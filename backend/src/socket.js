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