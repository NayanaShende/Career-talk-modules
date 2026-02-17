module.exports = (sequelize, DataTypes) => {
  const ExpertSkill = sequelize.define(
    "ExpertSkill",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      expert_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ✅ merged: using proper column name
      skill_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "ExpertSkills",   // IMPORTANT: match your migration table name
      timestamps: false,
    }
  );

  // ✅ association
  ExpertSkill.associate = (models) => {
    ExpertSkill.belongsTo(models.Expert, {
      foreignKey: "expert_id",
      as: "expert",
    });
  };

  return ExpertSkill;
};
