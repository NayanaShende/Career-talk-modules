const { User } = require("../models");

exports.saveProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ FIX 1: Added `role` to destructuring
    const { fullName, email, dob, qualification, experience, domain, role } =
      req.body;

    // ✅ BASIC VALIDATION
    if (
      !fullName ||
      !email ||
      !dob ||
      !qualification ||
      !domain ||
      !experience
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // ✅ EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ✅ FIX 2: Prepare updateData object properly
    const updateData = {
      fullName,
      email,
      dob,
      qualification,
      domain,
      experience,
      role,
      hasProfile: true,
    };

    // ✅ FIX 3: Save CV file if uploaded (moved before update)
    if (req.file) {
      updateData.cvFile = req.file.filename;
    }

    // ✅ FIX 4: Single update call with all data including cv
    await req.user.update(updateData);

    return res.json({
      success: true,
      message: "Profile saved successfully",
      user: req.user,
    });
  } catch (err) {
    console.error("SAVE PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};