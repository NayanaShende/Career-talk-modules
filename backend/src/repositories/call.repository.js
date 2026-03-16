const { Call } = require('../models');
const { Op } = require('sequelize'); // ✅ ADD THIS

class CallRepository {
  async createCall(data) {
    return await Call.create(data);
  }

  async updateCall(callId, data) {
    return await Call.update(data, {
      where: { id: callId },
    });
  }

  async getCallById(callId) {
    return await Call.findByPk(callId);
  }

  // ✅ ADD THIS METHOD
  async getUserCallHistory(userId) {
    return await Call.findAll({
      where: {
        [Op.or]: [
          { caller_id: userId },
          { receiver_id: userId },
        ],
      },
      order: [['created_at', 'DESC']],
    });
  }
}

module.exports = new CallRepository();