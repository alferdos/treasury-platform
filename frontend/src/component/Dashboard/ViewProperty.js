import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "../../utils/API";
import Modal from "@material-ui/core/Modal";
import GlobalTypes from "../../redux/actions/GlobalTypes";
import RiyalSymbol from "../RiyalSymbol";
import swal from "sweetalert";

//create property component to write all details from form.

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

	const { auth } = useSelector((state) => state);

	async function changeData(e) {
		const{name, value, min, max} = e.target;
		if(value==""){
			setChangeData({ units: "", amount: "" });
		}
		else if(value>parseInt(max)){
			swal("Error","Insufficient Balance!","error");
		}
		else{
			postDataAPI("changeData", {[name]: value, propertyId: propid }).then(function(res){
				var request=res.data;
				if(request.status==1){
					setChangeData(request.data);
				}
			});
		}
	}

	async function getProperty() {
		try {
			setLoading(true);
			setError(null);
			var hrefPath = window.location.href;
			var id = hrefPath.split("/")[5];
			if (!id) {
				setError("Invalid property ID");
				setLoading(false);
				return;
			}
			var getPropertyRes = await getDataAPI("/get_property/" + id);
			var getBlockchainRes = await getDataAPI("/getPropBlockchainData/" + id);
			var getPropTransactionRes = await getDataAPI("/getPropTransaction/" + id +"?isSubscription=true");

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

	useEffect(() => {
		getProperty();
	}, []);

	const transaction = async (e) => {
		e.preventDefault();
		const { units, amount, propertyId, action } = e.target.elements;
		if(parseInt(units.value)==0 && parseInt(amount.value)==0){
			swal("Error","Please enter units!","error");
		}
		else if(units.value>parseInt(units.max)){
			swal("Error","Insufficient Balance!","error");
		}
		else if(amount.value>parseInt(amount.max)){
			swal("Error","Insufficient Balance!","error");
		}
		else{
			let details = {
				units: units.value,
				amount: amount.value,
				propertyId: propertyId.value,
				userId: (auth.data)?auth.data.user._id:"",
				action: action.value,
			};
			var url = details.action === "buy" ? "buy" : "sell";
			postDataAPI(url, details).then(function (response) {
				if(response.data.status==0){
					swal("Error","Insufficient Balance!","error");
				}
				else{
					setBuyOpen(false);
					setSellOpen(false);
					dispatch({
						type: GlobalTypes.NOTIFY,
						payload: {
							success: response.data.msg,
						},
					});
					getProperty();
				}
			})
			.catch(function (error) {
				console.log(error);
			});
		}
	};

	const Buy = async (property) => {
		setPropId(property._id);
		setAvailableToken(property.totalTokenSupply-property.tokenSupply);
		setAvailableBalance((auth.data)?auth.data.user.totalBalance:"");
		setBuyOpen(true);
	};

	const Sell = async (property) => {
		setPropId(property._id);
		setAvailableToken(property.totalTokenSupply-property.tokenSupply);
		setSellOpen(true);
	};

	const [buyOpen, setBuyOpen] = React.useState(false);
	const [sellOpen, setSellOpen] = React.useState(false);
	const handleClose = () => {
		setBuyOpen(false);
		setSellOpen(false);
	};

	const bodyBuy = () => {
		return (
			<div className="paper">
				<div className="paper-head">
					<h2 className="paper_h2" id="simple-modal-title">
						Buy Unit
					</h2>
					<span onClick={handleClose}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</span>
				</div>
				<div className="paper-inner">
					<form onSubmit={transaction.bind(this)}>
						<input type="hidden" name="action" value="buy" />
						<input type="hidden" name="propertyId" value={`${propid}`} />
						<div className="mb-3">
							<label>Enter Units (In {(blockchain && blockchain.length > 0) ? blockchain[0].symbol : "Units"})</label>
							<input
								className="form-control"
								type="text"
								min="1"
								max={availabletoken}
								name="units"
								value={changedata ? changedata.units : ""}
								onChange={changeData}
							/>
							<span>Available Units: {availabletoken}</span>
						</div>
						<div className="mb-3">
													<label>Enter Amount (In <RiyalSymbol size="0.9em" />)</label>
							<input
								className="form-control"
								type="text"
								min="1"
								max={availablebalance}
								name="amount"
								value={changedata ? changedata.amount : ""}
								onChange={changeData}
							/>
													<span>Available User Balance: <RiyalSymbol size="0.85em" />{availablebalance}</span>
						</div>
						<button className="btn btn-default">Buy</button>
					</form>
				</div>
			</div>
		);
	};

	const bodySell = () => {
		return (
			<div className="paper">
				<div className="paper-head">
					<h2 className="paper_h2" id="simple-modal-title">
						Sell Unit
					</h2>
					<span onClick={handleClose}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</span>
				</div>
				<div className="paper-inner">
					<form onSubmit={transaction.bind(this)}>
						<input type="hidden" name="action" value="sell" />
						<input type="hidden" name="propertyId" value={`${propid}`} />
						<div className="mb-3">
							<label>Enter Units</label>
							<input
								className="form-control"
								type="text"
								min="1"
								name="units"
								required
							/>
							<span>Available Units: {availabletoken}</span>
						</div>
						<button className="btn btn-default">Submit</button>
					</form>
				</div>
			</div>
		);
	};

	if (loading) {
		return (
			<div className="main_content">
				<div className="container" style={{textAlign: 'center', padding: '50px'}}>
					<p>Loading property details...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="main_content">
				<div className="container" style={{textAlign: 'center', padding: '50px'}}>
					<p style={{color: 'red'}}>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="main_content">
				<section className="main_listing">
					<div className="container">
						{data && data.length > 0
							? data.map((property, i) => (
									<div key={i} className="inner_list">
										<h3>{property.title}</h3>
										<h3>
											Address:<span>{property.address}</span>
										</h3>
										<div className="list_grd">
											<div
												id="carouselExampleControls"
												className="carousel slide"
												data-bs-ride="carousel">
												<div className="carousel-inner">
												{property.imageName && Array.isArray(property.imageName) ? property.imageName.map((imgName, key) => (
													<div key={key} className={`carousel-item ${(key==0)?'active':''}`}>
														<img src={`${imgName}`} alt={property.title} />
													</div>
												)) : (
													<div className="carousel-item active">
														<img src="/img/al_narjes.jpg" alt={property.title} />
													</div>
												)}
												</div>
												<button
													className="carousel-control-prev"
													type="button"
													data-bs-target="#carouselExampleControls"
													data-bs-slide="prev">
													<span
														className="carousel-control-prev-icon"
														aria-hidden="true"></span>
													<span className="visually-hidden">Previous</span>
												</button>
												<button
													className="carousel-control-next"
													type="button"
													data-bs-target="#carouselExampleControls"
													data-bs-slide="next">
													<span
														className="carousel-control-next-icon"
														aria-hidden="true"></span>
													<span className="visually-hidden">Next</span>
												</button>
											</div>
											<div className="lis_col">
												<h4>Latest Transactions</h4>
												<div className="tab_le">
													<div className="tableScroll">
														<table className="table">
															<tbody>
																<tr>
																	<th>Units</th>
																	<th>Total Price</th>
																	<th>Buy/Sell</th>
																	<th>Date</th>
																</tr>
																{buysell && buysell.length > 0
																	? buysell.map((b, index) => (
																			<tr key={index}>
																				<td>{b.units}</td>
																				<td><RiyalSymbol size="0.85em" />{(b.units*property.tokenPrice)}</td>
																				<td>{b.action}</td>
																				<td>{b.createdAt ? b.createdAt.split("T")[0] : "-"}</td>
																			</tr>
																	  ))
																	: <tr><td colSpan="4" style={{textAlign:'center'}}>No transactions yet</td></tr>}
															</tbody>
														</table>
													</div>
												</div>
												<div className="token_row">
																<h3>Unit Price: <RiyalSymbol />{property.tokenPrice}</h3>
													<div className="btns">
														<button
															type="button"
															className="btn"
															onClick={() => Buy(property)}>
															Buy
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
							  ))
							: <div style={{textAlign:'center', padding:'50px'}}><p>Property not found.</p></div>}
					</div>
				</section>

				<div>
					<Modal
						open={buyOpen}
						onClose={handleClose}
						aria-labelledby="simple-modal-title"
						aria-describedby="simple-modal-description">
						{bodyBuy()}
					</Modal>
				</div>
				<div>
					<Modal
						open={sellOpen}
						onClose={handleClose}
						aria-labelledby="simple-modal-title"
						aria-describedby="simple-modal-description">
						{bodySell()}
					</Modal>
				</div>
			</div>
		</div>
	);
};

export default ViewProperty;
