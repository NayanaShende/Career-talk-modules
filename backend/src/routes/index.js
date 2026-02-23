const express = require("express");
const router = express.Router();

// Experts routes
const expertsRoutes = require("./experts");

// Mount experts routes
router.use("/experts", expertsRoutes);

// Health check route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Career Talk API running successfully"
  });
});

module.exports = router;