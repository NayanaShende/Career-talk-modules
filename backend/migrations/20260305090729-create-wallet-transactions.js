module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallet_transactions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      type: {
        type: Sequelize.ENUM("topup", "hold", "debit", "refund", "release"),
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
      },

      currency: {
        type: Sequelize.STRING,
        defaultValue: "INR",
      },

      ref_id: {
        type: Sequelize.STRING,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wallet_transactions");
  },
};
