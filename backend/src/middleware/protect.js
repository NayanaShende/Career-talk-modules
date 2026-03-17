// src/middleware/protect.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const protect = async (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

   const token = authHeader.split(" ")[1];
  console.log("TOKEN RECEIVED:", token);

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Find user in DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 4️⃣ Attach user to request
    req.user = user; // now req.user.id is available in controllers
    next();
  } catch (err) {
    console.error("Protect middleware error:", err);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};


exports.createExpertProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware

    const expertData = {
      ...req.body,
      userId, // force logged-in user
    };

    const expert = await expertService.createExpert(expertData);

    res.status(201).json({
      success: true,
      message: "Expert profile created",
      data: expert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = protect;
