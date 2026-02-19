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

// ======================
// MODELS
// ======================

db.User = require("./user")(sequelize, DataTypes);
db.UserProfile = require("./user.profile")(sequelize, DataTypes);
db.Expert = require("./expert")(sequelize, DataTypes);
db.ExpertProfile = require("./expert.profile")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill")(sequelize, DataTypes);

// ======================
// ASSOCIATIONS
// ======================

// User ↔ UserProfile (1:1)
db.User.hasOne(db.UserProfile, {
  foreignKey: "userId",
  as: "userProfile",
});
db.UserProfile.belongsTo(db.User, {
  foreignKey: "userId",
});

// User ↔ Expert (1:1)
db.User.hasOne(db.Expert, {
  foreignKey: "userId",
  as: "expert",
});
db.Expert.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

// Expert ↔ ExpertProfile (1:1)
db.Expert.hasOne(db.ExpertProfile, {
  foreignKey: "expertId",
  as: "profile",
  onDelete: "CASCADE",
});
db.ExpertProfile.belongsTo(db.Expert, {
  foreignKey: "expertId",
  as: "expert",
});

// Expert ↔ ExpertSkill (1:Many)
db.Expert.hasMany(db.ExpertSkill, {
  foreignKey: "expertId",
  as: "skills",
  onDelete: "CASCADE",
});
db.ExpertSkill.belongsTo(db.Expert, {
  foreignKey: "expertId",
});

// ======================
// DATABASE SYNC
// ======================

db.sequelize
  .sync({ alter: true })   // safely updates DB structure
  .then(() => {
    console.log("✅ Database synced successfully");
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });

module.exports = db;
