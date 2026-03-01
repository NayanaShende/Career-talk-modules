module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    senderId: {
      type: DataTypes.INTEGER,
    },
    receiverId: {
      type: DataTypes.INTEGER,
    },
    message: {
      type: DataTypes.TEXT,
    },
  });

  return Chat;
};