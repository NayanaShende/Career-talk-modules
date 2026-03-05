const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");

// ✅ Create Razorpay Order
router.post(
  "/create-order",
  paymentController.createOrder
);

// ✅ Verify Razorpay Payment
router.post(
  "/verify-payment",
  paymentController.verifyPayment || ((req, res) => {
    res.status(500).json({
      success: false,
      message: "verifyPayment controller not implemented",
    });
  })
);

module.exports = router;