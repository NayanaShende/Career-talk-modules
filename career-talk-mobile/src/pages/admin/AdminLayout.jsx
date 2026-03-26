// src/pages/admin/AdminLayout.jsx
import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./AdminLayout.css";

const navItems = [
  { icon: "📊", label: "Dashboard", path: "/admin" },
  { icon: "👥", label: "Users", path: "/admin/users" },
  { icon: "🎓", label: "Experts", path: "/admin/experts" },
  { icon: "💳", label: "Payments", path: "/admin/payments" },
];

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <div className="admin-sidebar-logo-icon">🎓</div>
        <div className="admin-sidebar-logo-text">
          <h3>Career Talk</h3>
          <p>Admin Panel</p>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <div className="admin-sidebar-section">Main Menu</div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-nav-link ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="admin-nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <span className="admin-nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  // Redirect if no admin token
  if (!token) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">{title || "Admin Dashboard"}</div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-user">
              <div className="admin-topbar-avatar">👤</div>
              <span>{adminInfo.fullName || "Super Admin"}</span>
            </div>
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
