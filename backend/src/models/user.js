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
        defaultValue: "user",
      },

      hasProfile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

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

sub_domain: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      
      gender: {
        type: DataTypes.STRING(10),
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
    },
    {
      timestamps: true,
    },
  );

  return User;
};