const { User } = require("../models");
const authService = require("../services/auth.service");
const expertRepository = require("../repositories/expert.repository");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
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

    const cvFile = req.files?.cv?.[0];
    const imageFile = req.files?.image?.[0];

    let imageUrl = null;
    let cvUrl = null;

    // Upload files to Cloudinary
    if (imageFile) {
      const result = await uploadToCloudinary(imageFile.buffer);
      imageUrl = result.secure_url;
    }

    if (cvFile) {
      const result = await uploadToCloudinary(cvFile.buffer);
      cvUrl = result.secure_url;
    }

    const updateData = {
      hasProfile: true,
      skills: skills || null,
    };

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (dob) updateData.dob = dob;
    if (qualification) updateData.qualification = qualification;
    if (experience) updateData.experience = experience;
    if (domain) updateData.domain = domain;
    if (role) updateData.role = role;

    if (imageUrl) updateData.image = imageUrl;
    if (cvUrl) updateData.cvFile = cvUrl;

    // Update user
    await req.user.update(updateData);
    await req.user.reload();

    const currentRole = role || req.user.role;

    /* ===============================
       EXPERT ROLE
    =============================== */

    if (currentRole === "expert") {
      let expert = await expertRepository.findExpertByUserId(req.user.id);

      const expertData = {
        name: fullName || req.user.fullName,
        experience: parseInt(experience) || 0,
        domain: domain || null,
        bio: bio || null,
        location: location || null,
        language_spoken: languages || null,
        certification: certificate || null,
        certified_city: certifiedCity || null,
      };

      if (imageUrl) expertData.image = imageUrl;
      if (cvUrl) expertData.cv = cvUrl;

      if (!expert) {
        expert = await expertRepository.createExpert({
          userId: req.user.id,
          rating: 0,
          is_online: false,
          ...expertData,
        });
      } else {
        await expert.update(expertData);
      }

      // Save skills
      if (skills && expert?.id) {
        const skillsArray = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (skillsArray.length > 0) {
          await expertRepository.deleteSkillsByExpertId(expert.id);

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

    /* ===============================
       JOBSEEKER
    =============================== */

    if (currentRole === "jobseeker") {
      await req.user.update({
        qualification,
        experience,
        cvFile: cvUrl || req.user.cvFile,
      });
    }

    return res.json({
      success: true,
      message: "Profile saved successfully",
      user: req.user,
    });
  } catch (err) {
    console.error("❌ SAVE PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
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

    // ✅ Upload to Cloudinary instead of saving filename
    if (imageFile) {
      const result = await uploadToCloudinary(imageFile.buffer);
      updateData.image = result.secure_url;
      console.log("✅ Image uploaded:", result.secure_url);
    }

    if (cvFile) {
      const result = await uploadToCloudinary(cvFile.buffer);
      updateData.cvFile = result.secure_url;
      console.log("✅ CV uploaded:", result.secure_url);
    }

    await req.user.update(updateData);
    await req.user.reload();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: req.user,
    });
  } catch (err) {
    console.error("❌ UPDATE PROFILE ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
/* =========================================
   GET PROFILE (logged in user)
========================================= */
const getProfile = async (req, res) => {
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
    console.error("❌ GET PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
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