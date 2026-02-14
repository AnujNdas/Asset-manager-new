  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import {
    getAdminStats,
    getDistribution,
    getMonthlySubscription,
    getMonthlyValuation,
    getSoftwareLicenseUtilization,
    getUpcomingSoftwareExpiry,
    getHardwareMaintenanceDue,
    getSoftwareCostMetrics,
    getDepartmentAssetDistribution
  } from "../Services/ApiServices";
  import CurrencyFilter from "../Components/CurrencyFilter";
  import { useCurrency } from "../Context/CurrencyContext";
  import { convertFromBase , CURRENCY_SYMBOLS } from "../utils/currency";

  import {
    BarChart,
    ScatterChart,
    Scatter,
    LineChart,
    Line,
    Bar,
    XAxis,
    AreaChart,
    Area,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend,
    CartesianGrid,
    PieChart,
    Pie,
    Treemap,
    Legend as PieLegend
  } from "recharts";

  import Loader from "../Components/Loader";
  import "../Page_styles/AdminDashboard.css";
  const CustomizedTreemap = ({
    x,
    y,
    width,
    height,
    name,
    size,
    currency
  }) => {
    if (!size || width < 60 || height < 30) return null;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#8B5CF6"
          rx={6}
        />

        <text
          x={x + 8}
          y={y + 18}
          fill="#fff"
          fontSize={12}
          fontWeight={600}
        >
          {name || "Unknown"}
        </text>

        <text
          x={x + 8}
          y={y + 34}
          fill="#E5E7EB"
          fontSize={11}
        >
          {CURRENCY_SYMBOLS[currency]} {(size || 0).toLocaleString()}
        </text>
      </g>
    );
  };

  const TreemapTooltip = ({ active, payload, currency }) => {
    if (!active || !payload?.length) return null;

    const { name, size, quantity } = payload[0].payload;

    return (
      <div className="chart-tooltip">
        <strong>{name}</strong>
        <div>Cost: {currency} {size.toLocaleString()}</div>
        <div>Licenses: {quantity}</div>
      </div>
    );
  };

  const LOCATION_COLORS = [
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#22C55E",
    "#F59E0B"
  ];
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#FFBB28",
  "#FF4444",
  "#00C49F",
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
    const [hardwareMaintenance, setHardwareMaintenance] = useState(null);
  const [softwareCostMetrics, setSoftwareCostMetrics] = useState(null);
  const [departmentAssets, setDepartmentAssets] = useState(null);

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
      const maintenance = await getHardwareMaintenanceDue();
      const softwareCost = await getSoftwareCostMetrics();
      const deptAssets = await getDepartmentAssetDistribution();

      setHardwareMaintenance(maintenance);
      setSoftwareCostMetrics(softwareCost?.data || softwareCost);
      setDepartmentAssets(deptAssets);

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
    <AreaChart
      data={valuationChartData}
      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
    >
      <defs>
        <linearGradient id="hardwareWave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BAR_COLORS.hardware} stopOpacity={0.6} />
          <stop offset="100%" stopColor={BAR_COLORS.hardware} stopOpacity={0.05} />
        </linearGradient>

        <linearGradient id="softwareWave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BAR_COLORS.software} stopOpacity={0.6} />
          <stop offset="100%" stopColor={BAR_COLORS.software} stopOpacity={0.05} />
        </linearGradient>

        <linearGradient id="totalWave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BAR_COLORS.total} stopOpacity={0.6} />
          <stop offset="100%" stopColor={BAR_COLORS.total} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip content={<CustomTooltip currency={currency} />} />
      <Legend content={<HorizontalLegend />} />

     <Area
  type="natural"
  dataKey="hardware"
  stroke={BAR_COLORS.hardware}
  fill="url(#hardwareWave)"
  strokeWidth={2}
  dot={false}
    animationDuration={1400}
  animationEasing="ease-in-out"
/>

