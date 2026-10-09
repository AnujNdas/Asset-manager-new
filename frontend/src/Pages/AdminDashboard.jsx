import React, { useEffect, useState } from "react";
import { getDashboardData } from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";
import LocationInsights from "../Components/LocationInsights";
import {
  FiGrid,
  FiDollarSign,
  FiMonitor,
  FiHardDrive,
  FiUsers,
  FiBarChart2,
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiInbox,
} from "react-icons/fi";
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
import { useOrganization } from "../Context/OrganizationContext";
import { CURRENCY_SYMBOLS } from "../utils/currency.js";
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
  const { organization } = useOrganization();
  const currencySymbol = CURRENCY_SYMBOLS[organization?.currency] || "NA";
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

  {/* ================= HEADER ================= */}

  <div className="dashboard-header">
    <div className="dashboard-heading">
      <span className="dashboard-heading-icon">
        <FiGrid />
      </span>

      <div>
        <h2 className="dashboard-title">
          Admin Dashboard
        </h2>
        <p>
          Monitor assets, financial insights, and upcoming activities.
        </p>
      </div>
    </div>
  </div>


  {/* ================= TOP METRICS ================= */}

  <div className="metrics-grid">

    <MetricCard
      title="Total Valuation"
      value={`${currencySymbol} ${totals.overallValuation.toLocaleString()}`}
      icon={<FiDollarSign />}
    />

    <MetricCard
      title="Software Assets"
      value={totals.softwareCount}
      sub={`${totals.softwareInstances} Instances • ${currencySymbol} ${totals.softwarePurchaseValue.toLocaleString()}`}
      redirectTo="/inventory?software"
      icon={<FiMonitor />}
    />

    <MetricCard
      title="Hardware Assets"
      value={totals.hardwareCount}
      sub={`${totals.hardwareInstances} Instances • ${currencySymbol} ${totals.hardwarePurchaseValue.toLocaleString()}`}
      redirectTo="/inventory?hardware"
      icon={<FiHardDrive />}
    />

    <MetricCard
      title="Users / Team-members"
      value={`${totals.usersCount} / ${totals.employeesCount}`}
      redirectTo="/setting/users"
      icon={<FiUsers />}
    />

  </div>


  {/* ================= ANALYTICS ================= */}

  <div className="dashboard-section-heading">
    <div>
      <h3>Asset Analytics</h3>
      <p>Spending, asset valuation, and department allocation.</p>
    </div>
  </div>

  <div className="section-grid">

    <div className="analytics-card">
      <div className="analytics-card-header">
        <span className="analytics-card-icon">
          <FiBarChart2 />
        </span>

        <div>
          <h3 className="analytics-title">
            Spend by Category (Top 5)
          </h3>
          <p>Category-wise asset expenditure</p>
        </div>
      </div>

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


  {/* ================= UPCOMING ACTIVITIES ================= */}

  <div className="dashboard-section-heading">
    <div>
      <h3>Upcoming Activities</h3>
      <p>Track renewals, maintenance, warranties, and insurance.</p>
    </div>
  </div>

  <div className="section-grid2">

    <ListCard
      title="Upcoming Software Renewals"
      items={upcoming.software?.upcoming || []}
      dateField="renewal"
    />

    <ListCard
      title="Upcoming Hardware Maintenance"
      items={upcoming.maintenance?.upcoming || []}
      dateField="maintenance"
    />

    <ListCard
      title="Upcoming Hardware Warranty"
      items={upcoming.warranty?.upcoming || []}
      dateField="warranty"
    />

    <ListCard
      title="Upcoming Hardware Insurance"
      items={upcoming.insurance?.upcoming || []}
      dateField="insurance"
    />

  </div>


  {/* ================= COST BREAKDOWN ================= */}

  <div className="dashboard-section-heading">
    <div>
      <h3>Cost Breakdown</h3>
      <p>Review major expenses across asset lifecycle categories.</p>
    </div>
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


  {/* ================= LOCATION INSIGHTS ================= */}

  <div className="dashboard-section-heading">
    <div>
      <h3>Location Insights</h3>
      <p>Asset distribution across your organization's locations.</p>
    </div>
  </div>

  <div className="section-grid dashboard-location-grid">
    <LocationInsights items={analytics.topLocations} />
  </div>

</div>

  );
};

