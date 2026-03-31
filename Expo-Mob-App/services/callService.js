import axios from "axios";
import { API_URL } from "../constants/config";

const API = axios.create({
  baseURL: API_URL, // ⚠️ change this
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
