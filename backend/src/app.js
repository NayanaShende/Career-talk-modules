require("dotenv").config();
var express = require("express");
var logger = require("morgan");
const cors = require("cors");
const path = require("path"); // ✅ NEW

const routes = require("./routes"); // this loads index.routes.js
const { sequelize } = require("./models");
var app = express();

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
// 404 HANDLER
// ------------------------------------------------------
app.use(function (req, res, next) {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;