  import React, { useEffect, useMemo, useState } from "react";
import "../Page_styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faCubes,
  faBoxOpen,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Spinner } from "react-bootstrap";
import { getUserDashboard } from "../Services/ApiServices";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const DashboardCompact = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch only once
useEffect(() => {
  const load = async () => {
    try {
      const raw = await getUserDashboard();

      console.log("RAW DATA:", raw);

      // Transform to match frontend format
      const formatted = {
        counts: {
          hardware: raw.hardwareCount || 0,
          software: raw.softwareCount || 0,
          categories: raw.categoryCount || 0,
          locations: raw.locationCount || 0,
          totalAssets:
            (raw.hardwareCount || 0) +
            (raw.softwareCount || 0),
          users: raw.userCount || 0,   // if exists
          inUse: raw.inUseCount || 0,  // if exists
        },

  expiry: {
    expired: raw.expiry?.expired || [],
    expiringSoon: raw.expiry?.expiringSoon || [],
  },
        recent: [
          ...(raw.recentHardware || []),
          ...(raw.recentSoftware || []),
        ],
      };

      setData(formatted);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);


  // SAFE VALUES (always defined so hooks run safely)
  const counts = data?.counts || {
    hardware: 0,
    software: 0,
    users: 0,
    totalAssets: 0,
    categories: 0,
    locations: 0,
    inUse: 0,
  };

  const chart = data?.chart || { months: [], values: [] };
  const recent = data?.recent || [];

  // HOOKS — ALWAYS EXECUTED (no conditional)
  const lineData = useMemo(
    () => ({
      labels: chart.months,
      datasets: [
        {
          label: "Assets added",
          data: chart.values,
          borderColor: "#6366F1",
          backgroundColor: "rgba(99,102,241,0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
      ],
    }),
    [chart]
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: "index" } },
      scales: {
        x: { ticks: { maxRotation: 0, minRotation: 0 } },
        y: { beginAtZero: true, precision: 0 },
      },
    }),
    []
  );

  return (
    <div className="a1-dashboard-container">

      {/* LOADING STATE */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
          <Spinner />
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && !data && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          Failed to load dashboard
        </div>
      )}

      {/* MAIN DASHBOARD */}
      {!loading && data && (
        <>
          {/* KPI Row */}
          <div className="a1-kpi-row">

            <div className="a1-kpi-card">
              <FontAwesomeIcon icon={faCubes} className="a1-kpi-icon" />
              <div className="a1-kpi-data">
                <div>Hardware</div>
                <span>{counts.hardware}</span>
              </div>
            </div>

            <div className="a1-kpi-card">
              <FontAwesomeIcon icon={faBoxOpen} className="a1-kpi-icon" />
              <div className="a1-kpi-data">
                <div>Software</div>
                <span>{counts.software}</span>
              </div>
            </div>

            <div className="a1-kpi-card">
              <FontAwesomeIcon icon={faUsers} className="a1-kpi-icon" />
              <div className="a1-kpi-data">
                <div>Users</div>
                <span>{counts.users}</span>
              </div>
            </div>

            <div className="a1-kpi-card">
              <FontAwesomeIcon icon={faChartSimple} className="a1-kpi-icon" />
              <div className="a1-kpi-data">
                <div>Total Assets</div>
                <span>{counts.totalAssets}</span>
              </div>
            </div>

          </div>

          {/* Chart + Recent */}
          <div className="a1-middle-row" style={{ gap: 12 }}>
            <div className="a1-chart-card">
  <div className="a1-card-title">Expiring Soon (Next 30 Days)</div>

  <div className="a1-recent-list" style={{ overflowY: "auto" }}>
    {data.expiry.expiringSoon.length === 0 ? (
      <div className="a1-empty">No assets expiring soon</div>
    ) : (
      data.expiry.expiringSoon.map((item, i) => (
        <div className="a1-recent-item" key={i}>
          <img src={item.image || "/assets/placeholder.png"} className="a1-thumb" />
          <div className="a1-recent-info">
            <div className="a1-recent-name">{item.name || item.assetName}</div>
            <div className="a1-recent-date">
              Expires: {new Date(item.licenseExpiry || item.warrantyExpiry).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>

<div className="a1-chart-card">
  <div className="a1-card-title">Expired Assets</div>

  <div className="a1-recent-list" style={{ overflowY: "auto" }}>
    {data.expiry.expired.length === 0 ? (
      <div className="a1-empty">No expired assets 🎉</div>
    ) : (
      data.expiry.expired.map((item, i) => (
        <div className="a1-recent-item" key={i}>
          <img src={item.image || "/assets/placeholder.png"} className="a1-thumb" />
          <div className="a1-recent-info">
            <div className="a1-recent-name">{item.name || item.assetName}</div>
            <div className="a1-recent-date">
              Expired: {new Date(item.licenseExpiry || item.warrantyExpiry).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>


            {/* <div className="a1-recent-card">
              <div className="a1-card-title">Recent Activity</div>
              <div className="a1-recent-list" style={{ overflowY: "auto" }}>
                {recent.length === 0 ? (
                  <div className="a1-empty">No recent activity</div>
                ) : (
                  recent.map((item, i) => (
                    <div className="a1-recent-item" key={i}>
                      <img
                        src={item.image || "/assets/placeholder.png"}
                        className="a1-thumb"
                        alt=""
                      />
                      <div className="a1-recent-info">
                        <div className="a1-recent-name">
                          {item.name || item.assetName || "Untitled"}
                        </div>
                        <div className="a1-recent-date">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div> */}
          </div>

          {/* Footer KPIs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <div style={{ fontSize: 13 }}>Categories: <strong>{counts.categories}</strong></div>
            <div style={{ fontSize: 13 }}>Locations: <strong>{counts.locations}</strong></div>
            <div style={{ fontSize: 13 }}>In Use: <strong>{counts.inUse}</strong></div>
          </div>
        </>
      )}

    </div>
  );
};

export default DashboardCompact;
