const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config(); // load .env

// Read DB config from environment
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false, // set to true if you want SQL logs
  },
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Expert = require("./expert")(sequelize, DataTypes);
// db.Jobseeker = require("./jobseeker")(sequelize, DataTypes); // if needed

module.exports = db;
