import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "../../utils/API";
import Modal from "@material-ui/core/Modal";
import GlobalTypes from "../../redux/actions/GlobalTypes";
import swal from "sweetalert";

//create property component to write all details from form.

const ViewProperty = () => {
	const dispatch = useDispatch();
	const [data, setData] = useState("");
	const [blockchain, setBlockchain] = useState([]);
	const [buysell, setTransaction] = useState([]);
	const [propid, setPropId] = useState("");
	const [availabletoken, setAvailableToken] = useState("");
	const [availablebalance, setAvailableBalance] = useState("");
	const [changedata, setChangeData] = useState("");

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
		var hrefPath = window.location.href;
		var id = hrefPath.split("/")[5];
		var getProperty = await getDataAPI("/get_property/" + id);
		var getBlockchain = await getDataAPI("/getPropBlockchainData/" + id);
		var getPropTransaction = await getDataAPI("/getPropTransaction/" + id +"?isSubscription=true");
		setData(getProperty.data);
		setBlockchain(getBlockchain.data);
		setTransaction(getPropTransaction.data);
	}
	useEffect(() => {
		getProperty();
	}, []);

	const transaction = async (e) => {
		e.preventDefault();
		const { units, amount, propertyId, action } = e.target.elements;
		if(parseInt(units.value)=="0" && parseInt(amount.value)=="0"){
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
			if (details.action == "buy") {
				var url = "buy";
			} else {
				var url = "sell";
			}
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
											<label>Enter Units (In {(blockchain && blockchain.length > 0)?blockchain[0].symbol:"Units"})</label>
							<input
								className="form-control"
								type="text"
								min="1"
								max={availabletoken}
								name="units"
								value={changedata.units}
								onChange={changeData}
							/>
							<span>Available Units: {availabletoken}</span>
						</div>
						<div className="mb-3">
							<label>Enter Amount(In $)</label>
							<input
								className="form-control"
								type="text"
								min="1"
								max={availablebalance}
								name="amount"
								value={changedata.amount}
								onChange={changeData}
							/>
							<span>Available User Balance: ${availablebalance}</span>
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

	return (
		<div>
			<div className="main_content">
				<section className="main_listing">
					<div className="container">
						{data
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
												{(property.imageName).map((imgName, key) => (
													<div className={`carousel-item ${(key==0)?'active':''}`}>
														<img src={`${imgName}`} />
													</div>
												))}
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
															<tr>
																<th>Units</th>
																<th>Total Price</th>
																<th>Buy/Sell</th>
																<th>Date</th>
															</tr>
															{buysell
																? buysell.map((b, index) => (
																		<tr key={index}>
																			<td>{b.units}</td>
																			<td>${(b.units*property.tokenPrice)}</td>
																			<td>{b.action}</td>
																			<td>{(b.createdAt).split("T")[0]}</td>
																		</tr>
																  ))
																: ""}
														</table>
													</div>
												</div>
												<div className="token_row">
													<h3>Unit Price: ${property.tokenPrice}</h3>
													<div className="btns">
														<button
															type="button"
															className="btn"
															onClick={() => Buy(property)}>
															Buy
														</button>
														{/* <button
															type="button"
															className="btn2"
															onClick={() => Sell(property)}>
															Sell
														</button> */}
													</div>
												</div>
											</div>
										</div>
									</div>
							  ))
							: ""}
					</div>
				</section>

				{/* <section>
					<div className="container">
						<div className="Graph">
							<img src="/theme/images/Graph.jpg" />
						</div>
					</div>
				</section>

				<section className="Related">
					<div className="container">
						<div className="inner_related">
							<h3>Related updates</h3>
							<ul>
								<li>
									<a href="#">Link to news about property</a>
								</li>
								<li>
									<a href="#">Link to news about property #2</a>
								</li>
								<li>
									<a href="#">Link to news about property #3</a>
								</li>
								<li>
									<a href="#">Link to news about property #4</a>
								</li>
							</ul>
						</div>
					</div>
				</section> */}

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
