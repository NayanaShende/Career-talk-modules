const { Sequelize, DataTypes } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../../config/config.json")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port || 5432,
    dialect: config.dialect || "postgres",
    logging: false,
  },
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

/* ================= MODELS ================= */

db.User = require("./user")(sequelize, DataTypes);
db.Expert = require("./expert")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill")(sequelize, DataTypes);

/* ================= RELATIONS ================= */

// Expert ↔ Skills
db.Expert.hasMany(db.ExpertSkill, { foreignKey: "expertId" });
db.ExpertSkill.belongsTo(db.Expert, { foreignKey: "expertId" });

/* ================= AUTO ASSOCIATE ================= */

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/* ================= DATABASE SYNC ================= */

db.sequelize
  .sync({ alter: true }) // safely updates DB without deleting data
  .then(() => {
    console.log("✅ Database synced successfully");
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });

module.exports = db;