<Area
  type="natural"
  dataKey="software"
  stroke={BAR_COLORS.software}
  fill="url(#softwareWave)"
  strokeWidth={2}
  dot={false}
/>

<Area
  type="natural"
  dataKey="total"
  stroke={BAR_COLORS.total}
  fill="url(#totalWave)"
  strokeWidth={3}
  dot={false}
/>

    </AreaChart>
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

  {(licenseUtilization?.labels || []).map((name, index) => {

    const used = Number(licenseUtilization?.inUse?.[index] ?? 0);
    const total = Number(licenseUtilization?.totalLicenses?.[index] ?? 0);

    const percent =
      total > 0 && !isNaN(used)
        ? Math.min((used / total) * 100, 100)
        : 0;

    const status =
      percent >= 80 ? "high" :
      percent >= 40 ? "medium" :
      "low";

    return (
      <div key={name || index} className="util-card">

        <div className="util-top">
          <span className="util-name">{name || "Unknown"}</span>
          <span className="util-count">{used}/{total}</span>
        </div>

        <div className="util-track">
          <div
            className={`util-fill util-${status}`}
            style={{ width: `${percent}%` }}
          />

          <span className="util-percent">
            {percent.toFixed(0)}%
          </span>
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
        <div className="panel-card">
    <h2>Hardware Maintenance</h2>

    {hardwareMaintenance?.data?.length === 0 && (
      <p className="empty-state">No maintenance due 🎉</p>
    )}

  {[
    ...(hardwareMaintenance?.overdue || []),
    ...(hardwareMaintenance?.upcoming || [])
  ]
  .slice(0, 5)
  .map(asset => (
    <div key={asset._id} className="expiry-row">
      <div>
        <strong>{asset.assetName}</strong>
        <p className="muted">{asset.locationAddress || "-"}</p>
      </div>

      <span
        className={`badge ${
          asset.daysOverdue
            ? "critical"
            : asset.daysLeft <= 7
            ? "warning"
            : "normal"
        }`}
      >
        {asset.daysOverdue
          ? `${asset.daysOverdue} overdue`
          : `${asset.daysLeft} days`}
      </span>
    </div>
  ))}

  </div>
<div className="chart-card">
  <h2>Software Cost by Type</h2>

  <ResponsiveContainer width="100%" height={260}>
    <BarChart
      data={(Array.isArray(softwareCostMetrics) ? softwareCostMetrics : [])
        .filter(t => t.totalCost > 0)
        .map(t => ({
          type: t.type || "One-time",
          cost: convertFromBase(t.totalCost, currency),
          quantity: t.totalQuantity
        }))
      }
      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} />

      <XAxis dataKey="type" />

      <YAxis
        tickFormatter={(val) =>
          `${CURRENCY_SYMBOLS[currency]}${(val / 1000).toFixed(0)}k`
        }
      />

      <Tooltip
        formatter={(value, name, props) => {
          if (name === "Cost") {
            return [
              `${CURRENCY_SYMBOLS[currency]} ${value.toLocaleString()}`,
              "Cost"
            ];
          }
          return [value, "Licenses"];
        }}
      />

      <Legend />

      {/* Cost Bar */}
      <Bar
        dataKey="cost"
        name="Cost"
        radius={[6, 6, 0, 0]}
        fill="#6366F1"
      />

      {/* Quantity Bar */}
      <Bar
        dataKey="quantity"
        name="Licenses"
        radius={[6, 6, 0, 0]}
        fill="#22C55E"
      />
    </BarChart>
  </ResponsiveContainer>
</div>



<div className="chart-card">
  <h2>Assets by Department</h2>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Tooltip
        formatter={(value) => value?.toLocaleString?.() || 0}
      />
      <Legend />

      <Pie
        data={(departmentAssets || []).map((d) => ({
          name: d.departmentName,
          value: (d.hardware || 0) + (d.software || 0),
        }))}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {(departmentAssets || []).map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
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
