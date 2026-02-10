const express = require("express");
const router = express.Router();
const { Expert } = require("../models");
const { Op } = require("sequelize");


// ===============================
// SEARCH experts
// GET /api/experts/search?skill=Node
// ===============================
router.get("/search", async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: "Skill is required"
      });
    }

    const experts = await Expert.findAll({
      where: {
        headline: {
          [Op.iLike]: `%${skill}%`
        }
      }
    });

    res.json({
      success: true,
      data: experts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


module.exports = router;
