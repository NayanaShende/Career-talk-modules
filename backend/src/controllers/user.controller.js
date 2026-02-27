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

<<<<<<< HEAD
    const { fullName, email, dob, qualification, experience, domain, role } =
      req.body;
=======
    const {
      fullName,
      email,
      dob,
      qualification,
      experience,
      domain,
      role, // ✅ DEFINE ROLE HERE
    } = req.body;
>>>>>>> faf22664448805d4a8455879ac84a3bc9e77a186

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

<<<<<<< HEAD
    // ✅ Prepare updateData
=======
    // ✅ Prepare update object
    // ✅ Prepare updateData object properly
>>>>>>> faf22664448805d4a8455879ac84a3bc9e77a186
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

    // 🔥 If role = expert → create or update expert table
    if (role === "expert") {
      await authService.setRole(req.user, role);

      // 1️⃣ Check if expert exists
      let expert = await expertRepository.findExpertByUserId(req.user.id);

      // 2️⃣ If not exists → create
      if (!expert) {
        expert = await expertRepository.createExpert({
          userId: req.user.id,
          name: fullName,
          experience: parseInt(experience) || 0,
          rating: 0,
          is_online: false,
          domain: domain,
          bio: `${qualification} | ${experience} years experience`,
          location: domain,
          language_spoken: "English",
          cv: req.file ? req.file.filename : null,
        });
      } else {
        // 3️⃣ Update existing expert
        await expert.update({
          name: fullName,
          experience: parseInt(experience) || expert.experience,
          domain: domain,
          bio: `${qualification} | ${experience} years experience`,
          location: domain,
          language_spoken: expert.language_spoken || "English",
          cv: req.file ? req.file.filename : expert.cv,
        });
      }
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
      message: err.message || "Server error",
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