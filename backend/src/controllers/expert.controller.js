// src/controllers/expert.controller.js

const expertService = require("../services/expert.service");

// ================= GET ALL =================
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await expertService.getAllExperts();

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


// ================= GET EXPERT BY ID =================
exports.getExpertById = async (req, res) => {
  try {
    const { id } = req.params;

    const expert = await expertService.getExpertById(id);

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expert,
    });
  } catch (err) {
    console.error("getExpertById error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.searchExperts = async (req, res) => {
  const { skill } = req.query;

  const experts = await Expert.findAll({
    where: {
      headline: {
        [Op.iLike]: `%${skill}%`,
      },
    },
  });

  res.json(experts);
};