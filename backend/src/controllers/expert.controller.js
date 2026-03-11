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

// ================= SUBMIT EXPERT PROFILE FORM =================
// ✅ called when expert fills out the profile form
// saves to Experts table using userId from JWT token
exports.submitExpertProfileForm = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ FIXED: multer.fields() puts files in req.files (object), not req.file
    // req.file is only set when using upload.single()
    const files = req.files || {};

    const cvFile = files.cv ? files.cv[0] : null;
    const imageFile = files.image ? files.image[0] : null;
    const certificateFile = files.certificate ? files.certificate[0] : null;

    console.log("📁 Uploaded files:", {
      cv: cvFile?.filename,
      image: imageFile?.filename,
      certificate: certificateFile?.filename,
    });

    const expert = await expertService.createExpertProfile(
      userId,
      req.body,
      cvFile,
      imageFile,
      certificateFile,
    );

    res.status(200).json({
      success: true,
      message: "Expert profile saved successfully",
      data: expert,
    });
  } catch (error) {
    console.error("submitExpertProfileForm error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MY PROFILE =================
exports.getMyExpertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await expertService.getExpertProfile(userId);

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No expert profile found. Please complete your profile.",
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("getMyExpertProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE MY EXPERT PROFILE (Protected) =================
// ✅ NEW: PUT /api/experts/profile/me
// Updates Experts table using userId from JWT — fixes language_spoken & certification not saving
exports.updateMyExpertProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from auth middleware (JWT)

    // ✅ Support both multipart/form-data (with file) and JSON
    const file = req.file || null;

    // ✅ FIXED: map both "certification" AND "certifications" so either works
    const body = {
      ...req.body,
      certifications: req.body.certification || req.body.certifications || null,
    };

    console.log("📝 updateMyExpertProfile — userId:", userId);
    console.log("📝 body:", JSON.stringify(body));

    // ✅ reuse createExpertProfile which already does upsert (update or create)
    const expert = await expertService.createExpertProfile(userId, body, file);

    res.status(200).json({
      success: true,
      message: "Expert profile updated successfully",
      data: expert,
    });
  } catch (error) {
    console.error("updateMyExpertProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE =================
exports.updateExpertProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    const expert = await expertService.updateExpert(Number(id), req.body);
    res
      .status(200)
      .json({ success: true, message: "Expert updated", data: expert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADD SKILLS =================
exports.addSkills = async (req, res) => {
  try {
    const { expertId } = req.params;
    const { skills } = req.body;

    if (!expertId || isNaN(expertId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    if (!skills || !Array.isArray(skills)) {
      return res
        .status(400)
        .json({ success: false, message: "skills must be an array" });
    }

    await expertService.addSkills(Number(expertId), skills);
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
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    const expert = await expertService.getExpertById(Number(id));

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

// ================= GET DOMAINS LIST =================
// ✅ returns 10 domains for frontend dropdown
// No auth required — public route
exports.getDomainsList = async (req, res) => {
  try {
    const domains = [
      "Career Counseling",
      "Software Engineering",
      "Data Science & AI",
      "Finance & Investment",
      "Marketing & Branding",
      "Health & Wellness",
      "Legal Advisory",
      "Business Strategy",
      "Education & Tutoring",
      "Human Resources",
    ];
    res.status(200).json({ success: true, data: domains });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};