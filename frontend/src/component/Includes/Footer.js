import React, { memo } from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer_grid">

        {/* Column 1 — Brand */}
        <div className="footer_brand">
          <Link to="/">
            <img src="/theme/images/logo_white.png" alt="Treasury" style={{ maxWidth: "90px", height: "auto" }} />
          </Link>
          <p className="footer_tagline">
            Tokenizing Saudi real estate.<br />
            Accessible. Transparent. Regulated.
          </p>
        </div>

        {/* Column 2 — Platform */}
        <div className="footer_col">
          <h4 className="footer_col_title">Platform</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/howitwork">How It Works</Link>
          <Link to="/portfolio">Portfolio</Link>
        </div>

        {/* Column 3 — Company */}
        <div className="footer_col">
          <h4 className="footer_col_title">Company</h4>
          <Link to="/blog">Blog</Link>
          <Link to="/contactus">Contact Us</Link>
          <Link to="/privacypolicy">Privacy Policy</Link>
          <Link to="/termsofuse">Terms of Use</Link>
        </div>

        {/* Column 4 — Contact */}
        <div className="footer_col">
          <h4 className="footer_col_title">Contact</h4>
          <a href="mailto:partnerships@treasury.sa">partnerships@treasury.sa</a>
          <span className="footer_address">7076 Al Sahaba Rd., Ishbiliyah<br />Riyadh 13225, Saudi Arabia</span>
        </div>

      </div>

        {/* Social links */}
        <div className="footer_social">
          <a href="https://twitter.com/treasury_sa" target="_blank" rel="noreferrer" aria-label="Twitter/X">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://linkedin.com/company/treasury-sa" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://instagram.com/treasury.sa" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
        </div>

        {/* Bottom bar */}
      <div className="footer_bottom">
        <p>© {new Date().getFullYear()} Treasury. All rights reserved.</p>
        <p className="footer_legal">
          <Link to="/privacypolicy">Privacy Policy</Link>
          <span className="footer_sep">·</span>
          <Link to="/termsofuse">Terms of Use</Link>
        </p>
      </div>
    </div>
  </footer>
);

export default memo(Footer);
