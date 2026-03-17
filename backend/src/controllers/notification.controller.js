const db = require("../models");
const Notification = db.Notification;


// Create notification
exports.createNotification = async (req, res) => {
  try {
    const { sender_id, receiver_id, type, title, message } = req.body;

    const notification = await Notification.create({
      sender_id,
      receiver_id,
      type,
      title,
      message
    });

    res.status(201).json({
      message: "Notification created successfully",
      data: notification
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating notification",
      error: error.message
    });
  }
};


// Get notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.findAll({
      where: { receiver_id: userId },
      order: [["createdAt", "DESC"]]
    });

    res.json({
      message: "Notifications fetched successfully",
      data: notifications
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message
    });
  }
};


// Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.update(
      { is_read: true },
      { where: { id } }
    );

    res.json({
      message: "Notification marked as read"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating notification",
      error: error.message
    });
  }
};


// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.update(
      { is_read: true },
      { where: { receiver_id: userId } }
    );

    res.json({
      message: "All notifications marked as read"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating notifications",
      error: error.message
    });
  }
};