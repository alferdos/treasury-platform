import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { getDataAPI, postDataAPI } from "../../utils/API";
import { editProperty } from "../../redux/actions/propertyAction";
import CreatePropertyBlockchain from "./DeployNewICO";
import RiyalSymbol from "../RiyalSymbol";
import { VIEW_CONTRACT } from "../../utils/config";

//create property component to write all details from form.

const EditProperty = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const [blockchaindata, setBlockchainData] = useState("");
	const { property, ico } = useSelector((state) => state);
	if (property.data) {
		var response = property.data;
		if (response.status == 1) {
			response.errors = 0;
			history.push("/");
		}
	}

	const initialState = {
		_id: "",
		title: "",
		address: "",
		description: "",
		contract_address: "",
		tokenPrice: "",
		imageName: "",
		propertyEstimatedValue: "",
		status: "",
		generatic_income: "",
		propertyDeed: "",
		percentageOfOwnership: "",
	};

	const [propertyData, setPropertyData] = useState(initialState);

	const {
		_id,
		title,
		address,
		description,
		contract_address,
		tokenPrice,
		imageName,
		propertyEstimatedValue,
		status,
		generatic_income,
		propertyDeed,
		percentageOfOwnership,
	} = propertyData;

	if (ico.data) {
		var response = ico.data;
		if (response.status == 1) {
			getBlockchain(propertyData);
		}
	}

	async function getProperty() {
		var hrefPath = window.location.href;
		var id = hrefPath.split("/")[5];
		getDataAPI("/get_property/" + id).then(function(getProperty){
			getProperty=getProperty.data[0];
			setPropertyData({ ...propertyData, ...getProperty });
		})
	}
	useEffect(() => {
		getProperty();
	}, []);

	const handleChangeInput = (e) => {
		const { name, value } = e.target;
		if(name=="address"){
            document.querySelector(".add_map").setAttribute("src", "https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&q="+value);
        }
		setPropertyData({ ...propertyData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch(editProperty(propertyData));
	};

	async function getBlockchain(prop) {
		if(prop._id){
			await getDataAPI("/getPropBlockchainData/" + prop._id).then(function(blockchainData){
				blockchainData=blockchainData.data[0];
				setBlockchainData(blockchainData);
			});
		}
	}
	useEffect(() => {
		getBlockchain(propertyData);
	}, [propertyData]);

	return (
		<div className="main_content">
			<section>
				<div className="container editPropertyPage">
					<ul className="nav nav-tabs" id="myTab" role="tablist">
						<li className="nav-item" role="presentation">
							<button className="nav-link active" id="create-tab" data-bs-toggle="tab" data-bs-target="#create" type="button" role="tab" aria-controls="create" aria-selected="true">Create Property Blockchain</button>
						</li>
						<li className="nav-item" role="presentation">
							<button className="nav-link" id="edit-tab" data-bs-toggle="tab" data-bs-target="#edit" type="button" role="tab" aria-controls="edit" aria-selected="false">Edit Property</button>
						</li>
					</ul>
					<div className="tab-content" id="myTabContent">
						<div className="tab-pane fade show active" id="create" role="tabpanel" aria-labelledby="create-tab">
					{blockchaindata ? (
						<div className="tokenInfoCard">
							<div className="tokenInfoHeader">
								<span className="tokenBadgeVerified">&#10003; Deployed</span>
								<h3>{blockchaindata.contractName} <span className="tokenSymbol">({blockchaindata.symbol})</span></h3>
								<span className="tokenNetwork">{blockchaindata.network || 'BSC Testnet'} &bull; Chain ID: {blockchaindata.chainId || 97}</span>
							</div>
							<div className="tokenInfoGrid">
								<div className="tokenInfoRow tokenInfoRowFull">
									<span className="tokenInfoLabel">Token ID (Contract Address)</span>
									<span className="tokenInfoValue tokenHash">
										<a href={`${VIEW_CONTRACT}token/${blockchaindata.contractAddress}`} target="_blank" rel="noreferrer">
											{blockchaindata.contractAddress}
										</a>
									</span>
								</div>
								<div className="tokenInfoRow tokenInfoRowFull">
									<span className="tokenInfoLabel">Transaction Hash</span>
									<span className="tokenInfoValue tokenHash">
										<a href={`${VIEW_CONTRACT}tx/${blockchaindata.transactionHash}`} target="_blank" rel="noreferrer">
											{blockchaindata.transactionHash}
										</a>
									</span>
								</div>
								<div className="tokenInfoRow">
									<span className="tokenInfoLabel">Token Symbol</span>
									<span className="tokenInfoValue">{blockchaindata.symbol}</span>
								</div>
								<div className="tokenInfoRow">
									<span className="tokenInfoLabel">Token Standard</span>
									<span className="tokenInfoValue">{blockchaindata.tokenStandard || 'BEP-20'}</span>
								</div>
								<div className="tokenInfoRow">
									<span className="tokenInfoLabel">Total Token Supply</span>
									<span className="tokenInfoValue">{Number(blockchaindata.totalTokenSupply).toLocaleString()}</span>
								</div>
								<div className="tokenInfoRow">
									<span className="tokenInfoLabel">Decimals</span>
									<span className="tokenInfoValue">{blockchaindata.decimals}</span>
								</div>
								<div className="tokenInfoRow">
									<span className="tokenInfoLabel">Block Number</span>
									<span className="tokenInfoValue">{blockchaindata.blockNumber ? blockchaindata.blockNumber.toLocaleString() : '—'}</span>
								</div>
								<div className="tokenInfoRow">
									<span className="tokenInfoLabel">Gas Used</span>
									<span className="tokenInfoValue">{blockchaindata.gasUsed ? blockchaindata.gasUsed.toLocaleString() : '—'}</span>
								</div>
								<div className="tokenInfoRow">
									<span className="tokenInfoLabel">Deployed At</span>
									<span className="tokenInfoValue">{new Date(blockchaindata.createdAt).toLocaleString()}</span>
								</div>
							</div>
							<div className="tokenInfoActions">
								<a href={`${VIEW_CONTRACT}token/${blockchaindata.contractAddress}`} target="_blank" rel="noreferrer" className="crt-ico">View Token on BSCScan</a>
								<a href={`${VIEW_CONTRACT}tx/${blockchaindata.transactionHash}`} target="_blank" rel="noreferrer" className="crt-ico crt-ico-secondary">View Transaction</a>
							</div>
						</div>
						) : (
							<CreatePropertyBlockchain data={propertyData}/>
						)}
						</div>
						<div className="tab-pane fade" id="edit" role="tabpanel" aria-labelledby="edit-tab">
							<div className="create">
							{blockchaindata ? (
								<form onSubmit={handleSubmit}>
									<div className="mb-3">
										<label className="form-label">Title</label>
										<input
											type="text"
											className="form-control"
											name="title"
											value={title}
											placeholder="Title"
											onChange={handleChangeInput}
											readonly
										/>
										<span className="error">
											{property.data ? property.data.errors.title : ""}
										</span>
									</div>
									<div className="mb-3">
										<label className="form-label">Address</label>
										<input
											type="text"
											className="form-control"
											name="address"
											value={address}
											placeholder="Address"
											onChange={handleChangeInput}
										/>
										<span className="error">{property.data ? property.data.errors.address : ""}</span>
										<iframe className="add_map" src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&q=${address}`} width="600" height="450" allowfullscreen="" loading="lazy"></iframe>
									</div>
									<div className="mb-3">
										<label className="form-label">Description</label>
										<textarea
											className="form-control"
											type="text"
											name="description"
											value={description}
											placeholder="Description"
											onChange={handleChangeInput}
										/>
										<span className="error">{property.data ? property.data.errors.description : ""}</span>
									</div>
									<div className="mb-3">
										<label className="form-label">Contract Address</label>
										<input
											type="text"
											className="form-control"
											name="contract_address"
											value={contract_address}
											placeholder="Contract Address"
											onChange={handleChangeInput}
										/>
										<span className="error">{property.data ? property.data.errors.contract_address : ""}</span>
									</div>
									<div className="mb-3">
										<label className="form-label">Unit Price (In <RiyalSymbol size="0.9em" />)</label>
										<input
											type="text"
											className="form-control"
											name="tokenPrice"
											value={tokenPrice}
											placeholder="Unit Price"
											onChange={handleChangeInput}
										/>
										<span className="error">{property.data ? property.data.errors.tokenPrice : ""}</span>
									</div>
									<div className="mb-3">
										<label className="form-label">Pictures</label>
										<div className="field" align="left">
											<div className="edit-image-upload">
											{imageName.map((img) => (
												<img src={`${img}`}/>
											))}
											</div>
										</div>
									</div>
									<div className="mb-3">
										<label className="form-label">Property Estimated Value(In m2)</label>
										<input
											className="form-control"
											type="text"
											name="propertyEstimatedValue"
											value={propertyEstimatedValue}
											placeholder="Property Estimated Value"
											onChange={handleChangeInput}
										/>
										<span className="error">{property.data ? property.data.errors.propertyEstimatedValue : ""}</span>
									</div>
									<div className="mb-3">
										<label className="form-label">Generetic Income</label>
										<div className="radio_grd">
											<label className="contain">
												<input
													className="form-control"
													type="radio"
													name="generatic_income"
													value="1"
													checked={(generatic_income==1)?true:false}
													onChange={handleChangeInput}
												/>
												<span className="checkmark"></span>Yes
											</label>
											<label className="contain">
												<input
													className="form-control"
													type="radio"
													name="generatic_income"
													value="0"
													checked={(generatic_income==0)?true:false}
													onChange={handleChangeInput}
												/>
												<span className="checkmark"></span>No
											</label>
										</div>
										<span className="error">{property.data ? property.data.errors.generatic_income : ""}</span>
									</div>
									<div className="mb-3">
										<label className="form-label">Copy of the Propety Deed</label>
										<div className="field" align="left">
											<div className="edit-file-upload">
												<a href={`${propertyDeed}`} target="_blank">
													<img src="/theme/images/samplePdf.png"/>
												</a>
											</div>
										</div>
									</div>
									<div className="mb-3">
										<label className="form-label">
											Percentage of Ownership(In %)
										</label>
										<input
											className="form-control" 
											placeholder="Percentage of Ownership" 
											name="percentageOfOwnership" 
											value={percentageOfOwnership} 
											onChange={handleChangeInput}
										/>
										<span className="error">{property.data ? property.data.errors.percentageOfOwnership : ""}</span>
									</div>
									<div className="mb-3">
										<label className="form-label">Status</label>
										<select className="form-control" name="status" value={status} onChange={handleChangeInput}>
											<option value="">--Select--</option>
											<option value="1">Active</option>
											<option value="0">Inactive</option>
										</select>
										<span className="error">{property.data ? property.data.errors.status : ""}</span>
									</div>
									<div className="mb-3">
										<button type="submit" className="btn">
											Update Property
										</button>
									</div>
								</form>
							) : (
								<div className="addBlockchainFirst">Please Add Proprty Blockchain first!</div>
							)}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default EditProperty;
