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

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },

      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      domain: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // ✅ NEW FIELDS

      language: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // ✅ ADDED: language_spoken used by Expert queries
      language_spoken: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // ✅ ADDED: location used by Expert queries
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      certification: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      cv: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      is_online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      // ✅ ADDED: verified used by Expert queries
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      // ✅ ADDED: gender used by Expert queries
      gender: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Experts");
  },
};