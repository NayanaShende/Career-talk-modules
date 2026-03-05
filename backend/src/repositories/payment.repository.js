const { Payment } = require("../models");

const createPayment = async (data) => {
  return await Payment.create(data);
};

const getPaymentByOrderId = async (orderId) => {
  return await Payment.findOne({
    where: { razorpay_order_id: orderId },
  });
};

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

module.exports = {
  createPayment,
  getPaymentByOrderId,
  updatePaymentStatus,
};