const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");
const ratingController = require("../controllers/rating.controller"); // ✅ NEW
const protect = require("../middleware/protect"); // ✅ NEW
const { uploadFields } = require("../middleware/upload"); // ✅ NEW: for cv + image upload

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

<<<<<<< HEAD
// ✅ NEW: GET DOMAINS LIST (public — no auth needed)
// Call this from frontend to populate domain dropdown
router.get("/domains", expertController.getDomainsList);

// ✅ NEW: SUBMIT EXPERT PROFILE FORM (protected + file upload)
router.post("/profile", protect, uploadFields, expertController.submitExpertProfileForm);

// ✅ NEW: GET MY EXPERT PROFILE (protected)
router.get("/profile/me", protect, expertController.getMyExpertProfile);

// ADD SKILLS
=======
// ============================
// ADD SKILLS TO EXPERT
// ============================
>>>>>>> 64bf132691d8a383b535079466a78f2adf1b450d
router.post("/:expertId/skills", expertController.addSkills);

// ============================
// UPDATE EXPERT PROFILE
// ============================
router.put("/:id", expertController.updateExpertProfile);

<<<<<<< HEAD
// ✅ NEW: SUBMIT RATING (protected - must be logged in)
router.post("/:id/rate", protect, ratingController.submitRating);

// ✅ NEW: GET RATINGS for an expert
router.get("/:id/ratings", ratingController.getRatings);

// GET BY ID  (keep last — /:id must always be last)
=======
// ============================
// GET EXPERT BY ID (KEEP LAST)
// ============================
>>>>>>> 64bf132691d8a383b535079466a78f2adf1b450d
router.get("/:id", expertController.getExpertById);

module.exports = router;