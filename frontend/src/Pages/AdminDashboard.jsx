import React, { useEffect, useState } from "react";
import { getDashboardData } from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import CurrencyFilter from "../Components/CurrencyFilter";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
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
const { currency, convertFromBase, loadingRates } = useCurrency();
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
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      console.log("Finished API call");
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);

 if (loading || loadingRates) { 
    return (
      <div className="dashboard-loader">
        <div className="spinner"></div>
      </div>
    );
  }

  const { totals, upcoming, analytics } = data;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
  <h1 className="dashboard-title">Admin Dashboard</h1>
  <CurrencyFilter />
</div>

      {/* ================= TOP METRICS ================= */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Valuation"
          value={` ${CURRENCY_SYMBOLS[currency]} ${convertFromBase(
  totals.overallValuation,
).toLocaleString()}`}

        />

        <MetricCard
          title="Software Assets"
          value={totals.softwareCount}
          sub={`${CURRENCY_SYMBOLS[currency]} ${convertFromBase(
  totals.softwareValuation,
).toLocaleString()}`}
redirectTo="/inventory?software"
        />

        <MetricCard
          title="Hardware Assets"
          value={totals.hardwareCount}
          sub={`${CURRENCY_SYMBOLS[currency]} ${convertFromBase(
  totals.hardwareValuation,
).toLocaleString()}`}
redirectTo="/inventory?hardware"
        />

        <MetricCard
          title="Users / Team-members"
          value={`${totals.usersCount} / ${totals.teamsCount}`}
          redirectTo="/setting/users"
        />
      </div>

      {/* ================= UPCOMING SECTION ================= */}


      {/* ================= ANALYTICS SECTION ================= */}
      <div className="section-grid">
        <div className="analytics-card">
  <h3 className="analytics-title">
    Software Spend by Category (Top 5)
  </h3>

  <SpendByCategoryBarChart
    data={analytics.spendByCategory}
  />
</div>

        <AnalyticsCard
          title="Top IT Assets"
          items={analytics.topAssets}
          labelKey="assetName"
          valueKey="assetCost.baseTotalAmount"
          currency={currency}
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
    title="Upcoming Software Renewals (30 Days)"
    items={upcoming.software?.upcoming || []}
    dateField="DOE"
    redirectTo="/inventory?software"
  />

  {/* MAINTENANCE */}


  <ListCard
    title="Upcoming Hardware Maintenance (30 Days)"
    items={upcoming.maintenance?.upcoming || []}
    dateField="DOE"
    redirectTo="/inventory?hardware"
  />
  {/* WARRANTY */}


  <ListCard
    title="Upcoming Hardware Warranty (30 Days)"
    items={upcoming.warranty?.upcoming || []}
    dateField="warranty.expiryDate"
    redirectTo="/inventory?hardware"
  />


  {/* INSURANCE */}


  <ListCard
    title="Upcoming Hardware Insurance (30 Days)"
    items={upcoming.insurance?.upcoming || []}
    dateField="insurance.expiryDate"
    redirectTo="/inventory?hardware"
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

      <div className="section-grid">
      <TopLocationsMap
  title="Top Locations"
  items={analytics.topLocations}
/>
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
                    {item.assetName}
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
  const { currency, convertFromBase} = useCurrency();
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
          const converted = convertFromBase(rawValue);

          return (
            <div key={index} className="list-row">
              <span>{getValue(item, labelKey)}</span>
              <span className="value-text">
                {CURRENCY_SYMBOLS[currency]}{" "}
                {converted.toLocaleString()}
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
        <p className="empty-text">No employee data</p>
      ) : (
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Dept</th>
                <th>Name</th>
                <th>Assets (H | S)</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((emp, index) => (
                <tr key={index}>
                  <td>{emp.departmentName}</td>
                  <td>{emp.employeeName}</td>
                  <td>
                    {emp.hardwareCount} | {emp.softwareCount}
                  </td>
                  <td className="text-right">
                    <strong>{emp.totalAssignedQuantity}</strong>
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

  items.forEach(item => {
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

    if (!detectedCountry) return; // Skip if no real country found

    // Special case: Map expects full official name
    if (detectedCountry === "United States") {
      detectedCountry = "United States of America";
    }

    map[detectedCountry] =
      (map[detectedCountry] || 0) + (item.total || 0);
  });

  return map;
}, [items]);

  const values = Object.values(locationMap);
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const minValue = values.length > 0 ? Math.min(...values) : 0;

  const colorScale = scaleLinear()
    .domain([0, maxValue || 1])
    .range(["#e8f0fe", "#1a73e8"]);

  /* ================= HANDLERS ================= */

  const handleMouseMove = e => {
    setPosition({
      x: e.clientX + 10,
      y: e.clientY + 10
    });
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.5, 4));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const resetZoom = () => setZoom(1);

  /* ================= RENDER ================= */

  return (
    <div className="card" 
    onClick={() => navigate("/locations")}
    >
      <h3 className="card-heading">{title}</h3>

      <div className="map-container">
        {/* ================= MAP ================= */}
        <div className="map-section" onMouseMove={handleMouseMove}>
          <ComposableMap projectionConfig={{ scale: 150 }}>
            <ZoomableGroup zoom={zoom} minZoom={1} maxZoom={4}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
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
                              value
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            fill: "#174ea6",
                            outline: "none",
                            cursor: value > 0 ? "pointer" : "default"
                          },
                          pressed: { outline: "none" }
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
                left: position.x
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
          {values.length === 0 ? (
            <p className="empty-text">No location data</p>
          ) : (
            Object.entries(locationMap)
              .sort((a, b) => b[1] - a[1])
              .map(([country, total], index) => (
                <div key={index} className="list-row">
                  <span>{country}</span>
                  <span className="value-text">
                    {total}
                  </span>
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
              "linear-gradient(to right, #e8f0fe, #1a73e8)"
          }}
        />
        <span>{maxValue}</span>
      </div>
    </div>
  );
};  
const SpendByCategoryBarChart = ({ data }) => {
  const { currency, convertFromBase } = useCurrency();
  if (!data || data.length === 0) {
    return <div className="chart-empty">No spend data available</div>;
  }

  const totalSpend = data.reduce(
    (acc, item) => acc + item.totalSpend,
    0
  );

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {payload[0].payload.category}
          </div>
          <div style={{ color: "#2563eb", fontWeight: 500 }}>
           {CURRENCY_SYMBOLS[currency]} {payload[0].value.toLocaleString()}
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
        background: "#ffffff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={data.map(item => ({
  ...item,
  totalSpendConverted: convertFromBase(item.totalSpend)
}))}
          margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

          <XAxis
            dataKey="category"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />

          <YAxis
  tickFormatter={(value) =>
    `${CURRENCY_SYMBOLS[currency]}${(value / 1000000).toFixed(1)}M`
  }
/>

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="bottom"
            align="center"
            layout="horizontal"
            wrapperStyle={{
              paddingTop: 20,
              fontSize: 13,
            }}
          />

          <Bar
            dataKey="totalSpendConverted"
            name="Total Spend"
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          >
<LabelList
  dataKey="totalSpendConverted"
  position="top"
  formatter={(value) =>
    `${CURRENCY_SYMBOLS[currency]}${(value / 1000000).toFixed(1)}M`
  }
/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
{/* 
      <div
        style={{
          marginTop: 16,
          textAlign: "right",
          fontWeight: 600,
          fontSize: 14,
          color: "#1e293b",
        }}
      >
        Total Spend: ₹ {totalSpend.toLocaleString()}
      </div> */}
    </div>
  );
};


