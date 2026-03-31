module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    "Chat",
    {
      senderId: {
        type: DataTypes.INTEGER,
        field: "senderId",
      },
      receiverId: {
        type: DataTypes.INTEGER,
        field: "receiverId",
      },
      message: {
        type: DataTypes.TEXT,
      },
      isSeen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "isSeen",
      },
      // ✅ NEW: soft delete flags — run SQL before using:
      // ALTER TABLE "Chats" ADD COLUMN IF NOT EXISTS "deletedBySender" BOOLEAN DEFAULT false;
      // ALTER TABLE "Chats" ADD COLUMN IF NOT EXISTS "deletedByReceiver" BOOLEAN DEFAULT false;
      deletedBySender: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "deletedBySender",
      },
      deletedByReceiver: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "deletedByReceiver",
      },
    },
    {
      tableName: "Chats",
      timestamps: true,
    }
  );

  return Chat;
};