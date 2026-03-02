import React, { useEffect, useState } from "react";
import { getDashboardData } from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";
import { useCurrency } from "../Context/CurrencyContext";
import { convertFromBase, CURRENCY_SYMBOLS } from "../utils/currency"; // adjust path
import CurrencyFilter from "../Components/CurrencyFilter";
const AdminDashboard = () => {
  const { currency } = useCurrency();
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

  if (loading) {
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
  currency
).toLocaleString()}${CURRENCY_SYMBOLS[currency]}`}
        />

        <MetricCard
          title="Software Assets"
          value={totals.softwareCount}
          sub={`${CURRENCY_SYMBOLS[currency]} ${convertFromBase(
  totals.softwareValuation,
  currency
).toLocaleString()}`}
        />

        <MetricCard
          title="Hardware Assets"
          value={totals.hardwareCount}
          sub={`${CURRENCY_SYMBOLS[currency]} ${convertFromBase(
  totals.hardwareValuation,
  currency
).toLocaleString()}`}
        />

        <MetricCard
          title="Users / Teams"
          value={`${totals.usersCount} / ${totals.teamsCount}`}
        />
      </div>

      {/* ================= UPCOMING SECTION ================= */}
      <div className="section-grid">
        <ListCard
          title="Upcoming Software Renewals (30 days)"
          items={upcoming.softwareRenewals}
          dateField="DOE"
        />

        <ListCard
          title="Upcoming Hardware Warranty"
          items={upcoming.hardwareWarranty}
          dateField="warranty.expiryDate"
        />
      </div>

      {/* ================= ANALYTICS SECTION ================= */}
      <div className="section-grid">
        <AnalyticsCard
          title="Software Spend by Category"
          items={analytics.spendByCategory}
          labelKey="category"
          valueKey="totalSpend"
        />

        <AnalyticsCard
          title="Top IT Assets"
          items={analytics.topAssets}
          labelKey="assetName"
          valueKey="assetCost.baseTotalAmount"
          currency={currency}
        />

        <AnalyticsCard
          title="Top Locations"
          items={analytics.topLocations}
          labelKey="name"
          valueKey="total"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;


/* ================= SUB COMPONENTS ================= */

const MetricCard = ({ title, value, sub }) => (
  <div className="card metric-card">
    <p className="card-title">{title}</p>
    <h2 className="metric-value">{value}</h2>
    {sub && <p className="metric-sub">{sub}</p>}
  </div>
);

const ListCard = ({ title, items, dateField }) => {
  const getDate = (item) => {
    if (dateField.includes(".")) {
      const keys = dateField.split(".");
      return new Date(item[keys[0]][keys[1]]).toLocaleDateString();
    }
    return new Date(item[dateField]).toLocaleDateString();
  };

  return (
    <div className="card">
      <h3 className="card-heading">{title}</h3>

      {items.length === 0 ? (
        <p className="empty-text">No upcoming items</p>
      ) : (
        <div className="list">
          {items.map((item, index) => (
            <div key={index} className="list-row">
              <span>{item.assetName}</span>
              <span className="date-text">{getDate(item)}</span>
            </div>
          ))}
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
  currency
}) => {
  const getValue = (obj, path) =>
    path.split(".").reduce((o, key) => o?.[key], obj);

  return (
    <div className="card">
      <h3 className="card-heading">{title}</h3>

      <div className="list">
        {items.map((item, index) => {
          const rawValue = getValue(item, valueKey) || 0;
          const converted = convertFromBase(rawValue, currency);

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

