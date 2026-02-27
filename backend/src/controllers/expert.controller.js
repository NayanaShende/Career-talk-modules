const expertService = require("../services/expert.service");

// ================= GET ALL =================
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await expertService.getAllExperts();
    res.status(200).json({ success: true, data: experts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= CREATE =================
exports.createExpertProfile = async (req, res) => {
  try {
    const expert = await expertService.createExpert(req.body);
    res.status(201).json({
      success: true,
      message: "Expert profile created",
      data: expert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE =================
exports.updateExpertProfile = async (req, res) => {
  try {
    const expert = await expertService.updateExpert(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Expert updated",
      data: expert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADD SKILLS =================
exports.addSkills = async (req, res) => {
  try {
    const { expertId } = req.params;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res
        .status(400)
        .json({ success: false, message: "skills must be an array" });
    }

    await expertService.addSkills(expertId, skills);

    res.json({ success: true, message: "Skills added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= RECOMMENDED =================
exports.getRecommendedExperts = async (req, res) => {
  try {
    const experts = await expertService.getRecommendedExperts();
    res.json({ success: true, data: experts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ONLINE =================
exports.getOnlineExperts = async (req, res) => {
  try {
    const experts = await expertService.getOnlineExperts();
    res.status(200).json({ success: true, data: experts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET BY ID =================
exports.getExpertById = async (req, res) => {
  try {
    const expert = await expertService.getExpertById(req.params.id);

    if (!expert) {
      return res
        .status(404)
        .json({ success: false, message: "Expert not found" });
    }

    res.status(200).json({ success: true, data: expert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
