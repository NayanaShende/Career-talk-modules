import axios from "axios";
 
const BASE_URL = "http://10.235.241.9:3000/api";
 
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});
 
// ── Initiate Call (balance check happens on backend)
export const initiateCall = async (
  callerId,
  receiverId,
  callType = "voice",
  callerName = "",
  callerImage = "",
) => {
  const res = await API.post("/calls/initiate", {
    callerId,
    receiverId,
    call_type: callType,
    callerName,
    callerImage,
  });
  return res.data;
};
 
// ── Accept Call (expert side)
export const acceptCall = async (callId) => {
  const res = await API.post("/calls/accept", { callId });
  return res.data;
};
 
// ── Reject Call (expert side)
export const rejectCall = async (callId) => {
  const res = await API.post("/calls/reject", { callId });
  return res.data;
};
 
// ── Per-minute billing tick for CALLS
// ✅ FIX: Now calls /wallet/call-tick (not /calls/tick which didn't exist)
// This is only called AFTER expert answers (call status = active)
export const callTick = async (callId, caller_id) => {
  const res = await API.post("/wallet/call-tick", { callId, caller_id });
  return res.data;
};
 
// ── End Call (either side)
export const endCall = async (callId, caller_id, minutesUsed = 0) => {
  const res = await API.post("/calls/end", {
    callId,
    caller_id,
    minutesUsed,
  });
  return res.data;
};
 
// ── Call History
export const getCallHistory = async (userId) => {
  const res = await API.get(`/calls/history/${userId}`);
  return res.data;
};
 