"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Add comment column
    await queryInterface.addColumn("Reviews", "comment", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // ✅ Add user_id column with FK to Users table
    await queryInterface.addColumn("Reviews", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Reviews", "comment");
    await queryInterface.removeColumn("Reviews", "user_id");
  },
};