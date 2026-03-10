const { WalletTransaction } = require("../models");
const walletService = require("../services/wallet.service");
const db = require("../models");

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
  try {
    const { userId, expertId, amount } = req.body;

    if (!userId || !expertId || !amount) {
      return res.status(400).json({
        error: "userId, expertId and amount required",
      });
    }

    const transaction = await db.WalletTransaction.create({
      user_id: userId,
      type: "hold", // ✅ change this
      amount: amount,
      currency: "INR",
      ref_id: expertId,
    });

    res.status(200).json({
      message: "Chat wallet pre-authorized",
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Chat pre-auth failed",
    });
  }
};

// HISTORY
exports.history = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await WalletTransaction.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.json(history);
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