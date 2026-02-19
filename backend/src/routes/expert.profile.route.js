const express = require("express");
const router = express.Router();

const expertController = require("../controllers/expert.profile.controller");
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

// CREATE / UPDATE PROFILE
router.post(
  "/:id/profile",
  protect,
  upload.single("cv"),
  expertController.createExpertProfile
);

// GET PROFILE BY EXPERT ID
router.get("/:id/profile", expertController.getExpertProfileById);

module.exports = router;
