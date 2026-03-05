const RazorpayModule = require("razorpay");
const Razorpay = RazorpayModule.default || RazorpayModule;
const crypto = require("crypto");
const paymentRepository = require("../repositories/payment.repository");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (amount, userId = null) => {

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  // ✅ Save order in database
  await paymentRepository.createPayment({
    user_id: userId,
    amount: amount,
    razorpay_order_id: order.id,
    status: "created",
  });

  return order;
};

// ✅ Verify Razorpay Payment
const verifyPayment = async (order_id, payment_id, signature) => {

  const body = order_id + "|" + payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === signature;

  if (isValid) {
    // ✅ Update payment status in DB
    await paymentRepository.updatePaymentStatus(
      order_id,
      payment_id,
      signature
    );
  }

  return isValid;
};

module.exports = {
  createOrder,
  verifyPayment,
};