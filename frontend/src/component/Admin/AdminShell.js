import React, { useState } from "react";
import { Link, NavLink, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/actions/authAction";
import swal from "sweetalert";
import i from "../../images/Logo.png";

const AdminShell = ({ children, pageTitle }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { auth } = useSelector((state) => state);
  const [collapsed, setCollapsed] = useState(false);

  const adminName =
    auth?.token?.name ||
    auth?.data?.user?.name ||
    "Admin";

  const handleLogout = () => {
    swal({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      buttons: ["Cancel", "Logout"],
      dangerMode: true,
    }).then((confirmed) => {
      if (confirmed) {
        dispatch(logout());
        history.push("/admin/login");
      }
    });
  };

  const navItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      path: "/admin/properties",
      label: "Properties",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: "/admin/blockchaindata",
      label: "Blockchain Data",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
    },
    {
      path: "/admin/requestFund",
      label: "Fund Requests",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
  ];

  const sidebarW = collapsed ? 68 : 236;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fa", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: sidebarW,
          minWidth: sidebarW,
          background: "linear-gradient(180deg,#1a2035 0%,#0d1117 100%)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 200,
          boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
          transition: "width 0.22s ease, min-width 0.22s ease",
          overflow: "hidden",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 16px" : "0 20px",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <img src={i} alt="Treasury" style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 1, whiteSpace: "nowrap" }}>
              TREASURY
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto", overflowX: "hidden" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "11px 22px" : "11px 20px",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: 500,
                borderLeft: "3px solid transparent",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
              }}
              activeStyle={{
                color: "#c9a84c",
                background: "rgba(201,168,76,0.12)",
                borderLeft: "3px solid #c9a84c",
              }}
            >
              <span style={{ flexShrink: 0, opacity: 0.85 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            background: "none",
            border: "none",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.35)",
            padding: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-end",
            flexShrink: 0,
          }}
        >
          <svg
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.22s" }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </aside>

      {/* ── Main area ── */}
      <div
        style={{
          marginLeft: sidebarW,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.22s ease",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <header
          style={{
            height: 64,
            background: "#fff",
            borderBottom: "1px solid #e8eaf0",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            flexShrink: 0,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>
              {pageTitle || "Admin Panel"}
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Treasury Admin Zone</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              to="/"
              target="_blank"
              style={{
                fontSize: 12,
                color: "#6b7280",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                transition: "all 0.18s",
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Site
            </Link>

            <div style={{ width: 1, height: 28, background: "#e5e7eb" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#c9a84c,#7a5c10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{adminName}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Administrator</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                color: "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
