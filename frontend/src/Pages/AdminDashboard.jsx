// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getAdminStats,
  getCategories,
  getLocations,
  getStatuses,
  getUnits,
} from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";
import { motion } from "framer-motion"; // npm install framer-motion

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);

useEffect(() => {
  (async () => {
    try {
      const [statsData, catData, locData, statData, unitData] = await Promise.all([
        getAdminStats(),
        getCategories(),
        getLocations(),
        getStatuses(),
        getUnits(),
      ]);

      // ✅ set stats
      setStats(statsData);

      // ✅ categories, locations, etc.
      setCategories(Array.isArray(catData) ? catData : []);
      setLocations(Array.isArray(locData) ? locData : []);
      setStatuses(Array.isArray(statData) ? statData : []);
      setUnits(Array.isArray(unitData) ? unitData : []);

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  })();
}, []);

  if (!stats) return <p>Loading...</p>;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title"> Admin Dashboard</h2>

      {/* --- STATS GRID --- */}
      <motion.div 
        className="stats-grid"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.2 }}
      >
        {[
          { title: "Hardware Assets", value: stats.hardwareCount, color: "#A7C7E7" },
          { title: "Software Assets", value: stats.softwareCount, color: "#F7B2AD" },
          { title: "Core Licenses", value: stats.coreLicensesCount, color: "#FFD97D" },
          { title: "Total Users", value: stats.usersCount, color: "#B5EAD7" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            className="stat-card"
            style={{ backgroundColor: stat.color }}
            variants={cardVariants}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }}
          >
            <h3>{stat.title}</h3>
            <p>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* --- SECONDARY DATA --- */}
      <div className="secondary-grid">
        {[
          { title: "📂 Categories", data: categories },
          { title: "📍 Locations", data: locations },
          { title: "✅ Statuses", data: statuses },
          { title: "📏 Units", data: units },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="data-card"
            variants={cardVariants}
            whileHover={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
          >
            <h4>{item.title}</h4>
            <ul className="scrollable-list">
              {item.data.length > 0 ? (
                item.data.map((d) => <li key={d._id}>{d.name}</li>)
              ) : (
                <li>No entries</li>
              )}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* --- CHART PLACEHOLDER --- */}
      <motion.div className="chart-section" variants={cardVariants}>
        <h3>Licenses Status</h3>
        <p>Active: {stats.activeLicenses}</p>
        <p>Expired: {stats.expiredLicenses}</p>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
