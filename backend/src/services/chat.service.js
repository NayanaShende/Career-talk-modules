const { Chat, Sequelize, User, Expert } = require("../models");
const { Op } = Sequelize;
 
const notificationService = require("./notification.service");
const { getIO } = require("../socket");
 
// ✅ CREATE MESSAGE
const createMessage = async (data) => {
  try {
    const chat = await Chat.create({
      senderId: data.senderId || data.sender_id,
      receiverId: data.receiverId || data.receiver_id,
      message: data.message,
      isSeen: false,
    });
 
    let isDelivered = false;
    try {
      const io = getIO();
      const room = String(chat.receiverId);
      const sockets = await io.in(room).fetchSockets();
      isDelivered = sockets.length > 0;
    } catch (e) {}
 
    const result = {
      id: chat.id,
      sender_id: Number(chat.senderId),
      receiver_id: Number(chat.receiverId),
      message: chat.message,
      is_seen: false,
      is_delivered: isDelivered,
      created_at: chat.createdAt,
    };
 
    try {
      const io = getIO();
      io.to(String(result.receiver_id)).emit("receiveMessage", result);
      io.to(String(result.receiver_id)).emit("newNotification", {
        type: "message",
        title: "New Message",
        sender_id: result.sender_id,
        receiver_id: result.receiver_id,
        message:
          result.message.length > 60
            ? result.message.substring(0, 60) + "..."
            : result.message,
        created_at: new Date(),
      });
 
      if (isDelivered) {
        io.to(String(result.sender_id)).emit("message-delivered", {
          messageId: chat.id,
          receiverId: result.receiver_id,
        });
      }
 
      await notificationService.createNotification(
        {
          sender_id: result.sender_id,
          receiver_id: result.receiver_id,
          type: "message",
          title: "New Message",
          message: result.message,
        },
        null
      );
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }
 
    return result;
  } catch (error) {
    throw new Error("Create message failed: " + error.message);
  }
};
 
// ✅ GET CONVERSATION
const getConversation = async (userId, expertId) => {
  try {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: expertId },
          { senderId: expertId, receiverId: userId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });
 
    return chats
      .filter((chat) => {
        const isSender = Number(chat.senderId) === Number(userId);
        if (isSender && chat.deletedBySender) return false;
        if (!isSender && chat.deletedByReceiver) return false;
        return true;
      })
      .map((chat) => ({
        id: chat.id,
        sender_id: Number(chat.senderId),
        receiver_id: Number(chat.receiverId),
        message: chat.message,
        is_seen: chat.isSeen || false,
        is_delivered: true,
        created_at: chat.createdAt,
      }));
  } catch (error) {
    throw new Error("Get conversation failed: " + error.message);
  }
};
 
// ✅ GET CONVERSATIONS FOR USER
// otherUserId is always an Expert → look up Expert table first
const getConversations = async (userId) => {
  try {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      order: [["createdAt", "DESC"]],
    });
 
    const visibleChats = chats.filter((chat) => {
      const isSender = Number(chat.senderId) === Number(userId);
      if (isSender && chat.deletedBySender) return false;
      if (!isSender && chat.deletedByReceiver) return false;
      return true;
    });
 
    const seen = new Set();
    const uniqueConversations = [];
 
    for (const chat of visibleChats) {
      const otherUserId =
        Number(chat.senderId) === Number(userId)
          ? Number(chat.receiverId)
          : Number(chat.senderId);
 
      if (!seen.has(otherUserId)) {
        seen.add(otherUserId);
 
        // ✅ For USER screen: otherUserId is Expert → find by userId in Expert table
        const expert = await Expert.findOne({ where: { userId: otherUserId } });
        const user = await User.findOne({ where: { id: otherUserId } });
 
        const name =
          expert?.name && expert.name.trim() !== ""
            ? expert.name
            : user?.fullName && user.fullName.trim() !== ""
            ? user.fullName
            : "Unknown User";
 
        const avatar = expert?.image || user?.image || null;
 
        uniqueConversations.push({
          id: String(otherUserId),
          otherUserId,
          name,
          avatar,
          lastMessage: chat.message,
          lastMessageTime: chat.createdAt,
        });
      }
    }
 
    return uniqueConversations;
  } catch (error) {
    throw new Error("Get conversations failed: " + error.message);
  }
};
 
