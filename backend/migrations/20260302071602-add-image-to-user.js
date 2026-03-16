"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    const tableDefinition = await queryInterface.describeTable("Users");

    if (!tableDefinition.image) {
      await queryInterface.addColumn("Users", "image", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

  },

  async down(queryInterface, Sequelize) {

    const tableDefinition = await queryInterface.describeTable("Users");

    if (tableDefinition.image) {
      await queryInterface.removeColumn("Users", "image");
    }

  },
};