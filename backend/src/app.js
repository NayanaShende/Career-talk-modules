require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const http = require("http");
const path = require("path");
const helmet = require("helmet");

const { initSocket } = require("./socket");
const routes = require("./routes");
const { sequelize } = require("./models");

// ✅ Create express app
const app = express();

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
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connection successful"))
  .catch((err) => console.log("❌ Database connection error:", err));

/* ---------------- API REQUEST LOGGER ---------------- */
app.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
});

/* ---------------- API ROUTES ---------------- */
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

/* ---------------- HTTP SERVER + SOCKET ---------------- */
// ✅ Create server here so bin/www can use it via { server }
const server = http.createServer(app);

// ✅ Init socket.io once, attached to this server
const io = initSocket(server);

// ✅ Make io accessible in controllers via req.app.get("io")
app.set("io", io);

// ✅ Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
});

// ✅ Export both app and server — bin/www uses { server }
module.exports = { app, server };