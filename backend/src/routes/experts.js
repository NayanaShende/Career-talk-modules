const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");

// GET
router.get("/", expertController.getAllExperts);

// POST expert
router.post("/", expertController.createExpert);

// POST skill
router.post("/:expertId/skills", expertController.addSkills);

// PUT profile
router.put("/:id", expertController.updateExpert);

// GET /api/experts/recommended
router.get("/recommended", expertController.getRecommendedExperts);
router.get("/", expertController.getAllExperts);
module.exports = router;
