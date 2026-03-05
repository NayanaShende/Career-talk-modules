const paymentService = require("../services/payment.service");

const createOrder = async (req, res) => {

  try {

    const { amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const order = await paymentService.createOrder(amount, req.user?.id);

    res.json({
      success: true,
      order,
    });

  } catch (error) {

    console.error("Payment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Order creation failed",
    });

  }
};


// ✅ VERIFY PAYMENT CONTROLLER (Added)
const verifyPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
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
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (error) {

    console.error("Verify Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });

  }
};


module.exports = {
  createOrder,
  verifyPayment,
};