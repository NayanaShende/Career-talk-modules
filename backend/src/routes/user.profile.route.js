const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");
const upload = require("../middleware/upload");
const profileController = require("../controllers/user.profile.controller");

router.post(
  "/create",
  protect,
  upload.single("cvFile"),
  profileController.createProfile,
);

router.get("/", protect, profileController.getProfile);

module.exports = router;
