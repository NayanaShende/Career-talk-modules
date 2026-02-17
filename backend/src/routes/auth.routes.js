const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const protect = require("../middleware/protect");

// OTP ROUTES
router.post("/send-otp", authController.sendOtp);
// console.log("OTP request received", req.body);
router.post("/verify-otp", authController.verifyOtp);

// When user logs in and gets OTP verified
router.post("/set-role", protect, authController.setRole);

module.exports = router;
