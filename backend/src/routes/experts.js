const express = require("express");
const router = express.Router();
const controller = require("../controllers/expert.controller");


// ================= SPECIFIC ROUTES FIRST =================

// online experts
router.get("/online", controller.getOnlineExperts);

// recommended experts
router.get("/recommended", controller.getRecommendedExperts);

// all experts
router.get("/", controller.getAllExperts);

// create
router.post("/", controller.createExpert);

// add skills
router.post("/:expertId/skills", controller.addSkills);

// update
router.put("/:id", controller.updateExpert);

// delete
router.delete("/:id", controller.deleteExpert);


// ================= KEEP THIS LAST ALWAYS =================
router.get("/:id", controller.getExpertById);


module.exports = router;