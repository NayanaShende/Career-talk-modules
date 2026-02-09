const Sequelize = require("sequelize");
const config = require("../../config/config.json").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Expert = require("./expert")(sequelize, Sequelize);

module.exports = db;
