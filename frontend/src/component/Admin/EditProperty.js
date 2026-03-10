import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { getDataAPIAuth, postDataAPI } from '../../utils/API';
import { editProperty } from '../../redux/actions/propertyAction';
import CreatePropertyBlockchain from './DeployNewICO';
import RiyalSymbol from '../RiyalSymbol';
import { VIEW_CONTRACT } from '../../utils/config';
import axios from 'axios';

//create property component to write all details from form.

const EditProperty = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const [blockchaindata, setBlockchainData] = useState("");
	const blockchainFetched = React.useRef(false);
	const [newImages, setNewImages] = useState([]);
	const [imageUploading, setImageUploading] = useState(false);
	const [imageUploadMsg, setImageUploadMsg] = useState('');
	const { auth, property, ico } = useSelector((state) => state);
	const token = auth?.data?.accesstoken || auth?.data?.access_token;
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
		getDataAPIAuth("/get_property/" + id, token).then(function(getProperty){
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
			await getDataAPIAuth("/getPropBlockchainData/" + prop._id, token).then(function(blockchainData){
				blockchainData=blockchainData.data[0];
				setBlockchainData(blockchainData);
				if(blockchainData) {
					// Auto-populate contract address from blockchain record
					const autoContractAddress = blockchainData.contractAddress || '';
					// Auto-calculate unit price: estimatedValue * ownership% / totalTokenSupply
					const estValue = prop.propertyEstimatedValue || 0;
					const ownershipPct = prop.percentageOfOwnership || 100;
					const supply = blockchainData.totalTokenSupply || prop.totalTokenSupply || 1;
					const autoUnitPrice = supply > 0 ? Math.round((estValue * ownershipPct / 100) / supply) : 0;
					setPropertyData(prev => ({
						...prev,
						contract_address: prev.contract_address || autoContractAddress,
						tokenPrice: prev.tokenPrice || autoUnitPrice,
					}));
				}
			});
		}
	}
	useEffect(() => {
		if(propertyData._id && !blockchainFetched.current) {
			blockchainFetched.current = true;
			getBlockchain(propertyData);
		}
	}, [propertyData._id]);

	const handleImageUpload = async () => {
		if (!newImages.length) return;
		setImageUploading(true);
		setImageUploadMsg('');
		try {
			const formData = new FormData();
			formData.append('propertyId', propertyData._id);
			newImages.forEach(img => formData.append('images', img));
			const resp = await axios.post('/api/uploadPropertyImages', formData, {
				headers: { 'content-type': 'multipart/form-data' },
			});
			if (resp.data.status === 1) {
				setPropertyData(prev => ({ ...prev, imageName: resp.data.imageName }));
				setNewImages([]);
				setImageUploadMsg('Images updated successfully!');
			} else {
				setImageUploadMsg('Upload failed. Please try again.');
			}
		} catch (e) {
			setImageUploadMsg('Upload error: ' + (e.response?.data?.msg || e.message));
		}
		setImageUploading(false);
	};

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
									{/* Current images */}
									<div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:12}}>
										{imageName && imageName.length > 0 ? imageName.map((img, idx) => (
											<img key={idx} src={img} alt="Property"
												style={{width:160,height:110,objectFit:'cover',borderRadius:8,border:'2px solid #e5e7eb'}}
												onError={(e) => { e.target.style.display='none'; }}
											/>
										)) : <span style={{color:'#999',fontSize:'0.85em'}}>No images yet</span>}
									</div>
									{/* Upload new images */}
									<div style={{border:'2px dashed #d1d5db',borderRadius:10,padding:'16px 20px',background:'#f9fafb'}}>
										<label style={{display:'block',marginBottom:8,fontWeight:600,fontSize:13,color:'#374151'}}>Replace Images</label>
										<input
											type="file"
											multiple
											accept="image/*"
											className="form-control"
											style={{marginBottom:10}}
											onChange={(e) => setNewImages(Array.from(e.target.files))}
										/>
										{newImages.length > 0 && (
											<div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:10}}>
												{newImages.map((f,i) => (
													<img key={i} src={URL.createObjectURL(f)} alt="preview"
														style={{width:100,height:70,objectFit:'cover',borderRadius:6,border:'2px solid #c9a84c'}}/>
												))}
											</div>
										)}
										<button
											type="button"
											onClick={handleImageUpload}
											disabled={imageUploading || newImages.length === 0}
											style={{background: newImages.length === 0 ? '#e5e7eb' : '#0e3725',color: newImages.length === 0 ? '#9ca3af' : '#fff',border:'none',borderRadius:8,padding:'9px 20px',fontWeight:600,fontSize:13,cursor: newImages.length === 0 ? 'not-allowed' : 'pointer'}}
										>
											{imageUploading ? 'Uploading…' : `Upload ${newImages.length > 0 ? `(${newImages.length} file${newImages.length>1?'s':''})` : 'Images'}`}
										</button>
										{imageUploadMsg && (
											<div style={{marginTop:8,fontSize:13,color: imageUploadMsg.includes('success') ? '#065f46' : '#991b1b',fontWeight:600}}>
												{imageUploadMsg}
											</div>
										)}
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
