const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const protect = require("../middleware/protect");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/set-role", protect, authController.setRole);

module.exports = router;


