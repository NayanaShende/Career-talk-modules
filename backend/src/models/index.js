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

// MODELS
db.Expert = require("./expert")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill")(sequelize, DataTypes);
db.User = require("./user")(sequelize, DataTypes);
db.UserProfile = require("./user.profile")(sequelize, DataTypes);
db.ExpertProfile = require("./expert.profile")(sequelize, DataTypes);

// OTHER RELATIONS
db.User.hasOne(db.UserProfile, { foreignKey: "userId" });
db.UserProfile.belongsTo(db.User, { foreignKey: "userId" });

// AUTO ASSOCIATE
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/* ✅✅✅ ADD THIS BLOCK (DO NOT REMOVE) */
db.sequelize
  .sync({ alter: true })   // safely updates DB columns without deleting data
  .then(() => {
    console.log("✅ Database synced successfully");
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });
/* ✅✅✅ END ADD */

module.exports = db;