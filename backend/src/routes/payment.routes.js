const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// ✅ IMPORTANT: Webhook route MUST be defined BEFORE express.json() is applied
// It needs raw body for Razorpay signature verification
// This route uses express.raw() to get raw buffer
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Parse raw buffer to JSON for our handler
    // but keep original raw for signature verification
    try {
      req.body = JSON.parse(req.body.toString());
      next();
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid JSON payload" });
    }
  },
  paymentController.handleWebhook
);

// ✅ Create Razorpay Order (requires auth middleware)
router.post("/create-order", paymentController.createOrder);

// ✅ Verify Payment + Credit Wallet (requires auth middleware)
router.post("/verify-payment", paymentController.verifyPayment);

module.exports = router;