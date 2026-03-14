const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const protect = require("../middleware/protect");

const { uploadFields } = require("../middleware/upload");
const { Expert } = require("../models");

/* ======================================
   PROFILE ROUTES
====================================== */

// Save or update profile
router.post("/save-profile", protect, uploadFields, userController.saveProfile);

// Get logged in user
router.get("/me", protect, userController.getProfile);

// Get profile by email
router.get("/profile/:email", userController.getUserByEmail);

// Update profile
router.put("/profile", protect, uploadFields, userController.updateProfile);

// ✅ NEW: Get user profile by ID — used by expert to view user profile in chat
router.get("/view/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = require("../models");

    const user = await db.User.findOne({
      where: { id: Number(userId) },
      attributes: [
        "id",
        "fullName",
        "email",
        "image",
        "dob",
        "qualification",
        "experience",
        "domain",
        "gender",
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (e) {
    console.error("getUserById error:", e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

/* ======================================
   ROLE SELECTION
====================================== */

router.put("/set-role", protect, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "expert"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    req.user.role = role;
    await req.user.save();

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

    res.json({
      success: true,
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    console.error("SET ROLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;