const { Server } = require("socket.io");
const { Expert } = require("./models");

let io;
const socketToExpert = {};
const userSockets = {};

// ✅ Prevent duplicate messages
const recentMessages = {};
const MESSAGE_TTL = 3000;

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

      if (!userSockets[uid]) {
        userSockets[uid] = new Set();
      }

      for (const oldSid of userSockets[uid]) {
        if (!io.sockets.sockets.get(oldSid)) {
          userSockets[uid].delete(oldSid);
        }
      }

      userSockets[uid].add(socket.id);
      socket.join(uid);
      console.log(
        `User ${userId} joined room (socket: ${socket.id}, total sockets: ${userSockets[uid].size})`
      );
    });

    // ── Chat ──────────────────────────────────────────────────────────────
    socket.on("sendMessage", (data) => {
      const { senderId, receiverId, message } = data;
      const timestamp = Date.now();
      const messageKey = `${senderId}-${receiverId}-${message}-${Math.floor(
        timestamp / 1000
      )}`;

      if (recentMessages[messageKey]) {
        console.log("⚠️ Duplicate message blocked:", messageKey);
        return;
      }

      recentMessages[messageKey] = true;
      setTimeout(() => {
        delete recentMessages[messageKey];
      }, MESSAGE_TTL);

      const payload = {
        senderId,
        receiverId,
        message,
        created_at: new Date(),
      };
      io.to(receiverId.toString()).emit("receiveMessage", payload);
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

    // ── Call signaling ────────────────────────────────────────────────────

    // ✅ FIX 1: Handle "call-invite" emitted by ChatScreen
    // ChatScreen emits "call-invite" → server relays as "incoming-call" to receiver
    socket.on("call-invite", (data) => {
      const { callerId, callerName, callerImage, receiverId, callType, roomId } = data;
      const callId =
        roomId ||
        `${Math.min(Number(callerId), Number(receiverId))}_${Math.max(
          Number(callerId),
          Number(receiverId)
        )}`;

      console.log(
        `📞 call-invite: ${callerId} (${callerName}) → ${receiverId} [${callType}] callId: ${callId}`
      );

      // Relay to receiver as "incoming-call" with FULL data (IncomingCall screen needs all fields)
      io.to(receiverId.toString()).emit("incoming-call", {
        callId,
        callerId: Number(callerId),
        callerName: callerName || "User",
        callerImage: callerImage || "",
        callType: callType || "audio",
        roomId: callId,
      });

      console.log(`📲 Emitted "incoming-call" to room ${receiverId}`);
    });

    // ✅ FIX 2: "call-accepted" — handles BOTH IncomingCall.js (accept-call)
    //           AND ChatScreen IncomingCallModal (call-accepted)
    socket.on("call-accepted", (data) => {
      const { callerId, receiverId, roomId, callId } = data;
      const cId = callId || roomId;
      console.log(`✅ call-accepted callId: ${cId} → notifying caller: ${callerId}`);
      io.to(callerId.toString()).emit("call-accepted", {
        callId: cId,
        receiverId,
      });
    });

    // ✅ FIX 3: "call-rejected" — from ChatScreen IncomingCallModal reject
    socket.on("call-rejected", (data) => {
      const { callerId, receiverId, roomId, callId } = data;
      const cId = callId || roomId;
      console.log(`❌ call-rejected callId: ${cId} → notifying caller: ${callerId}`);
      io.to(callerId.toString()).emit("call-rejected", { callId: cId });
    });

    // ✅ FIX 4: "call-cancelled" — caller cancelled before expert answered
    socket.on("call-cancelled", (data) => {
      const { receiverId, callId, roomId } = data;
      const cId = callId || roomId;
      console.log(`🚫 call-cancelled callId: ${cId}`);
      if (receiverId) {
        io.to(receiverId.toString()).emit("call-cancelled", { callId: cId });
      }
    });

    // Legacy "call-user" support (backward compat)
    socket.on("call-user", (data) => {
      const { callId, callerId, receiverId, callerName, callerImage, callType } = data;
      console.log(`📞 call-user from ${callerId} to ${receiverId}`);
      io.to(receiverId.toString()).emit("incoming-call", {
        callId,
        callerId: Number(callerId),
        callerName: callerName || "",
        callerImage: callerImage || "",
        callType: callType || "audio",
      });
    });

    // Legacy "accept-call" from IncomingCall.js
    socket.on("accept-call", (data) => {
      const { callId, callerId, receiverId } = data;
      console.log(`✅ accept-call callId: ${callId}`);
      io.to(callerId.toString()).emit("call-accepted", { callId, receiverId });
    });

    // Legacy "reject-call" from IncomingCall.js
    socket.on("reject-call", (data) => {
      const { callId, callerId } = data;
      console.log(`❌ reject-call callId: ${callId}`);
      io.to(callerId.toString()).emit("call-rejected", { callId });
    });

    socket.on("end-call", (data) => {
      const { callId, callerId, receiverId } = data;
      console.log(`🔚 end-call callId: ${callId}`);
      if (callerId) io.to(callerId.toString()).emit("call-ended", { callId });
      if (receiverId) io.to(receiverId.toString()).emit("call-ended", { callId });
    });

    // ── WebRTC signaling ──────────────────────────────────────────────────

    // Receiver ready → fixes timing issue where offer sent before receiver joined
    socket.on("receiver-ready", ({ callId, callerId }) => {
      console.log(
        `📣 Receiver ready for call ${callId}, notifying caller ${callerId}`
      );
      io.to(callerId.toString()).emit("receiver-ready", { callId });
    });

    // Caller → Receiver: SDP offer
    socket.on("webrtc-offer", ({ callId, receiverId, sdp }) => {
      console.log(`📡 Relaying offer for call ${callId} to ${receiverId}`);
      io.to(receiverId.toString()).emit("webrtc-offer", { callId, sdp });
    });

    // Receiver → Caller: SDP answer
    socket.on("webrtc-answer", ({ callId, callerId, sdp }) => {
      console.log(`📡 Relaying answer for call ${callId} to ${callerId}`);
      io.to(callerId.toString()).emit("webrtc-answer", { callId, sdp });
    });

    // ICE candidate relay (both directions)
    socket.on("webrtc-ice-candidate", ({ callId, targetUserId, candidate }) => {
      io.to(targetUserId.toString()).emit("webrtc-ice-candidate", {
        callId,
        candidate,
      });
    });

    // Media state relay (mute/camera toggle)
    socket.on(
      "webrtc-media-state",
      ({ targetUserId, isMuted, isCameraOff, callId }) => {
        io.to(targetUserId.toString()).emit("webrtc-media-state", {
          isMuted,
          isCameraOff,
          callId,
        });
      }
    );

    // ── Expert online/offline ─────────────────────────────────────────────
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
      for (const [uid, socketSet] of Object.entries(userSockets)) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id);
          if (socketSet.size === 0) {
            delete userSockets[uid];
          }
          break;
        }
      }

      const expertId = socketToExpert[socket.id];
      if (expertId) {
        try {
          const expertUserSockets = Object.entries(userSockets).find(
            ([uid, socketSet]) =>
              socketSet.size > 0 &&
              socketToExpert[Array.from(socketSet)[0]] === expertId
          );
          if (!expertUserSockets) {
            await Expert.update(
              { is_online: false },
              { where: { id: expertId } }
            );
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