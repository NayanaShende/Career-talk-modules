const { Chat, Sequelize, User, Expert } = require("../models");
const { Op } = Sequelize;

const notificationService = require("./notification.service");
const { getIO } = require("../socket");

// ✅ CREATE MESSAGE
const createMessage = async (data) => {
  try {

    const chat = await Chat.create({
      senderId: data.senderId || data.sender_id,
      receiverId: data.receiverId || data.receiver_id,
      message: data.message,
    });

    const result = {
      id: chat.id,
      sender_id: chat.senderId,
      receiver_id: chat.receiverId,
      message: chat.message,
      is_seen: chat.is_seen || false,
      created_at: chat.createdAt,
    };

    // 🔔 Emit socket message
    try {
      const io = getIO();

      io.to(String(result.receiver_id)).emit("receiveMessage", result);

      // 🔔 Create notification
      await notificationService.createNotification(
        {
          sender_id: result.sender_id,
          receiver_id: result.receiver_id,
          type: "message",
          title: "New Message",
          message: result.message,
        },
        io
      );

    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    return result;

  } catch (error) {
    throw new Error("Create message failed: " + error.message);
  }
};


// ✅ GET CONVERSATION between two users
const getConversation = async (userId, expertId) => {
  try {

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: expertId },
          { senderId: expertId, receiverId: userId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    return chats.map((chat) => ({
      id: chat.id,
      sender_id: chat.senderId,
      receiver_id: chat.receiverId,
      message: chat.message,
      is_seen: chat.is_seen,
      created_at: chat.createdAt,
    }));

  } catch (error) {
    throw new Error("Get conversation failed: " + error.message);
  }
};


// ✅ GET ALL CONVERSATIONS for chat list screen
const getConversations = async (userId) => {
  try {

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    const seen = new Set();
    const uniqueConversations = [];

    for (const chat of chats) {

      const otherUserId =
        Number(chat.senderId) === Number(userId)
          ? chat.receiverId
          : chat.senderId;

      if (!seen.has(otherUserId)) {

        seen.add(otherUserId);

        const expert = await Expert.findOne({ where: { userId: otherUserId } });
        const user = await User.findOne({ where: { id: otherUserId } });

        const name =
          (expert?.name && expert.name.trim() !== "") ? expert.name :
          (user?.fullName && user.fullName.trim() !== "") ? user.fullName :
          (user?.name && user.name.trim() !== "") ? user.name :
          "Unknown User";

        const avatar = expert?.image || user?.image || null;

        uniqueConversations.push({
          id: String(otherUserId),
          otherUserId,
          name,
          avatar,
          lastMessage: chat.message,
          lastMessageTime: chat.createdAt,
        });

      }
    }

    return uniqueConversations;

  } catch (error) {
    throw new Error("Get conversations failed: " + error.message);
  }
};


module.exports = {
  createMessage,
  getConversation,
  getConversations,
};