import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminShell from "./AdminShell";
// No external chart library — using inline SVG

const API = process.env.REACT_APP_API_URL || "";
const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" };
const formatSAR = (val) => `﷼ ${(val || 0).toLocaleString("en-SA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/getAdminAnalytics`)
      .then(res => { if (res.data.status === 1) setAnalytics(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { label: "Total Funds in Wallets", value: formatSAR(analytics.totalFunds), color: "#c9a84c", icon: "💰" },
    { label: "Total Users", value: analytics.totalUsers, color: "#3b82f6", icon: "👥" },
    { label: "Total Properties", value: analytics.totalProperties, color: "#0e3725", icon: "🏢" },
    { label: "Transaction Volume", value: formatSAR(analytics.totalTransactionValue), color: "#8b5cf6", icon: "📊" },
  ] : [];

  const feeCards = analytics ? [
    { label: "Listing Fees", rate: "2%", value: formatSAR(analytics.listingFees), desc: "2% of listed property value", color: "#c9a84c" },
    { label: "Subscription Fees", rate: "1%", value: formatSAR(analytics.subscriptionFees), desc: "1% on each subscription buy", color: "#10b981" },
    { label: "Exchange Fees", rate: "0.5%", value: formatSAR(analytics.exchangeFees), desc: "0.25% from each party per trade", color: "#3b82f6" },
    { label: "Total Revenue", rate: "", value: formatSAR((analytics.listingFees || 0) + (analytics.subscriptionFees || 0) + (analytics.exchangeFees || 0)), desc: "Combined platform fees", color: "#0e3725" },
  ] : [];

  const quickActions = [
    { label: "List New Property", to: "/admin/createproperty", color: "#1a2035", icon: "🏗️" },
    { label: "Manage Users", to: "/admin/users", color: "#c9a84c", icon: "👥" },
    { label: "Fund Requests", to: "/admin/requestFund", color: "#16a34a", icon: "💰" },
    { label: "Blockchain Data", to: "/admin/blockchaindata", color: "#6366f1", icon: "⛓️" },
  ];

  return (
    <AdminShell pageTitle="Dashboard">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .fee-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); border-left: 4px solid; }
        .tx-table { width: 100%; border-collapse: collapse; }
        .tx-table th { background: #f9fafb; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
        .tx-table td { padding: 12px 14px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
        .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .badge-buy { background: #d1fae5; color: #065f46; }
        .badge-sell { background: #fee2e2; color: #991b1b; }
      `}</style>

      {/* Welcome Banner */}
      <div style={{ background: "linear-gradient(135deg,#1a2035 0%,#0e3725 100%)", borderRadius: 14, padding: "28px 32px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>Welcome back, Admin</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>Treasury Real Estate Tokenization Platform</p>
        </div>
        <Link to="/admin/createproperty" style={{ background: "#c9a84c", color: "#fff", borderRadius: 9, padding: "10px 22px", fontSize: 13.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          + List Property
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ ...card, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Transaction Volume Chart */}
          <div style={{ ...card, padding: "24px", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Transaction Activity (Last 30 Days)</h3>
            {analytics && analytics.txByDate && analytics.txByDate.length > 0 ? (
              (() => {
                const pts = analytics.txByDate;
                const maxVal = Math.max(...pts.map(p => p.value || 0), 1);
                const W = 800, H = 180, PAD = 10;
                const xs = pts.map((_, i) => PAD + (i / Math.max(pts.length - 1, 1)) * (W - PAD * 2));
                const ys = pts.map(p => H - PAD - ((p.value || 0) / maxVal) * (H - PAD * 2));
                const lineD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
                const areaD = lineD + ` L${xs[xs.length-1]},${H-PAD} L${PAD},${H-PAD} Z`;
                return (
                  <div style={{ overflowX: 'auto' }}>
                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200 }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                        <line key={i} x1={PAD} y1={PAD + t * (H - PAD * 2)} x2={W - PAD} y2={PAD + t * (H - PAD * 2)} stroke="#f3f4f6" strokeWidth="1" />
                      ))}
                      <path d={areaD} fill="url(#chartGrad)" />
                      <path d={lineD} fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {xs.map((x, i) => (
                        <circle key={i} cx={x} cy={ys[i]} r="3" fill="#c9a84c" />
                      ))}
                      {pts.filter((_, i) => i % Math.ceil(pts.length / 6) === 0).map((p, i, arr) => {
                        const origIdx = pts.indexOf(p);
                        return <text key={i} x={xs[origIdx]} y={H - 2} textAnchor="middle" fontSize="9" fill="#9ca3af">{new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</text>;
                      })}
                    </svg>
                  </div>
                );
              })()
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📈</div>
                <p style={{ margin: 0 }}>No transaction data yet. Activity will appear here once users start trading.</p>
              </div>
            )}
          </div>

          {/* Fee Breakdown */}
          <div style={{ ...card, padding: "24px", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Platform Revenue & Fees</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
              {feeCards.map((f, i) => (
                <div key={i} className="fee-card" style={{ borderLeftColor: f.color }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{f.label}</span>
                    {f.rate && <span style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.rate}</span>}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: f.color, marginBottom: 4 }}>{f.value}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ ...card, padding: "22px 24px", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#111827" }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
              {quickActions.map((a) => (
                <Link key={a.to} to={a.to} style={{ background: `${a.color}0f`, border: `1px solid ${a.color}22`, borderRadius: 10, padding: "16px 18px", textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ ...card, padding: "24px" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#111827" }}>Recent Transactions</h3>
            {analytics?.recentTransactions?.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Property</th>
                      <th>Action</th>
                      <th>Units</th>
                      <th>Amount</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentTransactions.map((t, i) => (
                      <tr key={i}>
                        <td style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString("en-SA", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td style={{ fontWeight: 500 }}>{t.propertyId?.title || "Unknown"}</td>
                        <td><span className={`badge badge-${t.action}`}>{t.action?.toUpperCase()}</span></td>
                        <td style={{ fontWeight: 600 }}>{(t.units || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 600, color: t.action === "buy" ? "#ef4444" : "#10b981" }}>
                          {t.action === "buy" ? "-" : "+"}{formatSAR(t.price)}
                        </td>
                        <td><span style={{ fontSize: 12, color: "#6b7280" }}>{t.isSubscription ? "Subscription" : "Exchange"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <p style={{ margin: 0 }}>No transactions yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
};

export default AdminDashboard;
