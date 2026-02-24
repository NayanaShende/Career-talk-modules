// src/routes/expert.routes.js

const express = require("express");
const router = express.Router();
const expertController = require("../controllers/expert.controller");

// GET ALL
// GET ALL (with optional ?skill= filter)
router.get("/", expertController.getAllExperts);

// SEARCH by skill/headline
router.get("/search", expertController.searchExpertsByHeadline);

// RECOMMENDED
router.get("/recommended", expertController.getRecommendedExperts);

// ONLINE
router.get("/online", expertController.getOnlineExperts);

// GET BY ID (keep last)
router.get("/:id", expertController.getExpertById);

// CREATE
router.post("/", expertController.createExpert);

// UPDATE
router.put("/:id", expertController.updateExpert);

// ADD SKILLS
router.post("/:expertId/skills", expertController.addSkills);
// SEARCH experts by headline/skill
// GET /api/experts/search?skill=Node
router.get("/search", expertController.searchExpertsByHeadline);

module.exports = router;