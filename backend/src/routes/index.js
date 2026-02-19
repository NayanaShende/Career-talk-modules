const express = require("express");
const router = express.Router();

// ================= ROUTES IMPORT =================
const expertsRoutes = require("./experts");
const expertProfileRoutes = require("./expert.profile.route");


// ================= MOUNT ROUTES =================

// ✅ All experts APIs
// /api/experts
router.use("/experts", expertsRoutes);

// ✅ Expert profile related APIs
// /api/experts/profile or others
router.use("/experts", expertProfileRoutes);


// ================= HEALTH CHECK =================
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Career Talk API running successfully"
  });
});


module.exports = router;
