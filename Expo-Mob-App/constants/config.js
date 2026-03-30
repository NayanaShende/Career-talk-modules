import { Platform } from "react-native";

// ✅ Production backend URL (Render)
export const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3000"
    : "https://career-talk-modules-backend.onrender.com";

export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;

export default { API_URL, SOCKET_URL, BASE_URL };