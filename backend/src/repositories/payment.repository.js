const { Payment } = require("../models");

// ✅ Create payment record (supports user_id)
const createPayment = async (data) => {
  return await Payment.create(data);
};

// ✅ Find payment by Razorpay order ID
const getPaymentByOrderId = async (orderId) => {
  return await Payment.findOne({
    where: { razorpay_order_id: orderId },
  });
};

// ✅ Update payment to "paid" with payment_id and signature
const updatePaymentStatus = async (orderId, paymentId, signature) => {
  return await Payment.update(
    {
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      status: "paid",
    },
    {
      where: { razorpay_order_id: orderId },
    }
  );
};

// ✅ Update payment to "failed"
const updatePaymentStatusFailed = async (orderId) => {
  return await Payment.update(
    { status: "failed" },
    { where: { razorpay_order_id: orderId } }
  );
};

module.exports = {
  createPayment,
  getPaymentByOrderId,
  updatePaymentStatus,
  updatePaymentStatusFailed,
};