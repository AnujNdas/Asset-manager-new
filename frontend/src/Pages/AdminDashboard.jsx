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
        setValuationData(Array.isArray(valuation) ? valuation : [valuation]);

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
      month: `${v._id.month}/${v._id.year}`,
      valuation: v.monthlyValuation ?? 0,
    }))
  : [];



  return (
    <div className="admin-dashboard">

      {/* TOP STATS */}
     <div className="stats-grid">

  {/* Total Valuation */}
  <div className="stat-card green">
    <div className="stat-1">
    <p>Total Asset Valuation</p>
    <p>Hardware + Software</p>
  </div>
      <div className="stat-2">
    <h2>₹ {statsData?.totalValuation?.toLocaleString() ?? "0"}</h2>
  </div>
  </div>
  {/* Hardware */}
  <div className="stat-card purple" onClick={() => navigate("/inventory?tab=hardware")}>
    <div className="stat-1">
    <h2>{statsData?.hardwareCount ?? 0}</h2>
    <p>Hardware Assets</p>
      </div>
    <div className="stat-2">
    <h2>₹ {statsData?.hardwareValuation?.toLocaleString() ?? "0"}</h2>
    <p>Total Valuation</p>
      </div>
  </div>

  {/* Software */}
  <div className="stat-card violet" onClick={() => navigate("/inventory?tab=software")}>
    <div className="stat-1">
    <h2>{statsData?.softwareCount ?? 0}</h2>
    <p>Software Assets</p>
  </div>
      <div className="stat-2">
    <h2>₹ {statsData?.softwareValuation?.toLocaleString() ?? "0"}</h2>
    <p>Total Valuation</p>
  </div>
  </div>

  {/* Users */}
  <div className="stat-card pink" onClick={() => navigate("/setting/users")}>
    <h2>{statsData?.usersCount ?? 0}</h2>
    <p>Total Users</p>
  </div>

</div>


      {/* CHARTS GRID */}
      <div className="charts-grid">

        {/* TOP LOCATIONS BAR CHART */}
        <div className="chart-card">
          <h2>Top 5 Locations With Most Assets</h2>
          <ResponsiveContainer width="100%" height={200}>
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
  <h2>Monthly Asset Valuation Trend</h2>

  <ResponsiveContainer width="100%" height={200}>
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
          <h2>Most Active Users</h2>
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
<div className="panel-card expiring-panel">
  <h2>Assets Expiring Soon</h2>

  <div className="expiring-grid">

    {/* Hardware */}
    <div className="expiring-column">
      <h3>
        Hardware ({expiringAssets.expiringHardware?.length ?? 0})
      </h3>
      <ul>
        {expiringAssets.expiringHardware?.length > 0 ? (
          expiringAssets.expiringHardware.map((item) => (
            <li key={item._id}>
              <span className="dot red"></span>
              {item.hardwareName ?? "Unnamed Hardware"} — 
              {new Date(item.DOE).toLocaleDateString()}
            </li>
          ))
        ) : (
          <p className="empty-state">No hardware expiring soon</p>
        )}
      </ul>
    </div>

    {/* Software */}
    <div className="expiring-column">
      <h3>
        Software ({expiringAssets.expiringSoftware?.length ?? 0})
      </h3>
      <ul>
        {expiringAssets.expiringSoftware?.length > 0 ? (
          expiringAssets.expiringSoftware.map((item) => (
            <li key={item._id}>
              <span className="dot red"></span>
              {item.softwareName ?? "Unnamed Software"} — 
              {new Date(item.licenseExpiry).toLocaleDateString()}
            </li>
          ))
        ) : (
          <p className="empty-state">No software expiring soon</p>
        )}
      </ul>
    </div>

  </div>
</div>


      </div>

    </div>
  );
};

export default Dashboard;
