const { Sequelize, DataTypes } = require("sequelize");
const env = process.env.NODE_ENV || "development";

const config = require("../config/config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require("./user")(sequelize, Sequelize.DataTypes);
db.Expert = require("./expert")(sequelize, DataTypes);
db.UserProfile = require("./user.profile")(sequelize, DataTypes);

// Associations
db.User.hasOne(db.UserProfile, { foreignKey: "userId" });
db.UserProfile.belongsTo(db.User, { foreignKey: "userId" });
db.ExpertProfile = require("./expert.profile")(sequelize, Sequelize);

module.exports = db;
