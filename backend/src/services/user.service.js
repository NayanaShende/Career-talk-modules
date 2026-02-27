// src/services/user.service.js

const userRepo = require("../repositories/user.repository");

const normalizeMobile = (mobile) =>
  String(mobile || "").replace(/\D/g, "").slice(-10);

// ================== Generate OTP ==================
const generateOtp = async (mobile) => {
  mobile = normalizeMobile(mobile);

  if (!mobile || mobile.length !== 10) {
    throw new Error("Invalid mobile number");
  }

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
      role: "user", // default role
      hasProfile: false,
    });
  }

  console.log("Generated OTP for", mobile, ":", otp);

  return otp;
};

// ================== Verify OTP ==================
const verifyOtp = async (mobile, otp) => {
  mobile = normalizeMobile(mobile);

  const user = await userRepo.findUserByMobile(mobile);

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

  await userRepo.saveUser(user);

  return user;
};

// ================== Get User ==================
const getUserByMobile = async (mobile) => {
  mobile = normalizeMobile(mobile);
  return await userRepo.findUserByMobile(mobile);
};

// ================== Create / Update Profile ==================
const createUserProfile = async (userId, profileData, file) => {
  if (!userId) throw new Error("User ID required");

  const data = {
    fullName: profileData.fullName || null,
    email: profileData.email || null,
    dob: profileData.dob || null,
    qualification: profileData.qualification || null,
    experience: profileData.experience || null,
    domain: profileData.domain || null,
    role: profileData.role || "user",
    cvFile: file ? file.filename : null,
    userId,
  };

  let profile = await userRepo.findProfileByUserId(userId);

  if (profile) {
    profile = await userRepo.updateProfile(profile, data);
  } else {
    profile = await userRepo.createProfile(data);
  }

  // ✅ Mark user hasProfile true
  const user = await userRepo.findUserById
    ? await userRepo.findUserById(userId)
    : null;

  if (user) {
    user.hasProfile = true;

    // ✅ If role selected as expert, update role
    if (profileData.role === "expert") {
      user.role = "expert";
    }

    await userRepo.saveUser(user);
  }

  return profile;
};

// ================== Get Profile ==================
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