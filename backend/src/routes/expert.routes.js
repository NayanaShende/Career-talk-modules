const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.profile.controller");
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

// ==========================
// PUBLIC ROUTES
// ==========================

// GET ALL (with optional ?skill filter)
router.get("/", expertController.getAllExperts);

// SEARCH
router.get("/search", expertController.searchExpertsByHeadline);

// RECOMMENDED
router.get("/recommended", expertController.getRecommendedExperts);

// ONLINE
router.get("/online", expertController.getOnlineExperts);

// GET BY ID (keep last in public)
router.get("/:id", expertController.getExpertById);

// ==========================
// PROTECTED ROUTES
// ==========================

// CREATE BASIC EXPERT
router.post("/", expertController.createExpert);

// UPDATE EXPERT
router.put("/:id", expertController.updateExpert);

// ADD SKILLS
router.post("/:expertId/skills", expertController.addSkills);

// CREATE PROFILE (WITH FILE UPLOAD)
router.post(
  "/create-profile",
  protect,
  upload.single("cv"),
  expertController.createExpertProfile
);

// GET LOGGED-IN EXPERT PROFILE
router.get(
  "/my-profile",
  protect,
  expertController.getExpertProfile
);

module.exports = router;