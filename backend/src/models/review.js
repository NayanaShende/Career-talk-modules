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
  });

  // ✅ Associate Review with Expert
  Review.associate = (db) => {
    Review.belongsTo(db.Expert, { foreignKey: "expert_id", as: "expert" });
  };

  return Review;
};