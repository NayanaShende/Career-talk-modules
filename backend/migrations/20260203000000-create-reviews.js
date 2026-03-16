"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Create Reviews table with all columns
    await queryInterface.createTable("Reviews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      // ✅ FIXED: renamed from expertId to expert_id to match Review model
      expert_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Experts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // ✅ FIXED: renamed from userId to user_id to match Review model
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Reviews");
  },
};