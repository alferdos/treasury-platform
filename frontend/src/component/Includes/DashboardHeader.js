import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import swal from "sweetalert";
import { useHistory, Link, NavLink } from "react-router-dom";
import i from "../../images/Logo.png";
import { logout } from "../../redux/actions/authAction";
import "react-toastify/dist/ReactToastify.css";

//admin header component.
const DashboardHeader = () => {
  const history = useHistory();
  const { auth } = useSelector((state) => state);
  // console.log(auth, "authauthauth")
  if (auth.data) {
    var response = auth.data;
    if (response.status == 1 && response.action == "logout") {
      response.user = { name: "" }; // 🟡 direct mutation of app state!
      swal("Success", "You have successfully logout!", "success");
      history.push("/login");
    }
  }
  const dispatch = useDispatch();

  const currentPathName = window.location.pathname;

  return (
    <header>
      <nav
        className="navbar navbar-expand-lg text-uppercase fixed-top"
        id="mainNav"
      >
        <div className="container">
          <Link className="navbar-brand" to="/" onclick={() => window.location.reload()}>
            <img src={i} />
          </Link>
          <button
            className="navbar-toggler text-uppercase font-weight-bold rounded"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item mx-0 mx-lg-1">
                <Link
                  className={`nav-link py-3 px-0 px-lg-3 rounded ${
                    currentPathName == "/about" ? "btn" : ""
                  }`}
                  to="/about"
                >
                  About
                </Link>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <Link
                  className={`nav-link py-3 px-0 px-lg-3 rounded ${
                    currentPathName == "/howitwork" ? "btn" : ""
                  }`}
                  to="/howitwork"
                >
                  How it works
                </Link>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <Link
                  className={`nav-link py-3 px-0 px-lg-3 rounded ${
                    currentPathName == "/blog" ? "btn" : ""
                  }`}
                  to="/blog"
                >
                  Blog
                </Link>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <Link
                  className={`nav-link py-3 px-0 px-lg-3 rounded ${
                    currentPathName == "/contactus" ? "btn" : ""
                  }`}
                  to="/contactus"
                >
                  Contact Us
                </Link>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <Link
                  className={`nav-link py-3 px-0 px-lg-3 rounded ${
                    currentPathName == "/dashboard/transactions" ? "btn" : ""
                  }`}
                  to={`/dashboard/transactions`}
                >
                  Portfolio
                </Link>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <Link
                  className={`nav-link py-3 px-0 px-lg-3 rounded ${
                    currentPathName == "#" ? "btn" : ""
                  }`}
                  to="#"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </Link>
              </li>
              <li className="nav-item mx-0 mx-lg-1">
                <Link
                  className="nav-link py-3 px-0 px-lg-3 rounded profile"
                  to="/dashboard/profile"
                >
                  <img
                    src={auth.data?.user?.profile_image && auth.data.user.profile_image.startsWith('http')
                      ? auth.data.user.profile_image
                      : `https://res.cloudinary.com/dfzwynbsl/image/upload/w_40,h_40,c_fill,r_max,co_rgb:f8b602,l_text:Arial_20_bold:${(auth.data?.user?.name || 'U').charAt(0).toUpperCase()}/fl_layer_apply/v1773045169/avatar_base.png`}
                    onError={e => { e.target.src = `https://res.cloudinary.com/dfzwynbsl/image/upload/w_40,h_40,c_fill,r_max,co_rgb:f8b602,l_text:Arial_20_bold:U/fl_layer_apply/v1773045169/avatar_base.png`; }}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', marginRight: '6px' }}
                    alt="profile"
                  />
                  Welcome, {auth.data ? auth.data.user.name.split(" ")[0] : ""}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DashboardHeader;
