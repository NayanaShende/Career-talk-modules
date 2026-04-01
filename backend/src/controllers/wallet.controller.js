const { WalletTransaction } = require("../models");
const walletService = require("../services/wallet.service");
const db = require("../models");

const CHAT_HOLD_MULTIPLIER = 5;   // hold = 5× rate (e.g. rate=₹10 → hold=₹50)

// TOPUP
exports.topup = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const tx = await walletService.topupAmount(userId, amount, "topup");

    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HOLD (for call)
exports.hold = async (req, res) => {
  try {
    const { userId, amount, refId } = req.body;

    const tx = await walletService.holdAmount(userId, amount, refId);

    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DEBIT
exports.debit = async (req, res) => {
  try {
    const { userId, amount, refId } = req.body;

    const tx = await walletService.debitAmount(userId, amount, refId);

    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RELEASE
exports.release = async (req, res) => {
  try {
    const { userId, amount, refId } = req.body;

    const tx = await walletService.releaseAmount(userId, amount, refId);

    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CHAT PRE AUTHORIZATION
exports.chatPreAuth = async (req, res) => {
  // DEBUG LOG
  console.log("🔥 chatPreAuth called with body:", req.body);
  try {
    const { userId, expertId, amount } = req.body;

    if (!userId || !expertId || !amount) {
      console.log("❌ Missing fields — userId:", userId, "expertId:", expertId, "amount:", amount);
      return res.status(400).json({
        error: "userId, expertId and amount required",
      });
    }

    const transaction = await db.WalletTransaction.create({
      user_id: Number(userId),
      type: "hold",
      amount: Number(amount),
      currency: "INR",
      ref_id: String(expertId),
    });

    console.log("✅ Chat transaction created — ref_id:", transaction.ref_id);

    res.status(200).json({
      message: "Chat wallet pre-authorized",
      transaction,
    });
  } catch (error) {
    console.error("❌ chatPreAuth error:", error.message);
    res.status(500).json({
      error: "Chat pre-auth failed",
      detail: error.message,
    });
  }
};

// ─── CHAT START ───────────────────────────────────────────────────────────────
exports.chatStart = async (req, res) => {
  try {
    const { userId, expertId } = req.body;

    if (!userId || !expertId) {
      return res.status(400).json({ error: "userId and expertId required" });
    }

    // ✅ Fetch expert's custom rate
    const expert = await db.Expert.findOne({
      where: { id: Number(expertId) },
      attributes: ["id", "userId", "name", "rate_per_minute"],
    });
    if (!expert) return res.status(404).json({ error: "Expert not found" });

    const RATE        = expert.rate_per_minute || 10;
    const HOLD_AMOUNT = RATE * CHAT_HOLD_MULTIPLIER;   // 5 minutes pre-hold
    const MIN_BALANCE = HOLD_AMOUNT;

    const transactions = await WalletTransaction.findAll({
      where: { user_id: Number(userId) },
    });

    let balance = 0;
    transactions.forEach((tx) => {
      if (["topup", "refund", "release"].includes(tx.type)) {
        balance += parseFloat(tx.amount);
      } else {
        balance -= parseFloat(tx.amount);
      }
    });

    console.log("💰 User balance before chat start:", balance, "| Expert rate:", RATE);

    if (balance < MIN_BALANCE) {
      return res.status(400).json({
        error: "insufficient_balance",
        message: `Minimum ₹${MIN_BALANCE} required to start chat. Your balance: ₹${balance.toFixed(2)}`,
        balance:  balance,
        required: MIN_BALANCE,
        ratePerMin: RATE,
      });
    }

    const holdTx = await db.WalletTransaction.create({
      user_id:  Number(userId),
      type:     "hold",
      amount:   HOLD_AMOUNT,
      currency: "INR",
      ref_id:   String(expertId),
    });

    console.log("✅ Chat started — hold created:", holdTx.id, "amount:", HOLD_AMOUNT);

    res.status(200).json({
      success:    true,
      message:    `Chat started. ₹${HOLD_AMOUNT} held from wallet.`,
      holdTxId:   holdTx.id,
      balance:    balance - HOLD_AMOUNT,
      ratePerMin: RATE,
      holdAmount: HOLD_AMOUNT,
    });
  } catch (error) {
    console.error("chatStart error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── CHAT TICK ────────────────────────────────────────────────────────────────
exports.chatTick = async (req, res) => {
  try {
    const { userId, expertId } = req.body;

    if (!userId || !expertId) {
      return res.status(400).json({ error: "userId and expertId required" });
    }

    const expert = await db.Expert.findOne({
      where: { id: Number(expertId) },
      attributes: ["id", "userId", "name", "rate_per_minute"],
    });
    if (!expert) return res.status(404).json({ error: "Expert not found" });

    const RATE = expert.rate_per_minute || 10;

    const userTxns = await WalletTransaction.findAll({
      where: { user_id: Number(userId) },
    });

    let userBalance = 0;
    userTxns.forEach((tx) => {
      if (["topup", "refund", "release"].includes(tx.type)) {
        userBalance += parseFloat(tx.amount);
      } else {
        userBalance -= parseFloat(tx.amount);
      }
    });

    console.log("⏱️ Chat tick — user balance:", userBalance, "| rate:", RATE);

    if (userBalance < RATE) {
      return res.status(400).json({
        error:   "insufficient_balance",
        message: "Insufficient balance. Chat will end.",
        balance: userBalance,
      });
    }

    // Fetch Platform Fee Configuration
    let platformFeeConfig = await db.PlatformFee.findOne();
    let feePercent = platformFeeConfig ? platformFeeConfig.fee_percent : 10;
    
    // Calculate split
    const feeAmount = (RATE * feePercent) / 100;
    const expertCredit = RATE - feeAmount;

    // Debit full rate from user
    await db.WalletTransaction.create({
      user_id:  Number(userId),
      type:     "debit",
      amount:   RATE,
      currency: "INR",
      ref_id:   String(expertId),
    });

    // Log the platform fee taken dynamically
    await db.WalletTransaction.create({
      user_id:  Number(expert.userId),
      type:     "platform_fee",
      amount:   feeAmount,
      currency: "INR",
      ref_id:   String(userId),
    });

    // Credit remainder to expert
    await db.WalletTransaction.create({
      user_id:  Number(expert.userId),
      type:     "topup",
      amount:   expertCredit,
      currency: "INR",
      ref_id:   String(userId),
    });

    const newBalance = userBalance - RATE;
    console.log(`✅ Tick — Debited ₹${RATE}. Platform Fee: ₹${feeAmount}. Expert Credited: ₹${expertCredit}. User Balance: ${newBalance}`);

    res.status(200).json({
      success:    true,
      message:    `₹${RATE} debited. Platform Fee ₹${feeAmount} collected. Expert credited ₹${expertCredit}.`,
      balance:    newBalance,
      ratePerMin: RATE,
      feeTaken:   feeAmount
    });
  } catch (error) {
    console.error("chatTick error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── CHAT END ─────────────────────────────────────────────────────────────────
exports.chatEnd = async (req, res) => {
  try {
    const { userId, expertId, minutesUsed } = req.body;

    if (!userId || !expertId) {
      return res.status(400).json({ error: "userId and expertId required" });
    }

    // ✅ Fetch expert's rate for accurate billing
    const expert = await db.Expert.findOne({
      where: { id: Number(expertId) },
      attributes: ["id", "rate_per_minute"],
    });
    const RATE        = expert?.rate_per_minute || 10;
    const HOLD_AMOUNT = RATE * CHAT_HOLD_MULTIPLIER;

    const mins          = Number(minutesUsed) || 0;
    const totalCharged  = mins * RATE;
    const releaseAmount = Math.max(0, HOLD_AMOUNT - totalCharged);

    console.log(`📊 Chat ended — mins: ${mins}, rate: ₹${RATE}, charged: ₹${totalCharged}, releasing: ₹${releaseAmount}`);

    if (releaseAmount > 0) {
      await db.WalletTransaction.create({
        user_id:  Number(userId),
        type:     "release",
        amount:   releaseAmount,
        currency: "INR",
        ref_id:   String(expertId),
      });
    }

    res.status(200).json({
      success:      true,
      message:      `Chat ended. ₹${releaseAmount} released back to wallet.`,
      released:     releaseAmount,
      totalCharged: totalCharged,
      duration:     mins,
      ratePerMin:   RATE,
    });
  } catch (error) {
    console.error("chatEnd error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── HISTORY ✅ FIXED: parseInt(ref_id) for correct lookups ──────────────────
exports.history = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await WalletTransaction.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    const enriched = await Promise.all(
      history.map(async (tx) => {
        const txData = tx.toJSON();

        // ✅ For hold/debit — ref_id = Expert.id → fetch expert name
        if (
          (txData.type === "hold" || txData.type === "debit") &&
          txData.ref_id &&
          txData.ref_id !== "topup"
        ) {
          try {
            const expertId = parseInt(txData.ref_id);
            if (!isNaN(expertId)) {
              const expert = await db.Expert.findOne({
                where: { id: expertId },
                attributes: ["id", "name", "image"],
              });
              txData.expert_name = expert ? expert.name : null;
              txData.expert_image = expert ? expert.image : null;
            }
          } catch (e) {
            txData.expert_name = null;
            txData.expert_image = null;
          }
        }

        // ✅ NEW: For topup — ref_id = userId who paid → fetch user name
        // This handles expert earnings credited from chat sessions
        if (
          txData.type === "topup" &&
          txData.ref_id &&
          txData.ref_id !== "topup"
        ) {
          try {
            const refUserId = parseInt(txData.ref_id);
            if (!isNaN(refUserId)) {
              const user = await db.User.findOne({
                where: { id: refUserId },
                attributes: ["id", "fullName", "image"],
              });
              txData.from_user_name = user ? user.fullName : null;
              txData.from_user_image = user ? user.image : null;
            }
          } catch (e) {
            txData.from_user_name = null;
            txData.from_user_image = null;
          }
        }

        return txData;
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.balance = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await WalletTransaction.findAll({
      where: { user_id: userId },
    });

    let balance = 0;

    transactions.forEach((tx) => {
      if (
        tx.type === "topup" ||
        tx.type === "refund" ||
        tx.type === "release"
      ) {
        balance += parseFloat(tx.amount);
      } else {
        balance -= parseFloat(tx.amount);
      }
    });

    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};