var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
const cors = require("cors");

var apiRouter = require("./routes/index.routes");
const { sequelize } = require("./models");

var app = express();

// ------------------------------------------------------
// DATABASE SYNC
// ------------------------------------------------------
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ Sync error:", err));

// ------------------------------------------------------
// CORS
// ------------------------------------------------------
app.use(
  cors({
    origin: "*", // Allow Expo mobile & web
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------
// MAIN API ROUTES
// ------------------------------------------------------
app.use("/api", apiRouter);

// ------------------------------------------------------
// 404 HANDLER
// ------------------------------------------------------
app.use(function (req, res, next) {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;
