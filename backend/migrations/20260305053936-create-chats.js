"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Chats", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // ✅ FIXED: renamed from sender_id to senderId to match Chat model
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      // ✅ FIXED: renamed from receiver_id to receiverId to match Chat model
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      // ✅ FIXED: renamed from is_seen to isSeen to match Chat model
      isSeen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Chats");
  },
};