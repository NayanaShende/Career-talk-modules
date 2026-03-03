const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");
const ratingController = require("../controllers/rating.controller"); // ✅ NEW
const protect = require("../middleware/protect"); // ✅ NEW

// ============================
// GET ALL EXPERTS
// ============================
router.get("/", expertController.getAllExperts);

// ============================
// CREATE EXPERT PROFILE
// ============================
router.post("/", expertController.createExpertProfile);

// ============================
// GET RECOMMENDED EXPERTS
// ============================
router.get("/recommended", expertController.getRecommendedExperts);

// ============================
// GET ONLINE EXPERTS
// ============================
router.get("/online", expertController.getOnlineExperts);

// ============================
// ADD SKILLS TO EXPERT
// ============================
router.post("/:expertId/skills", expertController.addSkills);

// ============================
// UPDATE EXPERT PROFILE
// ============================
router.put("/:id", expertController.updateExpertProfile);

// ✅ NEW: SUBMIT RATING (protected - must be logged in)
router.post("/:id/rate", protect, ratingController.submitRating);

// ✅ NEW: GET RATINGS for an expert
router.get("/:id/ratings", ratingController.getRatings);

// GET BY ID  (keep last)
router.get("/:id", expertController.getExpertById);

module.exports = router;