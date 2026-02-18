const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.controller");

// GET
router.get("/", expertController.getAllExperts);

// GET /api/experts/recommended
router.get("/recommended", expertController.getRecommendedExperts);

router.get("/recommended", expertController.getRecommendedExperts);

router.get("/online", expertController.getOnlineExperts);


module.exports = router;
