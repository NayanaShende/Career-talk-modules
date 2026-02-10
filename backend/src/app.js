const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { sequelize } = require("./models");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
