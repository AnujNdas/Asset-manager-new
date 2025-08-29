import React , { useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import "../Page_styles/Security.css"
import Swal from "sweetalert2"

const Security = () => {
  const navigate = useNavigate()
    const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Assuming token is stored in localStorage
      const res = await axios.put(
        "https://asset-manager-new.onrender.com/api/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      Swal.fire({
      title: "Password Changed",
      text: "Password reset successful. Please login again.",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      // ✅ Remove token and redirect to login page
      sessionStorage.removeItem("token");
      navigate('/user/login') // or use navigate("/login") if using React Router
    });

    setMessage(res.data.message);
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: error.response?.data?.error || "Error changing password",
      icon: "error",
    });
    setMessage(error.response?.data?.error || "Error changing password");
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
          {message && <p className="response-message">{message}</p>}
      </div>
      
      <div className="login-activity">
        <div className="title-login">
          Login Activity
        </div>
        <div className="login-device">
          <div className="device-logo"></div>
          <div className="device-data">
            <h4> Windows</h4>
            <p> Last active today at 12:34pm </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Security
