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

module.exports = router;