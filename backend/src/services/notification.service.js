const notificationRepository = require("../repositories/notification.repository");

exports.createNotification = async (data, io) => {

  const notification = await notificationRepository.createNotification(data);

  // ✅ FIXED: room is just receiver_id.toString() (not "user_X")
  // ✅ FIXED: event is "newNotification" (not "new_notification")
  if (io) {
    io.to(data.receiver_id.toString()).emit("newNotification", {
      id: notification.id,
      sender_id: Number(data.sender_id),
      receiver_id: Number(data.receiver_id),
      type: data.type,
      title: data.title || "New Message",
      message: data.message,
      is_read: false,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

exports.getNotifications = async (userId) => {
  return await notificationRepository.getUserNotifications(userId);
};

exports.markAsRead = async (id) => {
  return await notificationRepository.markAsRead(id);
};

exports.markAllAsRead = async (userId) => {
  return await notificationRepository.markAllAsRead(userId);
};