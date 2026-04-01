// src/middleware/protect.js

const jwt = require("jsonwebtoken");
const { User } = require("../models");

const protect = async (req, res, next) => {
  try {
    // ✅ Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find user from token
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User not found.",
      });
    }

    // ✅ Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error("Protect middleware error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
};

module.exports = protect;