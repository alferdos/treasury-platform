import { BrowserRouter as Router, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { refreshToken } from "./redux/actions/authAction";
import { useEffect, memo } from "react";
import "./App.css";
import { useHistory } from 'react-router-dom';
import AuthLayout from "./component/Layouts/AuthLayout";
import AdminAuthLayout from "./component/Layouts/AdminAuthLayout";
import DashboardLayout from "./component/Layouts/DashboardLayout";
import AdminLayout from "./component/Layouts/AdminLayout";

import Notify from "./component/Common/Notify";
import Home from "./component/Home";
import About from "./component/About";
import HowItWork from "./component/HowItWork";
import Blog from "./component/Blog";
import ContactUs from "./component/ContactUs";
import TermsOfUse from "./component/TermsOfUse";
import PrivacyPolicy from "./component/PrivacyPolicy";
import ImageView from "./component/ImageView";

function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(refreshToken());
	}, [dispatch]);

	return (
		<Router>
			<div className="App"> 
				<Notify />
				<Route path="/" exact component={Home} />
				<Route component={AuthLayout} path="/login" exact/>
				<Route component={AuthLayout} path="/register" exact/>
				<Route component={AuthLayout} path="/forgotPassword" exact/>
				
				<Route path="/about" exact component={About} />
				<Route path="/howitwork" exact component={HowItWork} />
				<Route path="/blog" exact component={Blog} />
				<Route path="/contactus" exact component={ContactUs} />
				<Route path="/termsofuse" exact component={TermsOfUse} />
				<Route path="/privacypolicy" exact component={PrivacyPolicy} />

				<Route path="/invoice/:imageName"  component={ImageView} />


				<Route component={DashboardLayout} path="/dashboard/profile" exact/>
				<Route component={DashboardLayout} path="/dashboard/createproperty" exact/>
				<Route component={DashboardLayout} path="/dashboard/viewproperty/:id" exact/>
				<Route component={DashboardLayout} path="/dashboard/tradeproperty/:id" exact/>
				<Route component={DashboardLayout} path="/dashboard/transactions" exact/>

				<Route component={AdminAuthLayout} path="/admin/login" exact/>

				<Route component={AdminLayout} path="/admin/dashboard" exact/>
				<Route component={AdminLayout} path="/admin/profile" exact/>
				<Route component={AdminLayout} path="/admin/createproperty" exact/>
				<Route component={AdminLayout} path="/admin/viewproperty/:id" exact/>
				<Route component={AdminLayout} path="/admin/tradeproperty/:id" exact/>
				<Route component={AdminLayout} path="/admin/transactions" exact/>
				<Route component={AdminLayout} path="/admin/blockchaindata" exact/>
				<Route component={AdminLayout} path="/admin/users" exact/>
				<Route component={AdminLayout} path="/admin/requestFund" exact/>
				<Route component={AdminLayout} path="/admin/properties" exact/>
				<Route component={AdminLayout} path="/admin/property/:id" exact/>
				<Route component={AdminLayout} path="/admin/user/:userId" exact/>


			</div>
		</Router>
	);
}

export default memo(App);
