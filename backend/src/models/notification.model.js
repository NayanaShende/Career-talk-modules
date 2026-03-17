module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
    },

    message: {
      type: DataTypes.TEXT,
    },

    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Notification;
};