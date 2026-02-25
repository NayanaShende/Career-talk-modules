// src/controllers/expert.profile.controller.js

const expertService = require("../services/expert.service");

// ✅ IMPORT MAIN EXPERT CONTROLLER (IMPORTANT FIX)
const expertController = require("./expert.controller");

// ------------------------------
// CREATE OR UPDATE EXPERT PROFILE
// ------------------------------
exports.createExpertProfile = async (req, res) => {
  try {
    console.log("🔥 Received Body:", req.body);
    console.log("🔥 Received File:", req.file);
    console.log("🔥 Auth User:", req.user);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const profile = await expertService.createExpertProfile(
      req.user.id,
      req.body,
      req.file
    );

    await req.user.update({ hasProfile: true });

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (err) {
    console.error("❌ ERROR creating/updating expert profile:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ------------------------------
// GET EXPERT PROFILE
// ------------------------------
exports.getExpertProfile = async (req, res) => {
  try {
    const profile = await expertService.getExpertProfile(req.user.id);

    return res.json({ success: true, data: profile });
  } catch (err) {
    if (err.message === "Profile not found") {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    console.error("❌ ERROR fetching expert profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== SAFE EXPORT FIX =====================
// ✅ Reuse functions from main expert controller
module.exports = {
  // FROM MAIN CONTROLLER
  getAllExperts: expertController.getAllExperts,
  searchExpertsByHeadline: expertController.searchExpertsByHeadline,
  getRecommendedExperts: expertController.getRecommendedExperts,
  getOnlineExperts: expertController.getOnlineExperts,
  getExpertById: expertController.getExpertById,
  createExpert: expertController.createExpert,
  updateExpert: expertController.updateExpert,
  addSkills: expertController.addSkills,

  // PROFILE FUNCTIONS
  createExpertProfile: exports.createExpertProfile,
  getExpertProfile: exports.getExpertProfile,
};