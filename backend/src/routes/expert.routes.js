const express = require("express");
const router = express.Router();
const expertController = require("../controllers/expert.controller");

// GET ALL EXPERTS
router.get("/", expertController.getAllExperts);

// CREATE EXPERT
router.post("/", expertController.createExpertProfile);

// GET RECOMMENDED
router.get("/recommended", expertController.getRecommendedExperts);

// GET ONLINE
router.get("/online", expertController.getOnlineExperts);

// ADD SKILLS
router.post("/:expertId/skills", expertController.addSkills);

// UPDATE EXPERT
router.put("/:id", expertController.updateExpertProfile);

// GET BY ID  (keep last)
router.get("/:id", expertController.getExpertById);

module.exports = router;
