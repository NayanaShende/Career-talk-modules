const chatService = require("../services/chat.service");

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    const chat = await chatService.createMessage({
      senderId,
      receiverId,
      message,
    });

    const io = req.app.get("io");

    // 🔥 Emit to receiver
    io.to(`user_${receiverId}`).emit("receive_message", chat);

    // 🔥 Emit to sender
    io.to(`user_${senderId}`).emit("receive_message", chat);

    return res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId, expertId } = req.params;

    const chats = await chatService.getConversation(
      userId,
      expertId
    );

    return res.status(200).json({
      success: true,
      data: chats,
    });

  } catch (error) {
    console.error("Get Conversation Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};