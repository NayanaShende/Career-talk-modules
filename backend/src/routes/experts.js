const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");

// GET ALL
router.get("/", expertController.getAllExperts);

// CREATE
router.post("/", expertController.createExpert);

// GET RECOMMENDED
router.get("/recommended", expertController.getRecommendedExperts);

// GET ONLINE
router.get("/online", expertController.getOnlineExperts);

// GET BY ID (keep last)
router.get("/:id", expertController.getExpertById);

<<<<<<< HEAD
=======
// ✅ ADD SKILLS
router.post("/:expertId/skills", expertController.addSkills);

// ✅ UPDATE
router.put("/:id", expertController.updateExpert);


>>>>>>> be472dc42a199b58c8a839293261594068cffcca
module.exports = router;