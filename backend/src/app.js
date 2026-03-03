require("dotenv").config();
var express = require("express");
const http = require("http");
var logger = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io"); // ✅ IMPORTANT
const initSocket = require("./socket");

const routes = require("./routes");
const { sequelize } = require("./models");

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

// ------------------------------------------------------
// ROUTES
// ------------------------------------------------------
app.use("/api", routes);

// ------------------------------------------------------
// CREATE SERVER
// ------------------------------------------------------
const server = http.createServer(app);

// ✅ Create socket server
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


module.exports = app;