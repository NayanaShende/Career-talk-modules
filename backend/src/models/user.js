module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      mobile: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },

      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      otpExpiryAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // ✅ Role default added (important)
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user",
      },

      hasProfile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // ✅ PROFILE DATA
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true, // prevents invalid email format
        },
      },

      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      // ❌ REMOVED: qualification  → now lives in Experts table
      // ❌ REMOVED: experience     → now lives in Experts table
      // ❌ REMOVED: domain         → now lives in Experts table
      // ❌ REMOVED: cvFile         → now lives in Experts table
      // ❌ REMOVED: skills         → now lives in Experts table
    },
    {
      timestamps: true, // ensures createdAt & updatedAt
    }
  );

  // ✅ ADDED ASSOCIATION (DO NOT REMOVE)
  User.associate = (models) => {
    if (models.Expert) {
      User.hasOne(models.Expert, {
        foreignKey: "userId",
        as: "expert",
        onDelete: "CASCADE",
      });
    }
  };

  return User;
};