const express = require("express");
const router = express.Router();

// experts routes
const expertsRoutes = require("./expert.routes");

// mount
router.use("/experts", expertsRoutes);

// health route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Career Talk API running successfully",
  });
});

module.exports = router;