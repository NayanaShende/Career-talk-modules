module.exports = (sequelize, DataTypes) => {
  const Expert = sequelize.define(
    "Expert",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      experience: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      }
    },
    {
      tableName: "experts",
      timestamps: false   
    }
  );

  return Expert;
};
