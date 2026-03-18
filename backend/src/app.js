require("dotenv").config();
var express = require("express");
var logger = require("morgan");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");
const path = require("path");
const helmet = require("helmet");

const routes = require("./routes");
const { sequelize } = require("./models");

var app = express();

/* ---------------- SECURITY MIDDLEWARE ---------------- */
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

// ✅ Webhook route needs raw body — register BEFORE express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// ✅ All other routes use normal JSON parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ---------------- STATIC FILES ---------------- */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---------------- DATABASE ---------------- */
// ✅ Single database connection check
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connection successful");
    // ✅ Sync models with DB — alter: true adds any missing columns automatically
    return sequelize.sync();
  })

/* ---------------- API ROUTES ---------------- */
app.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

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

/* ---------------- SERVER & SOCKET ---------------- */
const server = http.createServer(app);
const io = initSocket(server); // ✅ FIXED: get io from initSocket
app.set("io", io);              // ✅ FIXED: set io on app so controllers can use req.app.get("io")

module.exports = { app, server };