import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwal from "../utils/swalTheme";
import axiosInstance from "../Services/axiosInstance";
import Loader from "../Components/Loader";
import "../Page_styles/MyProfile.css";
import {
  FiCamera,
  FiUserCheck,
  FiInfo,
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiSave,
  FiLoader,
} from "react-icons/fi";
import profile from "../Images/default_profile.png";
import { useOrganization } from "../Context/OrganizationContext";

const MyProfile = () => {
  const { organization, setOrganization } = useOrganization();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
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

// Update the global context
setOrganization(res.data.organization);

setAvatarFile(null);

ThemeSwal.fire(
  "Updated",
  "Profile updated successfully",
  "success"
);
    } catch (err) {
      ThemeSwal.fire("Error", "Profile update failed", "error");
      console.log("Profile update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = async (e) => {
  const newCurrency = e.target.value;

  // No change
  if (newCurrency === formData.currency) return;

  const result = await ThemeSwal.fire({
    title: "Change Organization Currency?",
    html: `
      <div style="text-align:left">
        <p><strong>This change affects your entire organization.</strong></p>
        <br/>
        <ul style="padding-left:20px">
          <li>All monetary values will be displayed in <b>${newCurrency}</b>.</li>
          <li>Existing asset costs will automatically use the new organization currency.</li>
          <li>This change is visible to all users in your organization.</li>
        </ul>
        <br/>
        <p>Do you want to continue?</p>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Change Currency",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  setFormData((prev) => ({
    ...prev,
    currency: newCurrency,
  }));
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

  {/* ==========================================
      PROFILE HEADER / AVATAR
  ========================================== */}

  <div className="profile-avatar-section">

    <div className="profile-avatar-content">

      <div className="avatar-wrapper">

        <img
          src={avatarPreview || user?.avatar?.url || profile}
          alt="Profile"
          className="profile-avatar"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/default-avatar.png";
          }}
        />

        <input
          type="file"
          accept="image/*"
          id="avatarUpload"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
          }}
        />

        <label
          htmlFor="avatarUpload"
          className="avatar-edit-btn"
          title="Change profile photo"
          aria-label="Change profile photo"
        >
          <FiCamera />
        </label>

      </div>


      <div className="profile-avatar-info">

        <div className="profile-avatar-title-row">

          <h3>
            {formData.fullName || "My Profile"}
          </h3>

          <span className="profile-account-badge">
            <FiUserCheck />
            Account
          </span>

        </div>

        <p className="profile-avatar-subtitle">
          {formData.profileTitle ||
            "Manage your personal and professional information"}
        </p>

        <span className="profile-avatar-hint">
          <FiInfo />
          Upload a square image for best results
        </span>

      </div>

    </div>

  </div>


  {/* ==========================================
      PERSONAL INFORMATION
  ========================================== */}

  <section className="profile-section">

    <div className="profile-section-header">

      <div className="profile-section-heading">

        <span className="profile-section-icon">
          <FiUser />
        </span>

        <div>
          <h3>Personal Information</h3>
          <p>Update your personal and contact details.</p>
        </div>

      </div>

    </div>


    <div className="profile-fields-grid">

      <div className="profile-field">

        <label htmlFor="profile-fullName">
          Full Name
        </label>

        <input
          id="profile-fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
        />

      </div>


      <div className="profile-field">

        <label htmlFor="profile-profileTitle">
          Profile Title
        </label>

        <input
          id="profile-profileTitle"
          name="profileTitle"
          value={formData.profileTitle}
          onChange={handleChange}
          placeholder="e.g. Frontend Developer"
        />

      </div>


      <div className="profile-field">

        <label htmlFor="profile-phone">
          Phone Number
        </label>

        <input
          id="profile-phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          autoComplete="tel"
        />

      </div>

    </div>

  </section>


  {/* ==========================================
      ORGANIZATION INFORMATION
  ========================================== */}

  <section className="profile-section">

    <div className="profile-section-header">

      <div className="profile-section-heading">

        <span className="profile-section-icon">
          <FiBriefcase />
        </span>

        <div>
          <h3>Organization Information</h3>
          <p>Manage organization and professional details.</p>
        </div>

      </div>

    </div>


    <div className="profile-fields-grid">

      {/* ORGANIZATION NAME */}

      <div className="profile-field">

        <label htmlFor="profile-organizationName">
          Organization Name
        </label>

        <input
          id="profile-organizationName"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="Enter organization name"
        />

      </div>


      {/* ORGANIZATION TYPE */}

      <div className="profile-field">

        <label htmlFor="profile-organizationType">
          Organization Type
        </label>

        <select
          id="profile-organizationType"
          name="organizationType"
          disabled={!canManageOrganization}
          value={formData.organizationType}
          onChange={handleChange}
        >
          <option value="">Select organization type</option>
          <option value="Startup">Startup</option>
          <option value="Enterprise">Enterprise</option>
          <option value="Agency">Agency</option>
          <option value="NGO">NGO</option>
          <option value="Other">Other</option>
        </select>

      </div>


      {/* CURRENCY */}

      <div className="profile-field">

        <label htmlFor="profile-currency">
          Organization Currency
        </label>

        <select
          id="profile-currency"
          name="currency"
          value={formData.currency}
          onChange={handleCurrencyChange}
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

      </div>


      {/* DEPARTMENT */}

      <div className="profile-field">

        <label htmlFor="profile-department">
          Department
        </label>

        <input
          id="profile-department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Enter department"
        />

      </div>


      {/* DESIGNATION */}

      <div className="profile-field">

        <label htmlFor="profile-designation">
          Designation
        </label>

        <input
          id="profile-designation"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Enter designation"
        />

      </div>


      {/* WORK EMAIL */}

      <div className="profile-field">

        <label htmlFor="profile-workEmail">
          Work Email
        </label>

        <input
          id="profile-workEmail"
          name="workEmail"
          type="email"
          value={formData.workEmail}
          onChange={handleChange}
          placeholder="Enter work email"
          autoComplete="email"
        />

      </div>

    </div>

  </section>


  {/* ==========================================
      LOCATION INFORMATION
  ========================================== */}

  <section className="profile-section">

    <div className="profile-section-header">

      <div className="profile-section-heading">

        <span className="profile-section-icon">
          <FiMapPin />
        </span>

        <div>
          <h3>Location Information</h3>
          <p>Update your organization's location details.</p>
        </div>

      </div>

    </div>


    <div className="profile-fields-grid">

      <div className="profile-field">

        <label htmlFor="profile-country">
          Country
        </label>

        <input
          id="profile-country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Enter country"
          autoComplete="country-name"
        />

      </div>


      <div className="profile-field">

        <label htmlFor="profile-city">
          City
        </label>

        <input
          id="profile-city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Enter city"
          autoComplete="address-level2"
        />

      </div>


      <div className="profile-field">

        <label htmlFor="profile-officeLocation">
          Office Location
        </label>

        <input
          id="profile-officeLocation"
          name="officeLocation"
          value={formData.officeLocation}
          onChange={handleChange}
          placeholder="Enter office location"
        />

      </div>

    </div>

  </section>


  {/* ==========================================
      SAVE ACTIONS
  ========================================== */}

  <div className="profile-actions">

    <div className="profile-actions-info">

      <FiInfo />

      <span>
        Save your changes to update your profile information.
      </span>

    </div>


    <button
      type="button"
      className="btn primary profile-save-btn"
      onClick={handleSave}
      disabled={saving}
    >

      {saving ? (
        <>
          <FiLoader className="profile-loading-icon" />
          Saving...
        </>
      ) : (
        <>
          <FiSave />
          Save Changes
        </>
      )}

    </button>

  </div>

</div>

  );
};

export default MyProfile;
