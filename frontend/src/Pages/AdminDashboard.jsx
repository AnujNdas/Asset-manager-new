import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getTopLocations,
  getExpiringAssets,
  getRecentAssets,
  getActiveUsers,
  getLocations,
} from "../Services/ApiServices";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie,
  ResponsiveContainer, Cell, Legend,
} from "recharts";

import "../Page_styles/AdminDashboard.css";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#22C55E", "#F59E0B"];

const Dashboard = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [topLocations, setTopLocations] = useState([]);
  const [expiringAssets, setExpiringAssets] = useState(null);
  const [recentAssets, setRecentAssets] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const [locationList, setLocationList] = useState([]);
  const [loading, setLoading] = useState(true);

const getLocationName = (id) => {
  const loc = locationList.find((l) => l._id === id);
  return loc ? loc.name : "Unknown Location";
};


  useEffect(() => {
    const load = async () => {
      try {
        const stats = await getAdminStats();
        const locs = await getTopLocations();
        const exp = await getExpiringAssets();
        const recent = await getRecentAssets();
        const users = await getActiveUsers();
        const allLocs = await getLocations();

        setStatsData(stats);
        setTopLocations(locs);
        setExpiringAssets(exp);
        setRecentAssets(recent);
        setActiveUsers(users);
        setLocationList(allLocs);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  // Transform Top Location Data
  const locChartData = topLocations.map((loc) => ({
    name: getLocationName(loc._id),
    value: loc.count,
  }));

  return (
    <div className="admin-dashboard">

      {/* TOP STATS */}
      <div className="stats-grid">
        <div className="stat-card purple" onClick={() => navigate("/inventory?tab=hardware")}>
          <h2>{statsData.hardwareCount}</h2>
          <p>Hardware Assets</p>
        </div>

        <div className="stat-card violet" onClick={() => navigate("/inventory?tab=software")}>
          <h2>{statsData.softwareCount}</h2>
          <p>Software Assets</p>
        </div>

        <div className="stat-card pink" onClick={() => navigate("/setting/users")}>
          <h2>{statsData.usersCount}</h2>
          <p>Total Users</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid">

        {/* TOP LOCATIONS – BAR CHART */}
        <div className="chart-card">
          <h3>Top 5 Locations With Most Assets</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={locChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {locChartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OTHER SECTIONS */}
      <div className="grid-2">

        {/* RECENT ASSETS */}
        <div className="panel-card">
          <h3>Recently Added Assets</h3>
          <ul className="list">
            {recentAssets?.hardware?.map((item) => (
              <li key={item._id}>
                <span className="dot purple"></span>
                {item.assetName}
              </li>
            ))}
            {recentAssets?.software?.map((item) => (
              <li key={item._id}>
                <span className="dot violet"></span>
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        {/* ACTIVE USERS */}
        <div className="panel-card">
          <h3>Most Active Users</h3>
          <ul className="list">
            {activeUsers?.map((u) => (
              <li key={u._id}>
                <strong>{u.username}</strong>
                <small>{new Date(u.updatedAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>

      </div>

    

    </div>
  );
};

export default Dashboard;
