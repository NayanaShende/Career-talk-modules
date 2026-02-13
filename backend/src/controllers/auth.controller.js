// src/controllers/auth.controller.js

const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ------------------------------
// HELPER FUNCTION TO NORMALIZE MOBILE
// ------------------------------
const normalizeMobile = (mobile) => mobile.replace(/\D/g, "").slice(-10);

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

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiryAt = new Date(Date.now() + 10 * 60 * 1000); // JS Date object

    // Find or create user
    let user = await User.findOne({ where: { mobile: normalizedMobile } });

    if (!user) {
      user = await User.create({
        mobile: normalizedMobile,
        otp: otp, // ensure this is passed
        otpExpiryAt: otpExpiryAt,
        isVerified: false,
      });
    } else {
      await user.update({
        otp: otp,
        otpExpiryAt: otpExpiryAt,
        isVerified: false,
      });
    }

    console.log("🔥 OTP SAVED:", otp, otpExpiryAt);
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
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

    const user = await User.findOne({ where: { mobile: normalizedMobile } });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    if (String(user.otp) !== String(otp))
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    const now = Date.now();
    const expiry = new Date(user.otpExpiryAt).getTime();

    if (now > expiry) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP valid
    user.otp = null;
    user.otpExpiryAt = null;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // Refresh user to include latest hasProfile
    const freshUser = await User.findByPk(user.id);

    // ------------------------------
    // Decide where user should go
    // ------------------------------
    let redirectTo = "";

    if (freshUser.hasProfile === true) {
      redirectTo = "/dashboard";
    } else {
      if (!freshUser.role) {
        redirectTo = "/select-role";
      } else if (freshUser.role === "jobseeker") {
        redirectTo = "/jobseeker";
      } else if (freshUser.role === "expert") {
        redirectTo = "/expert";
      }
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
