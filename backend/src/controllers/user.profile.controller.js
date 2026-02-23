// src/controllers/user.profile.controller.js

const userService = require("../services/user.service");

// ----------------------------------
// CREATE OR UPDATE USER PROFILE
// ----------------------------------
exports.createProfile = async (req, res) => {
  try {
    console.log("🔥 Received Body:", req.body);
    console.log("🔥 Received File:", req.file);
    console.log("🔥 Auth User:", req.user);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const profile = await userService.createUserProfile(
      req.user.id,
      req.body,
      req.file
    );

    // Mark user as having completed profile
    await req.user.update({ hasProfile: true });

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (err) {
    console.error("❌ ERROR creating/updating user profile:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ----------------------------------
// GET USER PROFILE
// ----------------------------------
exports.getProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);

    return res.json({ success: true, data: profile });
  } catch (err) {
    if (err.message === "Profile not found") {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    console.error("❌ ERROR fetching user profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
