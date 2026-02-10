const { Sequelize, DataTypes } = require("sequelize");
const config = require("../../config/config.json").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "postgres",
  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Expert = require("./expert.model")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill.model")(sequelize, DataTypes);

db.Expert.hasMany(db.ExpertSkill, {
  foreignKey: "expert_id",
  as: "skills",
});

module.exports = db;
