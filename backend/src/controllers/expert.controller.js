// src/controllers/expert.controller.js

const expertService = require("../services/expert.service");

// ================= GET ALL =================
exports.getAllExperts = async (req, res) => {
  try {
    const { skill } = req.query;

    // ✅ If skill query param exists, filter by skill
    let experts;
    if (skill && skill !== "All") {
      experts = await expertService.getExpertsBySkill(skill);
    } else {
      experts = await expertService.getAllExperts();
    }

    return res.status(200).json({
      success: true,
      data: experts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= CREATE EXPERT =================
exports.createExpert = async (req, res) => {
  try {
    const expert = await expertService.createExpert(req.body);

    return res.status(201).json({
      success: true,
      data: expert,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADD SKILLS =================
exports.addSkills = async (req, res) => {
  try {
    const expertId = req.params.expertId;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: "skills must be array" });
    }

    await expertService.addSkills(expertId, skills);

    return res.json({ success: true, message: "Skills added" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE EXPERT =================
exports.updateExpert = async (req, res) => {
  try {
    const { id } = req.params;

    await expertService.updateExpert(id, req.body);

    return res.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= RECOMMENDED =================
exports.getRecommendedExperts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const experts = await expertService.getRecommendedExperts(limit);

    return res.json(experts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ================= SEARCH BY HEADLINE =================
exports.searchExpertsByHeadline = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({ success: false, message: "Skill is required" });
    }

    const experts = await expertService.searchExpertsByHeadline(skill);

    return res.json({ success: true, data: experts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= ONLINE EXPERTS =================
exports.getOnlineExperts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const experts = await expertService.getOnlineExperts(limit);

    return res.status(200).json({
      success: true,
      data: experts,
    });
  } catch (err) {
    console.error("getOnlineExperts error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ✅ GET EXPERTS BY SKILL =================
exports.getExpertsBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill || skill === "All") {
      const experts = await expertService.getAllExperts();
      return res.status(200).json({ success: true, data: experts });
    }

    const experts = await expertService.getExpertsBySkill(skill);

    return res.status(200).json({
      success: true,
      data: experts,
    });
  } catch (err) {
    console.error("getExpertsBySkill error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};