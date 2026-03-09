require("dotenv").config();
var express = require("express");
const http = require("http");
var logger = require("morgan");
const cors = require("cors");
const { initSocket } = require("./socket"); // ✅ removed unused Server import
const path = require("path");

const routes = require("./routes");
const { sequelize } = require("./models");

sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.log("❌ Sync error:", err));

var app = express();

// ------------------------------------------------------
// CORS
// ------------------------------------------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------
app.use(logger("dev"));

// ✅ Webhook route needs raw body — register BEFORE express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// ✅ All other routes use normal JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files (cv, images) as static
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ------------------------------------------------------
// ROUTES
// ------------------------------------------------------
app.use("/api", routes);

// ------------------------------------------------------
// CREATE HTTP SERVER
// ------------------------------------------------------
const server = http.createServer(app);

// ------------------------------------------------------
// SOCKET.IO
// ✅ FIXED: pass the HTTP server directly to initSocket
// Do NOT create a second new Server() here — socket.js handles it
// ------------------------------------------------------
initSocket(server);

// ------------------------------------------------------
// 404 HANDLER
// ------------------------------------------------------
app.use(function (req, res, next) {
  res.status(404).json({ error: "Not Found" });
});

// ------------------------------------------------------
// ✅ server.listen() handled in bin/www
// ------------------------------------------------------

module.exports = { app, server }; // ✅ Export both app and server