const { Expert, ExpertSkill } = require("../models");
const expertService = require("../services/expert.service");

// ================= GET ALL =================
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await Expert.findAll({
      include: { model: ExpertSkill, as: "skills" }
    });

    return res.status(200).json({
      success: true,
      data: experts
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ================= CREATE EXPERT =================
exports.createExpert = async (req, res) => {
  try {
    const expert = await Expert.create(req.body);

    return res.status(201).json({
      success: true,
      data: expert
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ================= ADD SKILLS =================
exports.addSkills = async (req, res) => {
  try {
    const expertId = req.params.expertId;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "skills must be array"
      });
    }

    const skillRows = skills.map((skill) => ({
      expert_id: expertId,
      skill_name: skill
    }));

    await ExpertSkill.bulkCreate(skillRows);

    return res.json({
      success: true,
      message: "Skills added"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ================= UPDATE PROFILE =================
exports.updateExpert = async (req, res) => {
  try {
    const { id } = req.params;

    await Expert.update(req.body, { where: { id } });

    return res.json({
      success: true,
      message: "Updated successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ================= RECOMMENDED =================
exports.getRecommendedExperts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const experts = await Expert.findAll({
      order: [["createdAt", "DESC"]],
      limit: limit,
    });

    res.json(experts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= ONLINE TOP EXPERTS (NEW) =================
exports.getOnlineExperts = async (req, res) => {
  try {

    const limit = parseInt(req.query.limit) || 10;

    const experts = await Expert.findAll({
      where: { is_online: true },   // only online experts

      include: { model: ExpertSkill, as: "skills" },

      order: [
        ["rating", "DESC"],
        ["experience", "DESC"],
        ["id", "DESC"],
      ],

      limit: limit,
    });

    return res.status(200).json({
      success: true,
      data: experts
    });

  } catch (err) {
    console.error("getOnlineExperts error:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
