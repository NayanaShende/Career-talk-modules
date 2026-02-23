// src/controllers/auth.controller.js

const authService = require("../services/auth.service");

// ---------------------------------------
// SEND OTP
// ---------------------------------------
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile required" });
    }

    const { otp } = await authService.sendOtp(mobile);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      // TEMP for testing — remove later
      otp,
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------
// VERIFY OTP
// ---------------------------------------
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    console.log("VERIFY REQUEST:", mobile, otp);

    const { token, redirectTo, freshUser } = await authService.verifyOtp(mobile, otp);

    return res.json({
      success: true,
      message: "OTP verified successfully",
      token,
      redirectTo,
      user: {
        id: freshUser.id,
        mobile: freshUser.mobile,
        role: freshUser.role,
        hasProfile: freshUser.hasProfile,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);

    const clientErrors = ["User not found", "Invalid OTP", "OTP expired"];
    if (clientErrors.includes(err.message)) {
      return res.status(400).json({ success: false, message: err.message });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------
// SET ROLE
// ---------------------------------------
exports.setRole = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { role } = req.body;
    const user = await authService.setRole(req.user, role);

    return res.json({ success: true, message: "Role updated", user });
  } catch (err) {
    console.error("Set role error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
