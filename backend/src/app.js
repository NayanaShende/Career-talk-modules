require("dotenv").config();
var express = require("express");
var logger = require("morgan");
const cors = require("cors");
const http = require("http");
const path = require("path");

const routes = require("./routes");
const { sequelize } = require("./models");
const { initSocket } = require("./socket");

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connection successful"))
  .catch((err) => console.log("❌ Database connection error:", err));

var app = express();

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Middleware
app.use(logger("dev"));

// ✅ CHANGE 1: Webhook route needs raw body — register BEFORE express.json()
// This captures raw body only for /api/payments/webhook
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// ✅ All other routes use normal JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files (cv, images) as static
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api", routes);

// 404 handler
app.use(function (req, res) {
  res.status(404).json({ error: "Not Found" });
});

// ✅ CREATE SERVER
const server = http.createServer(app);

// ✅ INIT SOCKET.IO
initSocket(server);

// ✅ EXPORT BOTH
module.exports = { app, server };
