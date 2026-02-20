const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");

// GET ALL
router.get("/", expertController.getAllExperts);

// GET RECOMMENDED
router.get("/recommended", expertController.getRecommendedExperts);

// GET ONLINE EXPERTS
router.get("/online", expertController.getOnlineExperts);

module.exports = router;
