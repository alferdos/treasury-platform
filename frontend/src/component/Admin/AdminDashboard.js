import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getDataAPI } from "../../utils/API";
import { Link } from "react-router-dom";
import AdminShell from "./AdminShell";

const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" };

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getDataAPI("/get_user?role=0").then((r) => { if (r.data) setUsers(r.data); });
    getDataAPI("/get_property").then((r) => { if (r.data) setProperties(Array.isArray(r.data) ? r.data : r.data.data || []); });
    getDataAPI("/getRequestFund").then((r) => { if (r.data) setRequests(r.data); });
  }, []);

  const stats = [
    { label: "Total Users", value: users.length, color: "#c9a84c", icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    )},
    { label: "Properties", value: properties.length, color: "#1a2035", icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    )},
    { label: "Active Properties", value: properties.filter((p) => p.status).length, color: "#16a34a", icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    )},
    { label: "Pending Requests", value: requests.filter((r) => !r.isApproved).length, color: "#d97706", icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    )},
  ];

  const quickActions = [
    { label: "List New Property", to: "/admin/createproperty", color: "#1a2035", icon: "🏗️" },
    { label: "Manage Users", to: "/admin/users", color: "#c9a84c", icon: "👥" },
    { label: "Fund Requests", to: "/admin/requestFund", color: "#16a34a", icon: "💰" },
    { label: "Blockchain Data", to: "/admin/blockchaindata", color: "#6366f1", icon: "⛓️" },
  ];

  return (
    <AdminShell pageTitle="Dashboard">
      {/* Welcome banner */}
      <div style={{ background: "linear-gradient(135deg,#1a2035 0%,#2d3a5c 100%)", borderRadius: 14, padding: "28px 32px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>Welcome back, Admin</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>Treasury Real Estate Tokenization Platform</p>
        </div>
        <Link to="/admin/createproperty" style={{ background: "#c9a84c", color: "#fff", borderRadius: 9, padding: "10px 22px", fontSize: 13.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          List Property
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...card, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ ...card, padding: "22px 24px" }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#111827" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} style={{ background: `${a.color}0f`, border: `1px solid ${a.color}22`, borderRadius: 10, padding: "16px 18px", textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "all 0.18s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${a.color}1a`; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${a.color}0f`; e.currentTarget.style.transform = "none"; }}
            >
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
