import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loading } from "../../redux/actions/authAction";
import { postDataAPI } from "../../utils/API";
import AdminShell from "./AdminShell";

const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden" };
const TH = { padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const TD = { padding: "14px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };

const BlockchainData = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const getBlockchainData = async () => {
    dispatch(loading(true));
    const res = await postDataAPI("/cronJobFetchRecord");
    if (res.data && res.data.data) {
      setData(res.data.data);
      setSearchDate(dateFilter || new Date().toISOString().split("T")[0]);
    }
    dispatch(loading(false));
  };

  useEffect(() => { getBlockchainData(); }, []);

  const filterByDate = async () => {
    if (!dateFilter) return;
    dispatch(loading(true));
    const parts = dateFilter.split("-");
    const date = parseInt(parts[2] + parseInt(parts[1]) + parts[0]);
    await postDataAPI("/cronJobSearchRecord", { date });
    getBlockchainData();
  };

  return (
    <AdminShell pageTitle="Blockchain Data">
      {/* Filter bar */}
      <div style={{ ...card, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13.5, color: "#111827", background: "#f9fafb", outline: "none", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", paddingTop: 22 }}>
          <button onClick={filterByDate} style={{ background: "#1a2035", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
          </button>
          <button onClick={getBlockchainData} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>On-Chain Transactions</h2>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{data.length} records{searchDate ? ` · ${searchDate}` : ""}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "Wallet Address", "Property", "Amount", "Date"].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5} style={{ ...TD, textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <svg width="32" height="32" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                    <span>No blockchain records found</span>
                  </div>
                </td></tr>
              ) : data.map((d, i) => (
                <tr key={i}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.15s" }}
                >
                  <td style={{ ...TD, color: "#9ca3af", width: 40 }}>{i + 1}</td>
                  <td style={TD}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f3f4f6", padding: "3px 8px", borderRadius: 5, color: "#374151" }}>
                      {d[0] ? `${d[0].slice(0, 8)}…${d[0].slice(-6)}` : "—"}
                    </span>
                  </td>
                  <td style={{ ...TD, fontWeight: 600, color: "#111827" }}>{d[2] || "—"}</td>
                  <td style={TD}>
                    <span style={{ fontWeight: 600, color: "#c9a84c" }}>
                      {d[3] ? Number(d[3].hex).toLocaleString() : "—"}
                    </span>
                  </td>
                  <td style={{ ...TD, color: "#6b7280" }}>{searchDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
};

export default BlockchainData;
