import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getDataAPI, postDataAPI } from "../../utils/API";
import swal from "sweetalert";
import { blankProperty } from "../../redux/actions/propertyAction";
import { Link } from "react-router-dom";
import AdminShell from "./AdminShell";

const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden" };
const TH = { padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const TD = { padding: "14px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };

const AdminProperties = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);

  useEffect(() => { dispatch(blankProperty()); }, [dispatch]);

  const getProperty = async () => {
    const res = await getDataAPI("/get_property");
    if (res.data) setData(Array.isArray(res.data) ? res.data : res.data.data || []);
  };
  useEffect(() => { getProperty(); }, []);

  const deleteProperty = (id) => {
    swal({ title: "Delete Property", text: "This cannot be undone.", icon: "warning", buttons: ["Cancel", "Delete"], dangerMode: true })
      .then((ok) => { if (ok) postDataAPI("/delete_property", { property_id: id }).then(getProperty); });
  };

  const statusPill = (s) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: s ? "rgba(22,163,74,0.1)" : "rgba(107,114,128,0.1)",
    color: s ? "#15803d" : "#6b7280",
  });

  return (
    <AdminShell pageTitle="Properties">
      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Properties", value: data.length, color: "#c9a84c" },
          { label: "Active", value: data.filter((p) => p.status).length, color: "#16a34a" },
          { label: "Inactive", value: data.filter((p) => !p.status).length, color: "#6b7280" },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: "18px 24px", minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ margin: "6px 0 0", fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Link to="/admin/createproperty" style={{ background: "#1a2035", color: "#fff", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          List Property
        </Link>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>All Properties</h2>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{data.length} records</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#", "Property", "Address", "Est. Value (SAR)", "Status", "Actions"].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} style={{ ...TD, textAlign: "center", padding: 40, color: "#9ca3af" }}>No properties found</td></tr>
              ) : data.map((p, i) => (
                <tr key={p._id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.15s" }}
                >
                  <td style={{ ...TD, color: "#9ca3af", width: 40 }}>{i + 1}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 48, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
                        <img
                          src={(p.imageName && p.imageName.length > 0) ? p.imageName[0] : "/img/al_narjes.jpg"}
                          alt={p.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.src = "/img/al_narjes.jpg"; }}
                        />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: 13.5 }}>{p.title}</p>
                        {p.contract_address && (
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>
                            {p.contract_address.slice(0, 10)}…{p.contract_address.slice(-6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ ...TD, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.address}</td>
                  <td style={TD}>{p.propertyEstimatedValue ? `﷼ ${Number(p.propertyEstimatedValue).toLocaleString()}` : "—"}</td>
                  <td style={TD}><span style={statusPill(p.status)}>{p.status ? "Active" : "Inactive"}</span></td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link to={`/admin/property/${p._id}`} style={{ border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#f3f4f6", color: "#374151", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </Link>
                      <button onClick={() => deleteProperty(p._id)} style={{ border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#fee2e2", color: "#dc2626", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                        Delete
                      </button>
                    </div>
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

export default AdminProperties;
