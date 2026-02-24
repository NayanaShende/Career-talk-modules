require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
const cors = require("cors");

const routes = require("./routes");
const apiRouter = require("./routes/index.routes");
const { sequelize } = require("./models");
const expertRoutes = require("./routes/expert.routes");
// ✅ CREATE APP FIRST
var app = express();

// ------------------------------------------------------
// DATABASE SYNC
// ------------------------------------------------------
// sequelize
//   .sync({ alter: true })
//   .then(() => console.log("✅ Database synced"))
//   .catch((err) => console.error("❌ Sync error:", err));

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
app.use("/api", apiRouter);
app.use("/api/experts", expertRoutes);
// ------------------------------------------------------
// 404 HANDLER
// ------------------------------------------------------
app.use(function (req, res, next) {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;