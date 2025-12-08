import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getTopLocations,
  getExpiringAssets,
  getActiveUsers,
  getLocations,
  getMonthlyValuation
} from "../Services/ApiServices";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie,
  ResponsiveContainer, Cell, Legend, LineChart, Line
} from "recharts";

import Loader from "../Components/Loader";
import "../Page_styles/AdminDashboard.css";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#22C55E", "#F59E0B"];

const Dashboard = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [topLocations, setTopLocations] = useState([]);
  const [expiringAssets, setExpiringAssets] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [valuationData, setValuationData] = useState([]);

  const [loading, setLoading] = useState(true);

  const getLocationName = (id) => {
    const loc = locationList.find((l) => l._id === id);
    return loc ? loc.name : "Unknown";
  };

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await getAdminStats();
        const locs = await getTopLocations();
        const exp = await getExpiringAssets();
        const users = await getActiveUsers();
        const allLocs = await getLocations();
        const valuation = await getMonthlyValuation();

        setStatsData(stats);
        setTopLocations(locs);
        setExpiringAssets(exp);
        setActiveUsers(users);
        setLocationList(allLocs);
        setValuationData(Array.isArray(valuation) ? valuation : []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loader />;

  const locChartData = topLocations.map((loc) => ({
    name: getLocationName(loc._id),
    value: loc.count,
  }));
const valuationChartData = Array.isArray(valuationData)
  ? valuationData.map((v) => ({
      month: `${v.month}/${v.year}`,
      valuation: v.monthlyValuation ?? 0,
    }))
  : [];


  return (
    <div className="admin-dashboard">

      {/* TOP STATS */}
      <div className="stats-grid">

        <div className="stat-card purple" onClick={() => navigate("/inventory?tab=hardware")}>
          <h2>{statsData?.hardwareCount ?? 0}</h2>
          <p>Hardware Assets</p>
        </div>

        <div className="stat-card violet" onClick={() => navigate("/inventory?tab=software")}>
          <h2>{statsData?.softwareCount ?? 0}</h2>
          <p>Software Assets</p>
        </div>

        <div className="stat-card pink" onClick={() => navigate("/setting/users")}>
          <h2>{statsData?.usersCount ?? 0}</h2>
          <p>Total Users</p>
        </div>

      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid">

        {/* TOP LOCATIONS BAR CHART */}
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

        {/* MONTHLY VALUATION CHART */}
        <div className="chart-card">
  <h3>Monthly Asset Valuation Trend</h3>

  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={valuationChartData}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="valuation" fill="#6366F1" />
    </BarChart>
  </ResponsiveContainer>
</div>


      </div>

      {/* BOTTOM GRID */}
      <div className="grid-2">

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

        {/* EXPIRING ASSETS */}
        <div className="panel-card">
          <h3>Assets Expiring Soon</h3>
          <ul className="list">
            {expiringAssets?.map((item) => (
              <li key={item._id}>
                <span className="dot red"></span>
                {item.assetName} — {item.DOE}
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
