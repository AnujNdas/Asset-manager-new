import React, { useState, useEffect } from "react";
import "../Page_styles/Setting.css";
import { Link, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import MyProfile from "../Inner_sections/MyProfile";
import Security from "../Inner_sections/Security";
import Swal from "sweetalert2";
import { FaUser, FaLock, FaCogs, FaUsers, FaBell, FaSignOutAlt } from "react-icons/fa";

const Setting = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUserData(null);
    navigate("/User/Login");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Login Required",
          text: "Please log in.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => navigate("/User/Login"));
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/user",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Error fetching user data. Please try again.");
      }
    };
    fetchUserData();
  }, [navigate]);

  return (
    <div className="setting-container">
      {/* Tabs Navigation */}
      <nav className="settings-tabs">
        <Link to="/Setting/Profile" className={location.pathname.includes("Profile") ? "active" : ""}>
          <FaUser className="tab-icon" />
          <span className="tab-text">Profile</span>
        </Link>
        <Link to="/Setting/Security" className={location.pathname.includes("Security") ? "active" : ""}>
          <FaLock className="tab-icon" />
          <span className="tab-text">Security</span>
        </Link>
        <Link to="/Setting/General" className={location.pathname.includes("General") ? "active" : ""}>
          <FaCogs className="tab-icon" />
          <span className="tab-text">General</span>
        </Link>
        <Link to="/Setting/TeamMember" className={location.pathname.includes("TeamMember") ? "active" : ""}>
          <FaUsers className="tab-icon" />
          <span className="tab-text">Team</span>
        </Link>
        <Link to="/Setting/Notification" className={location.pathname.includes("Notification") ? "active" : ""}>
          <FaBell className="tab-icon" />
          <span className="tab-text">Notifications</span>
        </Link>
        <button onClick={handleLogout} className="logout-tab">
          <FaSignOutAlt className="tab-icon" />
          <span className="tab-text">Logout</span>
        </button>
      </nav>

      {/* Content */}
      <main className="settings">
        <Routes>
          <Route path="/" element={<Navigate to="Profile" />} />
          <Route path="Profile" element={<MyProfile />} />
          <Route path="Security" element={<Security />} />
          {/* Add other routes here */}
        </Routes>
      </main>
    </div>
  );
};

export default Setting;
