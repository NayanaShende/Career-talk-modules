const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");

// GET /api/experts/recommended
router.get("/recommended", expertController.getRecommendedExperts);
router.get("/", expertController.getAllExperts);

// GET /api/experts/search?skill=React
router.get("/search", expertController.searchExperts);

module.exports = router;
