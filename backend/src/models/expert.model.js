module.exports = (sequelize, DataTypes) => {
  const Expert = sequelize.define("Expert", {
    id: {
      type: DataTypes.INTEGER,   
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    headline: DataTypes.STRING,
    bio: DataTypes.TEXT,
    experience_years: DataTypes.INTEGER,

    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Expert.associate = (models) => {
    Expert.hasMany(models.ExpertSkill, {
      foreignKey: "expert_id",
      as: "skills"
    });
  };

  return Expert;
};
