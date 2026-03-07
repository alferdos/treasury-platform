import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loading } from "../../redux/actions/authAction";
import { getDataAPI, postDataAPI } from "../../utils/API";
import { VIEW_CONTRACT } from "../../utils/config";
import swal from "sweetalert";
import AdminShell from "./AdminShell";

/* ── design tokens ── */
const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden" };
const TH = { padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const TD = { padding: "14px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };
const pill = (c) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c === "gold" ? "rgba(201,168,76,0.12)" : "rgba(107,114,128,0.1)", color: c === "gold" ? "#92700a" : "#6b7280" });
const Btn = ({ variant = "default", onClick, children, type = "button", full }) => {
  const styles = {
    primary: { background: "#1a2035", color: "#fff" },
    success: { background: "#16a34a", color: "#fff" },
    danger: { background: "#fee2e2", color: "#dc2626" },
    default: { background: "#f3f4f6", color: "#374151" },
  };
  return (
    <button type={type} onClick={onClick} style={{ border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, width: full ? "100%" : "auto", justifyContent: full ? "center" : "flex-start", ...styles[variant] }}>
      {children}
    </button>
  );
};
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 440, padding: "28px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", position: "relative" };
const inputS = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13.5, color: "#111827", background: "#f9fafb", outline: "none", boxSizing: "border-box", marginTop: 6 };
const LBL = ({ children }) => <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block" }}>{children}</label>;

