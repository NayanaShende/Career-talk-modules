const { Chat, Sequelize } = require("../models");
const { Op } = Sequelize;

// ✅ CREATE MESSAGE
const createMessage = async (data) => {
  return await Chat.create(data);
};

// ✅ GET CONVERSATION
const getConversation = async (userId, expertId) => {
  return await Chat.findAll({
    where: {
      [Op.or]: [
        { senderId: userId, receiverId: expertId },
        { senderId: expertId, receiverId: userId },
      ],
    },
    order: [["createdAt", "ASC"]],
  });
};

module.exports = {
  createMessage,
  getConversation,
};