// src/controllers/auth.controller.js

const authService = require("../services/auth.service");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { normalizeMobile } = require("../utils/normalizeMobile");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

// ---------------------------------------
// SEND OTP
// ---------------------------------------
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile required",
      });
    }

    const normalizedMobile = normalizeMobile(mobile);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiryAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({
      where: { mobile: normalizedMobile },
    });

    if (!user) {
      user = await User.create({
        mobile: normalizedMobile,
        otp,
        otpExpiryAt,
        isVerified: false,
        role: "user", // ✅ FIXED (was null)
        hasProfile: false,
      });
    } else {
      await user.update({
        otp,
        otpExpiryAt,
        isVerified: false,
      });
    }

    const { otp: sentOtp } = await authService.sendOtp(mobile);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp: sentOtp, // remove in production
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ---------------------------------------
// VERIFY OTP
// ---------------------------------------
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    const normalizedMobile = normalizeMobile(mobile);
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({
      where: { mobile: normalizedMobile },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || String(user.otp).trim() !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiryAt && new Date() > new Date(user.otpExpiryAt)) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    await user.update({
      otp: null,
      isVerified: true,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const freshUser = await User.findByPk(user.id);

    let redirectTo = "";

    if (!freshUser.hasProfile) {
      redirectTo = "/profile";
    } else {
      redirectTo = "/dashboard";
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
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ---------------------------------------
// SET ROLE  ✅ FIXED - now calls authService.setRole()
// ---------------------------------------
exports.setRole = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // ✅ FIX: Call authService.setRole() so expert record gets created
    const updatedUser = await authService.setRole(req.user, role.toLowerCase());

    return res.json({
      success: true,
      message: "Role updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Set role error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File required",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    return res.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Upload failed",
    });
  }
};