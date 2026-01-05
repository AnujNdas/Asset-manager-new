import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/Profiledropdown.css";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({ isVisible, onClose, toggleButtonRef }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  /**
   * 🔐 LOAD USER FROM AUTH STORE
   */
  useEffect(() => {
    if (!isVisible) return;

    const authRaw = localStorage.getItem("auth");
    if (!authRaw) return;

    try {
      const auth = JSON.parse(authRaw);
      setUser(auth.user);
    } catch (err) {
      console.error("Invalid auth data");
    }
  }, [isVisible]);

  /**
   * 🚪 LOGOUT HANDLER
   */
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();

        Swal.fire({
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
          <li className="user-info">
            <img
              src={`https://robohash.org/${username}?set=set2&size=50x50`}
              alt="avatar"
              className="avatar"
            />
            <span className="username">{username}</span>
          </li>

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
