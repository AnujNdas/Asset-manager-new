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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";

import Loader from "../Components/Loader";
import "../Page_styles/AdminDashboard.css";

const LOCATION_COLORS = [
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#22C55E",
  "#F59E0B"
];

const BAR_COLORS = {
  hardware: "#3B82F6",
  software: "#8B5CF6",
  total: "#0F172A"
};

/* -------------------- TOOLTIP -------------------- */
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
    return (
    <div
      style={{
        background: "#0F172A",
        padding: "5px 10px",
        borderRadius: "8px",
        color: "#F8FAFC",
        fontSize: "12px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
      }}
    >
      <strong style={{ display: "block", marginBottom: 6 }}>{label}</strong>
      {payload.map((p, i) => (
        <div key={i} style={{ color: "#E5E7EB" }}>
          {p.name}: {CURRENCY_SYMBOLS[currency]}{" "}
          {p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
};
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


    // ✅ FIXED
    setStatsData(stats?.data || stats);
    setTopLocations(locs?.data || locs);
    setExpiringAssets(exp?.data || exp);
    setActiveUsers(users?.data || users);
    setLocationList(allLocs?.data || allLocs);
    setValuationData(valuation?.data || valuation);
    console.log("Valuation Data:", valuation?.data || valuation);
    console.log("All Locations:", allLocs?.data || allLocs);
    console.log("Top Locations:", locs?.data || locs);
    console.log("Stats Data:", stats?.data || stats);
    console.log("Expiring Assets:", exp?.data || exp);
    console.log("Active Users:", users?.data || users); 

    setApiDone(true);
    setTimeout(() => setLoading(false), 400);
  } catch (err) {
    console.error("Dashboard load error:", err);
    setLoading(false);
  }
};


    load(); 
  }, []);

  if (loading) return <Loader type="dashboard" apiDone={apiDone} />;

  const locChartData = topLocations.map((loc) => ({
    name: loc.name,
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


<div className="charts-grid">

        {/* TOP LOCATIONS */}
        <div className="chart-card">
          <h2>Top Locations by Asset Count</h2>

          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={locChartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={
                  <CustomTooltip currency={currency} />
                }
              />

              <Bar
                dataKey="value"
                barSize={14}
                radius={[4, 4, 4, 4]}
                isAnimationActive
                animationDuration={700}
              >
                {locChartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={LOCATION_COLORS[i % LOCATION_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MONTHLY VALUATION */}
        <div className="chart-card">
          <h2>Monthly Asset Valuation</h2>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={valuationChartData}
              layout="vertical"
              margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="month"
                width={70}
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={
                  <CustomTooltip currency={currency} />
                }
              />

              <Legend content={<HorizontalLegend />} />

              <Bar
                dataKey="hardware"
                name="Hardware"
                fill={BAR_COLORS.hardware}
                barSize={14}
                radius={[4, 4, 4, 4]}
              />
              <Bar
                dataKey="software"
                name="Software"
                fill={BAR_COLORS.software}
                barSize={14}
                radius={[4, 4, 4, 4]}
              />
              <Bar
                dataKey="total"
                name="Total"
                fill={BAR_COLORS.total}
                barSize={14}
                radius={[4, 4, 4, 4]}
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
