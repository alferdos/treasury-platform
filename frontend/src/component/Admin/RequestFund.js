import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loading } from "../../redux/actions/authAction";
import { getDataAPI, postDataAPI } from "../../utils/API";
import swal from "sweetalert";
import AdminShell from "./AdminShell";

const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden" };
const TH = { padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const TD = { padding: "14px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };

const RequestFund = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);

  const getRequestFund = async () => {
    const res = await getDataAPI("/getRequestFund");
    if (res.data) setData(res.data);
  };

  useEffect(() => { getRequestFund(); }, []);

  const approveRequest = (requestId) => {
    swal({ title: "Approve Request", text: "Approve this fund request?", icon: "warning", buttons: ["Cancel", "Approve"], dangerMode: false })
      .then((ok) => {
        if (ok) {
          dispatch(loading(true));
          postDataAPI("approveRequest", { requestId }).then(() => {
            dispatch(loading(false));
            getRequestFund();
          });
        }
      });
  };

  const pending = data.filter((r) => !r.isApproved);
  const approved = data.filter((r) => r.isApproved);

  return (
    <AdminShell pageTitle="Fund Requests">
      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Requests", value: data.length, color: "#1a2035" },
          { label: "Pending", value: pending.length, color: "#d97706" },
          { label: "Approved", value: approved.length, color: "#16a34a" },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: "18px 24px", minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ margin: "6px 0 0", fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>All Fund Requests</h2>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{data.length} records</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "User", "Amount (SAR)", "Invoice", "Status", "Action"].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <svg width="32" height="32" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span>No fund requests found</span>
                  </div>
                </td></tr>
              ) : data.map((req, i) => (
                <tr key={req._id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.15s" }}
                >
                  <td style={{ ...TD, color: "#9ca3af", width: 40 }}>{i + 1}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#7a5c10)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {req.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{req.userId?.name}</span>
                    </div>
                  </td>
                  <td style={TD}>
                    <span style={{ fontWeight: 700, color: "#c9a84c", fontSize: 15 }}>﷼ {Number(req.amount).toLocaleString()}</span>
                  </td>
                  <td style={TD}>
                    <a href={`/invoice/${req.invoice}`} target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#6366f1", textDecoration: "none", background: "rgba(99,102,241,0.08)", padding: "5px 12px", borderRadius: 6 }}>
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      View Invoice
                    </a>
                  </td>
                  <td style={TD}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: req.isApproved ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.1)", color: req.isApproved ? "#15803d" : "#b45309" }}>
                      {req.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td style={TD}>
                    {!req.isApproved && (
                      <button onClick={() => approveRequest(req._id)} style={{ border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#16a34a", color: "#fff", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
};

export default RequestFund;
