// src/routes/expert.routes.js

const express = require("express");
const router = express.Router();
const expertController = require("../controllers/expert.controller");

// SEARCH experts by headline/skill
// GET /api/experts/search?skill=Node
router.get("/search", expertController.searchExpertsByHeadline);

module.exports = router;
