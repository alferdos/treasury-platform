import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import { refreshToken } from "../../redux/actions/authAction";
import { postDataAPIBare } from "../../utils/API";

const inputStyle = {
  width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 9,
  fontSize: 14, color: "#111827", background: "#f9fafb", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const labelStyle = { fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 };
const cardStyle = { background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 };

const Profile = () => {
  const dispatch = useDispatch();
  const [authuser, setAuthUser] = useState({});
  const [errors, setErrors] = useState({});
  const [showUpload, setShowUpload] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { auth } = useSelector((state) => state);

  useEffect(() => {
    if (auth.data?.status === 1) {
      const u = auth.data.user;
      setAuthUser({ ...u, phone_no: u.phone_no ? u.phone_no.toString().slice(2) : "" });
    }
  }, [auth]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setAuthUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { name, email, national_id, phone_no, new_password, repeat_password } = e.target.elements;
    try {
      const res = await postDataAPIBare("update_profile", {
        user_id: auth.data?.user._id,
        name: name.value, email: email.value, national_id: national_id.value,
        phone_no: phone_no.value, new_password: new_password.value, repeat_password: repeat_password.value,
      });
      if (res.data.status === 0) setErrors(res.data.errors || {});
      else { swal("Success", "Profile updated successfully!", "success"); setErrors({}); }
    } catch { swal("Error", "Failed to update profile", "error"); }
    setSaving(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { swal("Warning", "Image must be under 2MB", "warning"); return; }
    setImage(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("user_id", auth.data?.user._id);
    try {
      const res = await postDataAPIBare("update_profilePic", formData);
      if (res.data.status === 1) {
        dispatch(refreshToken());
        setShowUpload(false);
        setImage(null);
        swal("Success", "Profile picture updated!", "success");
      }
    } catch { swal("Error", "Upload failed", "error"); }
    setUploading(false);
  };

  const user = auth.data?.user || {};
  // Support both Cloudinary URLs (http) and legacy local paths
  const avatarSrc = user.profile_image
    ? (user.profile_image.startsWith("http") ? user.profile_image : `/profilePic/${user.profile_image}`)
    : null;
  const initials = (user.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>My Profile</h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>Manage your personal information and security settings</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left — Avatar Card */}
        <div>
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt={user.name} style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid #f0e9d6" }} />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #0e3725, #1a5c3a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#c9a84c", margin: "0 auto" }}>
                  {initials}
                </div>
              )}
              <button onClick={() => setShowUpload(true)} style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%", background: "#c9a84c", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>{user.name || "—"}</h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>{user.email || "—"}</p>
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#374151", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#9ca3af" }}>National ID</span>
                <span style={{ fontWeight: 600 }}>{user.national_id || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#9ca3af" }}>Phone</span>
                <span style={{ fontWeight: 600 }}>+966 05{user.phone_no || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9ca3af" }}>Wallet</span>
                <span style={{ fontWeight: 600, fontSize: 11, color: user.walletAddress ? "#059669" : "#9ca3af" }}>
                  {user.walletAddress ? `${user.walletAddress.slice(0, 8)}…` : "Not set"}
                </span>
              </div>
            </div>
            <Link to="transactions" style={{ display: "block", marginTop: 14, padding: "10px", background: "linear-gradient(135deg, #0e3725, #1a5c3a)", color: "#c9a84c", borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
              View Transactions →
            </Link>
          </div>

          {/* Balance Card */}
          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #0e3725, #1a5c3a)" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Available Balance</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#c9a84c", margin: "0 0 4px" }}>
              ﷼ {(user.totalBalance || 0).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>Saudi Riyal</p>
          </div>
        </div>

        {/* Right — Edit Form */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 20px", paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
            Personal Information
          </h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="name" type="text" value={authuser.name || ""} onChange={handleInput} style={inputStyle} placeholder="Full Name" />
                {errors.name && <span style={{ fontSize: 12, color: "#ef4444" }}>{errors.name}</span>}
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input name="email" type="email" value={authuser.email || ""} onChange={handleInput} style={inputStyle} placeholder="Email" />
                {errors.email && <span style={{ fontSize: 12, color: "#ef4444" }}>{errors.email}</span>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>National ID</label>
                <input name="national_id" type="text" value={authuser.national_id || ""} onChange={handleInput} style={inputStyle} placeholder="XXXXXXXXXX" />
                {errors.national_id && <span style={{ fontSize: 12, color: "#ef4444" }}>{errors.national_id}</span>}
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ ...inputStyle, width: 72, flexShrink: 0, background: "#f3f4f6", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>+966 05</div>
                  <input name="phone_no" type="number" value={authuser.phone_no || ""} onChange={handleInput} style={{ ...inputStyle, flex: 1 }} placeholder="XXXXXXXX" />
                </div>
                {errors.phone_no && <span style={{ fontSize: 12, color: "#ef4444" }}>{errors.phone_no}</span>}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20, marginTop: 4 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 16px" }}>Change Password</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input name="new_password" type="password" style={inputStyle} placeholder="Leave blank to keep current" />
                  {errors.new_password && <span style={{ fontSize: 12, color: "#ef4444" }}>{errors.new_password}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input name="repeat_password" type="password" style={inputStyle} placeholder="Repeat new password" />
                  {errors.repeat_password && <span style={{ fontSize: 12, color: "#ef4444" }}>{errors.repeat_password}</span>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button type="submit" disabled={saving} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #c9a84c, #a07a20)", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Update Profile Picture</h3>
              <button onClick={() => { setShowUpload(false); setImage(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleUpload}>
              <div style={{ border: "2px dashed #e5e7eb", borderRadius: 10, padding: "24px", textAlign: "center", marginBottom: 16, background: "#f9fafb" }}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="profile-pic-input" />
                <label htmlFor="profile-pic-input" style={{ cursor: "pointer" }}>
                  {image ? (
                    <div>
                      <img src={URL.createObjectURL(image)} alt="Preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px" }} />
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{image.name}</p>
                    </div>
                  ) : (
                    <div>
                      <svg width="32" height="32" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 8px", display: "block" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Click to select image (max 2MB)</p>
                    </div>
                  )}
                </label>
              </div>
              <button type="submit" disabled={!image || uploading} style={{ width: "100%", padding: "12px", background: image ? "linear-gradient(135deg, #c9a84c, #a07a20)" : "#e5e7eb", color: image ? "#fff" : "#9ca3af", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: image ? "pointer" : "not-allowed" }}>
                {uploading ? "Uploading…" : "Upload Picture"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
