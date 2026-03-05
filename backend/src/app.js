require("dotenv").config();
var express = require("express");
const http = require("http");
var logger = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io"); // ✅ IMPORTANT
const { initSocket } = require("./socket");
const path = require("path");

const routes = require("./routes");
const { sequelize } = require("./models");


sequelize.authenticate()
  .then(() => console.log("✅ Database connection successful"))
  .catch(err => console.log("❌ Database connection error:", err));

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded files (cv, images) as static
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // ✅ FIXED PATH

// ------------------------------------------------------
// ROUTES
// ------------------------------------------------------
app.use("/api", routes);

// ------------------------------------------------------
// CREATE SERVER
// ------------------------------------------------------
const server = http.createServer(app);

// ------------------------------------------------------
// SOCKET.IO
// ------------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ✅ Initialize socket logic
initSocket(io);

// ------------------------------------------------------
// 404 HANDLER
// ------------------------------------------------------
app.use(function (req, res, next) {
  res.status(404).json({ error: "Not Found" });
});

// ------------------------------------------------------
// ✅ REMOVED server.listen() from here — now handled in bin/www
// ------------------------------------------------------

module.exports = { app, server }; // ✅ Export both app and server