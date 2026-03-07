import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "../../utils/API";
import GlobalTypes from "../../redux/actions/GlobalTypes";
import swal from "sweetalert";

const GOLD = "#c9a84c";
const DARK = "#0e3725";

const ViewProperty = () => {
	const dispatch = useDispatch();
	const [data, setData] = useState([]);
	const [blockchain, setBlockchain] = useState([]);
	const [buysell, setTransaction] = useState([]);
	const [propid, setPropId] = useState("");
	const [availabletoken, setAvailableToken] = useState("");
	const [availablebalance, setAvailableBalance] = useState("");
	const [changedata, setChangeData] = useState({ units: "", amount: "" });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [buyOpen, setBuyOpen] = useState(false);
	const [sellOpen, setSellOpen] = useState(false);
	const [activeImg, setActiveImg] = useState(0);

	const { auth } = useSelector((state) => state);
	const formatSAR = (v) => `\ufdfc ${(v || 0).toLocaleString("en-SA", { minimumFractionDigits: 2 })}`;
	const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

	async function changeData(e) {
		const { name, value, max } = e.target;
		if (!value) { setChangeData({ units: "", amount: "" }); return; }
		if (parseInt(value) > parseInt(max)) { swal("Error", "Insufficient Balance!", "error"); return; }
		postDataAPI("changeData", { [name]: value, propertyId: propid }).then(function (res) {
			if (res.data.status === 1) setChangeData(res.data.data);
		});
	}

	async function getProperty() {
		try {
			setLoading(true);
			setError(null);
			var hrefPath = window.location.href;
			var id = hrefPath.split("/")[5];
			if (!id) { setError("Invalid property ID"); setLoading(false); return; }
			var getPropertyRes = await getDataAPI("/get_property/" + id);
			var getBlockchainRes = await getDataAPI("/getPropBlockchainData/" + id);
			var getPropTransactionRes = await getDataAPI("/getPropTransaction/" + id + "?isSubscription=true");
			setData(Array.isArray(getPropertyRes.data) ? getPropertyRes.data : []);
			setBlockchain(Array.isArray(getBlockchainRes.data) ? getBlockchainRes.data : []);
			setTransaction(Array.isArray(getPropTransactionRes.data) ? getPropTransactionRes.data : []);
		} catch (err) {
			console.error("Error loading property:", err);
			setError("Failed to load property data. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { getProperty(); }, []);

	const transaction = async (e) => {
		e.preventDefault();
		const { units, amount, propertyId, action } = e.target.elements;
		if (parseInt(units.value) === 0 && parseInt(amount.value) === 0) {
			swal("Error", "Please enter units!", "error"); return;
		}
		if (units.value > parseInt(units.max)) { swal("Error", "Insufficient Balance!", "error"); return; }
		if (amount && amount.value > parseInt(amount.max)) { swal("Error", "Insufficient Balance!", "error"); return; }
		let details = {
			units: units.value,
			amount: amount ? amount.value : 0,
			propertyId: propertyId.value,
			userId: (auth.data) ? auth.data.user._id : "",
			action: action.value,
		};
		var url = details.action === "buy" ? "buy" : "sell";
		postDataAPI(url, details).then(function (response) {
			if (response.data.status === 0) {
				swal("Error", "Insufficient Balance!", "error");
			} else {
				setBuyOpen(false);
				setSellOpen(false);
				dispatch({ type: GlobalTypes.NOTIFY, payload: { success: response.data.msg } });
				getProperty();
			}
		}).catch(function (error) { console.log(error); });
	};

	const Buy = async (property) => {
		setPropId(property._id);
		setAvailableToken(property.totalTokenSupply - property.tokenSupply);
		setAvailableBalance((auth.data) ? auth.data.user.totalBalance : "");
		setChangeData({ units: "", amount: "" });
		setBuyOpen(true);
	};

	const Sell = async (property) => {
		setPropId(property._id);
		setAvailableToken(property.tokenSupply || 0);
		setSellOpen(true);
	};

	const handleClose = () => { setBuyOpen(false); setSellOpen(false); };

	if (loading) return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
			<div style={{ textAlign: "center" }}>
				<div style={{ width: 40, height: 40, border: `3px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
				<p style={{ color: "#6b7280", fontSize: 14 }}>Loading property…</p>
			</div>
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
		</div>
	);

	if (error) return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
			<div style={{ textAlign: "center", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "32px 40px" }}>
				<p style={{ color: "#dc2626", fontSize: 15, margin: 0 }}>{error}</p>
			</div>
		</div>
	);

	const property = data[0];
	if (!property) return (
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
			<p style={{ color: "#6b7280" }}>Property not found.</p>
		</div>
	);

	const bc = blockchain[0];
	const images = Array.isArray(property.imageName) && property.imageName.length > 0 ? property.imageName : ["/img/al_narjes.jpg"];
	const subscribed = property.tokenSupply || 0;
	const total = property.totalTokenSupply || 1;
	const progress = pct(subscribed, total);

	return (
		<div style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

			{/* Breadcrumb */}
			<div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
				<a href="/dashboard" style={{ color: "#9ca3af", textDecoration: "none" }}>Dashboard</a>
				<span style={{ margin: "0 8px" }}>›</span>
				<span style={{ color: "#374151", fontWeight: 600 }}>{property.title}</span>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
				{/* Left Column */}
				<div>
					{/* Image Gallery */}
					<div style={{ background: "#111", borderRadius: 16, overflow: "hidden", marginBottom: 20, position: "relative", aspectRatio: "16/9" }}>
						<img src={images[activeImg]} alt={property.title}
							style={{ width: "100%", height: "100%", objectFit: "cover" }}
							onError={e => { e.target.src = "/img/al_narjes.jpg"; }} />
						{images.length > 1 && (
							<>
								<button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
									style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: 18 }}>‹</button>
								<button onClick={() => setActiveImg(i => (i + 1) % images.length)}
									style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: 18 }}>›</button>
								<div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
									{images.map((_, i) => (
										<button key={i} onClick={() => setActiveImg(i)}
											style={{ width: 8, height: 8, borderRadius: "50%", border: "none", background: i === activeImg ? GOLD : "rgba(255,255,255,0.5)", cursor: "pointer", padding: 0 }} />
									))}
								</div>
							</>
						)}
					</div>

					{/* Property Info */}
					<div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
							<div>
								<h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>{property.title}</h1>
								<p style={{ fontSize: 13.5, color: "#6b7280", margin: 0 }}>📍 {property.address}</p>
							</div>
							<span style={{ background: property.status === 1 ? "#d1fae5" : "#f3f4f6", color: property.status === 1 ? "#059669" : "#6b7280", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
								{property.status === 1 ? "Active" : "Inactive"}
							</span>
						</div>
						<p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 20px" }}>{property.description}</p>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
							{[
								{ label: "Property Value", value: formatSAR(property.propertyEstimatedValue) },
								{ label: "Offering %", value: `${property.percentageOfOwnership || 0}%` },
								{ label: "Total Tokens", value: (property.totalTokenSupply || 0).toLocaleString() },
							].map((s, i) => (
								<div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px" }}>
									<p style={{ fontSize: 11.5, color: "#9ca3af", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
									<p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>{s.value}</p>
								</div>
							))}
						</div>
					</div>

					{/* Blockchain Info */}
					{bc && (
						<div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
							<h3 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
								<span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
								On-Chain Data
							</h3>
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
								{[
									{ label: "Contract Address", value: bc.contractAddress ? `${bc.contractAddress.slice(0, 18)}…` : "—", link: bc.contractAddress ? `https://testnet.bscscan.com/address/${bc.contractAddress}` : null },
									{ label: "Transaction Hash", value: bc.transactionHash ? `${bc.transactionHash.slice(0, 18)}…` : "—", link: bc.transactionHash ? `https://testnet.bscscan.com/tx/${bc.transactionHash}` : null },
									{ label: "Token Symbol", value: bc.tokenSymbol || bc.symbol || "—" },
									{ label: "Network", value: bc.network || "BSC TestNet" },
								].map((item, i) => (
									<div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px" }}>
										<p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</p>
										{item.link ? (
											<a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: GOLD, fontWeight: 600, textDecoration: "none", wordBreak: "break-all" }}>{item.value}</a>
										) : (
											<p style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", margin: 0 }}>{item.value}</p>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Transactions */}
					<div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
						<h3 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 16px" }}>Recent Transactions</h3>
						{buysell.length > 0 ? (
							<div style={{ overflowX: "auto" }}>
								<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
									<thead>
										<tr style={{ borderBottom: "2px solid #f3f4f6" }}>
											{["Units", "Total Price", "Type", "Date"].map(h => (
												<th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>{h}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{buysell.map((b, i) => (
											<tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
												<td style={{ padding: "10px 12px", fontWeight: 600 }}>{b.units}</td>
												<td style={{ padding: "10px 12px" }}>{formatSAR(b.units * property.tokenPrice)}</td>
												<td style={{ padding: "10px 12px" }}>
													<span style={{ background: b.action === "buy" ? "#d1fae5" : "#fef3c7", color: b.action === "buy" ? "#059669" : "#d97706", padding: "2px 10px", borderRadius: 12, fontSize: 11.5, fontWeight: 600, textTransform: "capitalize" }}>{b.action}</span>
												</td>
												<td style={{ padding: "10px 12px", color: "#6b7280" }}>{b.createdAt ? b.createdAt.split("T")[0] : "—"}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
								<p style={{ fontSize: 13, margin: 0 }}>No transactions yet</p>
							</div>
						)}
					</div>
				</div>

				{/* Right Column — Subscription Card */}
				<div style={{ position: "sticky", top: 24 }}>
					<div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", border: `1px solid ${GOLD}30` }}>
						<div style={{ marginBottom: 20 }}>
							<p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>Unit Price</p>
							<p style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: 0 }}>{formatSAR(property.tokenPrice)}</p>
						</div>
						<div style={{ marginBottom: 20 }}>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#6b7280", marginBottom: 6 }}>
								<span>Subscribed</span>
								<span style={{ fontWeight: 700, color: DARK }}>{progress}%</span>
							</div>
							<div style={{ background: "#f3f4f6", borderRadius: 6, height: 8, overflow: "hidden" }}>
								<div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${DARK}, ${GOLD})`, borderRadius: 6 }} />
							</div>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#9ca3af", marginTop: 4 }}>
								<span>{subscribed.toLocaleString()} units sold</span>
								<span>{(total - subscribed).toLocaleString()} remaining</span>
							</div>
						</div>
						<div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
							{[
								{ label: "Total Supply", value: total.toLocaleString() + " tokens" },
								{ label: "Your Balance", value: formatSAR(auth.data?.user?.totalBalance || 0) },
							].map((s, i) => (
								<div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: i === 0 ? 8 : 0 }}>
									<span style={{ color: "#6b7280" }}>{s.label}</span>
									<span style={{ fontWeight: 700, color: "#111827" }}>{s.value}</span>
								</div>
							))}
						</div>
						{property.status === 1 ? (
							<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
								<button onClick={() => Buy(property)}
									style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg, ${DARK}, #1a5c3a)`, color: GOLD, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
									Subscribe Now
								</button>
								<button onClick={() => Sell(property)}
									style={{ width: "100%", padding: "12px", background: "transparent", color: "#6b7280", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
									Sell Units
								</button>
							</div>
						) : (
							<div style={{ background: "#f9fafb", borderRadius: 10, padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
								This property is not currently open for subscription
							</div>
						)}
						<div style={{ marginTop: 16, padding: "12px 14px", background: "#fffbeb", borderRadius: 8, fontSize: 11.5, color: "#92400e", border: "1px solid #fde68a" }}>
							<strong>Fee Notice:</strong> Subscription: 1% · Exchange: 0.25% per party
						</div>
					</div>
				</div>
			</div>

			{/* Buy Modal */}
			{buyOpen && (
				<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
					<div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
							<div>
								<h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>Subscribe to Units</h3>
								<p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Enter number of units to purchase</p>
							</div>
							<button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 22 }}>×</button>
						</div>
						<form onSubmit={transaction.bind(this)}>
							<input type="hidden" name="action" value="buy" />
							<input type="hidden" name="propertyId" value={propid} />
							<div style={{ marginBottom: 16 }}>
								<label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Number of Units</label>
								<input type="number" name="units" min="1" max={availabletoken} onChange={changeData} value={changedata.units}
									style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 14, outline: "none", boxSizing: "border-box" }}
									placeholder="Enter units" required />
								<p style={{ fontSize: 12, color: "#9ca3af", margin: "5px 0 0" }}>Available: {availabletoken} units</p>
							</div>
							<div style={{ marginBottom: 20 }}>
								<label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Total Amount (SAR)</label>
								<input type="number" name="amount" max={availablebalance} value={changedata.amount} readOnly
									style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 14, background: "#f9fafb", boxSizing: "border-box" }} />
								<p style={{ fontSize: 12, color: "#9ca3af", margin: "5px 0 0" }}>Your balance: {formatSAR(availablebalance)}</p>
							</div>
							<button type="submit" style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${DARK}, #1a5c3a)`, color: GOLD, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
								Confirm Subscription
							</button>
						</form>
					</div>
				</div>
			)}

			{/* Sell Modal */}
			{sellOpen && (
				<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
					<div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
							<div>
								<h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>Sell Units</h3>
								<p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Enter number of units to sell</p>
							</div>
							<button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 22 }}>×</button>
						</div>
						<form onSubmit={transaction.bind(this)}>
							<input type="hidden" name="action" value="sell" />
							<input type="hidden" name="propertyId" value={propid} />
							<input type="hidden" name="amount" value="0" />
							<div style={{ marginBottom: 20 }}>
								<label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Number of Units</label>
								<input type="number" name="units" min="1" max={availabletoken}
									style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 14, outline: "none", boxSizing: "border-box" }}
									placeholder="Enter units" required />
								<p style={{ fontSize: 12, color: "#9ca3af", margin: "5px 0 0" }}>Available: {availabletoken} units</p>
							</div>
							<button type="submit" style={{ width: "100%", padding: "13px", background: "#fff7ed", color: "#d97706", border: "1.5px solid #fde68a", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
								Confirm Sale
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ViewProperty;
