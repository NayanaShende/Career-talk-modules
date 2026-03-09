require("dotenv").config();
var express = require("express");
var logger = require("morgan");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

const routes = require("./routes");
const { sequelize } = require("./models");

var app = express();

/* ---------------- SECURITY MIDDLEWARE ---------------- */

// Secure HTTP headers
app.use(helmet());

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------------- MIDDLEWARE ---------------- */

app.use(logger("dev"));

// JSON parser
app.use(express.json({ limit: "10mb" }));

// URL encoded parser
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ---------------- STATIC FILES ---------------- */

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---------------- API ROUTES ---------------- */

// Debug middleware (helps verify routes are loading)
app.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Load all API routes
app.use("/api", routes);

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Career Talk Backend API Running 🚀",
  });
});

/* ---------------- 404 HANDLER ---------------- */

app.use(function (req, res) {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;