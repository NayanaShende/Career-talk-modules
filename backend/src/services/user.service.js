const { User } = require("../models");

// Generate OTP
const generateOtp = async (mobile) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // OTP valid for 5 minutes
  const otpExpiryAt = new Date(Date.now() + 5 * 60 * 1000);

  // Check if user exists
  let user = await User.findOne({ where: { mobile } });

  if (user) {
    // Update existing user OTP
    user.otp = otp;
    user.otpExpiryAt = otpExpiryAt;
    user.isVerified = false;
    await user.save();
  } else {
    // Create new user with OTP
    user = await User.create({
      mobile,
      otp,
      otpExpiryAt,
      isVerified: false,
    });
  }

  console.log("Generated OTP for", mobile, ":", otp); // For debug only

  return otp;
};

// Verify OTP
const verifyOtp = async (mobile, otp) => {
  const user = await User.findOne({ where: { mobile } });

  if (!user) throw new Error("User not found");

if (String(user.otp) !== String(otp)) {
    throw new Error("Invalid OTP");
}

  if (new Date() > new Date(user.otpExpiryAt)) throw new Error("OTP expired");

  // OTP valid, mark user verified
  user.otp = null;
  user.otpExpiryAt = null;
  user.isVerified = true;
  await user.save();

  return user;
};

// Get user by mobile
const getUserByMobile = async (mobile) => {
  return await User.findOne({ where: { mobile } });
};

module.exports = {
  generateOtp,
  verifyOtp,
  getUserByMobile,
};
