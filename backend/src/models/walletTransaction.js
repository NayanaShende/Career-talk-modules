module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define(
    "WalletTransaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER, // ✅ fixed: matches users.id
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("topup", "hold", "debit", "refund", "release"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },
      ref_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "wallet_transactions",
      timestamps: false,
      underscored: true, // ✅ ensures created_at maps correctly
    }
  );

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return WalletTransaction;
};