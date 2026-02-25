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

/* =========================
   LOAD MODELS (ORDER SAFE)
========================= */

// Load User FIRST (since Expert depends on it)
db.User = require("./user")(sequelize, DataTypes);
db.Expert = require("./expert")(sequelize, DataTypes);

// db.UserProfile = require("./user.profile")(sequelize, DataTypes);
// db.ExpertProfile = require("./expert.profile")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill")(sequelize, DataTypes);

/* =========================
   BASIC RELATIONS
========================= */

// db.User.hasOne(db.UserProfile, { foreignKey: "userId" });
// db.UserProfile.belongsTo(db.User, { foreignKey: "userId" });

/* =========================
   AUTO ASSOCIATE
========================= */

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/* =========================
   SYNC DATABASE
========================= */

db.sequelize
  .sync({ alter: true }) // safely updates DB without deleting data
  .then(() => {
    console.log("✅ Database synced successfully");
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });

module.exports = db;