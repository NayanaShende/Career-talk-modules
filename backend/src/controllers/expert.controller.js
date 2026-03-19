const expertService = require("../services/expert.service");
const db = require("../models");

// ================= GET ALL =================
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await expertService.getAllExperts();
    res.status(200).json({ success: true, data: experts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= CREATE =================
exports.createExpertProfile = async (req, res) => {
  try {
    const expert = await expertService.createExpert(req.body);
    res.status(201).json({
      success: true,
      message: "Expert profile created",
      data: expert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SUBMIT EXPERT PROFILE FORM =================
// ✅ called when expert fills out the profile form
// saves to Experts table using userId from JWT token
// ✅ FIXED: multer.fields() puts files in req.files (object), not req.file
// req.file is only set when using upload.single()
exports.submitExpertProfileForm = async (req, res) => {
  try {
    const userId = req.user.id;

    const cvFile = req.files?.cv?.[0] || null;
    const imageFile = req.files?.image?.[0] || null;
    const certificateFiles = req.files?.certificates || [];

    console.log("📁 Uploaded files:", {
      cv: cvFile?.filename,
      image: imageFile?.filename,
      certificates: certificateFiles.map((f) => f.filename),
    });

    const gender = req.body.gender || null;
    console.log("👤 Gender received in submitExpertProfileForm:", gender);

    const bodyWithGender = {
      ...req.body,
      gender,
    };

    const expert = await expertService.createExpertProfile(
      userId,
      bodyWithGender,
      req.body,
      cvFile,
      imageFile,
      certificateFiles,
    );

    res.status(200).json({
      success: true,
      message: "Expert profile saved successfully",
      data: expert,
    });
  } catch (error) {
    console.error("submitExpertProfileForm error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MY PROFILE =================
exports.getMyExpertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await expertService.getExpertProfile(userId);

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No expert profile found. Please complete your profile.",
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("getMyExpertProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE MY EXPERT PROFILE =================
exports.updateMyExpertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file || null;

    const body = {
      ...req.body,
      certifications: req.body.certification || req.body.certifications || null,
      gender: req.body.gender || null,
    };

    const expert = await expertService.createExpertProfile(userId, body, file);

    res.status(200).json({
      success: true,
      message: "Expert profile updated successfully",
      data: expert,
    });
  } catch (error) {
    console.error("updateMyExpertProfile error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE =================
exports.updateExpertProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    const expert = await expertService.updateExpert(Number(id), req.body);
    res
      .status(200)
      .json({ success: true, message: "Expert updated", data: expert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADD SKILLS =================
exports.addSkills = async (req, res) => {
  try {
    const { expertId } = req.params;
    const { skills } = req.body;

    if (!expertId || isNaN(expertId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    if (!skills || !Array.isArray(skills)) {
      return res
        .status(400)
        .json({ success: false, message: "skills must be an array" });
    }

    await expertService.addSkills(Number(expertId), skills);
    res.json({ success: true, message: "Skills added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= RECOMMENDED =================
exports.getRecommendedExperts = async (req, res) => {
  try {
    const experts = await expertService.getRecommendedExperts();
    res.json({ success: true, data: experts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ONLINE =================
exports.getOnlineExperts = async (req, res) => {
  try {
    const experts = await expertService.getOnlineExperts();
    res.status(200).json({ success: true, data: experts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET BY ID =================
exports.getExpertById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    const expert = await expertService.getExpertById(Number(id));

    if (!expert) {
      return res
        .status(404)
        .json({ success: false, message: "Expert not found" });
    }

    res.status(200).json({ success: true, data: expert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= SUBMIT RATING ✅ =================
// POST /api/experts/:id/rate
// Requires auth — saves userId, rating, comment
// Enforces one rating per user per expert
exports.submitRating = async (req, res) => {
  try {
    const expertId = Number(req.params.id);
    const userId = req.user.id; // ✅ from JWT middleware
    const { rating, comment } = req.body;

    if (!expertId || isNaN(expertId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (!comment || !comment.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Comment is required" });
    }

    const result = await expertService.submitRating(
      expertId,
      userId,
      rating,
      comment.trim(),
    );

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("submitRating error:", error.message);

    // ✅ Return 409 Conflict for duplicate rating — frontend checks this
    if (error.message === "ALREADY_RATED") {
      return res.status(409).json({
        success: false,
        message: "You have already rated this expert",
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET RATINGS ✅ =================
// GET /api/experts/:id/ratings
// Returns avgRating, totalReviews, and reviews with user name + image
exports.getRatings = async (req, res) => {
  try {
    const expertId = Number(req.params.id);

    if (!expertId || isNaN(expertId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expert id" });
    }

    const data = await expertService.getRatings(expertId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getRatings error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET DOMAINS LIST =================
// ✅ returns 10 domains for frontend dropdown
// No auth required — public route
exports.getDomainsList = async (req, res) => {
  try {
    const domains = [
      "Career Counseling",
      "Software Engineering",
      "Data Science & AI",
      "Finance & Investment",
      "Marketing & Branding",
      "Health & Wellness",
      "Legal Advisory",
      "Business Strategy",
      "Education & Tutoring",
      "Human Resources",
    ];
    res.status(200).json({ success: true, data: domains });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ✅ NEW: GET EXPERT TRANSACTIONS =================
// GET /api/experts/my-transactions
// Returns all wallet transactions where ref_id = this expert's id
// Includes user name + image who paid
exports.getExpertTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // logged in expert's user id

    // Step 1: find expert record using userId
    const expert = await db.Expert.findOne({
      where: { userId: userId },
      attributes: ["id", "name"],
    });

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert profile not found",
      });
    }

    // Step 2: find all transactions where ref_id = expert.id
    const transactions = await db.WalletTransaction.findAll({
      where: { ref_id: String(expert.id) },
      order: [["created_at", "DESC"]],
    });

    // Step 3: enrich each transaction with user details
    const enriched = await Promise.all(
      transactions.map(async (tx) => {
        const txData = tx.toJSON();

        // fetch the user who made this transaction
        try {
          const user = await db.User.findOne({
            where: { id: txData.user_id },
            attributes: ["id", "fullName", "image"],
          });
          txData.user_name = user ? user.fullName : "User";
          txData.user_image = user ? user.image : null;
        } catch (e) {
          txData.user_name = "User";
          txData.user_image = null;
        }

        return txData;
      })
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (err) {
    console.error("getExpertTransactions error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ✅ NEW: GET EXPERT CHATS =================
// GET /api/experts/my-chats
// Returns all unique users who chatted with this expert
// Uses WalletTransaction hold/debit as chat indicator (ref_id = expert.id)
exports.getExpertChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: find expert record
    const expert = await db.Expert.findOne({
      where: { userId: userId },
      attributes: ["id", "name"],
    });

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert profile not found",
      });
    }

    // Step 2: find all hold/debit transactions for this expert
    const transactions = await db.WalletTransaction.findAll({
      where: {
        ref_id: String(expert.id),
        type: ["hold", "debit"],
      },
      order: [["created_at", "DESC"]],
    });

    // Step 3: get unique users only (one entry per user)
    const seenUserIds = new Set();
    const uniqueChats = [];

    for (const tx of transactions) {
      const txData = tx.toJSON();
      if (!seenUserIds.has(txData.user_id)) {
        seenUserIds.add(txData.user_id);

        try {
          const user = await db.User.findOne({
            where: { id: txData.user_id },
            attributes: ["id", "fullName", "image"],
          });

          uniqueChats.push({
            id: txData.id,
            user_id: txData.user_id,
            user_name: user ? user.fullName : "User",
            user_image: user ? user.image : null,
            amount: txData.amount,
            created_at: txData.created_at,
          });
        } catch (e) {
          uniqueChats.push({
            id: txData.id,
            user_id: txData.user_id,
            user_name: "User",
            user_image: null,
            amount: txData.amount,
            created_at: txData.created_at,
          });
        }
      }
    }

    res.status(200).json({ success: true, data: uniqueChats });
  } catch (err) {
    console.error("getExpertChats error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};