export default AdminDashboard;


/* ================= SUB COMPONENTS ================= */


const MetricCard = ({
  title,
  value,
  sub,
  redirectTo,
  icon,
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const isClickable = Boolean(redirectTo);

  return (
    <div
      className={`card metric-card ${
        isClickable ? "clickable-card" : ""
      }`}
      onClick={isClickable ? handleNavigate : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNavigate();
              }
            }
          : undefined
      }
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >

      <div className="metric-card-top">

        <span className="metric-icon">
          {icon || <FiGrid />}
        </span>

        {isClickable && (
          <FiArrowUpRight className="metric-arrow" />
        )}

      </div>

      <p className="card-title">{title}</p>

      <h2 className="metric-value">{value}</h2>

      {sub && (
        <p className="metric-sub">{sub}</p>
      )}

    </div>
  );
};



const ListCard = ({
  title,
  items = [],
  dateField,
  redirectTo,
}) => {
  const navigate = useNavigate();

  const getDateValue = (item) => {
    return dateField
      .split(".")
      .reduce((value, key) => value?.[key], item);
  };

  const getFormattedDate = (item) => {
    const value = getDateValue(item);

    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString();
  };

  const getDaysLeft = (item) => {
    const value = getDateValue(item);

    if (!value) return null;

    const target = new Date(value);

    if (Number.isNaN(target.getTime())) {
      return null;
    }

    const today = new Date();

    const todayUTC = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const targetUTC = Date.UTC(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );

    return Math.round(
      (targetUTC - todayUTC) / 86400000
    );
  };

  return (
    <div
      className={`card dashboard-list-card ${
        redirectTo ? "clickable-card" : ""
      }`}
      onClick={
        redirectTo
          ? () => navigate(redirectTo)
          : undefined
      }
      onKeyDown={
        redirectTo
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(redirectTo);
              }
            }
          : undefined
      }
      role={redirectTo ? "link" : undefined}
      tabIndex={redirectTo ? 0 : undefined}
    >

      <div className="dashboard-card-header">

        <div className="dashboard-card-heading">
          <span className="dashboard-card-icon">
            <FiCalendar />
          </span>

          <h3 className="card-heading">{title}</h3>
        </div>

        <span className="dashboard-item-count">
          {items.length}
        </span>

      </div>


      {items.length === 0 ? (

        <div className="dashboard-empty">
          <FiInbox />
          <p>No upcoming items</p>
        </div>

      ) : (

        <div className="list">

          {items.map((item, index) => {
            const daysLeft = getDaysLeft(item);

            const badgeType =
              daysLeft === null
                ? "normal"
                : daysLeft < 0
                ? "urgent"
                : daysLeft <= 10
                ? "urgent"
                : "normal";

            const badgeText =
              daysLeft === null
                ? null
                : daysLeft < 0
                ? "Expired"
                : daysLeft === 0
                ? "Due today"
                : `${daysLeft} days left`;

            return (
              <div
                key={item._id || index}
                className="list-row"
              >

                <div className="left-section">

                  <span className="asset-name">
                    {item.deviceName ||
                      `Asset #${String(item.assetId || "")
                        .slice(-4)}`}
                  </span>

                  <span className="date-text">
                    <FiClock />
                    {getFormattedDate(item)}
                  </span>

                </div>

                {badgeText && (
                  <span
                    className={`days-badge ${badgeType}`}
                  >
                    {badgeText}
                  </span>
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
  items = [],
  labelKey,
  valueKey,
  redirectTo,
}) => {
  const { organization } = useOrganization();
  const navigate = useNavigate();

  const currencySymbol =
    CURRENCY_SYMBOLS[organization?.currency] || "$";

  const getValue = (obj, path) =>
    path.split(".").reduce((o, key) => o?.[key], obj);

  const isClickable = Boolean(redirectTo);

  return (
    <div
      className={`card dashboard-analytics-list ${
        isClickable ? "clickable-card" : ""
      }`}
      onClick={
        isClickable
          ? () => navigate(redirectTo)
          : undefined
      }
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(redirectTo);
              }
            }
          : undefined
      }
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="dashboard-card-header">
        <div className="dashboard-card-heading">
          <span className="dashboard-card-icon">
            <FiBarChart2 />
          </span>
          <h3 className="card-heading">{title}</h3>
        </div>

        {isClickable && (
          <FiArrowUpRight className="dashboard-card-arrow" />
        )}
      </div>

      {items.length === 0 ? (
        <div className="dashboard-empty">
          <FiInbox />
          <p>No asset data available</p>
        </div>
      ) : (
        <div className="list">
          {items.map((item, index) => {
            const value = Number(
              getValue(item, valueKey) || 0
            );

            return (
              <div key={index} className="list-row">
                <span className="asset-name">
                  {getValue(item, labelKey) || "Unnamed asset"}
                </span>

                <span className="value-text">
                  {currencySymbol} {value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const DepartmentAnalyticsCard = ({
  title,
  items = [],
}) => {
  return (
    <div className="card dashboard-department-card">

      <div className="dashboard-card-header">
        <div className="dashboard-card-heading">
          <span className="dashboard-card-icon">
            <FiUsers />
          </span>
          <h3 className="card-heading">{title}</h3>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="dashboard-empty">
          <FiInbox />
          <p>No department data available</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Assets (H | S)</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((dept, index) => (
                <tr key={index}>
                  <td data-label="Department">
                    {dept.departmentName || "N/A"}
                  </td>

                  <td data-label="Hardware | Software">
                    {dept.hardware || 0} |{" "}
                    {dept.software || 0}
                  </td>

                  <td
                    data-label="Total"
                    className="text-right"
                  >
                    <strong>
                      {(dept.hardware || 0) +
                        (dept.software || 0)}
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

const SpendByCategoryBarChart = ({ data = [] }) => {
  const { organization } = useOrganization();

  const currencySymbol =
    CURRENCY_SYMBOLS[organization?.currency] || "$";

  if (!data.length) {
    return (
      <div className="chart-empty">
        <FiInbox />
        <p>No spend data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    totalSpend: Number(item.totalSpend || 0),
  }));

  const formatAxisValue = (value) => {
    const amount = Number(value || 0);

    if (Math.abs(amount) >= 10000000) {
      return `${(amount / 10000000).toFixed(1)}Cr`;
    }

    if (Math.abs(amount) >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    }

    if (Math.abs(amount) >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }

    return amount.toLocaleString();
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload;

    return (
      <div className="dashboard-chart-tooltip">
        <strong>{item.category}</strong>
        <span>
          {currencySymbol}{" "}
          {item.totalSpend.toLocaleString()}
        </span>
      </div>
    );
  };

  return (
    <div className="dashboard-chart-wrapper">
      <ResponsiveContainer
        width="100%"
        height={Math.max(260, chartData.length * 55)}
        minWidth={0}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 24,
            left: 4,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient
              id="dashboardSpendGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="#948979"
              />
              <stop
                offset="100%"
                stopColor="#DFD0B8"
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(223,208,184,0.1)"
            strokeDasharray="3 3"
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{
              fill: "#948979",
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              `${currencySymbol}${formatAxisValue(value)}`
            }
          />

          <YAxis
            type="category"
            dataKey="category"
            width={105}
            tick={{
              fill: "#DFD0B8",
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const text = String(value || "");
              return text.length > 16
                ? `${text.slice(0, 14)}…`
                : text;
            }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: "rgba(223,208,184,0.04)",
            }}
          />

          <Bar
            dataKey="totalSpend"
            name="Total Spend"
            fill="url(#dashboardSpendGradient)"
            radius={[0, 6, 6, 0]}
            maxBarSize={25}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


const CostBreakdownCard = ({ title, items = [] }) => {
  const { organization } = useOrganization();
  const currencySymbol =
    CURRENCY_SYMBOLS[organization?.currency] || "$";

  return (
    <div className="card dashboard-cost-card">
      <div className="dashboard-card-header">
        <div className="dashboard-card-heading">
          <span className="dashboard-card-icon">
            <FiDollarSign />
          </span>
          <h3 className="card-heading">{title}</h3>
        </div>

        <span className="dashboard-item-count">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="dashboard-empty">
          <FiInbox />
          <p>No data available</p>
        </div>
      ) : (
        <div className="list">
          {items.map((item, index) => (
            <div
              key={item._id || index}
              className="list-row"
            >
              <span className="asset-name">
                {item.instanceName || "Unnamed asset"}
              </span>

              <span className="value-text">
                {currencySymbol}{" "}
                {Number(item.cost || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

