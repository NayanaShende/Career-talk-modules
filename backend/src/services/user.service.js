// src/services/user.service.js

const userRepo = require("../repositories/user.repository");

<<<<<<< HEAD
const normalizeMobile = (mobile) =>
  String(mobile).replace(/\D/g, "").slice(-10);

// Generate OTP
const generateOtp = async (mobile) => {
  mobile = normalizeMobile(mobile);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiryAt = new Date(Date.now() + 5 * 60 * 1000);

  let user = await User.findOne({ where: { mobile } });
=======
const generateOtp = async (mobile) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiryAt = new Date(Date.now() + 5 * 60 * 1000);

  let user = await userRepo.findUserByMobile(mobile);
>>>>>>> be472dc42a199b58c8a839293261594068cffcca

  if (user) {
    user.otp = otp;
    user.otpExpiryAt = otpExpiryAt;
    user.isVerified = false;
    await userRepo.saveUser(user);
  } else {
<<<<<<< HEAD
    user = await User.create({
=======
    user = await userRepo.createUser({
>>>>>>> be472dc42a199b58c8a839293261594068cffcca
      mobile,
      otp,
      otpExpiryAt,
      isVerified: false,
    });
  }

<<<<<<< HEAD
  console.log("Generated OTP:", otp);
=======
  console.log("Generated OTP for", mobile, ":", otp);
>>>>>>> be472dc42a199b58c8a839293261594068cffcca

  return otp;
};

const verifyOtp = async (mobile, otp) => {
<<<<<<< HEAD
  mobile = normalizeMobile(mobile);

  const user = await User.findOne({ where: { mobile } });

  if (!user) throw new Error("User not found");

  if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
    throw new Error("Invalid OTP");
  }
=======
  const user = await userRepo.findUserByMobile(mobile);

  if (!user) throw new Error("User not found");

  if (String(user.otp) !== String(otp)) throw new Error("Invalid OTP");
>>>>>>> be472dc42a199b58c8a839293261594068cffcca

  if (!user.otpExpiryAt || new Date() > new Date(user.otpExpiryAt)) {
    throw new Error("OTP expired");
  }

  user.otp = null;
  user.otpExpiryAt = null;
  user.isVerified = true;
  await userRepo.saveUser(user);

  return user;
};

<<<<<<< HEAD
// Get user
const getUserByMobile = async (mobile) => {
  mobile = normalizeMobile(mobile);
  return await User.findOne({ where: { mobile } });
=======
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
>>>>>>> be472dc42a199b58c8a839293261594068cffcca
};

module.exports = {
  generateOtp,
  verifyOtp,
  getUserByMobile,
  createUserProfile,
  getUserProfile,
};
