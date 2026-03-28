// src/controllers/admin.controller.js
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const db = require("../models");

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
// POST /api/admin/login
// Upserts an admin user and returns a JWT
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const ADMIN_EMAIL = "admin@careertalk.com";
    const ADMIN_PASSWORD = "Admin@123";

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    // Upsert admin user in DB
    let admin = await db.User.findOne({ where: { email: ADMIN_EMAIL } });

    if (!admin) {
      admin = await db.User.create({
        mobile: "0000000000",
        email: ADMIN_EMAIL,
        fullName: "Super Admin",
        role: "admin",
        isVerified: true,
        hasProfile: true,
      });
    } else if (admin.role !== "admin") {
      await admin.update({ role: "admin" });
    }

    const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
    });
  } catch (err) {
    console.error("adminLogin error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STATS ────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await db.User.count({ where: { role: { [Op.ne]: "admin" } } });
    const totalExperts = await db.Expert.count();
    const verifiedExperts = await db.Expert.count({ where: { verified: true } });
    const pendingExperts = await db.Expert.count({ where: { verified: false } });

    // Total revenue = sum of all topup payment amounts
    const payments = await db.Payment.findAll({ where: { status: "paid" } });
    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    // Total wallet topups
    const walletTopups = await db.WalletTransaction.findAll({ where: { type: "topup" } });
    const totalWalletTopup = walletTopups.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    // Platform fee = 10% of wallet topup
    const platformRevenue = totalRevenue > 0 ? totalRevenue / 100 : totalWalletTopup * 0.10;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalExperts,
        verifiedExperts,
        pendingExperts,
        totalRevenue: totalRevenue / 100, // paise to rupees
        platformRevenue: Math.round(platformRevenue),
        totalWalletTopup,
      },
    });
  } catch (err) {
    console.error("getStats error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ALL USERS ────────────────────────────────────────────────────────────────
// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      where: { role: { [Op.ne]: "admin" } },
      attributes: ["id", "fullName", "mobile", "email", "role", "isVerified", "hasProfile", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ALL EXPERTS ──────────────────────────────────────────────────────────────
// GET /api/admin/experts
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await db.Expert.findAll({
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "fullName", "mobile", "email", "createdAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: experts });
  } catch (err) {
    console.error("getAllExperts error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY EXPERT ────────────────────────────────────────────────────────────
// PUT /api/admin/experts/:id/verify
exports.verifyExpert = async (req, res) => {
  try {
    const { id } = req.params;

    const expert = await db.Expert.findByPk(id);
    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    await expert.update({ verified: true });

    return res.status(200).json({ success: true, message: "Expert verified successfully", data: expert });
  } catch (err) {
    console.error("verifyExpert error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── REJECT EXPERT ────────────────────────────────────────────────────────────
// PUT /api/admin/experts/:id/reject
exports.rejectExpert = async (req, res) => {
  try {
    const { id } = req.params;

    const expert = await db.Expert.findByPk(id);
    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    await expert.update({ verified: false });

    return res.status(200).json({ success: true, message: "Expert rejected", data: expert });
  } catch (err) {
    console.error("rejectExpert error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
// GET /api/admin/payments
exports.getPlatformPayments = async (req, res) => {
  try {
    const payments = await db.Payment.findAll({
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "fullName", "mobile", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const totalRevenue = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return res.status(200).json({
      success: true,
      data: payments,
      summary: {
        totalRevenue: totalRevenue / 100, // paise to rupees
        totalTransactions: payments.length,
        paidCount: payments.filter((p) => p.status === "paid").length,
      },
    });
  } catch (err) {
    console.error("getPlatformPayments error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── WALLET TRANSACTIONS ──────────────────────────────────────────────────────
// GET /api/admin/wallet-transactions
exports.getWalletTransactions = async (req, res) => {
  try {
    const transactions = await db.WalletTransaction.findAll({
      order: [["created_at", "DESC"]],
      limit: 200,
    });

    // Enrich with user details
    const enriched = await Promise.all(
      transactions.map(async (tx) => {
        const txData = tx.toJSON();
        try {
          const user = await db.User.findOne({
            where: { id: txData.user_id },
            attributes: ["id", "fullName", "mobile"],
          });
          txData.user_name = user ? user.fullName : "Unknown";
          txData.user_mobile = user ? user.mobile : null;
        } catch (e) {
          txData.user_name = "Unknown";
        }
        return txData;
      })
    );

    const totalTopup = enriched
      .filter((t) => t.type === "topup" && t.ref_id === "topup")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return res.status(200).json({
      success: true,
      data: enriched,
      summary: {
        totalTopup,
        totalTransactions: enriched.length,
      },
    });
  } catch (err) {
    console.error("getWalletTransactions error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PLATFORM FEES ──────────────────────────────────────────────────────────────
// GET /api/admin/platform-fee
exports.getPlatformFee = async (req, res) => {
  try {
    let fee = await db.PlatformFee.findOne();
    if (!fee) {
      fee = await db.PlatformFee.create({ fee_percent: 10 });
    }
    return res.status(200).json({ success: true, data: fee });
  } catch (err) {
    console.error("getPlatformFee error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/platform-fee
exports.updatePlatformFee = async (req, res) => {
  try {
    const { fee_percent } = req.body;
    let fee = await db.PlatformFee.findOne();
    if (!fee) {
      fee = await db.PlatformFee.create({ fee_percent: fee_percent || 10 });
    } else {
      await fee.update({ fee_percent });
    }
    return res.status(200).json({ success: true, message: "Platform fee updated", data: fee });
  } catch (err) {
    console.error("updatePlatformFee error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

