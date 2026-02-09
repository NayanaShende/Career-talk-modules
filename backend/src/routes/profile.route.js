const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");
const protect = require("../middleware/protect");

// CREATE PROFILE
router.post("/create", protect, profileController.createProfile);

// GET PROFILE
router.get("/", protect, profileController.getProfile);

module.exports = router;
