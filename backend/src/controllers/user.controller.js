const { User } = require("../models");
const authService = require("../services/auth.service"); // ✅ ADDED
const expertRepository = require("../repositories/expert.repository"); // ✅ ADDED

exports.saveProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      fullName,
      email,
      dob,
      qualification,
      experience,
      domain,
      role, // ✅ DEFINE ROLE HERE
    } = req.body;

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

    // ✅ Prepare update object
    // ✅ Prepare updateData object properly
    const updateData = {
      fullName,
      email,
      dob,
      qualification,
      domain,
      experience,
      role: role || req.user.role, // keep old role if not provided
      hasProfile: true,
    };

    // ✅ Save CV file if uploaded
    if (req.file) {
      updateData.cvFile = req.file.filename;
    }

    // ✅ Update user
    await req.user.update(updateData);

    // 🔥 VERY IMPORTANT: create/update expert if role = expert
    if (role === "expert") {
      await authService.setRole(req.user, role);

      // 1️⃣ Check if expert row exists
      let expert = await expertRepository.findExpertByUserId(req.user.id);

      // 2️⃣ If not exists → create expert row
      if (!expert) {
        expert = await expertRepository.createExpert({
          userId: req.user.id,
          name: fullName,
          experience: 0,
          rating: 0,
          is_online: false,
        });
      }

      // 3️⃣ Always update expert professional info
      await expert.update({
        name: fullName,
        skill: domain,
        headline: qualification,
        bio: `${qualification} | ${experience} years experience`,
        location: domain,
        language_spoken: "English",
        cv: req.file ? req.file.filename : expert.cv,
      });
    }

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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};