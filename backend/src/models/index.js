const { Sequelize, DataTypes } = require("sequelize");

const env = process.env.NODE_ENV || "development";

// ✅ load config correctly
const config = require("../config/config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect || "postgres",
  },
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ================= MODELS =================

db.Expert = require("./expert.model")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill.model")(sequelize, DataTypes);
db.User = require("./user")(sequelize, DataTypes);
db.UserProfile = require("./user.profile")(sequelize, DataTypes);
db.ExpertProfile = require("./expert.profile")(sequelize, DataTypes);

// ================= RELATIONS =================

db.Expert.hasMany(db.ExpertSkill, {
  foreignKey: "expert_id",
  as: "skills",
});

db.User.hasOne(db.UserProfile, { foreignKey: "userId" });
db.UserProfile.belongsTo(db.User, { foreignKey: "userId" });

// ================= EXPORT =================

module.exports = db;
