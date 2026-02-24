require("dotenv").config();
var express = require("express");
var logger = require("morgan");
const cors = require("cors");

const apiRouter = require("./routes/index.routes");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api", apiRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;
