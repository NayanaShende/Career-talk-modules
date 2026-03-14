module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    expert_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
    },
    // ✅ FIXED: added comment column — backend requires it
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  // ✅ Associate Review with Expert
  Review.associate = (db) => {
    Review.belongsTo(db.Expert, { foreignKey: "expert_id", as: "expert" });
    // ✅ FIXED: added User association — needed for getRatings to include user name/image
    Review.belongsTo(db.User, { foreignKey: "user_id", as: "user" });
  };

  return Review;
};