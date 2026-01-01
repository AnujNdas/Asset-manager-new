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
import CurrencyFilter from "../Components/CurrencyFilter";
import { useCurrency } from "../Context/CurrencyContext";
import { convertFromBase , CURRENCY_SYMBOLS } from "../utils/currency";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie,
  ResponsiveContainer, Cell, Legend, LineChart, Line
} from "recharts";

import Loader from "../Components/Loader";
import "../Page_styles/AdminDashboard.css";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#22C55E", "#F59E0B"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const [statsData, setStatsData] = useState(null);
  const [topLocations, setTopLocations] = useState([]);
  const [expiringAssets, setExpiringAssets] = useState({
  expiringHardware: [],
  expiringSoftware: []
});

  const [activeUsers, setActiveUsers] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [valuationData, setValuationData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);
    
  const getLocationName = (id) => {
    const loc = locationList.find((l) => l._id === id);
    return loc ? loc.name : "Unknown";
  };
const HorizontalLegend = ({ payload }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px",
        fontSize: "11px",
        marginTop: "4px",
        color: "#334155",
      }}
    >
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              backgroundColor: entry.color,
              display: "inline-block",
            }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
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
        console.log("EXPIRING ASSETS RESPONSE:", exp);
        setStatsData(stats);
        setTopLocations(locs);
        setExpiringAssets(exp);
        setActiveUsers(users);
        setLocationList(allLocs);
        setValuationData(valuation);

      // ✅ SIGNAL LOADER TO COMPLETE
      setApiDone(true);
     // small delay for smooth UX
      setTimeout(() => setLoading(false), 400);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setLoading(false); // only here
      }
    };

    load();
  }, []);

  if (loading) return <Loader type="dashboard" apiDone={apiDone} />;

  const locChartData = topLocations.map((loc) => ({
    name: getLocationName(loc._id),
    value: loc.count,
  }));
const valuationChartData =
  valuationData?.labels?.map((label, index) => ({
    month: label,
    hardware: convertFromBase(
      valuationData?.hardwareValuation?.[index] ?? 0,
      currency
    ),
    software: convertFromBase(
      valuationData?.softwareValuation?.[index] ?? 0,
      currency
    ),
    total: convertFromBase(
      valuationData?.totalValuation?.[index] ?? 0,
      currency
    ),
  })) || [];




const hardwareList = expiringAssets?.expiringHardware ?? [];
const softwareList = expiringAssets?.expiringSoftware ?? [];

const totalValuationView = convertFromBase(
  statsData?.totalValuation ?? 0,
  currency
);

const hardwareValuationView = convertFromBase(
  statsData?.hardwareValuation ?? 0,
  currency
);

const softwareValuationView = convertFromBase(
  statsData?.softwareValuation ?? 0,
  currency
);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
  <h2>Admin Dashboard</h2>
  <CurrencyFilter />
</div>
      {/* TOP STATS */}
     <div className="stats-grid">

  {/* Total Valuation */}
  <div className="stat-card green">
    <div className="stat-1">
    <p>Total Asset Valuation</p>
    <p>Hardware + Software</p>
  </div>
      <div className="stat-2">
    <h2>
  {CURRENCY_SYMBOLS[currency]} {totalValuationView.toLocaleString()}
</h2>

  </div>
  </div>
  {/* Hardware */}
  <div className="stat-card purple" onClick={() => navigate("/inventory?tab=hardware")}>
    <div className="stat-1">
    <h2>{statsData?.hardwareCount ?? 0}</h2>
    <p>Hardware Assets</p>
      </div>
    <div className="stat-2">
    <h2>
  {CURRENCY_SYMBOLS[currency]} {hardwareValuationView.toLocaleString()}
</h2>

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
    <h2>
  {CURRENCY_SYMBOLS[currency]} {softwareValuationView.toLocaleString()}
</h2>

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
    <BarChart
      data={locChartData}
      layout="vertical"
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <XAxis
        type="number"
        tick={{ fontSize: 11 }}
        axisLine={true}
        tickLine={true}
      />

      <YAxis
        type="category"
        dataKey="name"
        width={70}                 // 🔥 KEY FIX
        tick={{ fontSize: 11 }}
        axisLine={true}
        tickLine={true}
      />

      <Tooltip />

      <Bar
        dataKey="value"
        barSize={18}               // thicker bars
        radius={0}                 // squared ends
      >
        {locChartData.map((_, index) => (
          <Cell
            key={index}
            fill={[
              "#4988C4",
              "#1D546D",
              "#0F2854",
              "#5C9BCF",
              "#2E6F95",
            ][index % 5]}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>



        {/* MONTHLY VALUATION CHART */}
<div className="chart-card">
  <h2>Monthly Asset Valuation Trend</h2>

  <ResponsiveContainer width="100%" height={220}>
    <BarChart
      data={valuationChartData}
      layout="vertical"
      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
    >
      <XAxis
        type="number"
        tick={{ fontSize: 11 }}
        axisLine={true}
        tickLine={true}
      />

      <YAxis
        type="category"
        dataKey="month"
        width={65}                 // 🔥 critical
        tick={{ fontSize: 11 }}
        axisLine={true}
        tickLine={true}
      />

      <Tooltip
  formatter={(value) => [`${currency} ${value.toLocaleString()}`, "Value"]}
/>


 <Legend content={<HorizontalLegend />} />

      <Bar
        dataKey="hardware"
        name="Hardware"
        fill="#4988C4"
        barSize={20}
        radius={0}
      />
      <Bar
        dataKey="software"
        name="Software"
        fill="#1D546D"
        barSize={20}
        radius={0}
      />
      <Bar
        dataKey="total"
        name="Total"
        fill="#0F2854"
        barSize={20}
        radius={0}
      />
    </BarChart>
  </ResponsiveContainer>
</div>




      </div>

      {/* BOTTOM GRID */}
      <div className="grid-2">

        {/* ACTIVE USERS */}
{/* ACTIVE USERS */}
<div className="panel-card">
  <h2>Most Active Users</h2>

  <ul className="active-users-list">
    {activeUsers?.map((u) => (
      <li key={u._id} className="active-user-item">
        <img
          src={`https://robohash.org/${u.username || "guest"}?set=set2&size=50x50`}
          alt="avatar"
          className="avatar"
        />

        <div className="user-meta">
          <strong className="username">{u.username}</strong>
          <span className="email">{u.email}</span>
          <small className="last-active">
            Last active: {new Date(u.updatedAt).toLocaleString()}
          </small>
        </div>
      </li>
    ))}
  </ul>
</div>


        {/* EXPIRING ASSETS */}
<div className="panel-card expiring-panel">
  <h2>Assets Requiring Attention</h2>

  <div className="expiring-grid">

    {/* Hardware */}
    <div className="expiring-column">
      <h3>Hardware ({hardwareList.length})</h3>

      <ul>
        {hardwareList.length > 0 ? (
          hardwareList.map((item) => (
            <li key={item._id}>
              <span className="dot red"></span>
              {item.name ?? "Unnamed Hardware"} — 
              Warranty ends on {new Date(item.expiry).toLocaleDateString()}
            </li>
          ))
        ) : (
          <p className="empty-state">No hardware requiring attention</p>
        )}
      </ul>
    </div>

    {/* Software */}
    <div className="expiring-column">
      <h3>Software ({softwareList.length})</h3>

      <ul>
        {softwareList.length > 0 ? (
          softwareList.map((item) => (
            <li key={item._id}>
              <span className="dot red"></span>
              {item.name ?? "Unnamed Software"} — 
              Expires on {new Date(item.expiry).toLocaleDateString()}
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
