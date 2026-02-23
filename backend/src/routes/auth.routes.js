const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const protect = require("../middleware/protect");

// OTP
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

// ROLE
router.post("/set-role", protect, authController.setRole);

module.exports = router;
