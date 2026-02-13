const db = require("../models"); // import your models
const ExpertProfile = db.ExpertProfile; // ✅ ADD THIS
const upload = require("../middleware/upload"); // multer middleware
// your multer middleware

// ------------------------------
// CREATE OR UPDATE EXPERT PROFILE
// ------------------------------
exports.createExpertProfile = async (req, res) => {
  try {
    console.log("🔥 Received Body:", req.body);
    console.log("🔥 Received File:", req.file);
    console.log("🔥 Auth User:", req.user);

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const profileData = {
      fullName: req.body.fullName || null,
      email: req.body.email || null,
      dob: req.body.dob || null,
      qualification: req.body.qualification || null,
      experience: req.body.experience || null,
      domain: req.body.domain || null,
      certifications: req.body.certifications || null, // must match frontend
      linkedIn: req.body.linkedIn || null, // must match frontend
      cvFile: req.file ? req.file.filename : null,
      userId: req.user.id,
    };

    // Check if profile exists
    let profile = await ExpertProfile.findOne({
      where: { userId: req.user.id },
    });

    if (profile) {
      profile = await profile.update(profileData);
    } else {
      profile = await UserProfile.create(profileData);
    }

    // ⭐ Mark user as having completed profile
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
    const profile = await ExpertProfile.findOne({
      where: { userId: req.user.id },
    });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error("❌ ERROR fetching expert profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
