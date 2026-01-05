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
} from "react-icons/fa";

import axiosInstance from "../Services/axiosInstance";

// Lazy load inner sections
const MyProfile = lazy(() => import("../Inner_sections/MyProfile"));
const Security = lazy(() => import("../Inner_sections/Security"));
const Notification = lazy(() => import("../Inner_sections/Notification"));
const UserManagement = lazy(() => import("../Inner_sections/UserManagement"));
const Subscription = lazy(() => import("../Inner_sections/Subscription"));

const Setting = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 🔐 AUTH BOOTSTRAP
   */
  useEffect(() => {
    const authRaw = localStorage.getItem("auth");

    if (!authRaw) {
      navigate("/user/login", { replace: true });
      return;
    }

    try {
      const auth = JSON.parse(authRaw);

      if (!auth.token || !auth.user) {
        throw new Error("Invalid auth object");
      }

      // Use cached user immediately
      setUserData(auth.user);

      // OPTIONAL: refresh user from backend
      refreshUser();
    } catch {
      localStorage.clear();
      navigate("/user/login", { replace: true });
    }
  }, [navigate]);

  /**
   * 🔄 OPTIONAL USER REFRESH (SAFE)
   */
  const refreshUser = async () => {
    try {
      const res = await axiosInstance.get("/user/me");

      if (res.data?.user) {
        setUserData(res.data.user);

        // keep auth in sync
        const auth = JSON.parse(localStorage.getItem("auth"));
        localStorage.setItem(
          "auth",
          JSON.stringify({
            ...auth,
            user: res.data.user,
          })
        );
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  /**
   * 🧭 ROUTE GUARD
   */
  if (!localStorage.getItem("auth")) {
    return <Navigate to="/user/login" replace />;
  }

  /**
   * 🧩 TABS CONFIG
   */
  const tabs = [
    { path: "profile", label: "Profile", icon: FaUser },
    { path: "security", label: "Security", icon: FaLock },
    { path: "notification", label: "Notifications", icon: FaBell },
    { path: "subscription", label: "Subscription", icon: FaCogs },
    ...(userData?.role === "super-admin"
      ? [{ path: "users", label: "User Management", icon: FaUsers }]
      : []),
  ];

  return (
    <div className="setting-container">
      <h2 className="classify_heading">Settings</h2>

      {/* Tabs Navigation */}
      <nav className="settings-tabs">
        {tabs.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={`/setting/${path}`}
            className={location.pathname.includes(path) ? "active" : ""}
          >
            <Icon className="tab-icon" />
            <span className="tab-text">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="settings">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="security" element={<Security />} />
            <Route path="notification" element={<Notification />} />
            <Route path="subscription" element={<Subscription />} />
            {userData?.role === "super-admin" && (
              <Route path="users" element={<UserManagement />} />
            )}
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default Setting;
