"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      otp: Sequelize.STRING,

      otpExpiryAt: Sequelize.DATE,

      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      role: Sequelize.STRING,

      hasProfile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      fullName: Sequelize.STRING,
      email: Sequelize.STRING,
      dob: Sequelize.DATEONLY,
      qualification: Sequelize.STRING,
      experience: Sequelize.STRING,
      domain: Sequelize.STRING,
      cvFile: Sequelize.STRING,

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Users");
  },
};