const Users = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [properties, setProperties] = useState([]);

  // Send Units
  const [sendOpen, setSendOpen] = useState(false);
  const [sendUserId, setSendUserId] = useState("");
  const [sendPropertyId, setSendPropertyId] = useState("");
  const [sendUnits, setSendUnits] = useState("");
  const [sendTxHash, setSendTxHash] = useState("");
  const [sendError, setSendError] = useState("");

  // Add Funds
  const [fundsOpen, setFundsOpen] = useState(false);
  const [fundsUserId, setFundsUserId] = useState("");
  const [fundsUserName, setFundsUserName] = useState("");
  const [fundsAmount, setFundsAmount] = useState("");
  const [fundsError, setFundsError] = useState("");
  const [fundsSuccess, setFundsSuccess] = useState("");

  const loadUsers = async () => {
    const res = await getDataAPI("/get_user?role=0");
    if (res.data) setData(res.data);
  };
  const loadProperties = async () => {
    const res = await getDataAPI("/get_property?status=1");
    if (res.data && res.data.data) setProperties(res.data.data);
    else if (Array.isArray(res.data)) setProperties(res.data);
  };

  useEffect(() => { loadUsers(); loadProperties(); }, []);

  /* Send Units */
  const openSend = (id) => { setSendUserId(id); setSendPropertyId(""); setSendUnits(""); setSendTxHash(""); setSendError(""); setSendOpen(true); };
  const sendSubmit = (e) => {
    e.preventDefault();
    dispatch(loading(true));
    postDataAPI("sendTokenByAdmin", { units: sendUnits, propertyId: sendPropertyId, userId: sendUserId })
      .then((res) => {
        dispatch(loading(false));
        if (res.data.status === 1) setSendTxHash(res.data.tx.hash);
        else setSendError(res.data.errors?.message || "Failed");
      })
      .catch(() => { dispatch(loading(false)); setSendError("Something went wrong"); });
  };

  /* Add Funds */
  const openFunds = (id, name) => { setFundsUserId(id); setFundsUserName(name); setFundsAmount(""); setFundsError(""); setFundsSuccess(""); setFundsOpen(true); };
  const fundsSubmit = (e) => {
    e.preventDefault();
    if (!fundsAmount || isNaN(fundsAmount) || Number(fundsAmount) <= 0) { setFundsError("Enter a valid amount greater than 0"); return; }
    dispatch(loading(true));
    postDataAPI("addFunds", { userId: fundsUserId, amount: Number(fundsAmount) })
      .then((res) => {
        dispatch(loading(false));
        if (res.data.status === 1) { setFundsSuccess(res.data.message || `﷼${Number(fundsAmount).toLocaleString()} added successfully`); setFundsAmount(""); }
        else setFundsError(res.data.errors?.message || "Failed to add funds");
      })
      .catch(() => { dispatch(loading(false)); setFundsError("Something went wrong"); });
  };

  /* Delete */
  const deleteUser = (id) => {
    swal({ title: "Delete User", text: "This cannot be undone.", icon: "warning", buttons: ["Cancel", "Delete"], dangerMode: true })
      .then((ok) => { if (ok) postDataAPI("/delete_user", { user_id: id }).then(loadUsers); });
  };

  return (
    <AdminShell pageTitle="User Management">
      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Users", value: data.length, color: "#c9a84c" },
          { label: "Admins", value: data.filter((u) => u.role === 1).length, color: "#1a2035" },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: "18px 24px", minWidth: 150 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ margin: "6px 0 0", fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>All Users</h2>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{data.length} records</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "User", "Email", "Phone", "Role", "Actions"].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: "center", padding: 40, color: "#9ca3af" }}>No users found</td></tr>
              ) : data.map((user, i) => (
                <tr key={user._id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.15s" }}
                >
                  <td style={{ ...TD, color: "#9ca3af", width: 40 }}>{i + 1}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#7a5c10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0, overflow: "hidden" }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={TD}>{user.email}</td>
                  <td style={TD}>{user.phone_no || "—"}</td>
                  <td style={TD}><span style={pill("gold")}>{user.role === 1 ? "Admin" : "User"}</span></td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Btn variant="default" onClick={() => openSend(user._id)}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Send Units
                      </Btn>
                      <Btn variant="success" onClick={() => openFunds(user._id, user.name)}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Add Funds
                      </Btn>
                      <Btn variant="danger" onClick={() => deleteUser(user._id)}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Send Units Modal ── */}
      {sendOpen && (
        <div style={overlay} onClick={() => setSendOpen(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSendOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 22, lineHeight: 1 }}>×</button>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>Send Units</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#9ca3af" }}>Assign property tokens to a user</p>
            {sendTxHash ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#15803d" }}>
                ✓ Units sent!{" "}
                <a href={`${VIEW_CONTRACT}tx/${sendTxHash}`} target="_blank" rel="noreferrer" style={{ color: "#15803d", fontWeight: 600 }}>View transaction →</a>
              </div>
            ) : (
              <form onSubmit={sendSubmit}>
                {sendError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{sendError}</div>}
                <div style={{ marginBottom: 14 }}>
                  <LBL>Select Property</LBL>
                  <select style={inputS} value={sendPropertyId} onChange={(e) => setSendPropertyId(e.target.value)} required>
                    <option value="">— Choose a property —</option>
                    {properties.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <LBL>Number of Units</LBL>
                  <input style={inputS} type="number" min="1" placeholder="e.g. 100" value={sendUnits} onChange={(e) => setSendUnits(e.target.value)} required />
                </div>
                <Btn type="submit" variant="primary" full>Send Units</Btn>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Add Funds Modal ── */}
      {fundsOpen && (
        <div style={overlay} onClick={() => setFundsOpen(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setFundsOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 22, lineHeight: 1 }}>×</button>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>Add Funds</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#9ca3af" }}>Credit SAR balance to user account</p>
            {fundsSuccess ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#15803d" }}>✓ {fundsSuccess}</div>
            ) : (
              <form onSubmit={fundsSubmit}>
                {fundsError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{fundsError}</div>}
                <div style={{ marginBottom: 14 }}>
                  <LBL>User</LBL>
                  <input style={{ ...inputS, background: "#f3f4f6", color: "#6b7280" }} value={fundsUserName} readOnly />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <LBL>Amount (SAR ﷼)</LBL>
                  <input style={inputS} type="number" min="1" step="0.01" placeholder="e.g. 5000" value={fundsAmount} onChange={(e) => setFundsAmount(e.target.value)} required />
                </div>
                <Btn type="submit" variant="success" full>Add Funds</Btn>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default Users;
