module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    senderId: {
      type: DataTypes.INTEGER,
      field: 'senderId', // ✅ explicit field name
          },
    receiverId: {
      type: DataTypes.INTEGER,
      field: 'receiverId',
    },
    message: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'Chats', // ✅ explicit table name
    isSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'isSeen',
    },
  }, {
    tableName: 'Chats',
    timestamps: true,
  });

  return Chat;
};