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

      // ✅ ONLINE STATUS
      is_online: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // ✅ NEW ADDED FIELDS
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      language_spoken: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      cv: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      certification: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      // ✅ NEW: Skill column added to model
      skill: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Experts",
      timestamps: true,
    }
  );

  // ✅ SAFE ASSOCIATIONS (NO CRASH)
  Expert.associate = (models) => {

    // hasOne Profile
    if (models.ExpertProfile) {
      Expert.hasOne(models.ExpertProfile, {
        foreignKey: "expertId",
        as: "profile",
      });
    }

    // hasMany Skills
    if (models.ExpertSkill) {
      Expert.hasMany(models.ExpertSkill, {
        foreignKey: "expert_id",
        as: "skills",
      });
    }

  };

  return Expert;
};