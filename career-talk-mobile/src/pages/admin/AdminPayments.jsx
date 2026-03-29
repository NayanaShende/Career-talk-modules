// src/pages/admin/AdminPayments.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { fetchPayments, fetchWalletTransactions } from "../../api/adminApi";
import "./AdminDashboard.css";

const TABS = ["Razorpay Payments", "Wallet Transactions", "Platform Fees"];

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState(0);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({});
  const [walletTxns, setWalletTxns] = useState([]);
  const [walletSummary, setWalletSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([fetchPayments(), fetchWalletTransactions()])
      .then(([payRes, walRes]) => {
        setPayments(payRes.data.data || []);
        setPaymentSummary(payRes.data.summary || {});
        setWalletTxns(walRes.data.data || []);
        setWalletSummary(walRes.data.summary || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.user?.fullName?.toLowerCase().includes(q) ||
      p.user?.mobile?.includes(q) ||
      p.status?.includes(q) ||
      p.razorpay_payment_id?.includes(q)
    );
  });

  const filteredWallet = walletTxns.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.user_name?.toLowerCase().includes(q) ||
      t.user_mobile?.includes(q) ||
      t.type?.includes(q)
    );
  });

  const filteredFees = walletTxns.filter((t) => {
    if (t.type !== "platform_fee") return false;
    const q = search.toLowerCase();
    return (
      t.user_name?.toLowerCase().includes(q) ||
      t.user_mobile?.includes(q)
    );
  });

  return (
    <AdminLayout title="Platform Payments">
      <div className="admin-page-header">
        <h1>💳 Platform Fees & Payments</h1>
        <p>Track all Razorpay payments and wallet transactions across the platform.</p>
      </div>

      {/* Revenue highlight */}
      {!loading && (
        <div className="revenue-highlight">
          <div className="revenue-highlight-icon">💰</div>
          <div className="revenue-highlight-info">
            <h3>₹{(paymentSummary.totalRevenue || 0).toLocaleString("en-IN")}</h3>
            <p>
              Total confirmed revenue · {paymentSummary.paidCount || 0} paid transactions ·{" "}
              ₹{(walletSummary.totalTopup || 0).toLocaleString("en-IN")} wallet topped up
            </p>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setSearch(""); }}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: activeTab === i
                ? "1px solid rgba(79, 70, 229, 0.2)"
                : "1px solid #e5e7eb",
              background: activeTab === i
                ? "#eef2ff"
                : "#ffffff",
              color: activeTab === i ? "#4f46e5" : "#6b7280",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
              boxShadow: activeTab === i ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <input
        className="admin-search-bar"
        placeholder="🔍  Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="admin-loading">⚡ Loading payment data...</div>
      ) : activeTab === 0 ? (
        /* ── RAZORPAY PAYMENTS ── */
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Payment ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty">No payments found</td></tr>
              ) : (
                filteredPayments.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.user?.fullName || "—"}</td>
                    <td>{p.user?.mobile || "—"}</td>
                    <td style={{ fontWeight: 700, color: "#4f46e5" }}>
                      ₹{(p.amount / 100).toLocaleString("en-IN")}
                    </td>
                    <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                    <td style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>
                      {p.razorpay_payment_id || "—"}
                    </td>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 1 ? (
        /* ── WALLET TRANSACTIONS ── */
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Amount (₹)</th>
                <th>Ref ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredWallet.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty">No transactions found</td></tr>
              ) : (
                filteredWallet.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{t.user_name || "—"}</td>
                    <td>{t.user_mobile || "—"}</td>
                    <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                    <td style={{ fontWeight: 700, color: "#4f46e5" }}>
                      ₹{parseFloat(t.amount).toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontSize: 11, color: "#9ca3af" }}>
                      {t.ref_id || "—"}
                    </td>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>
                      {new Date(t.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── PLATFORM FEES ── */
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Expert / Collected From</th>
                <th>Mobile</th>
                <th>Fee Amount (₹)</th>
                <th>Type</th>
                <th>Source ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty">No platform fees collected yet</td></tr>
              ) : (
                filteredFees.map((f, i) => (
                  <tr key={f.id}>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{f.user_name || "—"}</td>
                    <td>{f.user_mobile || "—"}</td>
                    <td style={{ fontWeight: 700, color: "#059669" }}>
                      ₹{parseFloat(f.amount).toLocaleString("en-IN")}
                    </td>
                    <td><span className="badge fee">fee</span></td>
                    <td style={{ fontSize: 11, color: "#9ca3af" }}>
                      User ID: {f.ref_id || "—"}
                    </td>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>
                      {new Date(f.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
