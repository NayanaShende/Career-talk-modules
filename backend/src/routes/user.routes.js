const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const protect = require("../middleware/protect");
const upload = require("../middleware/upload");
const { uploadFields } = require("../middleware/upload"); // ✅ Added for image + cv upload
const { Expert } = require("../models"); // ✅ Added

/* =========================================
   USER PROFILE ROUTES
========================================= */

// ✅ Save / Update Profile
// Protected route
// Accepts optional CV file upload (field name: "cv")
router.post(
  "/save-profile",
  protect,
  uploadFields, // ✅ updated: was upload.single("cv"), now accepts both cv and image
  userController.saveProfile
);

// ✅ Get Logged-in User Profile
router.get("/me", protect, userController.getProfile);

/* =========================================
   ROLE SELECTION ROUTE
========================================= */

// ✅ Set Role (user / expert)
router.put("/set-role", protect, async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!role || !["user", "expert"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    // 1️⃣ Update role in Users table
    req.user.role = role;
    await req.user.save();

    // 2️⃣ If role = expert → create expert row
    if (role === "expert") {
      const existingExpert = await Expert.findOne({
        where: { userId: req.user.id },
      });

      if (!existingExpert) {
        await Expert.create({
          userId: req.user.id,
          name: req.user.fullName || "New Expert",
          rating: 0,
          is_online: false,
        });
      }
    }

    // If role = user → do nothing extra

    return res.json({
      success: true,
      message: "Role updated successfully",
      role,
    });

  } catch (err) {
    console.error("SET ROLE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;