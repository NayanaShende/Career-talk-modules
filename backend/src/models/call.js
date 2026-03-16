module.exports = (sequelize, DataTypes) => {
  const Call = sequelize.define(
    'Call',
    {
      caller_id: DataTypes.INTEGER,
      receiver_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      started_at: DataTypes.DATE,
      ended_at: DataTypes.DATE,
    },
    {
      tableName: 'calls',
      underscored: true,
    }
  );

  return Call;
};