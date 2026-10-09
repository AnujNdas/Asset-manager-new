import React , { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import "../Page_styles/Security.css"
import ThemeSwal from '../utils/swalTheme'
import {
  FiShield,
  FiLock,
  FiInfo,
  FiAlertTriangle,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";
import AuthService from '../Services/AuthService'
const Security = () => {
  const navigate = useNavigate()
    const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
const handleResetData = async () => {
  try {
    // STEP 1: RESET keyword confirmation
    const { value: confirmText } = await ThemeSwal.fire({
      title: "Confirm System Reset",
      html: `
        <p style="font-size:14px;">
          This will permanently delete all organization data.
        </p>
        <p style="margin-top:10px;">
          Type <b>RESET</b> to continue.
        </p>
      `,
      input: "text",
      inputPlaceholder: "Type RESET",
      showCancelButton: true,
      confirmButtonText: "Continue",
      confirmButtonColor: "#d32f2f",
      customClass: {
        confirmButton: "custom-confirm-btn",
        cancelButton: "custom-cancel-btn"
      },
      preConfirm: (value) => {
        if (value !== "RESET") {
          ThemeSwal.showValidationMessage("You must type RESET exactly");
        }
        return value;
      }
    });

    if (!confirmText) return;

    // STEP 2: FETCH RESET PREVIEW
    const previewRes = await AuthService.getResetPreview();
    console.log("Reset Preview:", previewRes);
    await ThemeSwal.fire({
      title: "Reset Preview",
      icon: "warning",
      html: `
        <ul style="text-align:left;font-size:14px;">
          <li><b>Hardware Assets:</b> ${previewRes.preview.assets}</li>
          <li><b>Assignments:</b> ${previewRes.preview.assignments}</li>
          <li><b>Support Tickets:</b> ${previewRes.preview.tickets}</li>
          <li><b>Software Assets:</b> ${previewRes.preview.softwareAssets}</li>
          <li><b>Categories:</b> ${previewRes.preview.categories}</li>
          <li><b>Locations:</b> ${previewRes.preview.locations}</li>
          <li><b>Status:</b> ${previewRes.preview.statuses}</li>
          <li><b>Units:</b> ${previewRes.preview.units}</li>
          <li><b>Units:</b> ${previewRes.preview.units}</li>
          <li><b>Departments:</b> ${previewRes.preview.departments}</li>
          <li><b>Team Members:</b> ${previewRes.preview.employees}</li>
        </ul>
        <p style="margin-top:10px;color:#d32f2f;">
          This action cannot be undone.
        </p>
      `,
      confirmButtonText: "Continue",
      confirmButtonColor: "#d32f2f",
      showCancelButton: true,
        customClass: {
    confirmButton: "custom-confirm-btn",
    cancelButton: "custom-cancel-btn"
  },
    });

    // STEP 3: PASSWORD VERIFICATION
    const { value: password } = await ThemeSwal.fire({
      title: "Verify Your Password",
      input: "password",
      inputPlaceholder: "Enter your current password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Reset Now",
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#9e9e9e",
      customClass: {  
        confirmButton: "custom-confirm-btn",
        cancelButton: "custom-cancel-btn"
      },  
      preConfirm: (value) => {
        if (!value) {
          ThemeSwal.showValidationMessage("Password is required");
        }
        return value;
      }
    });

    if (!password) return;

    // STEP 4: EXECUTE RESET
    ThemeSwal.fire({
      title: "Resetting...",
      text: "Please wait while we reset your organization data.",
      allowOutsideClick: false,
      didOpen: () => {
        ThemeSwal.showLoading();
      }
    });

    await AuthService.ResetSystemData(password);

    // STEP 5: SUCCESS
    await ThemeSwal.fire({
      title: "Reset Completed",
      text: "All organization data has been reset successfully.",
      icon: "success",
      confirmButtonColor: "#DFD0B8",

    });

    // OPTIONAL: reload or redirect
    window.location.reload();

  } catch (error) {
    console.error("RESET FAILED:", error);

    ThemeSwal.fire({
      title: "Reset Failed",
      text:
        error?.response?.data?.message ||
        "Something went wrong while resetting the system.",
      icon: "error",
      confirmButtonColor: "#d32f2f"
    });
  }
};


const handleChangePassword = async () => {
  try {
    const authData = JSON.parse(localStorage.getItem("auth"));
    const token = authData?.token;

    const res = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/auth/change-password`,
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    ThemeSwal.fire({
      title: "Password Changed",
      text: "Password reset successful. Please login again.",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      localStorage.removeItem("auth");
      navigate('/user/login');
    });

    setMessage(res.data.message);

  } catch (error) {
    ThemeSwal.fire({
      title: "Error",
      text: error.response?.data?.error || "Error changing password",
      icon: "error",
    });

    setMessage(
      error.response?.data?.error || "Error changing password"
    );
  }
};
  return (

<div className="Security-container">

  {/* ================= PAGE HEADER ================= */}

  <div className="security-page-header">
    <div className="security-page-heading">
      <span className="security-page-icon">
        <FiShield />
      </span>

      <div>
        <h2>Security</h2>
        <p>
          Manage your account password and system security settings.
        </p>
      </div>
    </div>
  </div>


  {/* ================= CHANGE PASSWORD ================= */}

  <section className="change-password">

    <div className="box-head">
      <div className="security-section-title">
        <span className="security-section-icon">
          <FiLock />
        </span>

        <div>
          <h3 className="title-p">Change Password</h3>
          <p>
            Update your password to keep your account secure.
          </p>
        </div>
      </div>
    </div>


    <div className="security-password-grid">

      {/* CURRENT PASSWORD */}

      <div className="input-container">
        <label htmlFor="security-current-password">
          Current Password
        </label>

        <input
          id="security-current-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(e.target.value)
          }
        />
      </div>


      {/* NEW PASSWORD */}

      <div className="input-container2">
        <label htmlFor="security-new-password">
          New Password
        </label>

        <input
          id="security-new-password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
        />
      </div>

    </div>


    <div className="security-password-footer">

      <div className="security-password-hint">
        <FiInfo />
        <span>
          Use a strong, unique password for your account.
        </span>
      </div>

      <div className="change-button">
        <button
          type="button"
          onClick={handleChangePassword}
        >
          <FiLock />
          Change Password
        </button>
      </div>

    </div>

  </section>


  {/* ================= DANGER ZONE ================= */}

  <section className="danger-zone">

    <div className="danger-header">

      <div className="danger-title-group">

        <span className="danger-section-icon">
          <FiAlertTriangle />
        </span>

        <div>
          <h3>Danger Zone</h3>
          <p>Irreversible system operations</p>
        </div>

      </div>

      <span className="danger-badge">
        <FiAlertCircle />
        Critical
      </span>

    </div>


    <div className="danger-content">

      <div className="danger-description">

        <p>
          Resetting the system will permanently remove
          operational data, including assets, assignments,
          tickets, logs, and notifications.
        </p>

        <div className="danger-warning">
          <FiAlertTriangle />
          <span>
            This action cannot be undone.
          </span>
        </div>

      </div>


      <div className="danger-actions">

        <button
          className="reset-system-btn"
          type="button"
          onClick={handleResetData}
        >
          <FiTrash2 />
          Reset System Data
        </button>

      </div>

    </div>

  </section>

</div>

  )
}

export default Security
