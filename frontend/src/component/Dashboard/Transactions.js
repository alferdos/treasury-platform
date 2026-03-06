import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getDataAPI, postDataAPI, postDataAPIBare } from "../../utils/API";
import { refreshToken } from "../../redux/actions/authAction";
import Modal from "@material-ui/core/Modal";
import swal from "sweetalert";
import RiyalSymbol from "../RiyalSymbol";

//create property component to write all details from form.

const Transactions = () => {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(refreshToken());
	}, [dispatch]);
	const [image, setImage] = useState("");
	const [users, setUsers] = useState("");
	const [transaction, setTransaction] = useState("");
	const [balance, setBalance] = useState("");
	const [totalbalance, setTotalBalance] = useState(0);
	const { auth } = useSelector((state) => state);
	useEffect(() => {
		async function getTransaction() {
			if(auth.data){
				var getUserTransaction = await getDataAPI("/getUserTransaction/" + auth.data.user._id);
				var getUserBalance = await getDataAPI("/getUserBalance/" + auth.data.user._id);
				setTransaction(getUserTransaction.data);
				setBalance(getUserBalance.data);
				let tb=0;
				(getUserBalance.data).forEach(function(b){
					tb+=b.propertyId.tokenPrice*b.units;
				});
				setTotalBalance(tb);
			}
		}
		getTransaction();
	}, [auth]);

	async function getUser() {
		const res = await getDataAPI("/get_user");
		setUsers(res.data);
	}

	useEffect(() => {
		getUser();
	}, []);

	const addFund = async () => {
		setAddFundOpen(true);
	};
	const sendToken = async () => {
		setSendOpen(true);
	};
	const receiveToken = async () => {
		setReceiveOpen(true);
	};
	const transactionToken = async () => {
		setTransactionOpen(true);
	};
	const [addFundOpen, setAddFundOpen] = React.useState(false);
	const [sendOpen, setSendOpen] = React.useState(false);
	const [receiveOpen, setReceiveOpen] = React.useState(false);
	const [transactionOpen, setTransactionOpen] = React.useState(false);
	const handleClose = () => {
		setAddFundOpen(false);
		setSendOpen(false);
		setReceiveOpen(false);
		setTransactionOpen(false);
	};

	const addFundSubmit = async (e) => {
		e.preventDefault();
		const { amount } = e.target.elements;
		var formData = new FormData();
		formData.append("file", image);
        formData.append("userId", (auth.data)?auth.data.user._id:"");
		formData.append("amount", amount.value);
		let details = {
			userId: (auth.data)?auth.data.user._id:"",
			amount: amount.value,
		};
		postDataAPIBare("requestFund", formData).then(function(res){
			var response=res.data;
			if(response.status==1){
				setAddFundOpen(false);
				swal("Success","Request sent successfully. It will take approx 1 to 2 business days for approve!","success");
			}
		});
	};

	const sendTokenSubmit = async (e) => {
		e.preventDefault();
		const { units, userId } = e.target.elements;
		let details = {
			units: units.value,
			userId: userId.value,
		};
		
	};

	const bodyAddFund = () => {
		return (
			<div className="paper">
				<div className="paper-head">
					<h2 className="paper_h2" id="simple-modal-title">
						Add Fund
					</h2>
					<span onClick={handleClose}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</span>
				</div>
				<div className="paper-inner">
					<form onSubmit={addFundSubmit.bind(this)}>
						<div className="mb-3">
							<label>Enter Amount</label>
							<input
								className="form-control"
								type="number"
								min="1"
								name="amount"
								required
							/>
						</div>
						<div className="mb-3">
							<label>Upload Invoice</label>
							<input
								className="form-control"
								type="file"
								name="invoice"
								onChange={(e) => setImage(e.target.files[0])}
								required
							/>
						</div>
						<button className="btn btn-default">Add Fund</button>
					</form>
				</div>
			</div>
		);
	};

	const bodySend = () => {
		return (
			<div className="paper">
				<div className="paper-head">
					<h2 className="paper_h2" id="simple-modal-title">
						Send Unit
					</h2>
					<span onClick={handleClose}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</span>
				</div>
				<div className="paper-inner">
					<form onSubmit={sendTokenSubmit.bind(this)}>
						<div className="mb-3">
							<label>Select Property</label>
							<select className="form-control" name="propertyId" required>
								<option value="">--Select--</option>
								{
									balance?balance.map((b, i) => (
										<option key={i} value={b.propertyId._id}>{b.propertyId.title}</option>
									)): ""
								}
							</select>
						</div>
						<div className="mb-3">
							<label>Select User</label>
							<select className="form-control" name="userId" required>
								<option value="">--Select--</option>
								{
									users?users.map((u, i) => (
										<option key={i} value={u._id}>{u.email}</option>
									)): ""
								}
							</select>
						</div>
						<div className="mb-3">
							<label>Enter Units</label>
							<input
								className="form-control"
								type="number"
								min="1"
								name="units"
								required
							/>
						</div>
						<button className="btn btn-default">Send</button>
					</form>
				</div>
			</div>
		);
	};

	const bodyReceive = () => {
		return (
			<div className="paper">
				<div className="paper-head">
					<h2 className="paper_h2" id="simple-modal-title">
						Receive Unit
					</h2>
					<span onClick={handleClose}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</span>
				</div>
				<div className="paper-inner">
					<form>
						
					</form>
				</div>
			</div>
		);
	};

	const bodyTransaction = () => {
		return (
			<div className="paper transModal">
				<div className="paper-head">
					<h2 className="paper_h2" id="simple-modal-title">
						All Transactions
					</h2>
					<span onClick={handleClose}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</span>
				</div>
				<div className="paper-inner">
					<div className="how_wrk">
						<div className="lis_col padd">
							<div className="tab_le single_table">
								<table className="table">
									<tbody>
									{
										transaction?transaction.map((t, key) => (
											<tr className={(key%2==0)?"red":""} key={key}>
												<td style={{textAlign:'left'}}><img src={`/theme/images/${(t.action=='buy')?"arr_btn1.png":"arr_btn.png"}`}/></td>
												<td valign="middle">{(t.action=='buy')?"Buy":"Sell"} {t.propertyId.title}</td>
												<td valign="middle">{t.units} Units ({(t.isSubscription==true)?"Fleet":"Trade"})</td>
												<td valign="middle">{(t.createdAt).split("T")[0]}</td>
										<td valign="middle" style={{textAlign:'right'}}><RiyalSymbol size="0.85em" />{t.price*t.units}</td>
									</tr>
								)): ""
								}
								</tbody>
							</table>	 
						</div>
					</div>
				</div>
			</div>
			</div>
		);
	};
	return (
		<div className="main_content">
		   	<section className="main_listing">
				<div className="container">
					<div className="inner_list work_sec">
						<div className="token_row">
							<h3>Portfolio Value</h3>
							<div className="btns">
								<button type="button" className="btn" onClick={()=>addFund()}>Add Fund</button>
								{/* <button type="button" className="btn" onClick={()=>sendToken()}>Send</button>
								<button type="button" className="btn2" onClick={()=>receiveToken()}>Receive</button> */}
							</div>
						</div>	
						<div className="how_wrk">
							<div className="lis_col">
								<h4><span className="cash_b">Cash Balance</span><span className="doll"><RiyalSymbol size="1em" /></span><span className="big_fnt">{auth.data?auth.data.user.totalBalance:""}</span></h4>
								<div className="tab_le single_table">
									<table className="table">
										<thead>
											<tr>
												<th style={{textAlign:'left'}}>property name</th>
												<th>QTY</th>
												<th>price</th>
												<th style={{textAlign:'right'}}>value</th>
											</tr>
										</thead>
										<tbody>
											{
												balance?balance.map((b, i) => (
													<tr key={i}>
														<td style={{textAlign:'left'}}>{b.propertyId.title}</td>
														<td>{b.units} units</td>
												<td><RiyalSymbol size="0.85em" />{b.propertyId.tokenPrice}</td>
												<td style={{textAlign:'right'}}><RiyalSymbol size="0.85em" />{b.propertyId.tokenPrice*b.units}</td>
													</tr>
												)): ""
											}
											<tr className="re_sult">
												<td style={{textAlign:'left', fontSize:'16px'}}>SUMMARY</td>
												<td></td>
												<td></td>
												<td style={{textAlign:'right'}}><strong><RiyalSymbol size="0.85em" />{totalbalance}</strong></td>
											</tr>
											<tr className="re_sult">
												<td style={{textAlign:'left', fontSize:'16px'}}>TOTAL BALANCE</td>
												<td></td>
												<td></td>
												<td style={{textAlign:'right'}}><strong><RiyalSymbol size="0.85em" />{totalbalance+(auth.data?auth.data.user.totalBalance:0)}</strong></td>
											</tr>
										</tbody>
									</table>	 
								</div>
							</div>
						</div>		  
					</div>
					<div className="inner_list work_sec">
						<div className="token_row">
							<h3>Latest Transactions</h3>
							<h4><a href="javascript:void(0);" onClick={()=>transactionToken()}>See All</a></h4>
						</div>	
						<div className="how_wrk">
							<div className="lis_col padd">
								<div className="tab_le single_table">
									<table className="table">
										<tbody>
										{
											transaction?transaction.map((t, key) =>
												(key<5)?(
													<tr class={(key%2==0)?"red":""}>
														<td style={{textAlign:'left'}}><img src={`/theme/images/${(t.action=='buy')?"arr_btn1.png":"arr_btn.png"}`}/></td>
														<td valign="middle">{(t.action=='buy')?"Buy":"Sell"} {t.propertyId.title}</td>
														<td valign="middle">{t.units} Units ({(t.isSubscription==true)?"Fleet":"Trade"})</td>
														<td valign="middle">{(t.createdAt).split("T")[0]}</td>
										<td valign="middle" style={{textAlign:'right'}}><RiyalSymbol size="0.85em" />{t.price*t.units}</td>
									</tr>
								):""
											): ""
										}
										</tbody>
									</table>	 
								</div>
							</div>
						</div>		  
					</div>
				</div>
		   	</section>
			<div>
				<Modal
					open={addFundOpen}
					onClose={handleClose}
					aria-labelledby="simple-modal-title"
					aria-describedby="simple-modal-description">
					{bodyAddFund()}
				</Modal>
			</div>   
			<div>
				<Modal
					open={sendOpen}
					onClose={handleClose}
					aria-labelledby="simple-modal-title"
					aria-describedby="simple-modal-description">
					{bodySend()}
				</Modal>
			</div>	
			<div>
				<Modal
					open={receiveOpen}
					onClose={handleClose}
					aria-labelledby="simple-modal-title"
					aria-describedby="simple-modal-description">
					{bodyReceive()}
				</Modal>
			</div>		
			<div>
				<Modal
					open={transactionOpen}
					onClose={handleClose}
					aria-labelledby="simple-modal-title"
					aria-describedby="simple-modal-description">
					{bodyTransaction()}
				</Modal>
			</div>				
		</div>
	);
};

export default Transactions;
