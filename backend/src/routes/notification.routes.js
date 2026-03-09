const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");

router.post("/create", notificationController.createNotification);

router.get("/:userId", notificationController.getNotifications);

router.patch("/read/:id", notificationController.markAsRead);

router.patch("/read-all/:userId", notificationController.markAllAsRead);

module.exports = router;