// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAdminStats, fetchPayments } from "../../api/adminApi";
import "./AdminDashboard.css";

const STAT_CARDS = [
  { key: "totalUsers",       label: "Total Users",         icon: "👥", color: "purple" },
  { key: "totalExperts",     label: "Total Experts",       icon: "🎓", color: "blue"   },
  { key: "verifiedExperts",  label: "Verified Experts",    icon: "✅", color: "green"  },
  { key: "pendingExperts",   label: "Pending Verification",icon: "⏳", color: "orange" },
  { key: "totalRevenue",     label: "Total Revenue (₹)",   icon: "💰", color: "teal",  prefix: "₹" },
  { key: "totalWalletTopup", label: "Wallet Topups (₹)",   icon: "💳", color: "red",   prefix: "₹" },
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchPayments()])
      .then(([statsRes, paymentsRes]) => {
        setStats(statsRes.data.data);
        setRecentPayments((paymentsRes.data.data || []).slice(0, 8));
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
                      <td style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{i + 1}</td>
                      <td>{p.user?.fullName || "—"}</td>
                      <td>{p.user?.mobile || "—"}</td>
                      <td style={{ fontWeight: 700, color: "#a5b4fc" }}>
                        ₹{(p.amount / 100).toLocaleString("en-IN")}
                      </td>
                      <td>{p.currency}</td>
                      <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                      <td style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                        {new Date(p.createdAt).toLocaleDateString("en-IN")}
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
