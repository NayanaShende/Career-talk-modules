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

router.post("/:expert/skills", expertController.addSkills);
router.get("/recommended", expertController.getRecommendedExperts);

router.get("/online", expertController.getOnlineExperts);

router.delete("/:id", expertController.deleteExpert);

module.exports = router;
