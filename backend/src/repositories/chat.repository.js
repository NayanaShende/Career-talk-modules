const { Chat } = require("../models");
const { Op } = require("sequelize");

class ChatRepository {

  // ✅ create message
  async createMessage({ senderId, receiverId, message }) {
    return await Chat.create({
      senderId,
      receiverId,
      message,
      isRead: true,
    });
  }

  // ✅ get conversation between two users
  async getConversation(user1, user2) {
    return await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      },
      order: [["createdAt", "ASC"]],
    });
  }

}

module.exports = new ChatRepository();