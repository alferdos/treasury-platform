import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "./../utils/API";
import { useHistory, Link } from "react-router-dom";
import Header from "./Includes/Header";
import DashboardHeader from "./Includes/DashboardHeader";
import AdminHeader from "./Includes/AdminHeader";
import Footer from "./Includes/Footer";
import { blankProperty } from "../redux/actions/propertyAction";
import RiyalSymbol from "./RiyalSymbol";
import { refreshToken }  from "../redux/actions/authAction";

const Home = () => {
	const dispatch = useDispatch();
	const [data, setData] = useState("");
	const [data1, setData1] = useState("");
	const [data2, setData2] = useState("");
	const [header, setHeader] = useState("guest");
	const { auth } = useSelector((state) => state);
	useEffect(() => {
		if(auth.data){
			let response=auth.data;
			if(response.status==1){
				if(response.user.role!=1){
					setHeader("dashboard");
				}
				else{
					setHeader("admin");
				}
			}
			else{
				setHeader("guest");
			}
		}
		async function getProperty() {
			let d1=[];
			let d2=[];
			const res = await getDataAPI("/get_property?status=1");
			(res.data).forEach(function(property){
				if(parseInt((property.tokenSupply/property.totalTokenSupply)*100)!=100){
					d1.push(property);
				}
				else{
					d2.push(property);
				}
			});
			setData(res.data);
			setData1(d1);
			setData2(d2);
		}
		getProperty();
		dispatch(blankProperty());
		window.scrollTo(0, 0);
	}, [auth, dispatch]);
	return (
		<div>
			{
				(header=="guest")?<Header/>:(header=="dashboard")?<DashboardHeader/>:<AdminHeader/>
			}
			<div className="main_content">
				<section className="listing_banner">
					<div className="container">
						<div className="inner_list_banner">
							<div className="banner_content">
								<h1>TREASURY</h1>
								<p>The real estate investment platform for listing, securitizing and trading diversified  real estate opportunities</p>
								<Link to={(header=="guest")?"/login":(header=="dashboard")?"/dashboard/createproperty":"/admin/createproperty"} className="btn3">
									List Property
								</Link>
							</div>
						</div>
					</div>
				</section>
				<section className="list_latest">
					<div className="container">
						<div className="inner_list_latest">
							<h3 className="text-center">Under Subscriptions</h3>
							{data1==""?(<div><center>Records is empty!</center></div>):(<></>)}
							<div className="list_latest_content">
								{data1!="" ? data1.map((property, i) =>
									(
										<div className="bl_ock" key={i}>
											<div className="bl_ock_img_wrap">
												<Link to={(header=="guest")?`/login`:(header=="dashboard")?`/dashboard/viewproperty/${property._id}`:`/admin/viewproperty/${property._id}`}>
													<img src={`${(property.imageName && property.imageName.length > 0) ? property.imageName[0] : '/img/al_narjes.jpg'}`} alt={property.title} />
												</Link>
												<div className="bl_ock_img_overlay">
													<span className="bl_ock_location">{property.address || 'Riyadh, Saudi Arabia'}</span>
												</div>
											</div>
											<div className="bl_ock_body">
												<h4 className="bl_ock_title">{property.title}</h4>
												<div className="pr">
													<p>Unit Price: <RiyalSymbol />{property.tokenPrice}</p>
													<Link
														to={(header=="guest")?`/login`:(header=="dashboard")?`/dashboard/viewproperty/${property._id}`:`/admin/viewproperty/${property._id}`}
														className="btn">
														Subscribe
													</Link>
												</div>
												<div className="bar">
													<div className="progress">
														<div className="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{maxWidth: `${parseInt((property.tokenSupply/property.totalTokenSupply)*100)}%`}}></div>
													</div>
													<span className="title">{parseInt((property.tokenSupply/property.totalTokenSupply)*100)}%</span>
												</div>
											</div>
										</div>
									)): ""
								}
							</div>
						</div>
						<div className="inner_list_latest">
							<h3 className="text-center">Trades</h3>
							{data2==""?(<div><center>Records is empty!</center></div>):(<></>)}
							<div className="list_latest_content">
								{data2!="" ? data2.map((property, i) =>
									(
										<div className="bl_ock" key={i}>
											<div className="bl_ock_img_wrap">
												<Link to={(header=="guest")?`/login`:(header=="dashboard")?`/dashboard/tradeproperty/${property._id}`:`/admin/tradeproperty/${property._id}`}>
													<img src={`${(property.imageName && property.imageName.length > 0) ? property.imageName[0] : '/img/al_narjes.jpg'}`} alt={property.title} />
												</Link>
												<div className="bl_ock_img_overlay">
													<span className="bl_ock_location">{property.address || 'Riyadh, Saudi Arabia'}</span>
												</div>
											</div>
											<div className="bl_ock_body">
												<h4 className="bl_ock_title">{property.title}</h4>
												<div className="pr">
													<p>Unit Price: <RiyalSymbol />{property.tokenPrice}</p>
													<Link
														to={(header=="guest")?`/login`:(header=="dashboard")?`/dashboard/tradeproperty/${property._id}`:`/admin/tradeproperty/${property._id}`}
														className="btn">
														Trade
													</Link>
												</div>
												<div><span className="closed_badge">Closed</span></div>
											</div>
										</div>
									)): ""
								}
							</div>
						</div>
					</div>
				</section>
			</div>
			<Footer/>
		</div>
	);
};

export default Home;
