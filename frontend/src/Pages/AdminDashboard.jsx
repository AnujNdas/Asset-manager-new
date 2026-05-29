import React, { useEffect, useState } from "react";
import { getDashboardData } from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";
import LocationInsights from "../Components/LocationInsights";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { getErrorMessage } from "../utils/getErrorMessage";
import Swal from "sweetalert2"; // (recommended since you're already using it elsewhere)
import { scaleLinear } from "d3-scale";
import {  useMemo } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";


const COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
];


countries.registerLocale(enLocale);

const geoUrl =
  "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const COUNTRY_NAME_MAP = {
  USA: "United States of America",
  "United states": "United States of America",
  "United States": "United States of America",
  "United kingdom": "United Kingdom",
  UK: "United Kingdom"
};



const AdminDashboard = () => {
  console.log("AdminDashboard mounted");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("useEffect triggered");

  const fetchDashboard = async () => {
    console.log("Calling API...");

    try {
      const res = await getDashboardData();
      console.log("Dashboard data:", res);
      setData(res);
    }catch (error) {
  console.error("Dashboard error:", error);

  Swal.fire(
    "Error",
    getErrorMessage(error, "Failed to load dashboard data"),
    "error"
  );
} finally {
      console.log("Finished API call");
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);

 if (loading) { 
    return (
     <Loader />
    );
  }

if (!data) {
  return (
    <div className="dashboard-container">
      <p className="empty-text">No dashboard data available</p>
    </div>
  );
}

const { totals, upcoming, analytics, costBreakdown } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
  <h1 className="dashboard-title">Admin Dashboard</h1>
</div>

      {/* ================= TOP METRICS ================= */}
      <div className="metrics-grid">
<MetricCard
  title="Total Valuation"
  value={`$ ${totals.overallValuation.toLocaleString()}`}
/>

<MetricCard
  title="Software Assets"
  value={totals.softwareCount}
  sub={`${totals.softwareInstances} Instances • $ ${totals.softwarePurchaseValue.toLocaleString()}`}
  redirectTo="/inventory?software"
/>

<MetricCard
  title="Hardware Assets"
  value={totals.hardwareCount}
  sub={`${totals.hardwareInstances} Instances • $ ${totals.hardwarePurchaseValue.toLocaleString()}`}
  redirectTo="/inventory?hardware"
/>

        <MetricCard
          title="Users / Team-members"
          value={`${totals.usersCount} / ${totals.employeesCount}`}
          redirectTo="/setting/users"
        />
      </div>

      {/* ================= UPCOMING SECTION ================= */}


      {/* ================= ANALYTICS SECTION ================= */}
      <div className="section-grid">
        <div className="analytics-card">
  <h3 className="analytics-title">
    Spend by Category (Top 5)
  </h3>

  <SpendByCategoryBarChart
    data={analytics.spendByCategory}
  />
</div>

<AnalyticsCard
  title="Top IT Assets"
  items={analytics.topAssets}
  labelKey="assetName"
  valueKey="totalCost"
          redirectTo="/inventory?software"
        />

          <DepartmentAnalyticsCard
    title="Top Departments by Asset Allocation"
    items={analytics.departmentAssignments}
  />
      </div>
<div className="section-grid2">

  {/* SOFTWARE */}


<ListCard
  title="Upcoming Software Renewals"
  items={upcoming.software?.upcoming || []}
  dateField="renewal"
/>

  {/* MAINTENANCE */}

<ListCard
  title="Upcoming Hardware Maintenance"
  items={upcoming.maintenance?.upcoming || []}
  dateField="maintenance"
/>
  {/* WARRANTY */}


<ListCard
  title="Upcoming Hardware Warranty"
  items={upcoming.warranty?.upcoming || []}
  dateField="warranty"
/>


  {/* INSURANCE */}


<ListCard
  title="Upcoming Hardware Insurance"
  items={upcoming.insurance?.upcoming || []}
  dateField="insurance"
/>

  {/* <ListCard
    title="Expired Hardware Insurance"
    items={upcoming.insurance?.expired || []}
    dateField="insurance.expiryDate"
  />
    <ListCard
    title="Expired Hardware Maintenance"
    items={upcoming.maintenance?.expired || []}
    dateField="DOE"
  />
    <ListCard
    title="Expired Hardware Warranty"
    items={upcoming.warranty?.expired || []}
    dateField="warranty.expiryDate"
  />
    <ListCard
    title="Expired Software Renewals"
    items={upcoming.software?.expired || []}
    dateField="DOE"
  /> */}
</div>
<div className="section-grid2">
  <CostBreakdownCard
    title="Top Maintenance Costs"
    items={costBreakdown.maintenance}
  />

  <CostBreakdownCard
    title="Top Warranty Costs"
    items={costBreakdown.warranty}
  />

  <CostBreakdownCard
    title="Top Insurance Costs"
    items={costBreakdown.insurance}
  />

  <CostBreakdownCard
    title="Top Software Renewal Costs"
    items={costBreakdown.renewal}
  />
</div>
      <div className="section-grid">
      <LocationInsights items={analytics.topLocations} />
</div>
    </div>
  );
};

