// src/api/adminApi.js
import axios from "axios";

import { API_URL } from "../config";

const adminAxios = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach admin token to every request
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle expired tokens globally
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized/Token Expired: Redirecting to login...");
      localStorage.removeItem("adminToken");
      // Redirect to login page
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

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
