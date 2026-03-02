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

    // ✅ BASIC VALIDATION - removed domain from required since we now use skills
    if (
      !fullName ||
      !email ||
      !dob ||
      !qualification ||
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
    const imageFile = req.files?.image?.[0];

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
          domain: domain || null,
          bio: bio || null,
          location: location || null,
          language_spoken: languages || null,
          certification: certificate || null,
          cv: cvFile ? cvFile.filename : null,
          image: imageFile ? imageFile.filename : null,
        });
      } else {
        // 3️⃣ Update existing expert
        await expert.update({
          name: fullName,
          experience: parseInt(experience) || expert.experience,
          domain: domain || expert.domain,
          bio: bio || expert.bio,
          location: location || expert.location,
          language_spoken: languages || expert.language_spoken,
          certification: certificate || expert.certification,
          cv: cvFile ? cvFile.filename : expert.cv,
          image: imageFile ? imageFile.filename : expert.image,
        });
      }

      // ✅ NEW: Return expertId so frontend can save skills
      return res.json({
        success: true,
        message: "Profile saved successfully",
        user: req.user,
        data: {
          expertId: expert.id, // ✅ frontend needs this to save skills
        },
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