// ✅ GET CONVERSATIONS FOR EXPERT
// otherUserId is always a User → look up User table first
const getExpertConversations = async (expertId) => {
  try {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ senderId: expertId }, { receiverId: expertId }],
      },
      order: [["createdAt", "DESC"]],
    });
 
    const visibleChats = chats.filter((chat) => {
      const isSender = Number(chat.senderId) === Number(expertId);
      if (isSender && chat.deletedBySender) return false;
      if (!isSender && chat.deletedByReceiver) return false;
      return true;
    });
 
    const seen = new Set();
    const uniqueConversations = [];
 
    for (const chat of visibleChats) {
      const otherUserId =
        Number(chat.senderId) === Number(expertId)
          ? Number(chat.receiverId)
          : Number(chat.senderId);
 
      if (!seen.has(otherUserId)) {
        seen.add(otherUserId);
 
        // ✅ For EXPERT screen: otherUserId is a User → find in User table first
        const user = await User.findOne({ where: { id: otherUserId } });
        const expert = await Expert.findOne({ where: { userId: otherUserId } });
 
        const name =
          user?.fullName && user.fullName.trim() !== ""
            ? user.fullName
            : expert?.name && expert.name.trim() !== ""
            ? expert.name
            : "Unknown User";
 
        const avatar = user?.image || expert?.image || null;
 
        uniqueConversations.push({
          id: String(otherUserId),
          otherUserId,
          name,
          avatar,
          lastMessage: chat.message,
          lastMessageTime: chat.createdAt,
        });
      }
    }
 
    return uniqueConversations;
  } catch (error) {
    throw new Error("Get expert conversations failed: " + error.message);
  }
};
 
// ✅ MARK MESSAGES AS SEEN
const markSeen = async (viewerId, senderId) => {
  try {
    await Chat.update(
      { isSeen: true },
      {
        where: {
          senderId: Number(senderId),
          receiverId: Number(viewerId),
          isSeen: false,
        },
      }
    );
 
    try {
      const io = getIO();
      io.to(String(senderId)).emit("messages-seen", {
        by: Number(viewerId),
        from: Number(senderId),
      });
    } catch (e) {
      console.log("Socket emit error in markSeen:", e.message);
    }
 
    return { success: true };
  } catch (error) {
    throw new Error("Mark seen failed: " + error.message);
  }
};
 
// ✅ DELETE SINGLE MESSAGE
const deleteMessage = async (messageId, requestingUserId, deleteForEveryone) => {
  const chat = await Chat.findByPk(messageId);
  if (!chat) throw new Error("Message not found");
 
  const isSender = Number(chat.senderId) === Number(requestingUserId);
 
  if (deleteForEveryone) {
    if (!isSender) throw new Error("Only sender can delete for everyone");
    await chat.update({ deletedBySender: true, deletedByReceiver: true });
  } else {
    if (isSender) {
      await chat.update({ deletedBySender: true });
    } else {
      await chat.update({ deletedByReceiver: true });
    }
  }
 
  return { success: true, messageId, deleteForEveryone };
};
 
// ✅ DELETE ENTIRE CONVERSATION
const deleteConversation = async (userId, otherUserId, deleteForEveryone) => {
  const chats = await Chat.findAll({
    where: {
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
  });
 
  for (const chat of chats) {
    const isSender = Number(chat.senderId) === Number(userId);
    if (deleteForEveryone) {
      await chat.update({ deletedBySender: true, deletedByReceiver: true });
    } else {
      if (isSender) {
        await chat.update({ deletedBySender: true });
      } else {
        await chat.update({ deletedByReceiver: true });
      }
    }
  }
 
  return { success: true, deletedCount: chats.length };
};
 
module.exports = {
  createMessage,
  getConversation,
  getConversations,
  getExpertConversations,
  markSeen,
  deleteMessage,
  deleteConversation,
};