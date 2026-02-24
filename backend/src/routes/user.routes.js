const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

// PROFILE
router.post(
  "/save-profile",
  protect,
  upload.single("cv"),
  userController.saveProfile,
);

// Get logged in user profile
router.get("/me", protect, userController.getProfile);

module.exports = router;
