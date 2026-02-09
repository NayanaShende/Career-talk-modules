const express = require("express");
const router = express.Router();

// TEMP ROUTE – Just to prevent crashes
router.get("/", (req, res) => {
  res.json({ message: "Users route working" });
});

module.exports = router;
