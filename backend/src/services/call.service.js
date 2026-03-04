const callRepository = require('../repositories/call.repository');

class CallService {
  async initiateCall(callerId, receiverId) {
    return await callRepository.createCall({
      caller_id: callerId,
      receiver_id: receiverId,
      status: 'initiated',
    });
  }

  async acceptCall(callId) {
    return await callRepository.updateCall(callId, {
      status: "accepted",
      started_at: new Date(),
    });
  }

  async rejectCall(callId) {
    return await callRepository.updateCall(callId, {
      status: "rejected",
    });
  }

 async endCall(callId) {
  const call = await callRepository.getCallById(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  if (!call.started_at) {
    throw new Error("Call was not accepted");
  }

  const endedAt = new Date();

  // Duration in seconds
  const durationSec = Math.floor(
    (endedAt - new Date(call.started_at)) / 1000
  );

  // Convert to minutes (round up)
  const durationMin = Math.ceil(durationSec / 60);

  // Get expert rate
  const { Expert } = require('../models');
  const expert = await Expert.findByPk(call.receiver_id);

  if (!expert) {
    throw new Error("Expert not found");
  }

  const totalAmount = durationMin * expert.rate_per_minute;

  return await callRepository.updateCall(callId, {
    status: "ended",
    ended_at: endedAt,
    duration: durationSec,
    total_amount: totalAmount,
  });
}
  // ✅ MOVE INSIDE CLASS
  async getCallHistory(userId) {
    return await callRepository.getUserCallHistory(userId);
  }
}

module.exports = new CallService();