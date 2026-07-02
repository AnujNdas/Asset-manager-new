import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwal from "../utils/swalTheme";
import axiosInstance from "../Services/axiosInstance";
import Loader from "../Components/Loader";
import "../Page_styles/MyProfile.css";
import profile from "../Images/default_profile.png";
const MyProfile = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    profileTitle: "",
    phone: "",
    currency: "", // default
    organizationName: "",
    organizationType: "",
    department: "",
    designation: "",
    workEmail: "",

    country: "",
    city: "",
    officeLocation: "",
  });
  useEffect(() => {
  return () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
  };
}, [avatarPreview]);
  // -----------------------------
  // Fetch user profile
  // -----------------------------
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/user/me");

const userData = res.data.user;
const organizationData = res.data.organization;

setUser(userData);
setOrganization(organizationData);

setFormData({
  // User
  fullName: userData.fullName || "",
  profileTitle: userData.profileTitle || "",
  phone: userData.phone || "",

  department: userData.department || "",
  designation: userData.designation || "",
  workEmail: userData.workEmail || "",

  // Organization
  organizationName: organizationData?.name || "",
  organizationType:
    organizationData?.organizationType || "",
  currency:
    organizationData?.currency || "USD",

  country:
    organizationData?.country || "",
  city:
    organizationData?.city || "",
  officeLocation:
    organizationData?.officeLocation || "",
});
    } catch (err) {
      console.error("Profile fetch failed:", err);
      // ❌ DO NOT force redirect here
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);


  // -----------------------------
  // Handlers
  // -----------------------------
  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (avatarFile) data.append("avatar", avatarFile);

      const res = await axiosInstance.put("/user/update", data);

      setUser(res.data.user);
      setOrganization(res.data.organization);
      setAvatarFile(null);
      const auth = JSON.parse(localStorage.getItem("auth"));

localStorage.setItem(
  "auth",
  JSON.stringify({
    ...auth,
    user: res.data.user,
    organization: res.data.organization,
  })
);
      ThemeSwal.fire("Updated", "Profile updated successfully", "success");
    } catch (err) {
      ThemeSwal.fire("Error", "Profile update failed", "error");
      console.log("Profile update error:", err);
    } finally {
      setSaving(false);
    }
  };
  const canManageOrganization =
  user?.role === "admin" ||
  user?.role === "super-admin";
  if (loading) return <Loader />;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="profile-container">
      {/* <h2 className="profile-title">My Profile</h2> */}

      {/* Avatar Section */}
      {/* Avatar Section */}
<div className="profile-avatar-section">
<div className="avatar-wrapper">
  <img
    src={avatarPreview || user?.avatar?.url || profile}
    alt="Profile"
    className="profile-avatar"
    onError={(e) => {
      e.currentTarget.src = "/default-avatar.png";
    }}
  />

  {/* Hidden file input */}
  <input
    type="file"
    accept="image/*"
    id="avatarUpload"
    hidden
    onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  setAvatarFile(file);
  setAvatarPreview(URL.createObjectURL(file));
}}
  />

  {/* Edit button */}
  <label htmlFor="avatarUpload" className="avatar-edit-btn">
    ✏️
  </label>
</div>


  <small>Upload a square image for best results</small>
</div>


      {/* Personal Info */}
      <section className="profile-section">
        <h3>Personal Information</h3>

        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
        />

        <input
          name="profileTitle"
          value={formData.profileTitle}
          onChange={handleChange}
          placeholder="Profile Title (e.g. Frontend Developer)"
        />

        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
        />
      </section>

      {/* Organization */}
      <section className="profile-section">
        <h3>Organization</h3>

        <input
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="Organization Name"
        />

        <select
          name="organizationType"
          disabled={!canManageOrganization} 
          value={formData.organizationType}
          onChange={handleChange}
        >
          <option value="">Organization Type</option>
          <option value="Startup">Startup</option>
          <option value="Enterprise">Enterprise</option>
          <option value="Agency">Agency</option>
          <option value="NGO">NGO</option>
          <option value="Other">Other</option>
        </select>
        <select
  name="currency"
  value={formData.currency}
  onChange={handleChange}
>
  <option value="USD">USD - US Dollar</option>
  <option value="EUR">EUR - Euro</option>
  <option value="GBP">GBP - British Pound</option>
  <option value="INR">INR - Indian Rupee</option>
  <option value="JPY">JPY - Japanese Yen</option>
  <option value="AUD">AUD - Australian Dollar</option>
  <option value="CAD">CAD - Canadian Dollar</option>
  <option value="CHF">CHF - Swiss Franc</option>
  <option value="CNY">CNY - Chinese Yuan</option>
  <option value="SGD">SGD - Singapore Dollar</option>
  <option value="AED">AED - UAE Dirham</option>
</select>
        <input
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Department"
        />

        <input
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Designation"
        />

        <input
          name="workEmail"
          value={formData.workEmail}
          onChange={handleChange}
          placeholder="Work Email"
        />
      </section>

      {/* Location */}
      <section className="profile-section">
        <h3>Location</h3>

        <input
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Country"
        />

        <input
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="City"
        />

        <input
          name="officeLocation"
          value={formData.officeLocation}
          onChange={handleChange}
          placeholder="Office Location"
        />
      </section>

      {/* Save */}
      <div className="profile-actions">
        <button
          className="btn primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
