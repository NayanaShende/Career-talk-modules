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

// ✅ MODELS
db.Expert = require("./expert")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill")(sequelize, DataTypes);
db.User = require("./user")(sequelize, DataTypes);
db.Chat = require('./chat')(sequelize, DataTypes);
db.Call = require('./call')(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/* ✅ Database Sync */
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database synced safely");
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err);
  });

module.exports = db;
