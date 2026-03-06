const { Server } = require("socket.io");
const { Expert } = require("./models");

let io;
const socketToExpert = {};
const userSockets = {}; // track userId → socketId to prevent duplicates

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    // Prevent duplicate connections from same client
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // ===============================
    // JOIN PRIVATE ROOM (userId room)
    // ===============================
    socket.on("joinRoom", ({ userId }) => {
      const uid = userId.toString();

      // If user already has a socket, disconnect the old one
      if (userSockets[uid] && userSockets[uid] !== socket.id) {
        const oldSocket = io.sockets.sockets.get(userSockets[uid]);
        if (oldSocket) {
          oldSocket.disconnect(true);
          console.log(`⚠️ Disconnected old socket for user ${uid}`);
        }
      }

      // Register new socket for this user
      userSockets[uid] = socket.id;

      socket.join(uid);
      console.log(`User ${userId} joined room`);
    });

    // ===============================
    // CHAT
    // ===============================
    socket.on("sendMessage", (data) => {
      const { senderId, receiverId, message } = data;

      const payload = {
        senderId,
        receiverId,
        message,
        created_at: new Date(),
      };

      // Send to receiver only (sender already updates UI instantly)
      io.to(receiverId.toString()).emit("receiveMessage", payload);

      console.log(`💬 ${senderId} → ${receiverId}: ${message}`);
    });

    // ===============================
    // CALL EVENTS
    // ===============================
    socket.on("call-user", (data) => {
      const { callId, callerId, receiverId } = data;
      console.log(`📞 Call initiated from ${callerId} to ${receiverId}`);
      io.to(receiverId.toString()).emit("incoming-call", { callId, callerId });
    });

    socket.on("accept-call", (data) => {
      const { callId, callerId } = data;
      console.log(`✅ Call accepted: ${callId}`);
      io.to(callerId.toString()).emit("call-accepted", { callId });
    });

    socket.on("reject-call", (data) => {
      const { callId, callerId } = data;
      console.log(`❌ Call rejected: ${callId}`);
      io.to(callerId.toString()).emit("call-rejected", { callId });
    });

    socket.on("end-call", (data) => {
      const { callId, callerId, receiverId } = data;
      console.log(`🔚 Call ended: ${callId}`);
      io.to(callerId.toString()).emit("call-ended", { callId });
      io.to(receiverId.toString()).emit("call-ended", { callId });
    });

    // ===============================
    // EXPERT ONLINE / OFFLINE STATUS
    // ===============================
    socket.on("expert:online", async (userId) => {
      try {
        const expert = await Expert.findOne({ where: { userId } });
        if (!expert) {
          console.log(`⚠️ No expert found for userId: ${userId}`);
          return;
        }

        socketToExpert[socket.id] = expert.id;
        await expert.update({ is_online: true });

        io.emit("expert:status", { expertId: expert.id, is_online: true });
        console.log(`🟢 Expert ${expert.id} is ONLINE`);
      } catch (err) {
        console.error("expert:online error:", err.message);
      }
    });

    socket.on("expert:offline", async (userId) => {
      try {
        const expert = await Expert.findOne({ where: { userId } });
        if (!expert) {
          console.log(`⚠️ No expert found for userId: ${userId}`);
          return;
        }

        await expert.update({ is_online: false });
        io.emit("expert:status", { expertId: expert.id, is_online: false });
        console.log(`🔴 Expert ${expert.id} is OFFLINE`);
      } catch (err) {
        console.error("expert:offline error:", err.message);
      }
    });

    // ===============================
    // DISCONNECT
    // ===============================
    socket.on("disconnect", async () => {
      // Cleanup userSockets map
      for (const [uid, sid] of Object.entries(userSockets)) {
        if (sid === socket.id) {
          delete userSockets[uid];
          break;
        }
      }

      // Cleanup expert status
      const expertId = socketToExpert[socket.id];
      if (expertId) {
        try {
          await Expert.update({ is_online: false }, { where: { id: expertId } });
          io.emit("expert:status", { expertId, is_online: false });
          console.log(`🔴 Expert ${expertId} disconnected → OFFLINE`);
        } catch (err) {
          console.error("disconnect error:", err.message);
        }
        delete socketToExpert[socket.id];
      }

      console.log("🔌 Socket disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };