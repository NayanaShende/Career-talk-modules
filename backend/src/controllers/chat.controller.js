const chatService = require("../services/chat.service");
const db = require("../models");

exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    console.log("📨 sendMessage called:", { sender_id, receiver_id });

    const chat = await chatService.createMessage({
      sender_id,
      receiver_id,
      message,
    });

    const io = req.app.get("io");
    console.log("🔌 IO available:", !!io);

    if (io) {
      const room = receiver_id.toString();
      const socketsInRoom = await io.in(room).fetchSockets();
      console.log(`👥 Sockets in room "${room}":`, socketsInRoom.length);

      io.to(room).emit("receiveMessage", chat);

      const notifPayload = {
        type: "message",
        title: "New Message",
        sender_id: Number(sender_id),
        receiver_id: Number(receiver_id),
        message: message.length > 60 ? message.substring(0, 60) + "..." : message,
        created_at: new Date(),
      };

      io.to(room).emit("newNotification", notifPayload);
      console.log(`🔔 Emitted newNotification to room "${room}", sockets: ${socketsInRoom.length}`);
    }

    try {
      await db.Notification.create({
        sender_id,
        receiver_id,
        type: "message",
        title: "New Message",
        message: message.length > 60 ? message.substring(0, 60) + "..." : message,
      });
      console.log("💾 Notification saved to DB");
    } catch (notifErr) {
      console.error("❌ Notification DB save failed:", notifErr.message);
    }

    return res.json({ success: true, data: chat });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}; 

exports.getMessages = async (req, res) => {
  try {
    const { userId, expertId } = req.params;
    const chats = await chatService.getConversation(userId, expertId);
    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error("getConversation error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await chatService.getConversations(userId);
    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("getConversations error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};