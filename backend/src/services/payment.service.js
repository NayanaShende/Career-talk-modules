const RazorpayModule = require("razorpay");
const Razorpay = RazorpayModule.default || RazorpayModule;
const crypto = require("crypto");
const paymentRepository = require("../repositories/payment.repository");
const walletService = require("./wallet.service");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order & save to DB
const createOrder = async (amount, userId = null) => {
  const options = {
    amount: amount * 100, // paise
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  // Save order in payments table with user_id
  await paymentRepository.createPayment({
    user_id: userId,
    amount: amount,
    razorpay_order_id: order.id,
    status: "created",
  });

  return order;
};

// ✅ Verify Razorpay Payment Signature + Credit Wallet
const verifyPayment = async (order_id, payment_id, signature, userId) => {
  const body = order_id + "|" + payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === signature;

  if (isValid) {
    // 1. Update payment record to "paid"
    await paymentRepository.updatePaymentStatus(order_id, payment_id, signature);

    // 2. Fetch payment to get amount & user_id
    const payment = await paymentRepository.getPaymentByOrderId(order_id);

    const resolvedUserId = userId || payment?.user_id;

    if (!resolvedUserId) {
      throw new Error("User ID not found for wallet topup");
    }

    // 3. Credit wallet with topup transaction
    await walletService.topupAmount(
      resolvedUserId,
      payment.amount,
      payment_id  // ref_id = razorpay_payment_id for traceability
    );
  }

  return isValid;
};

// ✅ Handle Razorpay Webhook Events
const handleWebhook = async (payload, razorpaySignature) => {
  // Step 1: Verify webhook signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(payload))
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Invalid webhook signature");
  }

  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;

  // Step 2: Handle payment.captured event
  if (event === "payment.captured") {
    const order_id = paymentEntity.order_id;
    const payment_id = paymentEntity.id;
    const amount = paymentEntity.amount / 100; // convert paise to INR

    // Find existing payment record
    const payment = await paymentRepository.getPaymentByOrderId(order_id);

    if (!payment) {
      throw new Error(`Payment record not found for order: ${order_id}`);
    }

    // Avoid duplicate wallet credit (idempotency check)
    if (payment.status === "paid") {
      console.log(`Webhook: Payment ${payment_id} already processed. Skipping.`);
      return { alreadyProcessed: true };
    }

    // Update payment status
    await paymentRepository.updatePaymentStatus(
      order_id,
      payment_id,
      paymentEntity.signature || null
    );

    // Credit wallet
    if (payment.user_id) {
      await walletService.topupAmount(
        payment.user_id,
        amount,
        payment_id
      );
      console.log(`Webhook: Wallet credited ₹${amount} for user ${payment.user_id}`);
    } else {
      console.warn(`Webhook: No user_id found for order ${order_id}. Wallet not credited.`);
    }
  }

  // Step 3: Handle payment.failed event
  if (event === "payment.failed") {
    const order_id = paymentEntity.order_id;
    await paymentRepository.updatePaymentStatusFailed(order_id);
    console.log(`Webhook: Payment failed for order ${order_id}`);
  }

  return { success: true, event };
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};