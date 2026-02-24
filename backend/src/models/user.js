module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
      role: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
hasProfile: {
  type: DataTypes.BOOLEAN,
  defaultValue: false   // NEW USERS MUST BE false
},
      otp: { type: DataTypes.STRING, allowNull: true },
      otpExpiryAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "otpExpiryAt",
      }, // field ensures correct DB mapping

      isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "Users",
      underscored: false, // keep camelCase in DB
    },
  );

  return User;
};