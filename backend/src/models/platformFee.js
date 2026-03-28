module.exports = (sequelize, DataTypes) => {
  const PlatformFee = sequelize.define(
    "PlatformFee",
    {
      fee_percent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
    },
    {
      tableName: "PlatformFees",
      timestamps: true,
    }
  );

  return PlatformFee;
};
