import axios from "axios";

const API = axios.create({
  baseURL: "http://172.20.10.3:3000/api", // ⚠️ change this
});

// Initiate Call
export const initiateCall = (callerId, receiverId) => {
  return API.post("/calls/initiate", {
    callerId,
    receiverId,
  });
};

// Accept Call
export const acceptCall = (callId) => {
  return API.put(`/calls/accept/${callId}`);
};

// Reject Call
export const rejectCall = (callId) => {
  return API.put(`/calls/reject/${callId}`);
};

// End Call
export const endCall = (callId) => {
  return API.put(`/calls/end/${callId}`);
};
