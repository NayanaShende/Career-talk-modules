import { Platform } from "react-native";

// 🔧 Local Development IP (your machine's IP)
const LOCAL_IP = "192.168.1.18";
const LOCAL_PORT = "3000";

// 🚀 Render Production URL
const RENDER_URL = "https://dpg-d6t76mkhg0os73fkee1g-a.onrender.com";

// ✅ Backend URL based on environment
const IS_PRODUCTION = false; // 🔁 Set to true to use Render backend

export const BASE_URL = IS_PRODUCTION
  ? RENDER_URL
  : Platform.OS === "web"
    ? `http://localhost:${LOCAL_PORT}` // Web browser
    : `http://${LOCAL_IP}:${LOCAL_PORT}`; // Android / iOS device

export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;

export default { API_URL, SOCKET_URL, BASE_URL };
