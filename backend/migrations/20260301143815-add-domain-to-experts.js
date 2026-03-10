"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    const tableDefinition = await queryInterface.describeTable("Experts");

    if (!tableDefinition.domain) {
      await queryInterface.addColumn("Experts", "domain", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

  },

  async down(queryInterface, Sequelize) {

    const tableDefinition = await queryInterface.describeTable("Experts");

    if (tableDefinition.domain) {
      await queryInterface.removeColumn("Experts", "domain");
    }

  },
};