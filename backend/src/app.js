var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
const cors = require("cors");

var apiRouter = require("./routes/index.routes");
const { sequelize } = require("./models");

var app = express(); // <-- you were missing this

// ------------------------------------------------------
// DATABASE SYNC
// ------------------------------------------------------
sequelize
  .sync({ alter: true }) // will update tables automatically
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ Sync error:", err));

// ------------------------------------------------------
// CORS
// ------------------------------------------------------
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend port
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
// 404 Handler
// ------------------------------------------------------
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
