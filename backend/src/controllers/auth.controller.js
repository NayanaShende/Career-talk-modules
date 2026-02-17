// src/controllers/auth.controller.js

const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ------------------------------
// HELPER FUNCTION TO NORMALIZE MOBILE
// ------------------------------
const normalizeMobile = (mobile) =>
  String(mobile || "")
    .replace(/\D/g, "")
    .slice(-10);

// ---------------------------------------
// SEND OTP
// ---------------------------------------
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile)
      return res
        .status(400)
        .json({ success: false, message: "Mobile required" });

    const normalizedMobile = normalizeMobile(mobile);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiryAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ where: { mobile: normalizedMobile } });

    if (!user) {
      user = await User.create({
        mobile: normalizedMobile,
        otp,
        otpExpiryAt,
        isVerified: false,
      });
    } else {
      await user.update({
        otp,
        otpExpiryAt,
        isVerified: false,
      });
    }

    console.log("🔥 OTP SAVED FOR", normalizedMobile, ":", otp);

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
    let { mobile, otp } = req.body;

    if (!mobile || !otp)
      return res.status(400).json({ success: false, message: "Missing data" });

    const normalizedMobile = normalizeMobile(mobile);
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      where: { mobile: normalizedMobile },
    });

    console.log("VERIFY REQUEST:", normalizedMobile, cleanOtp);

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    console.log("DB OTP:", user.otp);

    // ---- FIX: safe OTP comparison ----
    if (!user.otp || String(user.otp).trim() !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ---- FIX: safe expiry check ----
    if (!user.otpExpiryAt || Date.now() > new Date(user.otpExpiryAt).getTime()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // OTP valid
    user.otp = null;
    user.otpExpiryAt = null;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    const freshUser = await User.findByPk(user.id);

    let redirectTo = "";

    if (freshUser.hasProfile === true) {
      redirectTo = "/dashboard";
    } else {
      if (!freshUser.role) redirectTo = "/select-role";
      else if (freshUser.role === "jobseeker") redirectTo = "/jobseeker";
      else if (freshUser.role === "expert") redirectTo = "/expert";
    }

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
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------------------------
// SET ROLE
// ---------------------------------------
exports.setRole = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    const { role } = req.body;
    req.user.role = role;
    await req.user.save();

    res.json({ success: true, message: "Role updated", user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
