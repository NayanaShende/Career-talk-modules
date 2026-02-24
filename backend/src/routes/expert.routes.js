const express = require("express");
const router = express.Router();
const expertController = require("../controllers/expert.profile.controller");
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");

router.post(
  "/create",
  protect,
  upload.single("cv"),
  expertController.createExpertProfile,
);

router.get("/", protect, expertController.getExpertProfile);

module.exports = router;