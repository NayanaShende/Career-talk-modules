const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");

router.post("/topup", walletController.topup);
router.post("/hold", walletController.hold);
router.post("/debit", walletController.debit);
router.post("/release", walletController.release);
router.post("/chat-preauth", walletController.chatPreAuth);
router.get("/balance/:userId", walletController.balance);
router.get("/history/:userId", walletController.history);

module.exports = router;
