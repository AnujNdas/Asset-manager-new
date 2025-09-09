// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAdminStats } from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    })();
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Hardware Assets</h3>
          <p>{stats.hardwareCount}</p>
        </div>
        <div className="stat-card">
          <h3>Software Assets</h3>
          <p>{stats.softwareCount}</p>
        </div>
        <div className="stat-card">
          <h3>Core Licenses</h3>
          <p>{stats.coreLicensesCount}</p>
        </div>
        <div className="stat-card">
          <h3>Users</h3>
          <p>{stats.usersCount}</p>
        </div>
      </div>

      <div className="chart-section">
        <h3>Licenses Status</h3>
        <p>Active: {stats.activeLicenses}</p>
        <p>Expired: {stats.expiredLicenses}</p>
        {/* Later you can add a pie chart here */}
      </div>
    </div>
  );
};

export default AdminDashboard;
