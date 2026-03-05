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
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

/* =========================
   LOAD MODELS (ORDER SAFE)
========================= */

// Load User FIRST (since Expert depends on it)
db.User = require("./user")(sequelize, DataTypes);

// Load Expert (depends on User)
db.Expert = require("./expert")(sequelize, DataTypes);

// Load Review ✅ NEW
db.Review = require("./review")(sequelize, DataTypes);
db.WalletTransaction = require("./walletTransaction")(sequelize, DataTypes);

// ✅ Load Payment
db.Payment = require("./payment")(sequelize, DataTypes);

// Load ExpertSkill (if exists)
try {
  db.ExpertSkill = require("./expertSkill")(sequelize, DataTypes);
} catch (err) {
  console.warn("⚠️ ExpertSkill model not found, skipping...");
}

/* =========================
   AUTO ASSOCIATE (SAFE)
========================= */

Object.keys(db).forEach((modelName) => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/* =========================
   TEST CONNECTION ONLY
   ✅ Sync is handled in app.js — removed from here to avoid duplicate
========================= */

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connection successful");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err);
  });

// ✅ REMOVED db.sequelize.sync() from here — already done in app.js

module.exports = db;