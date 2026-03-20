import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

// ─────────────────────────────────────
// STATUS MAPS
// ─────────────────────────────────────
const STATUS_LABEL = {
  pending: "Pending",
  review: "In review",
  verified: "Verified",
  rejected: "Rejected",
  info: "Need info",
};

const STATUS_CLASS = {
  pending: "badge-pending",
  review: "badge-review",
  verified: "badge-verified",
  rejected: "badge-rejected",
  info: "badge-info",
};

// Avatar color pairs for light theme
const AVATAR_COLORS = [
  ["rgba(10,125,107,0.1)", "#0a7d6b"],
  ["rgba(29,78,216,0.1)", "#1d4ed8"],
  ["rgba(124,58,237,0.1)", "#7c3aed"],
  ["rgba(180,83,9,0.1)", "#b45309"],
  ["rgba(220,38,38,0.1)", "#dc2626"],
  ["rgba(22,163,74,0.1)", "#16a34a"],
];

function avatarColors(str = "") {
  const idx = (str.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("verify");
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastTimer, setToastTimer] = useState(null);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired! Please login again.");
      navigate("/");
    }
  }, [navigate]);

  // Fetch experts
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/admin/experts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setExperts(list);
      } catch (err) {
        console.error("Error fetching experts:", err);
        showToast("⚠ Failed to load expert profiles.");
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    const t = setTimeout(() => setToast(""), 2800);
    setToastTimer(t);
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.patch(
        `/admin/experts/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setExperts((prev) =>
        prev.map((e) => (e._id === id || e.id === id ? { ...e, status } : e)),
      );
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("⚠ Failed to update status.");
    }
  };

  const pendingCount = experts.filter((e) =>
    ["pending", "review", "info"].includes(e.status),
  ).length;

  const pageMeta = {
    overview: { title: "Overview", sub: "Platform health and key metrics" },
    verify: {
      title: "Expert Verification",
      sub: "Review and authenticate expert profiles before they go live",
    },
    "all-experts": {
      title: "All Experts",
      sub: "Browse and manage all platform experts",
    },
    "auth-logs": {
      title: "Authentication Logs",
      sub: "Track login events, sessions and suspicious activity",
    },
    roles: {
      title: "Roles & Permissions",
      sub: "Configure access levels for admins, moderators and experts",
    },
    settings: {
      title: "Settings",
      sub: "Configure verification rules, authentication and notifications",
    },
  };

  const meta = pageMeta[activePage] || pageMeta.verify;

  return (
    <div className="admin-layout">
      {/* ═══ SIDEBAR ═══ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-mark">
            <div className="admin-logo-icon">CT</div>
            <div>
              <div className="admin-logo-text">CareerTalk</div>
              <div className="admin-logo-tag">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-group-label">Overview</div>
          <NavItem
            id="overview"
            active={activePage}
            onClick={setActivePage}
            label="Overview"
            icon={<OverviewIcon />}
          />

          <div className="admin-nav-group-label">Experts</div>
          <NavItem
            id="verify"
            active={activePage}
            onClick={setActivePage}
            label="Expert Verification"
            icon={<VerifyIcon />}
            badge={pendingCount || null}
          />
          <NavItem
            id="all-experts"
            active={activePage}
            onClick={setActivePage}
            label="All Experts"
            icon={<ExpertsIcon />}
          />

          <div className="admin-nav-group-label">Auth & Security</div>
          <NavItem
            id="auth-logs"
            active={activePage}
            onClick={setActivePage}
            label="Authentication Logs"
            icon={<AuthIcon />}
          />
          <NavItem
            id="roles"
            active={activePage}
            onClick={setActivePage}
            label="Roles & Permissions"
            icon={<RolesIcon />}
          />

          <div className="admin-nav-group-label">System</div>
          <NavItem
            id="settings"
            active={activePage}
            onClick={setActivePage}
            label="Settings"
            icon={<SettingsIcon />}
          />
        </nav>

        <div className="admin-sidebar-user">
          <div className="admin-user-avatar">SA</div>
          <div>
            <div className="admin-user-name">Super Admin</div>
            <div className="admin-user-role">admin@careertalk.io</div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-page-title">{meta.title}</div>
            <div className="admin-page-sub">{meta.sub}</div>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-icon-btn" title="Notifications">
              <BellIcon />
            </div>
          </div>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">Loading expert profiles…</div>
          ) : (
            <>
              {activePage === "verify" && (
                <VerifyPage
                  experts={experts}
                  onUpdate={updateStatus}
                  showToast={showToast}
                />
              )}
              {activePage === "overview" && <OverviewPage experts={experts} />}
              {activePage === "all-experts" && (
                <AllExpertsPage experts={experts} />
              )}
              {activePage === "auth-logs" && <AuthLogsPage />}
              {activePage === "roles" && <RolesPage />}
              {activePage === "settings" && (
                <SettingsPage showToast={showToast} />
              )}
            </>
          )}
        </div>
      </main>

      <div className={`admin-toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
};

export default AdminPage;

// ═══════════════════════════════════════
// NAV ITEM
// ═══════════════════════════════════════
const NavItem = ({ id, active, onClick, label, icon, badge }) => (
  <button
    className={`admin-nav-item ${active === id ? "active" : ""}`}
    onClick={() => onClick(id)}
  >
    <span className="admin-nav-icon">{icon}</span>
    {label}
    {badge != null && <span className="admin-nav-badge">{badge}</span>}
  </button>
);

// ═══════════════════════════════════════
// VERIFY PAGE
// ═══════════════════════════════════════
const VerifyPage = ({ experts, onUpdate, showToast }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [queueTab, setQueueTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const selected =
    experts.find((e) => (e._id || e.id) === selectedId) || experts[0];

  const getFiltered = () => {
    let list = [...experts];
    if (filterStatus === "pending")
      list = list.filter((e) =>
        ["pending", "review", "info"].includes(e.status),
      );
    else if (filterStatus !== "all")
      list = list.filter((e) => e.status === filterStatus);
    if (queueTab === "new") list = list.filter((e) => e.status === "pending");
    if (queueTab === "info") list = list.filter((e) => e.status === "info");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          (e.fullName || e.name || "").toLowerCase().includes(q) ||
          (e.domain || e.role || "").toLowerCase().includes(q),
      );
    }
    return list;
  };

  const handleApprove = async (id) => {
    await onUpdate(id, "verified");
    const ex = experts.find((e) => (e._id || e.id) === id);
    showToast("✓ " + (ex?.fullName || ex?.name || "Expert") + " verified!");
  };

  const handleReject = async (id) => {
    await onUpdate(id, "rejected");
    const ex = experts.find((e) => (e._id || e.id) === id);
    showToast("✕ " + (ex?.fullName || ex?.name || "Expert") + " rejected.");
  };

  const handleHold = async (id) => {
    await onUpdate(id, "info");
    showToast("⟳ More information requested.");
  };

  const filteredList = getFiltered();
  const pendingCount = experts.filter((e) =>
    ["pending", "review", "info"].includes(e.status),
  ).length;
  const verifiedCount = experts.filter((e) => e.status === "verified").length;

  return (
    <div>
      {/* Stats */}
      <div className="admin-stats-grid">
        <StatCard
          label="Pending review"
          value={pendingCount}
          delta="↑ 3 this week"
          deltaType="up"
          icon="⏳"
          iconBg="rgba(180,83,9,0.09)"
          iconColor="#b45309"
        />
        <StatCard
          label="Verified experts"
          value={verifiedCount}
          delta="Growing steadily"
          deltaType="up"
          icon="✓"
          iconBg="rgba(22,163,74,0.09)"
          iconColor="#16a34a"
        />
        <StatCard
          label="Avg. review time"
          value="1.4d"
          delta="— Stable"
          deltaType="neutral"
          icon="⏱"
          iconBg="rgba(10,125,107,0.09)"
          iconColor="#0a7d6b"
        />
        <StatCard
          label="Rejection rate"
          value="8%"
          delta="↓ 2% vs last month"
          deltaType="up"
          icon="✗"
          iconBg="rgba(220,38,38,0.09)"
          iconColor="#dc2626"
        />
      </div>

      {/* Filter bar */}
      <div className="admin-filter-row">
        <div className="admin-search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name or domain…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="admin-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="pending">Pending review</option>
          <option value="all">All status</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="admin-two-col">
        {/* Left: Queue */}
        <div>
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div className="admin-panel-title">Application Queue</div>
              <div className="admin-tab-group">
                {["all", "new", "info"].map((t) => (
                  <button
                    key={t}
                    className={`admin-tab ${queueTab === t ? "active" : ""}`}
                    onClick={() => setQueueTab(t)}
                  >
                    {t === "all"
                      ? `All (${experts.length})`
                      : t === "new"
                        ? `New (${experts.filter((e) => e.status === "pending").length})`
                        : `Need info (${experts.filter((e) => e.status === "info").length})`}
                  </button>
                ))}
              </div>
            </div>

            {filteredList.length === 0 ? (
              <div className="admin-empty">No experts match this filter.</div>
            ) : (
              filteredList.map((e) => {
                const eid = e._id || e.id;
                const name = e.fullName || e.name || "Unknown";
                const [abg, acol] = avatarColors(name);
                return (
                  <div
                    key={eid}
                    className={`admin-expert-row ${selectedId === eid ? "selected" : ""}`}
                    onClick={() => setSelectedId(eid)}
                  >
                    <div
                      className="admin-exp-avatar"
                      style={{ background: abg, color: acol }}
                    >
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="admin-exp-info">
                      <div className="admin-exp-name">{name}</div>
                      <div className="admin-exp-role">
                        {e.domain || e.role || "—"}
                        {e.experience ? " · " + e.experience : ""}
                      </div>
                    </div>
                    <div className="admin-exp-actions">
                      <span
                        className={`admin-badge ${STATUS_CLASS[e.status] || "badge-pending"}`}
                      >
                        {STATUS_LABEL[e.status] || "Pending"}
                      </span>
                      {e.status !== "verified" && e.status !== "rejected" && (
                        <>
                          <button
                            className="admin-btn admin-btn-approve"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleApprove(eid);
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className="admin-btn admin-btn-reject"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleReject(eid);
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detail + Activity */}
        <div className="admin-right-col">
          {selected &&
            (() => {
              const name = selected.fullName || selected.name || "Unknown";
              const eid = selected._id || selected.id;
              const done =
                selected.status === "verified" ||
                selected.status === "rejected";
              const [abg, acol] = avatarColors(name);
              return (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        className="admin-exp-avatar"
                        style={{
                          width: 38,
                          height: 38,
                          fontSize: 13,
                          borderRadius: 9,
                          background: abg,
                          color: acol,
                        }}
                      >
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="admin-panel-title">{name}</div>
                        <div className="admin-detail-subrole">
                          {selected.domain || selected.role || "—"}
                          {selected.experience
                            ? " · " + selected.experience
                            : ""}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`admin-badge ${STATUS_CLASS[selected.status] || "badge-pending"}`}
                    >
                      {STATUS_LABEL[selected.status] || "Pending"}
                    </span>
                  </div>

                  <div className="admin-detail-body">
                    <div className="admin-detail-section">
                      <div className="admin-detail-label">Profile details</div>
                      <DetailRow label="Email" value={selected.email || "—"} />
                      <DetailRow
                        label="Qualification"
                        value={selected.qualification || "—"}
                      />
                      <DetailRow
                        label="Certifications"
                        value={selected.certifications || "—"}
                      />
                      {selected.linkedIn && (
                        <DetailRow
                          label="LinkedIn"
                          value={
                            <a
                              href={selected.linkedIn}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-link"
                            >
                              View profile ↗
                            </a>
                          }
                        />
                      )}
                      {selected.cv && (
                        <DetailRow
                          label="CV"
                          value={
                            <a
                              href={selected.cv}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-link"
                            >
                              Download CV ↗
                            </a>
                          }
                        />
                      )}
                    </div>

                    <div className="admin-detail-section">
                      <div className="admin-detail-label">
                        Verification checklist
                      </div>
                      <div className="admin-checklist">
                        <CheckItem
                          label="Profile completeness"
                          status={
                            selected.fullName && selected.email ? "ok" : "warn"
                          }
                        />
                        <CheckItem
                          label="Domain / expertise filled"
                          status={selected.domain ? "ok" : "warn"}
                        />
                        <CheckItem
                          label="LinkedIn provided"
                          status={selected.linkedIn ? "ok" : "warn"}
                        />
                        <CheckItem
                          label="CV uploaded"
                          status={selected.cv ? "ok" : "warn"}
                        />
                        <CheckItem
                          label="Experience declared"
                          status={selected.experience ? "ok" : "warn"}
                        />
                        <CheckItem
                          label="Qualification verified"
                          status={selected.qualification ? "ok" : "warn"}
                        />
                      </div>
                    </div>

                    <div className="admin-detail-section">
                      <div className="admin-detail-label">Actions</div>
                      <button
                        className={`admin-big-btn admin-big-btn-approve ${done ? "admin-btn-disabled" : ""}`}
                        onClick={() => handleApprove(eid)}
                      >
                        ✓ Grant Verified Status
                      </button>
                      <button
                        className="admin-big-btn admin-big-btn-hold"
                        onClick={() => handleHold(eid)}
                      >
                        ⟳ Request More Information
                      </button>
                      <button
                        className={`admin-big-btn admin-big-btn-reject ${done ? "admin-btn-disabled" : ""}`}
                        onClick={() => handleReject(eid)}
                      >
                        ✕ Reject Application
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div className="admin-panel-title">Recent Activity</div>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                Live
              </span>
            </div>
            {[
              {
                color: "#16a34a",
                text: (
                  <>
                    <strong>Meera Shah</strong> approved as verified expert
                  </>
                ),
                time: "2h ago",
              },
              {
                color: "#dc2626",
                text: (
                  <>
                    <strong>Kevin Wu</strong> rejected — fraudulent docs
                  </>
                ),
                time: "5h ago",
              },
              {
                color: "#b45309",
                text: (
                  <>
                    <strong>Fatima Al-Hassan</strong> more info requested
                  </>
                ),
                time: "1d ago",
              },
              {
                color: "#0a7d6b",
                text: (
                  <>
                    <strong>Ravi Teja</strong> submitted new application
                  </>
                ),
                time: "1d ago",
              },
              {
                color: "#16a34a",
                text: (
                  <>
                    <strong>Natasha Kim</strong> approved as verified expert
                  </>
                ),
                time: "2d ago",
              },
            ].map((a, i) => (
              <div key={i} className="admin-activity-row">
                <div
                  className="admin-act-dot"
                  style={{ background: a.color }}
                />
                <div className="admin-act-text">{a.text}</div>
                <div className="admin-act-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// OVERVIEW PAGE
// ═══════════════════════════════════════
const OverviewPage = ({ experts }) => {
  const data = [12, 8, 19, 14, 22, 17, 25, 18, 28, 21, 16, 23, 30, 27];
  const max = Math.max(...data);
  const days = [
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
    "S",
  ];
  const cats = [
    { l: "Product Management", pct: 34, color: "#0a7d6b" },
    { l: "Software Engineering", pct: 28, color: "#1d4ed8" },
    { l: "Data Science", pct: 18, color: "#7c3aed" },
    { l: "UX Design", pct: 12, color: "#b45309" },
    { l: "Finance & Consulting", pct: 8, color: "#16a34a" },
  ];

  return (
    <div>
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total users"
          value="4,127"
          delta="↑ 8% this month"
          deltaType="up"
          icon="👥"
          iconBg="rgba(29,78,216,0.09)"
          iconColor="#1d4ed8"
        />
        <StatCard
          label="Active experts"
          value={experts.filter((e) => e.status === "verified").length || 142}
          delta="↑ 12 new"
          deltaType="up"
          icon="⭐"
          iconBg="rgba(10,125,107,0.09)"
          iconColor="#0a7d6b"
        />
        <StatCard
          label="Sessions held"
          value="891"
          delta="↑ 23% vs last month"
          deltaType="up"
          icon="📅"
          iconBg="rgba(124,58,237,0.09)"
          iconColor="#7c3aed"
        />
        <StatCard
          label="Revenue (MRR)"
          value="₹2.4L"
          delta="↑ 18% vs last month"
          deltaType="up"
          icon="₹"
          iconBg="rgba(22,163,74,0.09)"
          iconColor="#16a34a"
        />
      </div>

      <div className="admin-two-col">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">
              Sessions per day — last 14 days
            </div>
            <span style={{ fontSize: 13, color: "#0a7d6b", fontWeight: 600 }}>
              +34% ↑
            </span>
          </div>
          <div style={{ padding: "22px 22px 16px" }}>
            <div className="admin-mini-bar-wrap">
              {data.map((v, i) => (
                <div
                  key={i}
                  className="admin-mini-bar"
                  style={{ height: `${Math.round((v / max) * 100)}%` }}
                  title={`${v} sessions`}
                />
              ))}
            </div>
            <div className="admin-bar-labels">
              {days.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">Top expert categories</div>
          </div>
          <div style={{ padding: "18px 22px" }}>
            {cats.map((c, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    marginBottom: 7,
                  }}
                >
                  <span style={{ color: "#4a5568", fontWeight: 500 }}>
                    {c.l}
                  </span>
                  <span
                    style={{
                      color: c.color,
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    {c.pct}%
                  </span>
                </div>
                <div className="admin-cat-bar-track">
                  <div
                    className="admin-cat-bar-fill"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ALL EXPERTS PAGE
// ═══════════════════════════════════════
const AllExpertsPage = ({ experts }) => (
  <div className="admin-panel">
    <div className="admin-panel-header">
      <div className="admin-panel-title">All Expert Profiles</div>
      <span className="admin-badge badge-review">{experts.length} total</span>
    </div>
    <table className="admin-log-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Domain</th>
          <th>Qualification</th>
          <th>Experience</th>
          <th>LinkedIn</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {experts.length === 0 && (
          <tr>
            <td
              colSpan={6}
              style={{ textAlign: "center", padding: 36, color: "#94a3b8" }}
            >
              No experts found.
            </td>
          </tr>
        )}
        {experts.map((e, i) => {
          const name = e.fullName || e.name || "Unknown";
          const [abg, acol] = avatarColors(name);
          return (
            <tr key={e._id || e.id || i}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="admin-exp-avatar"
                    style={{
                      width: 32,
                      height: 32,
                      fontSize: 11,
                      borderRadius: 7,
                      flexShrink: 0,
                      background: abg,
                      color: acol,
                    }}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <strong style={{ color: "#0f1923", fontWeight: 600 }}>
                    {name}
                  </strong>
                </div>
              </td>
              <td>{e.domain || "—"}</td>
              <td>{e.qualification || "—"}</td>
              <td>{e.experience || "—"}</td>
              <td>
                {e.linkedIn ? (
                  <a
                    href={e.linkedIn}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-link"
                  >
                    View ↗
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td>
                <span
                  className={`admin-badge ${STATUS_CLASS[e.status] || "badge-pending"}`}
                >
                  {STATUS_LABEL[e.status] || "Pending"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ═══════════════════════════════════════
// AUTH LOGS PAGE
// ═══════════════════════════════════════
const AuthLogsPage = () => {
  const logs = [
    {
      user: "priya@gmail.com",
      event: "Login",
      ip: "103.21.44.1",
      loc: "Mumbai, IN",
      dev: "Chrome / macOS",
      time: "10:42 AM",
      status: "success",
    },
    {
      user: "arjun.k@gmail.com",
      event: "Login",
      ip: "49.36.78.12",
      loc: "Bangalore, IN",
      dev: "Safari / iOS",
      time: "10:38 AM",
      status: "success",
    },
    {
      user: "unknown@temp.io",
      event: "Login attempt",
      ip: "185.56.23.1",
      loc: "Unknown",
      dev: "Bot / headless",
      time: "10:31 AM",
      status: "fail",
    },
    {
      user: "sara.m@live.com",
      event: "Pwd reset",
      ip: "72.14.199.3",
      loc: "Seattle, US",
      dev: "Firefox / Win",
      time: "09:57 AM",
      status: "warn",
    },
    {
      user: "admin@careertalk.io",
      event: "Login",
      ip: "10.0.0.1",
      loc: "Internal",
      dev: "Chrome / macOS",
      time: "09:15 AM",
      status: "success",
    },
    {
      user: "rohan.n@gmail.com",
      event: "Login",
      ip: "152.58.44.9",
      loc: "Delhi, IN",
      dev: "Chrome / Android",
      time: "08:50 AM",
      status: "success",
    },
    {
      user: "bot_crawler",
      event: "Login attempt",
      ip: "91.108.56.1",
      loc: "Russia",
      dev: "Unknown",
      time: "08:23 AM",
      status: "fail",
    },
  ];
  const tagMap = {
    success: ["log-success", "Success"],
    fail: ["log-fail", "Blocked"],
    warn: ["log-warn", "2FA req"],
  };

  return (
    <div>
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Logins today"
          value="284"
          delta="↑ 12% vs yesterday"
          deltaType="up"
          icon="🔑"
          iconBg="rgba(10,125,107,0.09)"
          iconColor="#0a7d6b"
        />
        <StatCard
          label="Failed attempts"
          value="7"
          delta="↑ 3 flagged"
          deltaType="down"
          icon="⚠"
          iconBg="rgba(220,38,38,0.09)"
          iconColor="#dc2626"
        />
        <StatCard
          label="Active sessions"
          value="91"
          delta="— 14 countries"
          deltaType="neutral"
          icon="🌐"
          iconBg="rgba(29,78,216,0.09)"
          iconColor="#1d4ed8"
        />
        <StatCard
          label="2FA enabled"
          value="67%"
          delta="↑ 5% this month"
          deltaType="up"
          icon="🛡"
          iconBg="rgba(22,163,74,0.09)"
          iconColor="#16a34a"
        />
      </div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">Authentication Log</div>
          <select className="admin-filter-select" style={{ fontSize: 13 }}>
            <option>All events</option>
            <option>Failed only</option>
            <option>Suspicious</option>
          </select>
        </div>
        <table className="admin-log-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Event</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Device</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td style={{ color: "#0f1923", fontWeight: 500 }}>{l.user}</td>
                <td>{l.event}</td>
                <td className="admin-mono-text">{l.ip}</td>
                <td>{l.loc}</td>
                <td>{l.dev}</td>
                <td className="admin-mono-text">{l.time}</td>
                <td>
                  <span className={`admin-log-tag ${tagMap[l.status][0]}`}>
                    {tagMap[l.status][1]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ROLES PAGE
// ═══════════════════════════════════════
const RolesPage = () => {
  const roles = [
    {
      title: "Super Admin",
      desc: "Full unrestricted access",
      count: "2 users",
      perms: [
        "Verify experts",
        "Manage roles",
        "Auth logs",
        "Delete users",
        "Settings",
        "Billing",
        "API keys",
      ],
      active: [true, true, true, true, true, true, true],
    },
    {
      title: "Moderator",
      desc: "Can verify and moderate experts",
      count: "8 users",
      perms: [
        "Verify experts",
        "Auth logs (read)",
        "View all experts",
        "Manage roles",
        "Delete users",
      ],
      active: [true, true, true, false, false],
    },
    {
      title: "Expert",
      desc: "Verified career experts on the platform",
      count: "142 users",
      perms: [
        "Create sessions",
        "Manage profile",
        "Accept bookings",
        "Admin access",
      ],
      active: [true, true, true, false],
    },
    {
      title: "User",
      desc: "Default role for job seekers",
      count: "3,841 users",
      perms: [
        "Book sessions",
        "View experts",
        "Manage own profile",
        "Admin access",
      ],
      active: [true, true, true, false],
    },
  ];
  return (
    <div>
      {roles.map((r, i) => (
        <div key={i} className="admin-role-card">
          <div className="admin-role-header">
            <div>
              <div className="admin-role-title">{r.title}</div>
              <div className="admin-role-desc">{r.desc}</div>
            </div>
            <span className="admin-role-count">{r.count}</span>
          </div>
          <div className="admin-perms-grid">
            {r.perms.map((p, j) => (
              <span
                key={j}
                className={`admin-perm-chip ${r.active[j] ? "on" : ""}`}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════
const SettingsPage = ({ showToast }) => {
  const groups = [
    {
      title: "Verification Settings",
      rows: [
        {
          key: "Require government ID",
          desc: "Experts must upload a valid government-issued ID",
          on: true,
        },
        {
          key: "LinkedIn profile mandatory",
          desc: "Require a LinkedIn URL during expert application",
          on: true,
        },
        {
          key: "Employment letter required",
          desc: "Require an employer letter for verification",
          on: false,
        },
        {
          key: "Auto-reject after 30 days",
          desc: "Automatically reject applications older than 30 days",
          on: false,
        },
      ],
    },
    {
      title: "Authentication Settings",
      rows: [
        {
          key: "Enforce 2FA for admins",
          desc: "All admin accounts must enable two-factor authentication",
          on: true,
        },
        {
          key: "Session timeout (idle)",
          desc: "Auto-logout inactive sessions after 30 minutes",
          on: true,
        },
        {
          key: "Block suspicious IPs",
          desc: "Automatically block IPs with repeated failed logins",
          on: true,
        },
      ],
    },
    {
      title: "Notifications",
      rows: [
        {
          key: "Email on new application",
          desc: "Notify admins when a new expert applies",
          on: true,
        },
        {
          key: "Alert on blocked login",
          desc: "Send alert email when a login is blocked",
          on: false,
        },
        {
          key: "Weekly summary report",
          desc: "Send weekly digest of activity to admin email",
          on: true,
        },
      ],
    },
  ];
  return (
    <div>
      {groups.map((g, gi) => (
        <div key={gi} className="admin-panel" style={{ marginBottom: 16 }}>
          <div className="admin-panel-header">
            <div className="admin-panel-title">{g.title}</div>
          </div>
          {g.rows.map((r, ri) => (
            <SettingsToggleRow
              key={ri}
              label={r.key}
              desc={r.desc}
              initial={r.on}
              onToggle={() => showToast("Setting updated.")}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════
// SMALL REUSABLE COMPONENTS
// ═══════════════════════════════════════
const StatCard = ({
  label,
  value,
  delta,
  deltaType,
  icon,
  iconBg,
  iconColor,
}) => (
  <div className="admin-stat-card">
    {icon && (
      <div className="admin-stat-icon" style={{ background: iconBg }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
    )}
    <div className="admin-stat-label">{label}</div>
    <div className="admin-stat-value">{value}</div>
    <div className={`admin-stat-delta admin-delta-${deltaType}`}>{delta}</div>
  </div>
);

const CheckItem = ({ label, status }) => (
  <div className="admin-check-row">
    <div
      className={`admin-check-dot ${status === "ok" ? "dot-ok" : status === "warn" ? "dot-warn" : "dot-fail"}`}
    >
      {status === "ok" ? "✓" : status === "warn" ? "!" : "✕"}
    </div>
    {label}
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="admin-detail-row">
    <span className="admin-detail-row-label">{label}</span>
    <span className="admin-detail-row-value">{value}</span>
  </div>
);

const SettingsToggleRow = ({ label, desc, initial, onToggle }) => {
  const [on, setOn] = useState(initial);
  return (
    <div className="admin-settings-row">
      <div>
        <div className="admin-settings-key">{label}</div>
        <div className="admin-settings-desc">{desc}</div>
      </div>
      <button
        className={`admin-toggle ${on ? "on" : "off"}`}
        onClick={() => {
          setOn((v) => !v);
          onToggle();
        }}
      />
    </div>
  );
};

// ═══════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════
const OverviewIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
    <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
    <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
  </svg>
);
const VerifyIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M2 13c0-2.5 2-4 5-4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M10 10l1.5 1.5L14 9"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ExpertsIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <circle cx="5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="11" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M1 13c0-2 1.5-3 4-3M8 13c0-2 1.5-3 3-3s3 1 3 3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
const AuthIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <path
      d="M8 1.5L2.5 3.5V8c0 3 2.5 5.5 5.5 6 3-.5 5.5-3 5.5-6V3.5L8 1.5z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M5.5 8l1.5 1.5L10 7"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const RolesIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <rect
      x="2"
      y="5"
      width="12"
      height="9"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M5 5V3.5a3 3 0 0 1 6 0V5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="8" cy="10" r="1.5" fill="currentColor" />
  </svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M3.1 12.9l1.1-1.1M11.8 4.2l1.1-1.1"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1.5a5 5 0 0 1 5 5v3l1 2H2l1-2v-3a5 5 0 0 1 5-5z"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M6.5 12.5a1.5 1.5 0 0 0 3 0"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="6.5" cy="6.5" r="4" stroke="#94a3b8" strokeWidth="1.5" />
    <path
      d="M11 11l3.5 3.5"
      stroke="#94a3b8"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
