import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, Link, useHistory } from "react-router-dom";

import AdminDashboard from "../Admin/AdminDashboard";
import Profile from "../Dashboard/Profile";
import CreateProperty from "../Dashboard/CreateProperty";
import ViewProperty from "../Dashboard/ViewProperty";
import TradeProperty from "../Dashboard/TradeProperty";
import Transactions from "../Dashboard/Transactions";
import BlockchainData from "../Admin/BlockchainData";
import Users from "../Admin/Users";
import RequestFund from "../Admin/RequestFund";
import AdminProperties from "../Admin/AdminProperties";
import EditProperty from "../Admin/EditProperty";


//admin layout component
const DashboardLayout = () => {
	let history = useHistory();
	const { auth } = useSelector((state) => state);
    useEffect(() => {
		if(auth.data){
			let response=auth.data;
			if(response.status==0){
				history.push("/admin/login");
			}
			else{
				if(response.user.role!=1){
					history.push("/");
				}
			}
		}
		window.scrollTo(0, 0);
    }, [auth]);
	return (
		<div>
		<Switch>
					<Route exact path="/admin/dashboard">
						<AdminDashboard />
					</Route>
					<Route exact path="/admin/profile">
						<Profile />
					</Route>
					<Route exact path="/admin/createproperty">
						<CreateProperty />
					</Route>
					<Route exact path="/admin/viewproperty/:id">
						<ViewProperty />
					</Route>
					<Route exact path="/admin/tradeproperty/:id">
						<TradeProperty />
					</Route>
					<Route exact path="/admin/transactions">
						<Transactions />
					</Route>
					<Route exact path="/admin/blockchaindata">
						<BlockchainData />
					</Route>
					<Route exact path="/admin/users">
						<Users />
					</Route>
					<Route exact path="/admin/requestFund">
						<RequestFund />
					</Route>
					<Route exact path="/admin/properties">
						<AdminProperties />
					</Route>
					<Route exact path="/admin/property/:id">
						<EditProperty />
					</Route>
		</Switch>
		</div>
	);
};

export default DashboardLayout;
