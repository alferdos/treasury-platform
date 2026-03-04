import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDataAPI, postDataAPI } from "../../utils/API";
import { useHistory, Link } from "react-router-dom";

const AdminDashboard = () => {
	return (
		<div>
			<div className="main_content">
				<section className="listing_banner">
					<div className="container">
						<div className="inner_list_banner">
							<div className="banner_content">
								<h1>TREASURY</h1>
								<p>The real estate investment platform for listing, securitizing and trading diversified  real estate opportunities</p>
								<Link to="/admin/createproperty" className="btn3">
									List Property
								</Link>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default AdminDashboard;