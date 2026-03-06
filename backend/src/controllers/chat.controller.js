const chatService = require("../services/chat.service");

exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message } = req.body;

    // ✅ chat.service now returns snake_case directly (sender_id, receiver_id)
    const chat = await chatService.createMessage({
      sender_id,
      receiver_id,
      message,
    });

    // ✅ Safe io emit - won't crash if io is missing
    const io = req.app.get("io");
    if (io) {
      io.to(receiver_id.toString()).emit("receiveMessage", chat);
    }

    return res.json({ success: true, data: chat });
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId, expertId } = req.params;

    const chats = await chatService.getConversation(userId, expertId);

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error("getConversation error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ NEW: Get all conversations for chat list screen
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