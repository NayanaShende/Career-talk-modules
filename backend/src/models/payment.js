module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      },
    },
    {
      tableName: "payments",
      timestamps: true,
    }
  );

  return Payment;
};