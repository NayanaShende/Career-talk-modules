module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define(
    "Wallet",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      holdAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: "wallets",
      underscored: true,
      timestamps: true,
    }
  );

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Wallet;
};