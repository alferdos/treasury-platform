import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { register } from "../../redux/actions/authAction";

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 14,
  color: "#111827",
  background: "#f9fafb",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};
const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const errorStyle = { fontSize: 12, color: "#ef4444", marginTop: 4, display: "block", minHeight: 18 };

const Register = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [checkBox, setCheckBox] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState("");
  const { auth } = useSelector((state) => state);

  if (auth.data) {
    const response = auth.data;
    if (response.status == 1 && response.action == "register") {
      history.push("/login");
    }
  }

  const validate = (name, value) => {
    const errs = { ...errors };
    if (name === "name") {
      if (!value) errs.name = "Full name is required";
      else if (!/^[A-Za-z\s]+$/.test(value)) errs.name = "Only letters allowed";
      else delete errs.name;
    }
    if (name === "email") {
      if (!value) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errs.email = "Enter a valid email address";
      else delete errs.email;
    }
    if (name === "national_id") {
      if (!value) errs.national_id = "National ID is required";
      else if (value.length < 3 || value.length > 10) errs.national_id = "ID must be 3–10 characters";
      else delete errs.national_id;
    }
    if (name === "phone_no") {
      if (!value) errs.phone_no = "Phone number is required";
      else if (value.length !== 8) errs.phone_no = "Must be exactly 8 digits";
      else delete errs.phone_no;
    }
    if (name === "password") {
      if (!value) errs.password = "Password is required";
      else if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/.test(value))
        errs.password = "Min 8 chars with uppercase, number, and special character";
      else delete errs.password;
    }
    if (name === "repeat_password") {
      const pwd = document.querySelector('[name="password"]')?.value || "";
      if (!value) errs.repeat_password = "Please confirm your password";
      else if (value !== pwd) errs.repeat_password = "Passwords do not match";
      else delete errs.repeat_password;
    }
    setErrors(errs);
  };

  const handleChange = (e) => validate(e.target.name, e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, national_id, phone_no, password, repeat_password } = e.target.elements;
    dispatch(register({ name: name.value, email: email.value, national_id: national_id.value, phone_no: phone_no.value, password: password.value, repeat_password: repeat_password.value }));
  };

  const serverErrors = auth.data?.errors || {};

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f8f9fa" }}>
      {/* Left Panel */}
      <div style={{ flex: 1, background: "linear-gradient(160deg, #0e3725 0%, #1a5c3a 60%, #c9a84c 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 40px", minHeight: "100vh" }} className="register-left-panel">
        <Link to="/">
          <img src="/theme/images/logo.png" alt="Treasury" style={{ height: 56, marginBottom: 32, filter: "brightness(0) invert(1)" }} />
        </Link>
        <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, textAlign: "center", margin: "0 0 16px", lineHeight: 1.2 }}>
          Start Your Investment Journey
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, textAlign: "center", maxWidth: 340, lineHeight: 1.7, margin: "0 0 40px" }}>
          Join thousands of investors accessing fractional ownership in premium Saudi real estate assets.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 320 }}>
          {[
            { icon: "🏢", title: "Premium Properties", desc: "Curated, tokenized real estate assets" },
            { icon: "⛓️", title: "Blockchain Secured", desc: "BEP-20 tokens on BSC network" },
            { icon: "📊", title: "Transparent Returns", desc: "Real-time portfolio tracking" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 18px", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{f.title}</div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Create Account</h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#c9a84c", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </div>

          {auth.data?.status === 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#dc2626" }}>
              {auth.data?.errors?.message || "Registration failed. Please check your details."}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input name="name" type="text" placeholder="e.g. Faisal Alferdos" style={{ ...inputStyle, borderColor: focusedField === "name" ? "#c9a84c" : errors.name ? "#ef4444" : "#e5e7eb" }}
                onChange={handleChange} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField("")} />
              <span style={errorStyle}>{errors.name || serverErrors.name}</span>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com" style={{ ...inputStyle, borderColor: focusedField === "email" ? "#c9a84c" : errors.email ? "#ef4444" : "#e5e7eb" }}
                onChange={handleChange} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField("")} />
              <span style={errorStyle}>{errors.email || serverErrors.email}</span>
            </div>

            {/* National ID */}
            <div>
              <label style={labelStyle}>National ID (Iqama / Saudi ID)</label>
              <input name="national_id" type="text" placeholder="XXXXXXXXXX" style={{ ...inputStyle, borderColor: focusedField === "national_id" ? "#c9a84c" : errors.national_id ? "#ef4444" : "#e5e7eb" }}
                onChange={handleChange} onFocus={() => setFocusedField("national_id")} onBlur={() => setFocusedField("")} />
              <span style={errorStyle}>{errors.national_id || serverErrors.national_id}</span>
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ ...inputStyle, width: 90, flexShrink: 0, background: "#f3f4f6", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>
                  +966 05
                </div>
                <input name="phone_no" type="number" placeholder="XXXXXXXX" style={{ ...inputStyle, flex: 1, borderColor: focusedField === "phone_no" ? "#c9a84c" : errors.phone_no ? "#ef4444" : "#e5e7eb" }}
                  onChange={handleChange} onFocus={() => setFocusedField("phone_no")} onBlur={() => setFocusedField("")} />
              </div>
              <span style={errorStyle}>{errors.phone_no || serverErrors.phone_no}</span>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input name="password" type={showPass ? "text" : "password"} placeholder="Min 8 chars, uppercase, number, symbol"
                  style={{ ...inputStyle, paddingRight: 44, borderColor: focusedField === "password" ? "#c9a84c" : errors.password ? "#ef4444" : "#e5e7eb" }}
                  onChange={handleChange} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField("")} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
                  {showPass ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <span style={errorStyle}>{errors.password || serverErrors.password}</span>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input name="repeat_password" type="password" placeholder="Re-enter your password"
                style={{ ...inputStyle, borderColor: focusedField === "repeat_password" ? "#c9a84c" : errors.repeat_password ? "#ef4444" : "#e5e7eb" }}
                onChange={handleChange} onFocus={() => setFocusedField("repeat_password")} onBlur={() => setFocusedField("")} />
              <span style={errorStyle}>{errors.repeat_password || serverErrors.repeat_password}</span>
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              <input type="checkbox" checked={checkBox} onChange={(e) => setCheckBox(e.target.checked)}
                style={{ marginTop: 2, accentColor: "#c9a84c", width: 16, height: 16, flexShrink: 0 }} />
              I agree to the{" "}
              <Link to="/terms" style={{ color: "#c9a84c", textDecoration: "none", fontWeight: 600 }}>Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" style={{ color: "#c9a84c", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>
            </label>

            {/* Submit */}
            <button type="submit" disabled={!checkBox}
              style={{ width: "100%", padding: "14px", background: checkBox ? "linear-gradient(135deg, #c9a84c, #a07a20)" : "#e5e7eb", color: checkBox ? "#fff" : "#9ca3af", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: checkBox ? "pointer" : "not-allowed", transition: "all 0.2s", marginTop: 4 }}>
              Create Account
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .register-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Register;
