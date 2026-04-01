const callService = require("../services/call.service");
const { getIO } = require("../socket");
const db = require("../models");

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CALL_RATE_PER_MIN = 10;  // ₹10 per minute
const CALL_HOLD_AMOUNT  = 50;  // ₹50 held when call starts
const MIN_BALANCE       = 50;  // minimum balance to start a call

// ─── HELPER: Compute wallet balance from transactions ────────────────────────
const computeBalance = async (userId) => {
  const txns = await db.WalletTransaction.findAll({
    where: { user_id: Number(userId) },
  });
  let balance = 0;
  txns.forEach((tx) => {
    if (["topup", "refund", "release"].includes(tx.type)) {
      balance += parseFloat(tx.amount);
    } else {
      balance -= parseFloat(tx.amount);
    }
  });
  return balance;
};

// 🔹 Initiate Call
exports.initiateCall = async (req, res) => {
  try {
    const { callerId, receiverId, call_type, callerImage } = req.body;

    if (!callerId || !receiverId) {
      return res.status(400).json({ error: "callerId and receiverId are required" });
    }

    // ✅ FIX: Only fetch fullName — that's the actual DB column name
    let callerName = "User";
    try {
      const callerUser = await db.User.findOne({
        where: { id: Number(callerId) },
        attributes: ["id", "fullName"],
      });
      if (callerUser && callerUser.fullName) {
        callerName = callerUser.fullName;
      }
    } catch (e) {
      console.log("Could not fetch caller name:", e.message);
    }

    // ✅ Check balance before allowing call
    const balance = await computeBalance(callerId);
    console.log(`💰 User ${callerId} balance before call: ₹${balance}`);

    if (balance < MIN_BALANCE) {
      return res.status(400).json({
        error: "insufficient_balance",
        message: `Minimum ₹${MIN_BALANCE} required. Your balance: ₹${balance.toFixed(2)}`,
        balance,
        required: MIN_BALANCE,
      });
    }

    // ✅ Hold ₹50 from caller wallet
    await db.WalletTransaction.create({
      user_id: Number(callerId),
      type: "hold",
      amount: CALL_HOLD_AMOUNT,
      currency: "INR",
      ref_id: String(receiverId),
    });
    console.log(`🔒 Held ₹${CALL_HOLD_AMOUNT} from user ${callerId}`);

    const call = await callService.initiateCall(callerId, receiverId, call_type || "voice");

    const io = getIO();
    io.to(receiverId.toString()).emit("incoming-call", {
      callId: call.id,
      callerId: Number(callerId),
      receiverId: Number(receiverId),
      callerName,           // ✅ real name from DB
      callerImage: callerImage || "",
      callType: call_type || "voice",
    });

    console.log(`📞 Emitted "incoming-call" | callId: ${call.id} | caller: ${callerName}`);

    return res.status(201).json({
      ...call.dataValues,
      id: call.id,
      callId: call.id,
      callerName,
    });

  } catch (error) {
    console.error("initiateCall error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 Accept Call
exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.body;
    if (!callId) return res.status(400).json({ error: "callId is required" });
    await callService.acceptCall(callId);
    return res.json({ message: "Call accepted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 Reject Call — release hold back to caller
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.body;
    if (!callId) return res.status(400).json({ error: "callId is required" });

    // ✅ Fetch BEFORE updating so caller_id is available
    const call = await db.Call.findOne({ where: { id: Number(callId) } });
    await callService.rejectCall(callId);

    if (call && call.caller_id) {
      await db.WalletTransaction.create({
        user_id: Number(call.caller_id),
        type: "release",
        amount: CALL_HOLD_AMOUNT,
        currency: "INR",
        ref_id: String(call.receiver_id || "rejected"),
      });
      console.log(`🔓 Released ₹${CALL_HOLD_AMOUNT} back to caller ${call.caller_id} (rejected)`);
    }

    return res.json({ message: "Call rejected" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 Call Tick — ₹10/min debit from caller, credit to expert
// POST /api/calls/tick
exports.callTick = async (req, res) => {
  try {
    const { callId, caller_id } = req.body;

    if (!callId || !caller_id) {
      return res.status(400).json({ error: "callId and caller_id are required" });
    }

    const call = await db.Call.findOne({ where: { id: Number(callId) } });
    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    // ✅ FIX: receiver_id in calls table = expert's user_id directly
    // No need to look up Expert table — use receiver_id as user_id
    const expertUserId = Number(call.receiver_id);

    const userBalance = await computeBalance(caller_id);
    console.log(`⏱️ Call tick | callId: ${callId} | balance: ₹${userBalance}`);

    if (userBalance < CALL_RATE_PER_MIN) {
      return res.status(400).json({
        error: "insufficient_balance",
        message: "Insufficient balance. Call will end.",
        balance: userBalance,
      });
    }

    // Debit caller
    await db.WalletTransaction.create({
      user_id: Number(caller_id),
      type: "debit",
      amount: CALL_RATE_PER_MIN,
      currency: "INR",
      ref_id: String(callId),
    });

    // Credit expert (their user_id)
    await db.WalletTransaction.create({
      user_id: expertUserId,
      type: "topup",
      amount: CALL_RATE_PER_MIN,
      currency: "INR",
      ref_id: String(caller_id),
    });

    const newBalance = userBalance - CALL_RATE_PER_MIN;
    console.log(`✅ Tick — ₹${CALL_RATE_PER_MIN} debited from ${caller_id}, credited to expert ${expertUserId}. Balance: ₹${newBalance}`);

    return res.status(200).json({
      success: true,
      message: `₹${CALL_RATE_PER_MIN} debited`,
      balance: newBalance,
      ratePerMin: CALL_RATE_PER_MIN,
    });

  } catch (error) {
    console.error("callTick error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 End Call
// ✅ KEY FIX: Only caller sends caller_id → only caller gets wallet release
// Expert/receiver calls end WITHOUT caller_id → skips wallet ops entirely
exports.endCall = async (req, res) => {
  try {
    const { callId, caller_id, minutesUsed } = req.body;
    if (!callId) return res.status(400).json({ error: "callId is required" });

    // Always mark call ended in DB (service handles duplicate calls safely)
    await callService.endCall(callId);

    // ✅ Only settle wallet if this is the CALLER ending (has caller_id)
    if (caller_id) {
      const mins = Number(minutesUsed) || 0;
      const totalCharged = mins * CALL_RATE_PER_MIN;
      const releaseAmount = Math.max(0, CALL_HOLD_AMOUNT - totalCharged);

      console.log(`🔚 Call ${callId} | ${mins} min | charged: ₹${totalCharged} | releasing: ₹${releaseAmount}`);

      if (releaseAmount > 0) {
        await db.WalletTransaction.create({
          user_id: Number(caller_id),
          type: "release",
          amount: releaseAmount,
          currency: "INR",
          ref_id: String(callId),
        });
        console.log(`🔓 Released ₹${releaseAmount} to caller ${caller_id}`);
      }

      return res.status(200).json({
        message: "Call ended",
        minutesUsed: mins,
        totalCharged,
        released: releaseAmount,
        ratePerMin: CALL_RATE_PER_MIN,
      });
    }

    // Receiver side — just acknowledge, no wallet ops
    console.log(`🔚 Call ${callId} ended (receiver side, no billing)`);
    return res.status(200).json({ message: "Call ended" });

  } catch (error) {
    console.error("endCall error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 Get Call History
exports.getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const calls = await callService.getCallHistory(userId);
    return res.json(calls);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};