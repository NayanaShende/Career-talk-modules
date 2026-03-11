const expertService = require("../services/expert.service");

// ================= SUBMIT RATING =================
exports.submitRating = async (req, res) => {
  try {
    const expertId = Number(req.params.id);
    const { rating, comment } = req.body;
    // ✅ FIXED: renamed to userId (consistent naming)
    const userId = req.user?.id || null;

    if (!expertId || isNaN(expertId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expert id",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    // ✅ FIXED: correct parameter order — (expertId, userId, rating, comment)
    // was: submitRating(expertId, rating, comment, userid) — WRONG ORDER
    const result = await expertService.submitRating(expertId, userId, Number(rating), comment.trim());

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: result,
    });
  } catch (err) {
    console.error("SUBMIT RATING ERROR:", err);

    // ✅ FIXED: return 409 for duplicate rating
    if (err.message === "ALREADY_RATED") {
      return res.status(409).json({
        success: false,
        message: "You have already rated this expert",
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET RATINGS =================
exports.getRatings = async (req, res) => {
  try {
    const expertId = req.params.id;
    const result = await expertService.getRatings(expertId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("GET RATINGS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};