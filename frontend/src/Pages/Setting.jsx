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
const Notification = lazy(() => import("../Inner_sections/Notification"));
const UserManagement = lazy(() => import("../Inner_sections/UserManagement"));

// Add more when needed

const Setting = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

// Tabs config
const tabs = [
  { path: "profile", label: "Profile", icon: FaUser },
  { path: "security", label: "Security", icon: FaLock },
  { path: "notification", label: "Notifications", icon: FaBell },
  // User Management only visible for super-admin
  ...(userData?.role === "super-admin"
    ? [{ path: "users", label: "User Management", icon: FaUsers }]
    : []),
];


  // Fetch user data (with cache)
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Login Required",
          text: "Please log in.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => navigate("/user/login"));
        return;
      }

      const cachedUser = localStorage.getItem("username");

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
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
    return <Navigate to="/user/login" replace />;
  }

  return (
    <div className="setting-container">
    <h2 className="classify_heading"> Settings</h2>
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
        {/* <button onClick={handleLogout} className="logout-tab">
          <FaSignOutAlt className="tab-icon" />
          <span className="tab-text">Logout</span>
        </button> */}
      </nav>

      {/* Content */}
      <main className="settings">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="profile" />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="security" element={<Security />} />
            <Route path="notification" element={<Notification />} />
            <Route path="users" element={<UserManagement />} />

            {/* Add other routes here when components are ready */}
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default Setting;
