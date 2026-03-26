// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { fetchAllUsers } from "../../api/adminApi";
import "./AdminDashboard.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers()
      .then((res) => {
        setUsers(res.data.data || []);
        setFiltered(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.mobile?.includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  return (
    <AdminLayout title="User Management">
      <div className="admin-page-header">
        <h1>👥 User Management</h1>
        <p>View all registered users on Career Talk.</p>
      </div>

      <input
        className="admin-search-bar"
        placeholder="🔍  Search by name, mobile, email or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="admin-loading">⚡ Loading users...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Role</th>
                <th>Profile</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">No users found</td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{u.fullName || "—"}</td>
                    <td>{u.mobile}</td>
                    <td style={{ color: "rgba(255,255,255,0.55)" }}>{u.email || "—"}</td>
                    <td>
                      <span className={`badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.hasProfile ? "verified" : "pending"}`}>
                        {u.hasProfile ? "Complete" : "Incomplete"}
                      </span>
                    </td>
                    <td style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
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
