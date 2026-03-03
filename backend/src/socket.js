module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ===============================
    // JOIN PRIVATE ROOM (userId room)
    // ===============================
    socket.on("joinRoom", ({ userId }) => {
      socket.join(userId.toString());
      console.log(`User ${userId} joined room`);
    });

    // ===============================
    // CHAT
    // ===============================
    socket.on("sendMessage", (data) => {
      const { senderId, receiverId, message } = data;

      io.to(receiverId.toString()).emit("receiveMessage", {
        senderId,
        message,
      });
    });

    // ===============================
    // CALL EVENTS
    // ===============================

    // 1️⃣ Initiate Call
    socket.on("call-user", async (data) => {
      const { callId, callerId, receiverId } = data;

      console.log(`Call initiated from ${callerId} to ${receiverId}`);

      io.to(receiverId.toString()).emit("incoming-call", {
        callId,
        callerId,
      });
    });

    // 2️⃣ Accept Call
    socket.on("accept-call", (data) => {
      const { callId, callerId, receiverId } = data;

      console.log(`Call accepted: ${callId}`);

      io.to(callerId.toString()).emit("call-accepted", {
        callId,
      });
    });

    // 3️⃣ Reject Call
    socket.on("reject-call", (data) => {
      const { callId, callerId } = data;

      console.log(`Call rejected: ${callId}`);

      io.to(callerId.toString()).emit("call-rejected", {
        callId,
      });
    });

    // 4️⃣ End Call
    socket.on("end-call", (data) => {
      const { callId, callerId, receiverId } = data;

      console.log(`Call ended: ${callId}`);

      io.to(callerId.toString()).emit("call-ended", { callId });
      io.to(receiverId.toString()).emit("call-ended", { callId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
const { Server } = require("socket.io");
const { Expert } = require("./models");

let io;
const socketToExpert = {};

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // Expert goes ONLINE — receives userId from mobile app
    socket.on("expert:online", async (userId) => {
      try {
        // ✅ FIXED: Find expert by userId (not expert.id)
        const expert = await Expert.findOne({ where: { userId: userId } });

        if (!expert) {
          console.log(`⚠️ No expert found for userId: ${userId}`);
          return;
        }

        socketToExpert[socket.id] = expert.id; // store expert.id for disconnect

        await expert.update({ is_online: true });

        io.emit("expert:status", { expertId: expert.id, is_online: true });
        console.log(`✅ Expert ${expert.id} (userId: ${userId}) is now ONLINE`);

      } catch (err) {
        console.error("expert:online error:", err.message);
      }
    });

    // Expert goes OFFLINE manually
    socket.on("expert:offline", async (userId) => {
      try {
        // ✅ FIXED: Find expert by userId
        const expert = await Expert.findOne({ where: { userId: userId } });

        if (!expert) {
          console.log(`⚠️ No expert found for userId: ${userId}`);
          return;
        }

        await expert.update({ is_online: false });

        io.emit("expert:status", { expertId: expert.id, is_online: false });
        console.log(`🔴 Expert ${expert.id} (userId: ${userId}) is now OFFLINE`);

      } catch (err) {
        console.error("expert:offline error:", err.message);
      }
    });

    // Auto OFFLINE on disconnect
    socket.on("disconnect", async () => {
      const expertId = socketToExpert[socket.id];

      if (expertId) {
        try {
          await Expert.update({ is_online: false }, { where: { id: expertId } });
          io.emit("expert:status", { expertId, is_online: false });
          console.log(`🔴 Expert ${expertId} disconnected → set OFFLINE`);
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
