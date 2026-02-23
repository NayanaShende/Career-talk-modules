const { User } = require("../models");

const normalizeMobile = (mobile) =>
  String(mobile).replace(/\D/g, "").slice(-10);

// Generate OTP
const generateOtp = async (mobile) => {
  mobile = normalizeMobile(mobile);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiryAt = new Date(Date.now() + 5 * 60 * 1000);

  let user = await User.findOne({ where: { mobile } });

  if (user) {
    user.otp = otp;
    user.otpExpiryAt = otpExpiryAt;
    user.isVerified = false;
    await user.save();
  } else {
    user = await User.create({
      mobile,
      otp,
      otpExpiryAt,
      isVerified: false,
    });
  }

  console.log("Generated OTP:", otp);

  return otp;
};

// Verify OTP
const verifyOtp = async (mobile, otp) => {
  mobile = normalizeMobile(mobile);

  const user = await User.findOne({ where: { mobile } });

  if (!user) throw new Error("User not found");

  if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
    throw new Error("Invalid OTP");
  }

  if (!user.otpExpiryAt || new Date() > new Date(user.otpExpiryAt)) {
    throw new Error("OTP expired");
  }

  user.otp = null;
  user.otpExpiryAt = null;
  user.isVerified = true;
  await user.save();

  return user;
};

// Get user
const getUserByMobile = async (mobile) => {
  mobile = normalizeMobile(mobile);
  return await User.findOne({ where: { mobile } });
};

module.exports = {
  generateOtp,
  verifyOtp,
  getUserByMobile,
};
