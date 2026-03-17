const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");

router.post("/topup", walletController.topup);
router.post("/hold", walletController.hold);
router.post("/debit", walletController.debit);
router.post("/release", walletController.release);
router.post("/chat-preauth", walletController.chatPreAuth);

// ✅ NEW: Professional per-minute chat billing
router.post("/chat-start", walletController.chatStart);   // hold ₹50 when chat starts
router.post("/chat-tick", walletController.chatTick);     // debit ₹10 every minute + credit expert
router.post("/chat-end", walletController.chatEnd);       // release remaining hold to user

router.get("/balance/:userId", walletController.balance);
router.get("/history/:userId", walletController.history);

module.exports = router;