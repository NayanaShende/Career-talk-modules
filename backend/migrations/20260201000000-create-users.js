"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      otpExpiryAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "user",
      },

      hasProfile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      // ✅ PROFILE DATA
      fullName: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      // ❌ qualification, experience, domain, cvFile, skills NOT here
      // ✅ Those columns live in the Experts table

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
    await queryInterface.dropTable("Users");
  },
};