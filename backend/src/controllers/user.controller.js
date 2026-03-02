const { User } = require("../models");
// make sure these are imported if used

/* =========================================
   SAVE PROFILE
========================================= */
const saveProfile = async (req, res) => {
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

    const updateData = {
      hasProfile: true,
    };

    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (dob !== undefined) updateData.dob = dob;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (experience !== undefined) updateData.experience = experience;
    if (domain !== undefined) updateData.domain = domain;
    if (role !== undefined) updateData.role = role;

    if (cvFile) updateData.cvFile = cvFile.filename;
    if (imageFile) updateData.image = imageFile.filename;

    // update user
    await req.user.update(updateData);

    // reload fresh data
    await req.user.reload();

    /* ===============================
       EXPERT ROLE HANDLING
    =============================== */
    if (role === "expert") {
      if (authService?.setRole) {
        await authService.setRole(req.user, role);
      }

      let expert =
        await expertRepository.findExpertByUserId(req.user.id);

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

      if (cvFile) expertData.cv = cvFile.filename;
      if (imageFile) expertData.image = imageFile.filename;

      if (!expert) {
        await expertRepository.createExpert({
          userId: req.user.id,
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

/* =========================================
   GET PROFILE
========================================= */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        qualification: user.qualification,
        experience: user.experience,
        domain: user.domain,
        image: user.image
          ? `http://192.168.1.3:3000/uploads/${user.image}`
          : null,
        cvFile: user.cvFile
          ? `http://192.168.1.3:3000/uploads/${user.cvFile}`
          : null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================================
   UPDATE PROFILE
========================================= */
const updateProfile = saveProfile;

/* =========================================
   GET USER BY EMAIL
========================================= */
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        qualification: user.qualification,
        experience: user.experience,
        domain: user.domain,
        image: user.image
          ? `http://192.168.1.3:3000/uploads/${user.image}`
          : null,
        cvFile: user.cvFile
          ? `http://192.168.1.3:3000/uploads/${user.cvFile}`
          : null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("PROFILE FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};