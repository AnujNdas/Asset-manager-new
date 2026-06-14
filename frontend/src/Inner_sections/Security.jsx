import React , { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import "../Page_styles/Security.css"
import ThemeSwal from '../utils/swalTheme'
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
          <li><b>Assets:</b> ${previewRes.preview.assets}</li>
          <li><b>Assignments:</b> ${previewRes.preview.assignments}</li>
          <li><b>Support Tickets:</b> ${previewRes.preview.tickets}</li>
          <li><b>Software Assets:</b> ${previewRes.preview.softwareAssets}</li>
          <li><b>Categories:</b> ${previewRes.preview.categories}</li>
          <li><b>Locations:</b> ${previewRes.preview.locations}</li>
          <li><b>Status:</b> ${previewRes.preview.statuses}</li>
          <li><b>Units:</b> ${previewRes.preview.units}</li>
          <li><b>Units:</b> ${previewRes.preview.units}</li>
          <li><b>Departments:</b> ${previewRes.preview.departments}</li>
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
    <div className='Security-container'>
      <div className="classify_heading">Security</div>
      <div className="change-password">
        <div className="box-head">
          <div className="title-p">
            Change Password
          </div>
        </div>
          <div className="input-container">
            <p> Current Password :- </p>  
            <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          </div>
          <div className="input-container2">
            <p> New Password :- </p>
            <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          </div>
          <div className="change-button">
            <button type="button" onClick={handleChangePassword}>
            Change
          </button>
          </div>
      </div>
      
{/* ================= DANGER ZONE ================= */}
<div className="danger-zone">
  <div className="danger-header">
    <h3>Danger Zone</h3>
    <span className="danger-badge">Critical</span>
  </div>

  <p className="danger-description">
    Resetting the system will permanently remove all operational data such as
    assets, assignments, tickets, logs, and notifications.
    <br />
    <strong>This action cannot be undone.</strong>
  </p>

  <div className="danger-actions">
    <button
      className="reset-system-btn"
      type="button"
      onClick={handleResetData}  // backend later
    >
      Reset System Data
    </button>
  </div>
</div>


    </div>
  )
}

export default Security
