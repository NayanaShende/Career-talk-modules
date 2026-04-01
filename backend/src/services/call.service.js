const callRepository = require('../repositories/call.repository');

class CallService {

  async initiateCall(callerId, receiverId, callType = 'voice') {
    return await callRepository.createCall({
      caller_id: callerId,
      receiver_id: receiverId,
      status: 'initiated',
      call_type: callType,
    });
  }

  async acceptCall(callId) {
    return await callRepository.updateCall(callId, {
      status: 'accepted',
      started_at: new Date(),
    });
  }

  async rejectCall(callId) {
    return await callRepository.updateCall(callId, {
      status: 'rejected',
      ended_at: new Date(),
    });
  }

  async endCall(callId) {
    const call = await callRepository.getCallById(callId);

    if (!call) {
      throw new Error('Call not found');
    }

    // ✅ FIX 1: If call was never accepted (no started_at),
    // just mark it ended with 0 duration — don't throw error
    const endedAt = new Date();
    const startedAt = call.started_at ? new Date(call.started_at) : endedAt;

    // Duration in seconds (0 if never started)
    const durationSec = Math.max(
      0,
      Math.floor((endedAt - startedAt) / 1000)
    );

    // Convert to minutes (round up, minimum 0)
    const durationMin = Math.ceil(durationSec / 60);

    // ✅ FIX 2: Safely get expert rate — don't crash if expert not found
    let totalAmount = 0;
    try {
      const { Expert } = require('../models');
      const expert = await Expert.findByPk(call.receiver_id);
      if (expert && expert.rate_per_minute) {
        totalAmount = durationMin * expert.rate_per_minute;
      }
    } catch (e) {
      console.log('⚠️ Could not fetch expert rate:', e.message);
      // totalAmount stays 0, call still ends cleanly
    }

    // ✅ FIX 3: Only update if call is not already ended
    // Prevents double-end 500 errors when both sides call endCall
    if (call.status === 'ended') {
      console.log(`⚠️ Call ${callId} already ended, skipping duplicate end`);
      return call;
    }

    console.log(`🔚 Ending call ${callId} | duration: ${durationSec}s | amount: ₹${totalAmount}`);

    return await callRepository.updateCall(callId, {
      status: 'ended',
      ended_at: endedAt,
      duration: durationSec,
      total_amount: totalAmount,
    });
  }

  async getCallHistory(userId) {
    return await callRepository.getUserCallHistory(userId);
  }
}

module.exports = new CallService();