const notificationRepository = require("../repositories/notification.repository");

exports.createNotification = async (data, io) => {

  const notification = await notificationRepository.createNotification(data);

  // Real-time notification
  if (io) {
    io.to(`user_${data.receiver_id}`).emit("new_notification", notification);
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