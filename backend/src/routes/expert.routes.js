const express = require("express");
const router = express.Router();

// Controllers
const expertController = require("../controllers/expert.controller");
const ratingController = require("../controllers/rating.controller");

// ✅ SAFE middleware imports (works for both export styles)
const protectMiddleware = require("../middleware/protect");
const uploadMiddleware = require("../middleware/upload");

// Handle both: module.exports = protect  OR  module.exports = { protect }
const protect =
  protectMiddleware.protect || protectMiddleware;

// Handle both: module.exports = uploadFields OR module.exports = { uploadFields }
const uploadFields =
  uploadMiddleware.uploadFields || uploadMiddleware;


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
// GET DOMAINS LIST (PUBLIC)
// ============================
router.get("/domains", expertController.getDomainsList);

// ============================
// SUBMIT EXPERT PROFILE FORM (Protected + Upload)
// ============================
router.post(
  "/profile",
  protect,
  uploadFields,
  expertController.submitExpertProfileForm
);

// ============================
// GET MY EXPERT PROFILE (Protected)
// ============================
router.get(
  "/profile/me",
  protect,
  expertController.getMyExpertProfile
);

// ============================
// ADD SKILLS
// ============================
router.post("/:expertId/skills", expertController.addSkills);

// ============================
// UPDATE EXPERT PROFILE
// ============================
router.put("/:id", expertController.updateExpertProfile);

// ============================
// SUBMIT RATING (Protected)
// ============================
router.post(
  "/:id/rate",
  protect,
  ratingController.submitRating
);

// ============================
// GET RATINGS
// ============================
router.get("/:id/ratings", ratingController.getRatings);

// ============================
// GET EXPERT BY ID  (Keep Last)
// ============================
router.get("/:id", expertController.getExpertById);

module.exports = router;