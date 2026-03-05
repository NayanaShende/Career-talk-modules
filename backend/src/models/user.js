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

      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user", // user | jobseeker | expert
      },

      hasProfile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // BASIC PROFILE
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
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

      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      cvFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // =========================
      // JOBSEEKER FIELDS
      // =========================

      skills: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      jobPreference: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      currentLocation: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      portfolio: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // =========================
      // EXPERT FIELDS
      // =========================

      expertise: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      company: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      linkedin: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      hourlyRate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    },
  );

  // ASSOCIATION
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
