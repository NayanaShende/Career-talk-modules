"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("payments", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "id", // places it right after id column
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("payments", "user_id");
  },
};