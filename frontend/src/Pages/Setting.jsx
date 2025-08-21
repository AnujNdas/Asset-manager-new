import React, { useState, useEffect, lazy, Suspense } from "react";
import "../Page_styles/Setting.css";
import {
  Link,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaUser,
  FaLock,
  FaCogs,
  FaUsers,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";

// Lazy load inner sections
const MyProfile = lazy(() => import("../Inner_sections/MyProfile"));
const Security = lazy(() => import("../Inner_sections/Security"));
// Add more when needed

const Setting = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs config
  const tabs = [
    { path: "Profile", label: "Profile", icon: FaUser },
    { path: "Security", label: "Security", icon: FaLock },
    { path: "General", label: "General", icon: FaCogs },
    { path: "TeamMember", label: "Team", icon: FaUsers },
    { path: "Notification", label: "Notifications", icon: FaBell },
  ];

  // Logout
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("user");
        setUserData(null);
        navigate("/User/Login");
      }
    });
  };

  // Fetch user data (with cache)
  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Login Required",
          text: "Please log in.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => navigate("/User/Login"));
        return;
      }

      const cachedUser = sessionStorage.getItem("username");

      try {
        const response = await fetch("https://asset-manager-new.onrender.com/api/auth/user", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUserData(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [navigate]);

  // Route guard (if not logged in, redirect immediately)
  if (!localStorage.getItem("token")) {
    return <Navigate to="/User/Login" replace />;
  }

  return (
    <div className="setting-container">
      {/* Tabs Navigation */}
      <nav className="settings-tabs">
        {tabs.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={`/Setting/${path}`}
            className={location.pathname.includes(path) ? "active" : ""}
          >
            <Icon className="tab-icon" />
            <span className="tab-text">{label}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="logout-tab">
          <FaSignOutAlt className="tab-icon" />
          <span className="tab-text">Logout</span>
        </button>
      </nav>

      {/* Content */}
      <main className="settings">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="Profile" />} />
            <Route path="Profile" element={<MyProfile />} />
            <Route path="Security" element={<Security />} />
            {/* Add other routes here when components are ready */}
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default Setting;
