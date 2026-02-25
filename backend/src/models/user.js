module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    mobile: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    otp: DataTypes.STRING,
    
    otpExpiryAt: {
      type: DataTypes.DATE,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    role: DataTypes.STRING,

    hasProfile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // PROFILE DATA
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,

    dob: DataTypes.DATEONLY, // ✅ birth date calendar

    qualification: DataTypes.STRING,
    experience: DataTypes.STRING,
    domain: DataTypes.STRING,
    cvFile: DataTypes.STRING,
  });

  // ✅ ADDED ASSOCIATION (DO NOT REMOVE)
  User.associate = (models) => {
    if (models.Expert) {
      User.hasOne(models.Expert, {
        foreignKey: "userId",
        as: "expert",
      });
    }
  };

  return User;
};