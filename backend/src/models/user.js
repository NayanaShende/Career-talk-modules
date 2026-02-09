module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: true, // ❗ KEEP NULL
      defaultValue: null,
    },

    hasProfile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // ❗ VERY IMPORTANT
    },

    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otpExpiryAt: {
      type: DataTypes.DATE, // ✅ Use DataTypes.DATE instead of Sequelize.DATE
      allowNull: true,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return User;
};
