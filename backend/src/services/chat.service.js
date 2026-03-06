const { Chat, Sequelize, User, Expert } = require("../models");
const { Op } = Sequelize;

// ✅ CREATE MESSAGE
const createMessage = async (data) => {
  const chat = await Chat.create({
    senderId: data.senderId || data.sender_id,
    receiverId: data.receiverId || data.receiver_id,
    message: data.message,
  });

  return {
    id: chat.id,
    sender_id: chat.senderId,
    receiver_id: chat.receiverId,
    message: chat.message,
    is_seen: chat.is_seen || false,
    created_at: chat.createdAt,
  };
};

// ✅ GET CONVERSATION between two users
const getConversation = async (userId, expertId) => {
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
};

// ✅ GET ALL CONVERSATIONS for chat list screen
const getConversations = async (userId) => {
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

      // ✅ Find expert by userId to get real name + image
      const expert = await Expert.findOne({ where: { userId: otherUserId } });

      // ✅ Only use User as last fallback
      const user = !expert
        ? await User.findOne({ where: { id: otherUserId } })
        : null;

      // ✅ Priority: expert.name > user.name > "User"  (never show mobile)
      const name = expert?.name || user?.name || "User";
      const avatar = expert?.image || null;

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
};

module.exports = {
  createMessage,
  getConversation,
  getConversations,
};