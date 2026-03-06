module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // ✅ Added: Link payment to user
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // allowNull true for backward compatibility
      },

      razorpay_order_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      razorpay_payment_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      razorpay_signature: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "INR",
      },

      status: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "created",
        // Possible values: "created", "paid", "failed"
      },
    },
    {
      tableName: "payments",
      timestamps: true,
    }
  );

  // ✅ Association: Payment belongs to User
  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Payment;
};