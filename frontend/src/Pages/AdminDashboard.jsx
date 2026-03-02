import React, { useEffect, useState } from "react";
import { getDashboardData } from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboardData();
        setData(res);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
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
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* ================= TOP METRICS ================= */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Valuation"
          value={`₹ ${totals.overallValuation.toLocaleString()}`}
        />

        <MetricCard
          title="Software Assets"
          value={totals.softwareCount}
          sub={`₹ ${totals.softwareValuation.toLocaleString()}`}
        />

        <MetricCard
          title="Hardware Assets"
          value={totals.hardwareCount}
          sub={`₹ ${totals.hardwareValuation.toLocaleString()}`}
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

const AnalyticsCard = ({ title, items, labelKey, valueKey }) => {
  const getValue = (obj, path) =>
    path.split(".").reduce((o, key) => o?.[key], obj);

  return (
    <div className="card">
      <h3 className="card-heading">{title}</h3>

      <div className="list">
        {items.map((item, index) => (
          <div key={index} className="list-row">
            <span>{getValue(item, labelKey)}</span>
            <span className="value-text">
              {getValue(item, valueKey)?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};