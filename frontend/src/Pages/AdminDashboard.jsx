import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getDistribution,
  getMonthlySubscription,
  getMonthlyValuation,
  getSoftwareLicenseUtilization,
  getUpcomingSoftwareExpiry
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
  CartesianGrid,
  PieChart,
  Pie,
  Legend as PieLegend
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
  const [monthlySubscription, setMonthlySubscription] = useState(null);
  const [softwareDistribution, setSoftwareDistribution] = useState(null);
  const [licenseUtilization, setLicenseUtilization] = useState(null);
const [upcomingExpiry, setUpcomingExpiry] = useState(null);

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
    const valuation = await getMonthlyValuation();
    const monthlySub = await getMonthlySubscription();
    const distribution = await getDistribution();
    const utilization = await getSoftwareLicenseUtilization();
    const expiry = await getUpcomingSoftwareExpiry();
    setStatsData(stats?.data || stats);
    setValuationData(valuation?.data || valuation);
    setMonthlySubscription(monthlySub);
    setSoftwareDistribution(distribution);
    setLicenseUtilization(utilization);
    setUpcomingExpiry(expiry);
    console.log("Dashboard data loaded:", {
      stats,
      valuation,
      monthlySub,
      distribution,
    });
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

    {/* TOP SECTION */}
    <div className="top-section">
      {/* KPI 2x2 */}
      <div className="kpi-2x2">
        <div className="stat-card green">
          <p>Total Valuation</p>
          <h3>
            {CURRENCY_SYMBOLS[currency]}{" "}
            {totalValuationView.toLocaleString()}
          </h3>
        </div>

        <div
          className="stat-card purple"
          onClick={() => navigate("/inventory?tab=hardware")}
        >
          <p>Hardware Assets</p>
          <h3>{statsData?.hardwareCount ?? 0}</h3>
          <p>{hardwareValuationView.toLocaleString()} {CURRENCY_SYMBOLS[currency]}</p>
        </div>

        <div
          className="stat-card violet"
          onClick={() => navigate("/inventory?tab=software")}
          >
          <p>Software Assets</p>
          <h3>{statsData?.softwareCount ?? 0}</h3>
          <p>{softwareValuationView.toLocaleString()} {CURRENCY_SYMBOLS[currency]}</p>
        </div>

        <div
          className="stat-card pink"
          onClick={() => navigate("/setting/users")}
        >
          <p>Total Users</p>
          <h3>{statsData?.usersCount ?? 0}</h3>
        </div>
      </div>

      {/* VALUATION CHART */}
      <div className="chart-card valuation-card">
        <h2>Monthly Asset Valuation</h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={valuationChartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="month" width={70} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend content={<HorizontalLegend />} />
            <Bar dataKey="hardware" fill={BAR_COLORS.hardware} />
            <Bar dataKey="software" fill={BAR_COLORS.software} />
            <Bar dataKey="total" fill={BAR_COLORS.total} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* MIDDLE ROW */}
    <div className="three-grid">
            <div className="chart_box">
  <h2>Software Distribution</h2>

  <div className="pie-layout">
    {/* Pie Chart */}
    <div className="pie-chart">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={softwareDistribution?.labels?.map((l, i) => ({
              name: l,
              value: softwareDistribution.values[i]
            }))}
            dataKey="value"
            innerRadius={45}
            outerRadius={85}
            paddingAngle={2}
          >
            {softwareDistribution?.labels?.map((_, i) => (
              <Cell key={i} fill={LOCATION_COLORS[i % 5]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Custom Legend */}
    <div className="pie-legend">
      {softwareDistribution?.labels?.map((label, i) => (
        <div key={i} className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: LOCATION_COLORS[i % 5] }}
          />
          <span className="legend-label">{label}</span>
          <span className="legend-value">
            {softwareDistribution.values[i]}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>
      <div className="panel-card">
        <h2>Software License Utilization</h2>
        {licenseUtilization?.labels?.map((name, index) => {
  const used = licenseUtilization.inUse[index];
  const total = licenseUtilization.totalLicenses[index];

  const percent = total > 0 ? (used / total) * 100 : 0;
  console.log(name, used, total, percent);
  const color =
  percent > 80 ? "#22c55e" :
  percent > 40 ? "#38bdf8" :
  "#f59e0b";


  return (
    <div key={name} className="utilization-row">
      <div className="utilization-header">
        <span>{name}</span>
        <span>{used}/{total}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` , backgroundColor: color }}
        />
      </div>
    </div>
  );
})}

      </div>

      <div className="panel-card">
        <h2>Upcoming License Expiry</h2>
        <div className="expiry-summary">
          <div className="expiry critical">
            <strong>{upcomingExpiry?.critical?.length ?? 0}</strong>
            <span>30 Days</span>
          </div>
          <div className="expiry warning">
            <strong>{upcomingExpiry?.warning?.length ?? 0}</strong>
            <span>60 Days</span>
          </div>
          <div className="expiry normal">
            <strong>{upcomingExpiry?.normal?.length ?? 0}</strong>
            <span>90 Days</span>
          </div>
        </div>
      </div>

      {/* <div className="panel-card">
        <h2>Monthly Subscriptions</h2>
        {monthlySubscription?.labels?.map((name, i) => (
          <div key={name} className="subscription-item">
            <span>{name}</span>
            <span>
              {CURRENCY_SYMBOLS[currency]}{" "}
              {convertFromBase(
                monthlySubscription.monthlyCost[i],
                currency
              ).toLocaleString()}
            </span>
          </div>
        ))}
      </div> */}


    </div>

  </div>
);

};

export default Dashboard;
