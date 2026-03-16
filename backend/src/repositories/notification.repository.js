const { Notification } = require("../models");

exports.createNotification = async (data) => {
  return await Notification.create(data);
};

exports.getUserNotifications = async (userId) => {
  return await Notification.findAll({
    where: { receiver_id: userId },
    order: [["createdAt", "DESC"]],
  });
};

exports.markAsRead = async (id) => {
  const notification = await Notification.findByPk(id);
  if (!notification) return null;

  notification.is_read = true;
  await notification.save();

  return notification;
};

exports.markAllAsRead = async (userId) => {
  return await Notification.update(
    { is_read: true },
    { where: { receiver_id: userId } }
  );
};