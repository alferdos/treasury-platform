import React, { memo } from "react";
import { Link } from "react-router-dom";
import logo from "../../images/logo_white.png";
// import medium from "../../images/medium.svg";
import TelegramIcon from "@material-ui/icons/Telegram";
const Footer = () => (
	<footer className="footer">
		<div className="container">
			<div className="inner_footer">
			<Link to="/">
				<img src="/theme/images/logo_white.png" style={{maxWidth: '150px', height: 'auto'}} />
			</Link>
				<div className="footer_menu">
					<div>
						<Link to="/about">About</Link>
						<Link to="/howitwork">How it works</Link>
					</div>
					<div>
						<Link to="/blog">Blog</Link>
						<Link to="/contactus">Contact Us</Link>
					</div>
				</div>
			</div>
			<div className="policy_footer">
				<p>
					<Link to="/privacypolicy">Privacy Policy</Link>
					<Link to="/termsofuse">Terms of Use</Link>
				</p>
			</div>
		</div>
	</footer>
);

export default memo(Footer);
