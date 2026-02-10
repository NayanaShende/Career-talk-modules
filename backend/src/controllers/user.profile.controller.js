const { UserProfile } = require("../models");
const upload = require("../middleware/upload");


exports.createProfile = async (req, res) => {
  try {
    console.log("🔥 Received Body:", req.body);
    console.log("🔥 Received File:", req.file);
    console.log("🔥 Auth User:", req.user.id);

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const profileData = {
      fullName: req.body.fullName,
      email: req.body.email,
      dob: req.body.dob,
      qualification: req.body.qualification,
      experience: req.body.experience,
      domain: req.body.domain,
      cvFile: req.file ? req.file.filename : null,
      userId: req.user.id,
    };

    const profile = await UserProfile.create(profileData);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
