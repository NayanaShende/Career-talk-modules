const express = require("express");
const router = express.Router();

// --------------------------------------
// IMPORT ROUTES
// --------------------------------------
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const expertsRoutes = require("./expert.routes");
const chatRoutes = require('./chat.routes');


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


// Chat routes
router.use('/chat', chatRoutes);

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