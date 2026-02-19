const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");

// GET
router.get("/", expertController.getAllExperts);

// GET /api/experts/recommended
router.get("/recommended", expertController.getRecommendedExperts);

// ✅ ADD THIS LINE (IMPORTANT)
router.get("/:id", expertController.getExpertById);

router.post("/", expertController.createExpert);

router.put("/:id", expertController.updateExpert);

router.post("/:expertId/skills", expertController.addSkills);


module.exports = router;
