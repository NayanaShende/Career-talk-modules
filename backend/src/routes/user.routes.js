const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const protect = require("../middleware/protect");
const { uploadFields } = require("../middleware/upload");
const { Expert } = require("../models");

/* =========================================
   USER PROFILE ROUTES
========================================= */

// SAVE / UPDATE PROFILE
router.post("/save-profile", protect, uploadFields, userController.saveProfile);

// GET LOGGED-IN USER PROFILE
router.get("/me", protect, userController.getProfile);

// GET PROFILE BY EMAIL
router.get("/profile/:email", userController.getUserByEmail);

// OPTIONAL update route (can keep)
router.put("/profile", protect, uploadFields, userController.updateProfile);

/* =========================================
   ROLE SELECTION
========================================= */

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
  } catch (err) {
    console.error("SET ROLE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
