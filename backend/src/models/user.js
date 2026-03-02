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

      qualification: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      experience: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      domain: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      cvFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true, // ensures createdAt & updatedAt
    },
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
