const expertService = require("../services/expert.service");

// ================= SUBMIT RATING =================
exports.submitRating = async (req, res) => {
  try {
    const expertId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user?.id || null;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const result = await expertService.submitRating(expertId, rating, comment, userId);

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: result,
    });
  } catch (err) {
    console.error("SUBMIT RATING ERROR:", err);
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