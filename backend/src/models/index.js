const { Sequelize, DataTypes } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../../config/config.json")[env];

// ✅ Production uses DATABASE_URL, development uses individual config
let sequelize;

if (config.use_env_variable) {
  // Production (Render) — uses DATABASE_URL environment variable
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    dialect: config.dialect || "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Development (local) — uses individual config values
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port || 5432,
    dialect: config.dialect || "postgres",
    logging: false,
  });
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

/* =========================
   LOAD MODELS
========================= */

db.User = require("./user")(sequelize, DataTypes);
db.Chat = require("./chat")(sequelize, DataTypes);
db.Call = require("./call")(sequelize, DataTypes);
db.Notification = require("./notification.model")(sequelize, DataTypes);
db.Expert = require("./expert")(sequelize, DataTypes);
db.Review = require("./review")(sequelize, DataTypes);
db.WalletTransaction = require("./walletTransaction")(sequelize, DataTypes);
db.Payment = require("./payment")(sequelize, DataTypes);

try {
  db.ExpertSkill = require("./expertSkill")(sequelize, DataTypes);
} catch (err) {
  console.warn("⚠️ ExpertSkill model not found, skipping...");
}

/* =========================
   AUTO ASSOCIATE
========================= */

Object.keys(db).forEach((modelName) => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
