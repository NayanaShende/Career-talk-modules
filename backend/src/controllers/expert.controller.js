const { Expert } = require("../models");
const { ExpertSkill } = require("../models");
const expertService = require("../services/expert.service");

// ================= GET ALL =================
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await Expert.findAll({
      include: { model: ExpertSkill, as: "skills" }
    });

    res.json(experts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// ================= CREATE EXPERT =================
exports.createExpert = async (req, res) => {
  try {
    const expert = await Expert.create(req.body);
    res.status(201).json(expert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= ADD SKILL =================

exports.addSkills = async (req, res) => {
  try {
    const expertId = req.params.expertId; // ✅ correct param
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: "skills must be array" });
    }

    const skillRows = skills.map((skill) => ({
      expert_id: expertId,
      skill_name: skill   // ✅ MUST match model column
    }));

    await ExpertSkill.bulkCreate(skillRows);

    res.json({
      success: true,
      message: "Skills added"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE PROFILE =================
exports.updateExpert = async (req, res) => {
  try {
    const { id } = req.params;

    await Expert.update(req.body, { where: { id } });

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecommendedExperts = async (req, res) => {
  try {
    const experts = await expertService.getRecommendedExperts();

    return res.status(200).json({
      success: true,
      data: experts,
    });
  } catch (error) {
    console.error("getRecommendedExperts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recommended experts",
    });
  }
};