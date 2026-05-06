import React, { useEffect, useRef, useState } from "react";
import ThemeSwal from "../utils/SwalTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/Profiledropdown.css";
import { useNavigate } from "react-router-dom";
import profile from "../Images/profile.png";
import axiosInstance from "../Services/axiosInstance";
const ProfileDropdown = ({ isVisible, onClose, toggleButtonRef }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  /**
   * 🔐 LOAD USER FROM AUTH STORE
   */
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("/user/me");
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  if (isVisible) {
    fetchUser(); // fetch only when dropdown opens
  }
}, [isVisible]);
  /**
   * 🚪 LOGOUT HANDLER
   */
  const handleLogout = () => {
ThemeSwal.fire({
  title: "Are you sure?",
  text: "Do you really want to logout?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes, Logout",
  cancelButtonText: "Cancel",
  confirmButtonColor: "#d33",

  customClass: {
    confirmButton: "logout-confirm-btn"
  }
}).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();

        ThemeSwal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been successfully logged out!",
          timer: 1200,
          showConfirmButton: false,
        });

        navigate("/user/login", { replace: true });
      }
    });
  };
  const handleProfileClick = () => {
    navigate("/setting/profile");
    onClose();
  }
  /**
   * 🖱️ CLICK OUTSIDE HANDLER
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const clickedOutsideToggleButton =
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target);

      if (clickedOutsideDropdown && clickedOutsideToggleButton) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose, toggleButtonRef]);

  const username = user?.username || "User";

  return (
    <div
      ref={dropdownRef}
      className={`profile-dropdown-container ${isVisible ? "show" : ""}`}
    >
      <div className={`dropdown-menu ${isVisible ? "show" : ""}`}>
        <ul className="drop-box">
          <button className="user-info" onClick={handleProfileClick}>
<img
  src={
    user?.avatar?.url || profile
  }
  alt="avatar"
  className="avatar"
/>

            <span className="username">{username}</span>
          </button>

          <hr className="divide" />

          <li>
            <button onClick={handleLogout} className="logout-btn">
              <FontAwesomeIcon icon={faSignOut} /> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDropdown;
