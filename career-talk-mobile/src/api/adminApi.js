// src/api/adminApi.js
import axios from "axios";

const adminAxios = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach admin token to every request
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const adminLogin = (email, password) =>
  adminAxios.post("/admin/login", { email, password });

// ─── STATS ────────────────────────────────────────────────────────────────
export const fetchAdminStats = () => adminAxios.get("/admin/stats");

// ─── USERS ────────────────────────────────────────────────────────────────
export const fetchAllUsers = () => adminAxios.get("/admin/users");

// ─── EXPERTS ──────────────────────────────────────────────────────────────
export const fetchAllExperts = () => adminAxios.get("/admin/experts");
export const verifyExpert = (id) => adminAxios.put(`/admin/experts/${id}/verify`);
export const rejectExpert = (id) => adminAxios.put(`/admin/experts/${id}/reject`);

// ─── PAYMENTS ─────────────────────────────────────────────────────────────
export const fetchPayments = () => adminAxios.get("/admin/payments");
export const fetchWalletTransactions = () => adminAxios.get("/admin/wallet-transactions");
