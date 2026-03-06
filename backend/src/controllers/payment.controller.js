const paymentService = require("../services/payment.service");

// ✅ Create Razorpay Order
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    // Pass authenticated user's ID
    const order = await paymentService.createOrder(amount, req.user?.id);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Order creation failed",
    });
  }
};

// ✅ Verify Payment + Credit Wallet (called from frontend after payment)
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data missing",
      });
    }

    const isValid = await paymentService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      req.user?.id  // pass user ID for wallet credit
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed - invalid signature",
      });
    }

    res.json({
      success: true,
      message: "Payment verified and wallet credited successfully",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// ✅ Razorpay Webhook Handler
// IMPORTANT: This route must use express.raw() middleware - see routes file
const handleWebhook = async (req, res) => {
  try {
    const razorpaySignature = req.headers["x-razorpay-signature"];

    if (!razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay signature header",
      });
    }

    // req.body must be raw JSON (not parsed) — handled in routes
    const payload = req.body;

    const result = await paymentService.handleWebhook(payload, razorpaySignature);

    if (result.alreadyProcessed) {
      return res.status(200).json({ success: true, message: "Already processed" });
    }

    res.status(200).json({ success: true, message: "Webhook handled", event: result.event });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    // Always return 200 to Razorpay to prevent retries on auth errors
    res.status(200).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};