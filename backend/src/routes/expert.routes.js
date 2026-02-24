// src/routes/expert.routes.js

const express = require("express");
const router = express.Router();
const expertController = require("../controllers/expert.controller");

// GET ALL
router.get("/", expertController.getAllExperts);

// SEARCH
router.get("/search", expertController.searchExperts);

// RECOMMENDED
router.get("/recommended", expertController.getRecommendedExperts);

// ONLINE
router.get("/online", expertController.getOnlineExperts);

// CREATE PROFILE
router.post("/", expertController.createExpert);

// UPDATE PROFILE
router.put("/:id", expertController.updateExpert);

// ADD SKILLS
router.post("/:expertId/skills", expertController.addSkills);
// SEARCH experts by headline/skill
// GET /api/experts/search?skill=Node
router.get("/search", expertController.searchExpertsByHeadline);

module.exports = router;
