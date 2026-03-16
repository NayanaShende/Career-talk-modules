const { Server } = require("socket.io");
const { Expert } = require("./models");

let io;
const socketToExpert = {};
const userSockets = {}; // uid → Set of socket IDs (support multiple tabs/devices)

// ✅ Prevent duplicate messages
const recentMessages = {};
const MESSAGE_TTL = 3000; // 3 seconds

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("joinRoom", ({ userId }) => {
      const uid = userId.toString();

      // ✅ FIX: Instead of disconnecting old socket (which causes reconnect loop),
      // just make sure this socket joins the room. We track a SET of socket IDs
      // per user so multiple sockets (reconnects) all receive messages.
      if (!userSockets[uid]) {
        userSockets[uid] = new Set();
      }

      // Clean up any stale socket IDs that are no longer connected
      for (const oldSid of userSockets[uid]) {
        if (!io.sockets.sockets.get(oldSid)) {
          userSockets[uid].delete(oldSid);
        }
      }

      userSockets[uid].add(socket.id);
      socket.join(uid);
      console.log(`User ${userId} joined room (socket: ${socket.id}, total sockets: ${userSockets[uid].size})`);
    });

    socket.on("sendMessage", (data) => {
      const { senderId, receiverId, message } = data;

      const timestamp = Date.now();
      const messageKey = `${senderId}-${receiverId}-${message}-${Math.floor(
        timestamp / 1000
      )}`;

      // ✅ Block duplicate messages
      if (recentMessages[messageKey]) {
        console.log("⚠️ Duplicate message blocked:", messageKey);
        return;
      }

      recentMessages[messageKey] = true;

      // ✅ Auto cleanup memory
      setTimeout(() => {
        delete recentMessages[messageKey];
      }, MESSAGE_TTL);

      const payload = {
        senderId,
        receiverId,
        message,
        created_at: new Date(),
      };

      // send message to receiver
      io.to(receiverId.toString()).emit("receiveMessage", payload);

      // send notification
      io.to(receiverId.toString()).emit("newNotification", {
        type: "message",
        title: "New Message",
        sender_id: Number(senderId),
        receiver_id: Number(receiverId),
        message: message,
        created_at: new Date(),
      });

      console.log(`💬 ${senderId} → ${receiverId}: ${message}`);
    });

    socket.on("sendNotification", (data) => {
      const { senderId, receiverId, title, message, type } = data;

      io.to(receiverId.toString()).emit("newNotification", {
        sender_id: Number(senderId),
        receiver_id: Number(receiverId),
        title,
        message,
        type,
        created_at: new Date(),
      });

      console.log(`🔔 Notification ${senderId} → ${receiverId}`);
    });

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

    socket.on("expert:online", async (userId) => {
      try {
        const expert = await Expert.findOne({ where: { userId: userId } });

        if (!expert) {
          console.log(`⚠️ No expert found for userId: ${userId}`);
          return;
        }

        socketToExpert[socket.id] = expert.id;

        await Expert.update({ is_online: true }, { where: { id: expert.id } });

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

        await Expert.update({ is_online: false }, { where: { id: expert.id } });

        io.emit("expert:status", { expertId: expert.id, is_online: false });

        console.log(`🔴 Expert ${expert.id} is OFFLINE`);
      } catch (err) {
        console.error("expert:offline error:", err.message);
      }
    });

    socket.on("disconnect", async () => {
      // ✅ FIX: Remove only this specific socket ID from the user's set
      for (const [uid, socketSet] of Object.entries(userSockets)) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id);
          // Clean up empty sets
          if (socketSet.size === 0) {
            delete userSockets[uid];
          }
          break;
        }
      }

      const expertId = socketToExpert[socket.id];

      if (expertId) {
        try {
          // ✅ FIX: Only mark expert offline if they have NO remaining sockets
          const expertUid = Object.keys(userSockets).find((uid) => {
            // Check if any remaining socket belongs to this expert
            return false; // handled below
          });

          // Check if expert still has other active sockets
          const expertStillConnected = Object.values(userSockets).some(
            (socketSet) => socketSet.size > 0
          );

          // Only go offline if this was the last socket for this expert user
          const expertUserSockets = Object.entries(userSockets).find(
            ([uid, socketSet]) => socketSet.size > 0 && socketToExpert[Array.from(socketSet)[0]] === expertId
          );

          if (!expertUserSockets) {
            await Expert.update({ is_online: false }, { where: { id: expertId } });
            io.emit("expert:status", { expertId, is_online: false });
            console.log(`🔴 Expert ${expertId} disconnected → OFFLINE`);
          }
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