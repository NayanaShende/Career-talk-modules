require("dotenv").config();
var express = require("express");
var logger = require("morgan");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");
const { sequelize } = require("./models");

var app = express();

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api", routes);

// 404
app.use(function (req, res) {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;