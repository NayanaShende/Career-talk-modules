// src/pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/adminApi";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await adminLogin(email, password);
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));
        navigate("/admin");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Connection failed. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="admin-login-logo-icon">🎓</div>
          <div className="admin-login-logo-text">
            <h2>Career Talk</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <div className="admin-login-badge">🔐 Secure Admin Access</div>

        <h1 className="admin-login-title">Welcome Back</h1>
        <p className="admin-login-subtitle">Sign in to your admin dashboard</p>

        {error && (
          <div className="admin-login-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="admin-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@careertalk.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
