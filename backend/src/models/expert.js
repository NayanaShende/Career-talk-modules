module.exports = (sequelize, DataTypes) => {
  const Expert = sequelize.define(
    "Expert",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // ✅ Link Expert to User
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
        validate: {
          min: 0,
          max: 5,
        },
      },

      image: {
        type: DataTypes.TEXT,
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

      // ✅ NEW DOMAIN FIELD (replaces skill/headline/role usage)
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
    },
    {
      tableName: "Experts",
      timestamps: true,
    },
  );

  // ✅ SAFE ASSOCIATIONS
  Expert.associate = (models) => {

    if (models.User) {
      Expert.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
    }

    // ❌ REMOVED: ExpertProfile association (model does not exist in your project)
    // if (models.ExpertProfile) { ... }

    if (models.ExpertSkill) {
      Expert.hasMany(models.ExpertSkill, {
        foreignKey: "expert_id",
        as: "skills",
      });
    }
  };

  return Expert;
};