const { Sequelize, DataTypes } = require("sequelize");
<<<<<<< HEAD
const config = require("../../config/config.json").development;
=======
const env = process.env.NODE_ENV || "development";

const config = require("../config/config.js")[env];
>>>>>>> origin/Mob_app

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
<<<<<<< HEAD
  {
    host: config.host,
    dialect: "postgres",
  }
);

const db = {};

=======
  config,
);

const db = {};
db.Sequelize = Sequelize;
>>>>>>> origin/Mob_app
db.sequelize = sequelize;
db.Sequelize = Sequelize;

<<<<<<< HEAD
db.Expert = require("./expert.model")(sequelize, DataTypes);
db.ExpertSkill = require("./expertSkill.model")(sequelize, DataTypes);

db.Expert.hasMany(db.ExpertSkill, {
  foreignKey: "expert_id",
  as: "skills",
});
=======
// Models
db.User = require("./user")(sequelize, Sequelize.DataTypes);
db.Expert = require("./expert")(sequelize, DataTypes);
db.UserProfile = require("./user.profile")(sequelize, DataTypes);

// Associations
db.User.hasOne(db.UserProfile, { foreignKey: "userId" });
db.UserProfile.belongsTo(db.User, { foreignKey: "userId" });
db.ExpertProfile = require("./expert.profile")(sequelize, Sequelize);
>>>>>>> origin/Mob_app

module.exports = db;
