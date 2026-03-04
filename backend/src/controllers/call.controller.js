const callService = require("../services/call.service");

// 🔹 Initiate Call
exports.initiateCall = async (req, res) => {
  try {
    const { callerId, receiverId } = req.body;

    if (!callerId || !receiverId) {
      return res.status(400).json({ error: "callerId and receiverId are required" });
    }

    const call = await callService.initiateCall(callerId, receiverId);

    return res.status(201).json(call);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 Accept Call
exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({ error: "callId is required" });
    }

    await callService.acceptCall(callId);

    return res.json({ message: "Call accepted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 Reject Call
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({ error: "callId is required" });
    }

    await callService.rejectCall(callId);

    return res.json({ message: "Call rejected" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 🔹 End Call
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.body;

    if (!callId) {
      return res.status(400).json({ error: "callId is required" });
    }

    await callService.endCall(callId);

    return res.json({ message: "Call ended" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const calls = await callService.getCallHistory(userId);
    return res.json(calls);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};