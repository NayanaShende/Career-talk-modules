// src/pages/admin/AdminExperts.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAllExperts, verifyExpert, rejectExpert } from "../../api/adminApi";
import "./AdminDashboard.css";

export default function AdminExperts() {
  const [experts, setExperts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    fetchAllExperts()
      .then((res) => {
        setExperts(res.data.data || []);
        setFiltered(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      experts.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.domain?.toLowerCase().includes(q) ||
          e.user?.fullName?.toLowerCase().includes(q) ||
          e.user?.mobile?.includes(q)
      )
    );
  }, [search, experts]);

  const handleVerify = async (id) => {
    setActing(id + "-verify");
    try {
      await verifyExpert(id);
      setExperts((prev) =>
        prev.map((e) => (e.id === id ? { ...e, verified: true } : e))
      );
    } catch (err) {
      alert("Failed to verify expert");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id) => {
    setActing(id + "-reject");
    try {
      await rejectExpert(id);
      setExperts((prev) =>
        prev.map((e) => (e.id === id ? { ...e, verified: false } : e))
      );
    } catch (err) {
      alert("Failed to reject expert");
    } finally {
      setActing(null);
    }
  };

  return (
    <AdminLayout title="Expert Management">
      <div className="admin-page-header">
        <h1>🎓 Expert Management</h1>
        <p>Verify or reject expert profiles. Verified experts appear to users.</p>
      </div>

      <input
        className="admin-search-bar"
        placeholder="🔍  Search by name, domain, or mobile..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="admin-loading">⚡ Loading experts...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Expert</th>
                <th>Domain</th>
                <th>Rating</th>
                <th>Mobile</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    No experts found
                  </td>
                </tr>
              ) : (
                filtered.map((expert, i) => (
                  <tr key={expert.id}>
                    <td style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{i + 1}</td>
                    <td>
                      <div className="expert-name-cell">
                        {expert.image ? (
                          <img
                            src={expert.image}
                            alt={expert.name}
                            className="expert-avatar"
                            style={{ borderRadius: 10, width: 36, height: 36, objectFit: "cover" }}
                          />
                        ) : (
                          <div className="expert-avatar">🎓</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: "#fff" }}>
                            {expert.name || expert.user?.fullName || "—"}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {expert.user?.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{expert.domain || "—"}</td>
                    <td>
                      <span style={{ color: "#fbbf24" }}>⭐ {expert.rating?.toFixed(1) || "0.0"}</span>
                    </td>
                    <td>{expert.user?.mobile || "—"}</td>
                    <td>{expert.experience ? `${expert.experience} yrs` : "—"}</td>
                    <td>
                      <span className={`badge ${expert.verified ? "verified" : "pending"}`}>
                        {expert.verified ? "✅ Verified" : "⏳ Pending"}
                      </span>
                    </td>
                    <td>
                      {!expert.verified ? (
                        <button
                          className="btn-verify"
                          disabled={acting === expert.id + "-verify"}
                          onClick={() => handleVerify(expert.id)}
                        >
                          {acting === expert.id + "-verify" ? "..." : "✅ Verify"}
                        </button>
                      ) : (
                        <button
                          className="btn-reject"
                          disabled={acting === expert.id + "-reject"}
                          onClick={() => handleReject(expert.id)}
                        >
                          {acting === expert.id + "-reject" ? "..." : "❌ Revoke"}
                        </button>
                      )}
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
