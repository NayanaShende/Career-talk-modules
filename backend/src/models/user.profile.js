module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define("UserProfile", {
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    dob: DataTypes.DATEONLY,
    qualification: DataTypes.STRING,
    experience: DataTypes.STRING,
    domain: DataTypes.STRING,
    cvFile: DataTypes.STRING,
  });

  UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return UserProfile;
};
