// src/services/auth.service.js

const jwt = require("jsonwebtoken");
const authRepo = require("../repositories/auth.repository");
const expertRepository = require("../repositories/expert.repository");

const sendOtp = async (mobile) => {
  const normalizedMobile = authRepo.normalizeMobile(mobile);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiryAt = new Date(Date.now() + 10 * 60 * 1000);

  let user = await authRepo.findUserByMobile(normalizedMobile);

  if (!user) {
    user = await authRepo.createUser({
      mobile: normalizedMobile,
      otp,
      otpExpiryAt,
      isVerified: false,
    });
  } else {
    await authRepo.updateUser(user, {
      otp,
      otpExpiryAt,
      isVerified: false,
    });
  }

  console.log("🔥 OTP SAVED FOR", normalizedMobile, ":", otp);

  return { normalizedMobile, otp };
};

const verifyOtp = async (mobile, otp) => {
  const normalizedMobile = authRepo.normalizeMobile(mobile);
  const cleanOtp = String(otp).trim();

  const user = await authRepo.findUserByMobile(normalizedMobile);

  if (!user) throw new Error("User not found");

  if (!user.otp || String(user.otp).trim() !== cleanOtp) {
    throw new Error("Invalid OTP");
  }

  if (!user.otpExpiryAt || Date.now() > new Date(user.otpExpiryAt).getTime()) {
    throw new Error("OTP expired");
  }

  user.otp = null;
  user.otpExpiryAt = null;
  user.isVerified = true;
  await user.save();

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const freshUser = await authRepo.findUserById(user.id);

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

  return { token, redirectTo, freshUser };
};

const setRole = async (user, role) => {
  console.log("🔥 setRole called with role:", role);

  // ✅ Only update role on User record — do NOT auto-create expert here
  // Expert creation with full data is handled in user.controller.js
  if (user.role !== role) {
    user.role = role;
    await user.save();
    console.log("✅ User role updated to:", role);
  }

  return user;
};

module.exports = {
  sendOtp,
  verifyOtp,
  setRole,
};