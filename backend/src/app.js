var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
const cors = require("cors");

var apiRouter = require("./routes/index.routes");

const { sequelize } = require("./models");

var app = express();

// ------------------------------------------------------
// ✅ DATABASE SYNC (RUN THIS ONCE)
// ------------------------------------------------------
sequelize
  .sync({ alter: true }) // <--- ADD THIS HERE
  .then(() => console.log("✅ Database synced with ALTER"))
  .catch((err) => console.error("❌ Sync error:", err));

// ------------------------------------------------------
// CORS
// ------------------------------------------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
