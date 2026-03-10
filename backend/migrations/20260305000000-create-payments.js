"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      razorpay_order_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      razorpay_payment_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      razorpay_signature: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      currency: {
        type: Sequelize.STRING,
        defaultValue: "INR",
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: "created",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payments");
  },
};