const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");

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
// SEARCH experts by headline/skill
// GET /api/experts/search?skill=Node
router.get("/search", expertController.searchExpertsByHeadline);

router.post(
  "/create",
  protect,
  upload.single("cv"),
  expertController.createExpertProfile,
);

// ============================
// GET EXPERT BY ID (KEEP LAST)
// ============================
router.get("/:id", expertController.getExpertById);

module.exports = router;