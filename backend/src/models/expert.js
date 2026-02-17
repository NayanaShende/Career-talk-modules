module.exports = (sequelize, DataTypes) => {
  const Expert = sequelize.define(
    "Expert",   // ✅ IMPORTANT: Capital E (model name)
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
        allowNull: false,
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
    },
    {
      tableName: "Experts",   // ✅ matches your DB
      timestamps: false,
    }
  );

  return Expert;
};
