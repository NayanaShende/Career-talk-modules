module.exports = (sequelize, DataTypes) => {
  const ExpertSkill = sequelize.define("ExpertSkill", {
    skill: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return ExpertSkill;
};
