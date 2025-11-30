import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

import {
  getAdminStats,
  getTopLocations,
  getExpiringAssets,
  getRecentAssets,
  getActiveUsers,
  getLocations,
} from "../Services/ApiServices";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip, faLaptop, faUsers } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import "../Page_styles/AdminDashboard.css";

const COLORS = ["#7b5dff", "#ef4444", "#10b981", "#6366f1", "#f59e0b"];

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [topLocations, setTopLocations] = useState([]);
  const [recentAssets, setRecentAssets] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [expiringAssets, setExpiringAssets] = useState(null);
  const [locationList, setLocationList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Convert ID → name
  const getLocationName = (id) => {
    const loc = locationList.find((l) => l._id === id);
    return loc ? loc.locationName : "Unknown";
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const s = await getAdminStats();
        const tl = await getTopLocations();
        const recent = await getRecentAssets();
        const active = await getActiveUsers();
        const exp = await getExpiringAssets();
        const allLoc = await getLocations();

        setStats(s);
        setTopLocations(tl);
        setRecentAssets(recent);
        setActiveUsers(active);
        setExpiringAssets(exp);
        setLocationList(allLoc);

      } catch (err) {
        Swal.fire("Error", "Failed to load Dashboard", "error");
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  // Pie chart data (Active vs Expired)
  const licensePieData = [
    { name: "Active", value: stats.activeLicenses },
    { name: "Expired", value: stats.expiredLicenses },
  ];

  // Line chart for recently added assets
  const recentLineData = [
    { name: "Software", count: recentAssets.software.length },
    { name: "Hardware", count: recentAssets.hardware.length },
  ];

  return (
    <div className="admin-dashboard">

      {/* ========= Summary Cards ========= */}
      <div className="summary-grid">
        <div className="summary-card purple" onClick={() => navigate("/inventory?tab=hardware")}>
          <FontAwesomeIcon icon={faMicrochip} className="summary-icon" />
          <h3>{stats.hardwareCount}</h3>
          <p>Hardware Assets</p>
        </div>

        <div className="summary-card blue" onClick={() => navigate("/inventory?tab=software")}>
          <FontAwesomeIcon icon={faLaptop} className="summary-icon" />
          <h3>{stats.softwareCount}</h3>
          <p>Software Assets</p>
        </div>

        <div className="summary-card red" onClick={() => navigate("/setting/users")}>
          <FontAwesomeIcon icon={faUsers} className="summary-icon" />
          <h3>{stats.usersCount}</h3>
          <p>Total Users</p>
        </div>
      </div>

      {/* ========= Charts Row ========= */}
      <div className="chart-row">

        {/* ---- Bar Chart: Top Locations ---- */}
        <div className="chart-card">
          <h3>Top 5 Locations (Assets)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topLocations.map(loc => ({
              name: getLocationName(loc._id),
              count: loc.count,
            }))}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7b5dff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ---- Pie Chart: License Status ---- */}
        <div className="chart-card">
          <h3>License Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={licensePieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {licensePieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ========= Recent Assets Line Chart ========= */}
      <div className="chart-card full">
        <h3>Recent Assets Added</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={recentLineData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ========= Active Users ========= */}
      <div className="section">
        <h3>Most Active Users (Last 30 Days)</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{new Date(u.lastActive).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========= Expiring Assets ========= */}
      <div className="section">
        <h3>Expiring Within 3 Months</h3>
        <div className="expiring-row">

          <div className="expiring-col">
            <h4>Hardware</h4>
            <ul>
              {expiringAssets.expiringHardware.map((asset) => (
                <li key={asset._id}>{asset.assetName} – {asset.DOE}</li>
              ))}
            </ul>
          </div>

          <div className="expiring-col">
            <h4>Software</h4>
            <ul>
              {expiringAssets.expiringSoftware.map((asset) => (
                <li key={asset._id}>{asset.name} – {asset.licenseExpiry}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
