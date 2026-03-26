import { Platform } from "react-native";

// ✅ CHANGE ONLY THIS ONE IP ADDRESS WHEN YOUR NETWORK CHANGES
const LOCAL_IP = "172.20.10.3";

// Automatically picks correct URL for web vs mobile
const BASE_URL =
  Platform.OS === "web" ? "http://localhost:3000" : `http://${LOCAL_IP}:3000`;

export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;

export default { API_URL, SOCKET_URL };

