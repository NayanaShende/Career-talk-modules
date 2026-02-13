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

module.exports = protect;
