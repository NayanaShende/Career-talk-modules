const express = require("express");
const router = express.Router();

// --------------------------------------
// IMPORT ROUTES
// --------------------------------------
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const expertsRoutes = require("./expert.routes");
const chatRoutes = require('./chat.routes');
const callRoutes = require('./call.routes');
const notificationRoutes = require("./notification.routes"); // ADDED
const walletRoutes = require("./wallet.routes");

// ✅ Admin Routes
const adminRoutes = require("./admin.routes");

// ✅ Razorpay Payment Routes
const paymentRoutes = require("./payment.routes");

// --------------------------------------
// MOUNT ROUTES
// --------------------------------------

// Auth routes
// Example: /api/auth/send-otp
router.use("/auth", authRoutes);

// User routes
// Example: /api/users/save-profile
router.use("/users", userRoutes);

// Expert routes
// Example: /api/experts
router.use("/experts", expertsRoutes);

// Notification routes
// Example: /api/notifications/create
router.use("/notifications", notificationRoutes); // ADDED


router.use("/wallet", walletRoutes);

// Admin routes
// Example: /api/admin/stats
router.use("/admin", adminRoutes);

// Chat routes
router.use("/chat", chatRoutes);
router.use("/calls", callRoutes);

// ✅ Payment routes
// Example: /api/payment/create-order
router.use("/payment", paymentRoutes);

// --------------------------------------
// HEALTH CHECK ROUTE
// --------------------------------------
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Career Talk API running successfully",
  });
});

module.exports = router;