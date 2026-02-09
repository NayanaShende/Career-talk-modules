const { Expert } = require("../models");

const expertService = require("../services/expert.service");

// GET /api/experts/recommended
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

// GET /api/experts/search?skill=React
exports.searchExperts = async (req, res) => {
  try {
    const { skill } = req.query;

    const experts = await expertService.searchExperts(skill);

    return res.status(200).json({
      success: true,
      data: experts,
    });
  } catch (error) {
    console.error("searchExperts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search experts",
    });
  }
};
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await Expert.findAll();

    res.json({
      success: true,
      data: experts,
    });
  } catch (error) {
    console.error("Controller Error (All Experts):", error);
    res.status(500).json({ success: false });
  }
};
