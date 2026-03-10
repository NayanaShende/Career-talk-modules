const { Chat } = require("../models");

class ChatRepository {
  async createMessage(data) {
    return Chat.create(data);
  }

  async getConversation(userId, expertId) {
    return Chat.findAll({
      where: {
        sender_id: [userId, expertId],
        receiver_id: [userId, expertId],
      },
      order: [["created_at", "ASC"]],
    });
  }
}

module.exports = new ChatRepository();