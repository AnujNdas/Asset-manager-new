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

  // Fetch data once
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getUserDashboard();
        setData(res);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // If loading or no data yet → safe return (no hooks inside!)
  if (loading) {
    return (
      <div className="a1-dashboard-container">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Error loading dashboard</div>;
  }

  // Extract
  const {
    counts,
    recent,
    chart
  } = data;

  // Chart Memo (always runs in same order)
  const lineData = useMemo(() => ({
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
      }
    ]
  }), [chart]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: "index" } },
    scales: {
      x: { ticks: { maxRotation: 0, minRotation: 0 } },
      y: { beginAtZero: true, precision: 0 },
    },
  }), []);

  return (
    <div className="a1-dashboard-container">
      
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
            <span>{counts.users || 0}</span>
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

      {/* Middle Row */}
      <div className="a1-middle-row" style={{ gap: 12 }}>
        <div className="a1-chart-card">
          <div className="a1-card-title">Assets (last 6 months)</div>
          <div className="a1-chart-box" style={{ minHeight: 200 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="a1-recent-card">
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
        </div>
      </div>

      {/* Footer Mini KPIs */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <div style={{ fontSize: 13 }}>Categories: <strong>{counts.categories}</strong></div>
        <div style={{ fontSize: 13 }}>Locations: <strong>{counts.locations}</strong></div>
        <div style={{ fontSize: 13 }}>In Use: <strong>{counts.inUse}</strong></div>
      </div>
    </div>
  );
};

export default DashboardCompact;
