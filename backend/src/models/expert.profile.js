module.exports = (sequelize, DataTypes) => {
  const ExpertProfile = sequelize.define("ExpertProfile", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
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

    certifications: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    linkedIn: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cvFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    expertId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  });

ExpertProfile.associate = (models) => {
  ExpertProfile.belongsTo(models.Expert, {
    foreignKey: "expertId",
  });
};
  return ExpertProfile;
};
