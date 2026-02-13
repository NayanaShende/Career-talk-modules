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

// router.get("/recommended", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, name, role, experience, rating, image FROM experts"
//     );

//     res.json({
//       success: true,
//       data: result.rows
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false });
//   }
// });

module.exports = router;