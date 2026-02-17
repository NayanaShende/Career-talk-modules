"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Experts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      // from both files
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // from second file
      headline: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // merged experience fields
      experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // merged rating / verified
      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("Experts");
  },
};
