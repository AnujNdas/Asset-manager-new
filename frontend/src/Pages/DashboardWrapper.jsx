// src/pages/DashboardWrapper.jsx
import React from "react";
import AdminDashboard from "./AdminDashboard";
import Dashboard from "./Dashboard";

const DashboardWrapper = () => {
  const authRaw = localStorage.getItem("auth");

  // 🔐 Not logged in → normal dashboard or redirect handled elsewhere
  if (!authRaw) {
    return <Dashboard />;
  }

  let role = "user";

  try {
    const auth = JSON.parse(authRaw);
    role = auth.user?.role || "user";
  } catch (err) {
    console.error("Invalid auth data in DashboardWrapper");
    return <Dashboard />;
  }

  // 🛡️ Role-based dashboard
  if (role === "admin" || role === "super-admin") {
    return <AdminDashboard />;
  }

  return <Dashboard />;
};

export default DashboardWrapper;
  