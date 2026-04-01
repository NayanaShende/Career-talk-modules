import { io } from "socket.io-client";
import { API_URL } from "../constants/config";

const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  autoConnect: true,
});

// ── Auto join room with logged-in userId ──────────────────────────────────
// This runs once socket connects (and on every reconnect)
socket.on("connect", async () => {
  console.log("🟢 Socket connected:", socket.id);

  try {
    const str = await AsyncStorage.getItem("user");
    if (str) {
      const u = JSON.parse(str);
      const userId = u?.id || u?.userId || u?.user?.id;

      if (userId) {
        socket.emit("joinRoom", { userId });
        console.log("🏠 Joined room:", userId);
      }
    }
  } catch (e) {
    console.log("socket joinRoom error:", e.message);
  }
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket connection error:", err.message);
});

export default socket;