export default AdminDashboard;


/* ================= SUB COMPONENTS ================= */

const MetricCard = ({ title, value, sub, redirectTo }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card metric-card clickable-card"
      onClick={() => redirectTo && navigate(redirectTo)}
      role="button"
    >
      <p className="card-title">{title}</p>
      <h2 className="metric-value">{value}</h2>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  );
};

const ListCard = ({ title, items, dateField , redirectTo }) => {
  const navigate = useNavigate();

  const getDateValue = (item) => {
    if (dateField.includes(".")) {
      const keys = dateField.split(".");
      return item?.[keys[0]]?.[keys[1]];
    }
    return item?.[dateField];
  };

  const getFormattedDate = (item) => {
    const value = getDateValue(item);
    return value ? new Date(value).toLocaleDateString() : "-";
  };

  const getDaysLeft = (item) => {
    const value = getDateValue(item);
    if (!value) return null;

    const today = new Date();
    const target = new Date(value);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className="card"
    onClick={() => redirectTo && navigate(redirectTo)}>
      <h3 className="card-heading">{title}</h3>

      {items.length === 0 ? (
        <p className="empty-text">No upcoming items</p>
      ) : (
        <div className="list">
          {items.map((item, index) => {
            const daysLeft = getDaysLeft(item);
            const isUrgent = daysLeft !== null && daysLeft < 10;

            return (
              <div key={index} className="list-row">
                <div className="left-section">
                  <span className="asset-name">
                    {item.deviceName || `Asset #${item.assetId?.slice(-4)}`}
                  </span>
                  <span className="date-text">
                    {getFormattedDate(item)}
                  </span>
                </div>

                {daysLeft !== null && (
                  <div
                    className={
                      isUrgent
                        ? "days-badge urgent"
                        : "days-badge normal"
                    }
                  >
                    {daysLeft > 0
                      ? `${daysLeft} days left`
                      : "Expired"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AnalyticsCard = ({
  title,
  items,
  labelKey,
  valueKey,
  redirectTo
}) => {
  const navigate = useNavigate();

  const getValue = (obj, path) =>
    path.split(".").reduce((o, key) => o?.[key], obj);

  return (
    <div
      className="card clickable-card"
      onClick={() => redirectTo && navigate(redirectTo)}
    >
      <h3 className="card-heading">{title}</h3>

      <div className="list">
        {items.map((item, index) => {
          const rawValue = getValue(item, valueKey) || 0;

          return (
            <div key={index} className="list-row">
              <span>{getValue(item, labelKey)}</span>

              <span className="value-text">
                $ {rawValue.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const DepartmentAnalyticsCard = ({ title, items }) => {
  return (
    <div className="card">
      <h3 className="card-heading">{title}</h3>

      {items.length === 0 ? (
        <p className="empty-text">No department data</p>
      ) : (
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Assets <br/> (H | S)</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.departmentName || "N/A"}</td>

                  <td>
                    {dept.hardware || 0} | {dept.software || 0}
                  </td>

                  <td className="text-right">
                    <strong>
                      {(dept.hardware || 0) + (dept.software || 0)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
const resolveCountryName = (raw) => {
  if (!raw) return null;

  const value = raw.trim();

  // 1️⃣ Try ISO alpha-2 (US, ES, GB)
  if (value.length === 2) {
    const name = countries.getName(value.toUpperCase(), "en");
    if (name) return name;
  }

  // 2️⃣ Try ISO alpha-3 (USA, ESP, GBR)
  if (value.length === 3) {
    const alpha2 = countries.alpha3ToAlpha2(value.toUpperCase());
    if (alpha2) {
      return countries.getName(alpha2, "en");
    }
  }

  // 3️⃣ Try full country name match
  const allCountries = countries.getNames("en");

  const match = Object.values(allCountries).find(
    country =>
      country.toLowerCase() === value.toLowerCase()
  );

  if (match) return match;

  return null; // Not a country
};
const TopLocationsMap = ({ title, items }) => {
  const [tooltip, setTooltip] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const navigate = useNavigate();
  /* ================= NORMALIZE LOCATION DATA ================= */

  const locationMap = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      if (!item?.name) return;

      const parts = item.name.split(",");

      let detectedCountry = null;

      for (let part of parts) {
        const resolved = resolveCountryName(part);
        if (resolved) {
          detectedCountry = resolved;
          break;
        }
      }

      if (!detectedCountry) return;

      if (detectedCountry === "United States") {
        detectedCountry = "United States of America";
      }

      map[detectedCountry] =
        (map[detectedCountry] || 0) + (item.total || 0);
    });

    return map;
  }, [items]);

  /* ================= LEGEND VALUES ================= */

  const values = useMemo(() => Object.values(locationMap), [locationMap]);

  const maxValue = values.length ? Math.max(...values) : 0;
  const minValue = values.length ? Math.min(...values) : 0;

  const colorScale = scaleLinear()
    .domain([0, maxValue || 1])
    .range(["#e8f0fe", "#1a73e8"]);

  /* ================= SORTED LIST DATA ================= */

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.total - a.total);
  }, [items]);

  /* ================= HANDLERS ================= */

  const handleMouseMove = (e) => {
    setPosition({
      x: e.clientX + 10,
      y: e.clientY + 10,
    });
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev * 1.5, 4));
  const zoomOut = () => setZoom((prev) => Math.max(prev / 1.5, 1));
  const resetZoom = () => setZoom(1);

  /* ================= RENDER ================= */

  return (
    <div className="card" onClick={() => navigate("/locations")}>
      <h3 className="card-heading">{title}</h3>

      <div className="map-container">

        {/* ================= MAP ================= */}
        <div className="map-section" onMouseMove={handleMouseMove}>
          <ComposableMap projectionConfig={{ scale: 150 }}>
            <ZoomableGroup zoom={zoom} minZoom={1} maxZoom={4}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    const value = locationMap[countryName] || 0;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(value)}
                        stroke="#DDD"
                        onMouseEnter={() => {
                          if (value > 0) {
                            setTooltip({
                              name: countryName,
                              value,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            fill: "#174ea6",
                            outline: "none",
                            cursor: value > 0 ? "pointer" : "default",
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* ================= TOOLTIP ================= */}
          {tooltip && (
            <div
              className="map-tooltip"
              style={{
                position: "fixed",
                top: position.y,
                left: position.x,
              }}
            >
              <strong>{tooltip.name}</strong>
              <br />
              Total: {tooltip.value}
            </div>
          )}

          {/* ================= ZOOM CONTROLS ================= */}
          <div className="zoom-controls">
            <button onClick={zoomIn}>+</button>
            <button onClick={zoomOut}>−</button>
            <button onClick={resetZoom}>Reset</button>
          </div>
        </div>

        {/* ================= SIDE LIST ================= */}
        <div className="map-data">
          {sortedItems.length === 0 ? (
            <p className="empty-text">No location data</p>
          ) : (
            sortedItems.map((item, index) => (
              <div key={index} className="list-row">
                <span>{item.name}</span>
                <span className="value-text">{item.total}</span>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ================= COLOR LEGEND ================= */}
      <div className="map-legend">
        <span>{minValue}</span>

        <div
          className="legend-gradient"
          style={{
            background:
              "linear-gradient(to right, #e8f0fe, #1a73e8)",
          }}
        />

        <span>{maxValue}</span>
      </div>
    </div>
  );
};  
const formatCurrency = (value) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  } else {
    return value.toFixed(0);
  }
};
const SpendByCategoryBarChart = ({ data }) => {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!data || data.length === 0) {
    return <div className="chart-empty">No spend data available</div>;
  }

const chartData = data.map((item) => ({
  ...item,
}));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 , color : "#DFD0B8"}}>
            {payload[0].payload.category}
          </div>

          <div style={{ color: "#DFD0B8", fontWeight: 500 }}>
$ {formatCurrency(payload[0].payload.totalSpend)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "16px",
        padding: isMobile ? "6px" : "24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      <ResponsiveContainer width="100%" height={isMobile ? chartData.length * 45 : 380}>
  <BarChart
    data={chartData}
    layout={isMobile ? "vertical" : "horizontal"}
      margin={{
        top: 20,
        right: isMobile ? 10 : 20,
        left: isMobile ? 10 : 0,
        bottom: isMobile ? 10 : 40,
      }}
  >
    <defs>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DFD0B8" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#DFD0B8" stopOpacity={0.7} />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

    {isMobile ? (
      <>
        {/* Horizontal chart axes */}
        <XAxis
          type="number"
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => `$${formatCurrency(value)}`}
        />

<YAxis
  type="category"
  dataKey="category"
  width={90}
  tick={{ fontSize: 11 }}
/>
      </>
    ) : (
      <>
        {/* Desktop chart axes */}
        <XAxis
          dataKey="category"
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-15}
          textAnchor="end"
        />

<YAxis
  tickFormatter={(value) => `$${formatCurrency(value)}`}
/>
      </>
    )}

    <Tooltip content={<CustomTooltip />} />

    {!isMobile && (
<Legend
  verticalAlign="bottom"
  align="center"
  layout="horizontal"
  wrapperStyle={{
    paddingTop: 20,
    fontSize: 13,
    color: "#DFD0B8"
  }}
/>
    )}

    <Bar
      dataKey="totalSpend"
      name="Total Spend"
      fill="url(#barGradient)"
      radius={isMobile ? [0, 8, 8, 0] : [8, 8, 0, 0]}
    >
      {!isMobile && (
<LabelList
  dataKey="totalSpend"
  position="top"
  formatter={(value) => `$${formatCurrency(value)}`}
/>
      )}
    </Bar>
  </BarChart>
</ResponsiveContainer>
    </div>
  );
};

const CostBreakdownCard = ({ title, items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="card">
        <h3 className="card-heading">{title}</h3>
        <p className="empty-text">No data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-heading">{title}</h3>

      <div className="list">
        {items.map((item, index) => {
          return (
            <div key={item._id || index} className="list-row">
              <span>{item.instanceName}</span>

              <span className="value-text">
                $ {(item.cost || 0).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
