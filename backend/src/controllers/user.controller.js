const { User } = require("../models");
const authService = require("../services/auth.service");
const expertRepository = require("../repositories/expert.repository");

exports.saveProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      fullName,
      email,
      dob,
      qualification,
      experience,
      domain,
      role,
      bio,
      location,
      languages,
      certificate,
      certifiedCity,
      skills,
    } = req.body;

    if (!fullName || !email || !dob || !qualification || !experience) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    const cvFile = req.files?.cv?.[0];
    const imageFile = req.files?.image?.[0];

    // ✅ Users table — basic fields only
    const updateData = {
      fullName,
      email,
      dob,
      role: role || req.user.role,
      hasProfile: true,
      skills: skills || null,
    };

    await req.user.update(updateData);

    // ✅ If role = expert → create or update Experts table
    if (role === "expert") {
      await authService.setRole(req.user, role);

      let expert = await expertRepository.findExpertByUserId(req.user.id);

      if (!expert) {
        expert = await expertRepository.createExpert({
          userId: req.user.id,
          name: fullName,
          experience: parseInt(experience) || 0,
          rating: 0,
          is_online: false,
          domain: domain || null, // ✅ FIXED: was saving null before
          bio: bio || null,
          location: location || null,
          language_spoken: languages || null,
          certification: certificate || null,
          cv: cvFile ? cvFile.filename : null,
          image: imageFile ? imageFile.filename : null,
        });
      } else {
        await expert.update({
          name: fullName,
          experience: parseInt(experience) || expert.experience,
          domain: domain !== undefined ? domain : expert.domain, // ✅ FIXED: was overwriting with null if domain not sent
          bio: bio !== undefined ? bio : expert.bio,
          location: location !== undefined ? location : expert.location,
          language_spoken:
            languages !== undefined ? languages : expert.language_spoken,
          certification:
            certificate !== undefined ? certificate : expert.certification,
          cv: cvFile ? cvFile.filename : expert.cv,
          image: imageFile ? imageFile.filename : expert.image,
        });
      }

      // ✅ Save skills to ExpertSkills table
      if (skills) {
        const skillsArray = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (skillsArray.length > 0) {
          const skillRows = skillsArray.map((skill_name) => ({
            expert_id: expert.id,
            skill_name,
          }));
          await expertRepository.bulkCreateSkills(skillRows);
        }
      }

      return res.json({
        success: true,
        message: "Profile saved successfully",
        user: req.user,
        data: { expertId: expert.id },
      });
    }

    // ✅ For jobseeker: save qualification, experience, cv to user table
    if (role === "jobseeker") {
      await req.user.update({
        qualification,
        experience,
        cvFile: cvFile ? cvFile.filename : req.user.cvFile,
      });
    }

    return res.json({
      success: true,
      message: "Profile saved successfully",
      user: req.user,
    });
  } catch (err) {
    console.error("SAVE PROFILE ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    return res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
