import { Platform } from "react-native";

export const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:3000"
    : "https://user-management-backend-api-24le.onrender.com"; // ✅ correct

export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;

export default { API_URL, SOCKET_URL, BASE_URL };
