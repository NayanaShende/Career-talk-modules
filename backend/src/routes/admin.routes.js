// src/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const adminProtect = require("../middleware/adminProtect");

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
// POST /api/admin/login
router.post("/login", adminController.adminLogin);

// ─── PROTECTED (admin only) ───────────────────────────────────────────────────
// GET /api/admin/stats
router.get("/stats", adminProtect, adminController.getStats);

// GET /api/admin/users
router.get("/users", adminProtect, adminController.getAllUsers);

// GET /api/admin/experts
router.get("/experts", adminProtect, adminController.getAllExperts);

// PUT /api/admin/experts/:id/verify
router.put("/experts/:id/verify", adminProtect, adminController.verifyExpert);

// PUT /api/admin/experts/:id/reject
router.put("/experts/:id/reject", adminProtect, adminController.rejectExpert);

// GET /api/admin/payments
router.get("/payments", adminProtect, adminController.getPlatformPayments);

// GET /api/admin/wallet-transactions
router.get("/wallet-transactions", adminProtect, adminController.getWalletTransactions);

module.exports = router;
