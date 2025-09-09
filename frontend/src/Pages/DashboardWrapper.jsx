// src/pages/DashboardWrapper.jsx
import React from "react";
import AdminDashboard from "./AdminDashboard";
import Dashboard from "./Dashboard";

const DashboardWrapper = () => {
  const role = sessionStorage.getItem("role");

  if (role === "admin") {
    return <AdminDashboard />;
  }
  return <Dashboard />;
};

export default DashboardWrapper;
