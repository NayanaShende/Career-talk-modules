// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAdminStats, fetchPayments, fetchWalletTransactions } from "../../api/adminApi";
import "./AdminDashboard.css";

const STAT_CARDS = [
  { key: "totalUsers",       label: "Total Users",         icon: "👥", color: "purple" },
  { key: "totalExperts",     label: "Total Experts",       icon: "🎓", color: "blue"   },
  { key: "verifiedExperts",  label: "Verified Experts",    icon: "✅", color: "green"  },
  { key: "pendingExperts",   label: "Pending Verification",icon: "⏳", color: "orange" },
  { key: "totalRevenue",     label: "Total Revenue (₹)",   icon: "💰", color: "teal",  prefix: "₹" },
  { key: "platformRevenue",  label: "Platform Fees (₹)",   icon: "🏦", color: "green", prefix: "₹" },
];

function StatCard({ icon, label, value, color, prefix }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">
        {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : "—"}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentFees, setRecentFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchPayments(), fetchWalletTransactions()])
      .then(([statsRes, paymentsRes, walletRes]) => {
        setStats(statsRes.data.data);
        setRecentPayments((paymentsRes.data.data || []).slice(0, 5));
        
        // Extract recent platform fees
        const allTx = walletRes.data.data || [];
        const fees = allTx.filter(t => t.type === "platform_fee");
        setRecentFees(fees.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-page-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening on Career Talk.</p>
      </div>

      {loading ? (
        <div className="admin-loading">⚡ Loading stats...</div>
      ) : (
        <>
          <div className="admin-stats-grid">
            {STAT_CARDS.map((card) => (
              <StatCard
                key={card.key}
                icon={card.icon}
                label={card.label}
                color={card.color}
                prefix={card.prefix || ""}
                value={stats?.[card.key] ?? 0}
              />
            ))}
          </div>

          <div className="admin-section-title">💳 Recent Payments</div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Mobile</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr><td colSpan={7} className="admin-empty">No payments found</td></tr>
                ) : (
                  recentPayments.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: "#9ca3af", fontSize: "12px" }}>{i + 1}</td>
                      <td>{p.user?.fullName || "—"}</td>
                      <td>{p.user?.mobile || "—"}</td>
                      <td style={{ fontWeight: 700, color: "#4f46e5" }}>
                        ₹{(p.amount / 100).toLocaleString("en-IN")}
                      </td>
                      <td>{p.currency}</td>
                      <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                      <td style={{ color: "#9ca3af", fontSize: "12px" }}>
                        {new Date(p.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-section-title" style={{ marginTop: "40px" }}>🏦 Recent Platform Fees</div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Expert / User</th>
                  <th>Mobile</th>
                  <th>Fee Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFees.length === 0 ? (
                  <tr><td colSpan={6} className="admin-empty">No platform fees collected yet</td></tr>
                ) : (
                  recentFees.map((f, i) => (
                    <tr key={f.id}>
                      <td style={{ color: "#9ca3af", fontSize: "12px" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{f.user_name || "—"}</td>
                      <td>{f.user_mobile || "—"}</td>
                      <td style={{ fontWeight: 700, color: "#059669" }}>
                        ₹{parseFloat(f.amount).toLocaleString("en-IN")}
                      </td>
                      <td><span className="badge fee">fee</span></td>
                      <td style={{ color: "#9ca3af", fontSize: "12px" }}>
                        {new Date(f.created_at).toLocaleDateString("en-IN", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
