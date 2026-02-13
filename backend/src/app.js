var createError = require("http-errors");
var express = require("express");
var logger = require("morgan");
const cors = require("cors");
const routes = require("./routes");
const { sequelize } = require("./models");

var apiRouter = require("./routes/index.routes");
const { sequelize } = require("./models");

<<<<<<< HEAD
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
=======
var app = express();

// ------------------------------------------------------
// DATABASE SYNC
// ------------------------------------------------------
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ Sync error:", err));
>>>>>>> origin/Mob_app

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

<<<<<<< HEAD
// Routes
app.use("/api", routes);
=======
// ------------------------------------------------------
// MAIN API ROUTES
// ------------------------------------------------------
app.use("/api", apiRouter);
>>>>>>> origin/Mob_app

// ------------------------------------------------------
// 404 HANDLER
// ------------------------------------------------------
app.use(function (req, res, next) {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;
