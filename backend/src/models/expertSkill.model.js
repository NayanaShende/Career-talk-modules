module.exports = (sequelize, DataTypes) => {
  const ExpertSkill = sequelize.define("ExpertSkill", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    expert_id: {
      type: DataTypes.INTEGER,   
      allowNull: false
    },

    skill_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  ExpertSkill.associate = (models) => {
    ExpertSkill.belongsTo(models.Expert, {
      foreignKey: "expert_id"
    });
  };

  return ExpertSkill;
};
