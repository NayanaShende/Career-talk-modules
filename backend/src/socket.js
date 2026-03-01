module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join private room
    socket.on("joinRoom", ({ userId }) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Send message
    socket.on("sendMessage", (data) => {
      const { senderId, receiverId, message } = data;

      // Emit to receiver
      io.to(receiverId).emit("receiveMessage", {
        senderId,
        message,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};