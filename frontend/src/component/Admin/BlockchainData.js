import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDataAPIAuth } from "../../utils/API";
import AdminShell from "./AdminShell";

const BSCSCAN = "https://testnet.bscscan.com";

const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden" };
const TH = { padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const TD = { padding: "14px 16px", fontSize: 13.5, color: "#374151", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };

const StatusBadge = ({ status }) => {
  const map = {
    1: { label: "Active", bg: "#d1fae5", color: "#065f46" },
    0: { label: "Pending", bg: "#fef3c7", color: "#92400e" },
    2: { label: "Closed", bg: "#fee2e2", color: "#991b1b" },
  };
  const s = map[status] || { label: "Unknown", bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

const BlockchainData = () => {
  const auth = useSelector(state => state.auth);
  const token = auth?.data?.accesstoken || auth?.data?.access_token;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDataAPIAuth("/getBlockchainOverview", token);
      if (res.data && res.data.status === 1) {
        setData(res.data.data);
      } else {
        setError("Failed to load blockchain data.");
      }
    } catch (e) {
      setError("Failed to load blockchain data: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = data.filter(d =>
    !search ||
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.contract_address?.toLowerCase().includes(search.toLowerCase()) ||
    d.onChain?.symbol?.toLowerCase().includes(search.toLowerCase())
  );

  const deployed = data.filter(d => d.contract_address && !d.onChain?.error).length;
  const totalValue = data.reduce((s, d) => s + (d.propertyEstimatedValue || 0), 0);
  const totalTokens = data.reduce((s, d) => s + (d.totalTokenSupply || 0), 0);

  const formatSAR = (v) => `﷼ ${(v || 0).toLocaleString("en-SA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const shortAddr = (a) => a ? `${a.slice(0, 8)}…${a.slice(-6)}` : "—";

  return (
    <AdminShell pageTitle="Blockchain Data">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .bc-link { color: #c9a84c; text-decoration: none; font-family: monospace; font-size: 12px; }
        .bc-link:hover { text-decoration: underline; }
        .bc-row:hover td { background: #fafafa; }
        .bc-row { transition: background 0.15s; }
        .refresh-btn { background: #1a2035; color: #fff; border: none; border-radius: 8px; padding: "9px 18px"; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .refresh-btn:hover { background: #0e3725; }
      `}</style>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Contracts", value: data.length, color: "#1a1a2e" },
          { label: "Deployed On-Chain", value: deployed, color: "#0e3725" },
          { label: "Total Token Supply", value: totalTokens.toLocaleString(), color: "#c9a84c" },
          { label: "Total Property Value", value: formatSAR(totalValue), color: "#c9a84c" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter / Refresh bar */}
      <div style={{ ...card, padding: "16px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="Search by property name, contract address, or symbol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13.5, color: "#111827", background: "#f9fafb", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <button
          onClick={load}
          style={{ background: "#1a2035", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      {/* Main Table */}
      <div style={card}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>Tokenized Property Contracts — BSC TestNet</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{filtered.length} contract{filtered.length !== 1 ? "s" : ""}</span>
            <a href={`${BSCSCAN}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#c9a84c", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              BscScan TestNet
            </a>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", flexDirection: "column", gap: 12 }}>
            <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ color: "#9ca3af", fontSize: 14 }}>Loading on-chain data…</span>
          </div>
        ) : error ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#ef4444", fontSize: 14 }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#9ca3af" }}>
            <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            <p style={{ margin: 0 }}>No deployed contracts found. Add properties with contract addresses to see them here.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Property", "Token Name / Symbol", "Contract Address", "Token Supply", "Unit Price (SAR)", "Ownership %", "Status", "Actions"].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={i} className="bc-row">
                    {/* Property */}
                    <td style={TD}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{d.title}</div>
                      {d.address && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{d.address}</div>}
                    </td>

                    {/* Token Name / Symbol */}
                    <td style={TD}>
                      {d.onChain?.error ? (
                        <span style={{ color: "#ef4444", fontSize: 12 }}>⚠ Chain read failed</span>
                      ) : d.onChain ? (
                        <div>
                          <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{d.onChain.name}</div>
                          <div style={{ fontSize: 12, color: "#c9a84c", fontWeight: 700, marginTop: 2 }}>{d.onChain.symbol}</div>
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Contract Address */}
                    <td style={TD}>
                      <a
                        href={`${BSCSCAN}/token/${d.contract_address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bc-link"
                        title={d.contract_address}
                      >
                        {shortAddr(d.contract_address)}
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: 4, verticalAlign: "middle" }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </td>

                    {/* Token Supply */}
                    <td style={TD}>
                      <div style={{ fontWeight: 600 }}>
                        {d.onChain && !d.onChain.error
                          ? Number(d.onChain.totalSupply).toLocaleString()
                          : (d.totalTokenSupply || "—").toLocaleString()}
                      </div>
                      {d.onChain && !d.onChain.error && (
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>live on-chain</div>
                      )}
                    </td>

                    {/* Unit Price */}
                    <td style={TD}>
                      <span style={{ fontWeight: 600, color: "#c9a84c" }}>
                        {d.tokenPrice ? `﷼ ${Number(d.tokenPrice).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                      </span>
                    </td>

                    {/* Ownership % */}
                    <td style={TD}>
                      {d.percentageOfOwnership != null ? (
                        <span style={{ fontWeight: 600 }}>{d.percentageOfOwnership}%</span>
                      ) : "—"}
                    </td>

                    {/* Status */}
                    <td style={TD}><StatusBadge status={d.status} /></td>

                    {/* Actions */}
                    <td style={TD}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <a
                          href={`${BSCSCAN}/token/${d.contract_address}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#c9a84c", padding: "4px 10px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          Token ↗
                        </a>
                        <a
                          href={`${BSCSCAN}/address/${d.contract_address}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#0e3725", padding: "4px 10px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          Txns ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Network Info Footer */}
      <div style={{ marginTop: 16, padding: "12px 20px", background: "#f9fafb", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#6b7280" }}>
        <svg width="14" height="14" fill="none" stroke="#c9a84c" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Connected to <strong style={{ color: "#1a1a2e" }}>BSC TestNet</strong> (Chain ID: 97) · All contracts are ERC-20 tokens representing fractional property ownership · On-chain data is read live from the blockchain</span>
      </div>
    </AdminShell>
  );
};

export default BlockchainData;
