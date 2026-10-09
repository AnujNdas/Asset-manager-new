import React, { useEffect, useRef, useState } from "react";
import ThemeSwal from "../utils/swalTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/Profiledropdown.css";
import { useNavigate } from "react-router-dom";
import profile from "../Images/profile.png";
import {
  FiUser,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
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
    confirmButton: "logout-confirm-btn",
    cancelButton: "logout-cancel-btn"
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
  className={`profile-dropdown-container ${
    isVisible ? "show" : ""
  }`}
>
  <div
    className={`dropdown-menu ${
      isVisible ? "show" : ""
    }`}
  >
    {/* ACCOUNT HEADER */}
    <div className="dropdown-header">
      <div className="dropdown-avatar">
        <img
          src={user?.avatar?.url || profile}
          alt="Profile avatar"
          className="avatar"
        />
      </div>

      <div className="dropdown-user-details">
        <span className="dropdown-user-label">
          Signed in as
        </span>

        <strong className="username">
          {username || "User"}
        </strong>
      </div>
    </div>

    {/* ACTIONS */}
    <div className="dropdown-actions">

      <button
        type="button"
        className="dropdown-action profile-action"
        onClick={handleProfileClick}
      >
        <FiUser className="dropdown-action-icon" />

        <span>My Profile</span>

        <FiChevronRight className="dropdown-action-arrow" />
      </button>

      <div className="dropdown-divider" />

      <button
        type="button"
        className="dropdown-action logout-btn"
        onClick={handleLogout}
      >
        <FiLogOut className="dropdown-action-icon" />

        <span>Logout</span>
      </button>

    </div>
  </div>
</div>

  );
};

export default ProfileDropdown;
