const { User } = require("../models");
const authService = require("../services/auth.service");
const expertRepository = require("../repositories/expert.repository");

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
      role,
      // ✅ EXPERT FIELDS - these were missing before!
      bio,
      location,
      languages,
      certificate,
      certifiedCity,
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

    // ✅ Get cv and image from req.files (updated from req.file)
    const cvFile = req.files?.cv?.[0];
    const imageFile = req.files?.image?.[0]; // ✅ NEW

    // ✅ Prepare updateData
    const updateData = {
      fullName,
      email,
      dob,
      qualification,
      domain,
      experience,
      role: role || req.user.role,
      hasProfile: true,
    };

    // ✅ Save CV file if uploaded
    if (cvFile) {
      updateData.cvFile = cvFile.filename;
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
          domain: domain, // ✅ correct
          bio: bio || null, // ✅ from form
          location: location || null, // ✅ from form (was domain before!)
          language_spoken: languages || null, // ✅ from form (was hardcoded "English"!)
          certification: certificate || null, // ✅ from form
          cv: cvFile ? cvFile.filename : null,
          image: imageFile ? imageFile.filename : null, // ✅ NEW
        });
      } else {
        // 3️⃣ Update existing expert
        await expert.update({
          name: fullName,
          experience: parseInt(experience) || expert.experience,
          domain: domain, // ✅ correct
          bio: bio || expert.bio, // ✅ from form
          location: location || expert.location, // ✅ from form
          language_spoken: languages || expert.language_spoken, // ✅ from form
          certification: certificate || expert.certification, // ✅ from form
          cv: cvFile ? cvFile.filename : expert.cv,
          image: imageFile ? imageFile.filename : expert.image, // ✅ NEW
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
