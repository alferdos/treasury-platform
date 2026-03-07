import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loading } from "../../redux/actions/authAction";
import { getDataAPI, postDataAPI } from "../../utils/API";
import { VIEW_CONTRACT } from "../../utils/config";
import swal from "sweetalert";
import { useHistory, Link } from "react-router-dom";
import Modal from "@material-ui/core/Modal";

const Users = () => {
	const dispatch = useDispatch();
	const { auth } = useSelector((state) => state);
	const [data, setData] = useState("");
	const [senderror, setSendError] = useState("");
	const [sendtrans, setSendTrans] = useState(0);

	// Send Units modal
	const [open, setOpen] = React.useState(false);
	const [userid, setUserId] = useState("");
	const [properties, setProperties] = useState([]);

	// Add Funds modal
	const [fundsOpen, setFundsOpen] = useState(false);
	const [fundsUserId, setFundsUserId] = useState("");
	const [fundsUserName, setFundsUserName] = useState("");
	const [fundsAmount, setFundsAmount] = useState("");
	const [fundsError, setFundsError] = useState("");
	const [fundsSuccess, setFundsSuccess] = useState("");

	const handleClose = () => {
		setOpen(false);
		setSendTrans(0);
		setSendError("");
	};

	const handleFundsClose = () => {
		setFundsOpen(false);
		setFundsAmount("");
		setFundsError("");
		setFundsSuccess("");
	};

	async function getUser() {
		const res = await getDataAPI("/get_user?role=0");
		setData(res.data);
	}

	async function getActiveProperties() {
		const res = await getDataAPI("/get_property?status=1");
		if (res.data && res.data.data) {
			setProperties(res.data.data);
		} else if (Array.isArray(res.data)) {
			setProperties(res.data);
		}
	}

	useEffect(() => {
		getUser();
		getActiveProperties();
	}, []);

	const sendToken = async (user_id) => {
		setUserId(user_id);
		setSendTrans(0);
		setSendError("");
		setOpen(true);
	};

	const openAddFunds = (user_id, user_name) => {
		setFundsUserId(user_id);
		setFundsUserName(user_name);
		setFundsAmount("");
		setFundsError("");
		setFundsSuccess("");
		setFundsOpen(true);
	};

	const deleteUser = async (user_id) => {
		swal({
			title: "Are you sure?",
			text: "You want to delete this record?",
			icon: "warning",
			buttons: [
			  'No',
			  'Yes'
			],
			dangerMode: true,
		}).then(async function(isConfirm) {
			if (isConfirm) {
				await postDataAPI("/delete_user", {user_id});
				getUser();
			}
		});
	};

	const sendTokenSubmit = async (e) => {
		e.preventDefault();
		dispatch(loading(true));
		const { units, propertyId, userId } = e.target.elements;
		let details = {
			units: units.value,
			propertyId: propertyId.value,
			userId: userId.value,
		};
		postDataAPI("sendTokenByAdmin", details).then(function (res) {
			dispatch(loading(false));
			let response = res.data;
			if(response.status==1){
				setSendTrans(response.tx.hash);
			}
			else{
				setSendError(response.errors);
			}
		})
		.catch(function (error) {
			console.log(error);
			dispatch(loading(false));
		});
	};

	const addFundsSubmit = async (e) => {
		e.preventDefault();
		setFundsError("");
		setFundsSuccess("");
		if (!fundsAmount || isNaN(fundsAmount) || Number(fundsAmount) <= 0) {
			setFundsError("Please enter a valid amount greater than 0");
			return;
		}
		dispatch(loading(true));
		postDataAPI("addFunds", { userId: fundsUserId, amount: Number(fundsAmount) }).then(function (res) {
			dispatch(loading(false));
			let response = res.data;
			if (response.status == 1) {
				setFundsSuccess(response.message || `Successfully added ${fundsAmount} SAR to ${fundsUserName}'s balance.`);
				setFundsAmount("");
			} else {
				setFundsError(response.errors?.message || "Failed to add funds. Please try again.");
			}
		}).catch(function (error) {
			dispatch(loading(false));
			setFundsError("An error occurred. Please try again.");
			console.log(error);
		});
	};

	const bodySendUnits = () => {
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
				{(sendtrans)?
				(
					<div className="alert alert-success text-center">Unit sent to user successfully. <br/>Click <a href={`${VIEW_CONTRACT}tx/${sendtrans}`} target="_blank">Here</a> to view the transaction!</div>
				):(
					<form onSubmit={sendTokenSubmit.bind(this)}>
						<input type="hidden" name="userId" value={userid}/>
						<div className="mb-3">
							<label>Select Property</label>
							<select className="form-control" name="propertyId">
								<option value="">--Select--</option>
								{
									properties.length > 0 ? properties.map((p, i) => (
										<option key={i} value={p._id}>{p.title}</option>
									)) : <option disabled>No active properties available</option>
								}
							</select>
							<span className="error">{senderror && senderror.propertyId}</span>
						</div>
						<div className="mb-3">
							<label>Enter Units</label>
							<input
								className="form-control"
								type="number"
								min="1"
								name="units"
							/>
							<span className="error">{senderror && senderror.units}</span>
						</div>
						<button className="btn btn-default">Send</button>
					</form>
				)}
				</div>
			</div>
		);
	};

	const bodyAddFunds = () => {
		return (
			<div className="paper">
				<div className="paper-head">
					<h2 className="paper_h2" id="add-funds-modal-title">
						Add Funds
					</h2>
					<span onClick={handleFundsClose}>
						<i className="fa fa-times" aria-hidden="true"></i>
					</span>
				</div>
				<div className="paper-inner">
					{fundsSuccess ? (
						<div className="alert alert-success text-center">{fundsSuccess}</div>
					) : (
						<form onSubmit={addFundsSubmit}>
							<div className="mb-3">
								<label>User</label>
								<input
									className="form-control"
									type="text"
									value={fundsUserName}
									disabled
									style={{ background: "#f5f5f5", color: "#666" }}
								/>
							</div>
							<div className="mb-3">
								<label>Amount (SAR ﷼)</label>
								<input
									className="form-control"
									type="number"
									min="1"
									step="0.01"
									placeholder="Enter amount in SAR"
									value={fundsAmount}
									onChange={(e) => setFundsAmount(e.target.value)}
								/>
								{fundsError && <span className="error" style={{ color: "red", fontSize: "13px" }}>{fundsError}</span>}
							</div>
							<button className="btn btn-default" type="submit">Add Funds</button>
						</form>
					)}
				</div>
			</div>
		);
	};

	return (
		<div>
			<div className="main_content">
				<section className="listing_banner">
					<div className="container">
					<div className="table_scroll">
						<table className="table propertyListTable">
							<thead>
								<tr>
									<th scope="col">#</th>
									<th scope="col">Image</th>
									<th scope="col">Name</th>
									<th scope="col">Email</th>
									<th scope="col">Phone</th>
									<th scope="col">Role</th>
									<th scope="col">Action</th>
								</tr>
							</thead>
							<tbody>
							{
								(data.length==0)?(<tr><td colSpan='100%'><center>Record is empty!</center></td></tr>):""
							}
							{data ? data.map((user, index) => (
								<tr key={index}>
									<td scope="row">{index+1}</td>
									<td><img src={`../profilePic/${user.profile_image}`} /></td>
									<td>{user.name}</td>
									<td>{user.email}</td>
									<td>{user.phone_no}</td>
									<td>{(user.role)?( <>Admin</> ):( <>User</> )}</td>
									<td className="btn_div">
										<button className="btn send1 btn-default" onClick={()=>sendToken(user._id)}>Send Units</button>
										<button className="btn btn-default" style={{background:"#4a7c59", color:"#fff", marginLeft:"4px"}} onClick={()=>openAddFunds(user._id, user.name)}>Add Funds</button>
										<button className="btn del1 btn-default" onClick={()=>deleteUser(user._id)}>Delete</button>
									</td>
								</tr>
							)) : ""}
							</tbody>
						</table>
						</div>
					</div>
				</section>
				<div>
					<Modal
						open={open}
						onClose={handleClose}
						aria-labelledby="simple-modal-title"
						aria-describedby="simple-modal-description">
						{bodySendUnits()}
					</Modal>
					<Modal
						open={fundsOpen}
						onClose={handleFundsClose}
						aria-labelledby="add-funds-modal-title"
						aria-describedby="add-funds-modal-description">
						{bodyAddFunds()}
					</Modal>
				</div>
			</div>
		</div>
	);
};

export default Users;
