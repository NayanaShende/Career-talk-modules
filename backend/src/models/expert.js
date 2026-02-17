module.exports = (sequelize, DataTypes) => {
  const Expert = sequelize.define(
    "Expert",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // ✅ MATCHED WITH DATABASE
      experience: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },

      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      headline: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "Experts",
      timestamps: true,
    }
  );

  // ✅ association
  Expert.associate = (models) => {
    Expert.hasMany(models.ExpertSkill, {
      foreignKey: "expert_id",
      as: "skills",
    });
  };

  return Expert;
};
