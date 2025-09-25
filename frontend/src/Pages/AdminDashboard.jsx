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
import { motion, AnimatePresence } from "framer-motion";

// Add images (store banners in /public/images/)
const features = [
  {
    title: "📊 Manage Assets",
    description: "Easily track and organize all hardware and software assets.",
    image: "/images/assets.png",
  },
  {
    title: "🔑 License Tracking",
    description: "Monitor active and expired licenses with real-time insights.",
    image: "/images/vaultifly.com.png",
  },
  {
    title: "👥 User Management",  
    description: "Control roles, permissions, and streamline team collaboration.",
    image: "/images/User Management.png",
  },
  {
    title: "📍 Location Management",
    description: "Assign and monitor assets across multiple locations seamlessly.",
    image: "/images/webinar.png",
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [index, setIndex] = useState(0);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, catData, locData, statData, unitData] =
          await Promise.all([
            getAdminStats(),
            getCategories(),
            getLocations(),
            getStatuses(),
            getUnits(),
          ]);
        setStats(statsData);
        setCategories(catData);
        setLocations(locData);
        setStatuses(statData);
        setUnits(unitData);
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
      <h2 className="classify_heading"> Admin Dashboard</h2>

      {/* --- FEATURE CAROUSEL --- */}
<div className="feature-carousel">
  <AnimatePresence mode="wait">
    <motion.div
      key={index}
      className="feature-card"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
  <div className="feature-image-container">
    <img
      src={features[index].image}
      alt={features[index].title}
      className="feature-image"
    />
    <button className="feature-btn">Explore</button>
  </div>
    </motion.div>
  </AnimatePresence>

  {/* Manual Controls */}
  <div className="carousel-controls">
    {features.map((_, idx) => (
      <button
        key={idx}
        className={`dot ${idx === index ? "active" : ""}`}
        onClick={() => setIndex(idx)}
      />
    ))}
  </div>
</div>




      {/* --- STATS GRID --- */}
      <motion.div
        className="stats-grid"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.2 }}
      >
        {[
          {
            title: "Hardware Assets",
            value: stats.hardwareCount,
            color: "#A7C7E7",
          },
          {
            title: "Software Assets",
            value: stats.softwareCount,
            color: "#F7B2AD",
          },
          {
            title: "Core Licenses",
            value: stats.coreLicensesCount,
            color: "#FFD97D",
          },
          { title: "Total Users", value: stats.usersCount, color: "#B5EAD7" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            className="stat-card"
            style={{ backgroundColor: stat.color }}
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 10px 20px rgba(0,0,0,0.15)",
            }}
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
            whileHover={{
              scale: 1.03,
              boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
            }}
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
    </div>
  );
};

export default AdminDashboard;
