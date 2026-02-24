// src/services/user.service.js

const userRepo = require("../repositories/user.repository");

const generateOtp = async (mobile) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiryAt = new Date(Date.now() + 5 * 60 * 1000);

  let user = await userRepo.findUserByMobile(mobile);

  if (user) {
    user.otp = otp;
    user.otpExpiryAt = otpExpiryAt;
    user.isVerified = false;
    await userRepo.saveUser(user);
  } else {
    user = await userRepo.createUser({
      mobile,
      otp,
      otpExpiryAt,
      isVerified: false,
    });
  }

  console.log("Generated OTP for", mobile, ":", otp);

  return otp;
};

const verifyOtp = async (mobile, otp) => {
  const user = await userRepo.findUserByMobile(mobile);

  if (!user) throw new Error("User not found");

  if (String(user.otp) !== String(otp)) throw new Error("Invalid OTP");

  if (!user.otpExpiryAt || new Date() > new Date(user.otpExpiryAt)) {
    throw new Error("OTP expired");
  }

  user.otp = null;
  user.otpExpiryAt = null;
  user.isVerified = true;
  await userRepo.saveUser(user);

  return user;
};

const getUserByMobile = async (mobile) => {
  return await userRepo.findUserByMobile(mobile);
};

const createUserProfile = async (userId, profileData, file) => {
  const data = {
    ...profileData,
    cvFile: file ? file.filename : null,
    userId,
  };

  let profile = await userRepo.findProfileByUserId(userId);

  if (profile) {
    profile = await userRepo.updateProfile(profile, data);
  } else {
    profile = await userRepo.createProfile(data);
  }

  return profile;
};

const getUserProfile = async (userId) => {
  const profile = await userRepo.findProfileByUserId(userId);
  if (!profile) throw new Error("Profile not found");
  return profile;
};

module.exports = {
  generateOtp,
  verifyOtp,
  getUserByMobile,
  createUserProfile,
  getUserProfile,
};
