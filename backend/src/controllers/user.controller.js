const { User } = require("../models");
const authService = require("../services/auth.service"); 
const expertRepository = require("../repositories/expert.repository"); 

/* =========================================
   SAVE PROFILE
========================================= */
const saveProfile = async (req, res) => {
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

    console.log("📥 SAVE PROFILE body:", req.body);
    console.log("📥 SAVE PROFILE files:", req.files);
    console.log("📥 domain received:", domain);           // ✅ NEW debug log
    console.log("📥 qualification received:", qualification); // ✅ NEW debug log

    const cvFile = req.files?.cv?.[0];
    const imageFile = req.files?.image?.[0];

    const updateData = {
      hasProfile: true,
      skills: skills || null,
    };

    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (dob !== undefined) updateData.dob = dob;
    // ✅ FIXED: only save if not empty string
    if (qualification !== undefined && qualification !== "") updateData.qualification = qualification;
    if (experience !== undefined) updateData.experience = experience;
    // ✅ FIXED: only save if not empty string
    if (domain !== undefined && domain !== "") updateData.domain = domain;
    if (role !== undefined) updateData.role = role;

    if (cvFile) updateData.cvFile = cvFile.filename;
    if (imageFile) updateData.image = imageFile.filename;

    // ✅ Update user
    await req.user.update(updateData);
    await req.user.reload();

    // ✅ FIX: Always use latest role safely
    const currentRole = role || req.user.role;

    /* ===============================
       EXPERT ROLE HANDLING
    =============================== */
    if (currentRole === "expert") {

      let expert = await expertRepository.findExpertByUserId(req.user.id);

      const expertData = {
        name: fullName || req.user.fullName,
        experience: parseInt(experience) || 0,
        domain: domain || null,           // ✅ domain saved to Expert table
        bio: bio || null,
        location: location || null,
        language_spoken: languages || null,
        certification: certificate || null,
        certified_city: certifiedCity || null,
      };

      if (cvFile) expertData.cv = cvFile.filename;
      if (imageFile) expertData.image = imageFile.filename;

      console.log("📥 expertData to save:", expertData); // ✅ NEW debug log

      if (!expert) {
        console.log("🔥 Creating expert with full data...");
        expert = await expertRepository.createExpert({
          userId: req.user.id,
          rating: 0,
          is_online: false,
          ...expertData,
        });
        console.log("✅ Expert created:", expert.id);
      } else {
        console.log("🔥 Updating expert:", expert.id);
        await expert.update(expertData);
        console.log("✅ Expert updated with domain:", expertData.domain); // ✅ NEW debug log
      }

      // ✅ Save skills properly (delete old skills first to avoid duplicate)
      if (skills && expert?.id) {
        const skillsArray = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (skillsArray.length > 0) {
          console.log("🔥 Saving skills:", skillsArray);

          if (expertRepository.deleteSkillsByExpertId) {
            await expertRepository.deleteSkillsByExpertId(expert.id);
          }

          const skillRows = skillsArray.map((skill_name) => ({
            expert_id: expert.id,
            skill_name,
          }));

          await expertRepository.bulkCreateSkills(skillRows);
          console.log("✅ Skills saved");
        }
      }

      return res.json({
        success: true,
        message: "Profile saved successfully",
        user: req.user,
        data: { expertId: expert.id },
      });
    }

    /* ===============================
       JOBSEEKER HANDLING
    =============================== */
    if (currentRole === "jobseeker") {
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
    console.error("❌ SAVE PROFILE ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

/* =========================================
   GET PROFILE (logged-in user)
========================================= */
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    return res.json({ success: true, user: req.user });
  } catch (err) {
    console.error("❌ GET PROFILE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

/* =========================================
   GET USER BY EMAIL
========================================= */
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("❌ GET USER BY EMAIL ERROR:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

/* =========================================
   UPDATE PROFILE
========================================= */
const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cvFile = req.files?.cv?.[0];
    const imageFile = req.files?.image?.[0];

    const updateData = { ...req.body };

    if (cvFile) updateData.cvFile = cvFile.filename;
    if (imageFile) updateData.image = imageFile.filename;

    await req.user.update(updateData);
    await req.user.reload();

    return res.json({ success: true, message: "Profile updated successfully", user: req.user });
  } catch (err) {
    console.error("❌ UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

/* =========================================
   EXPORTS
========================================= */
module.exports = {
  saveProfile,
  getProfile,
  getUserByEmail,
  updateProfile,
};