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

const MONTHS_TO_SHOW = 6;
const MAX_RECENT = 5;

const DashboardCompact = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDash = async () => {
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
    fetchDash();
  }, []);

  if (!data) {
    return <div className="a1-dashboard-container"><Spinner /></div>;
  }

  const {
    hardwareCount,
    softwareCount,
    categoryCount,
    locationCount,
    recentHardware = [],
    recentSoftware = []
  } = data;

  const totalAssets = hardwareCount + softwareCount;

  // Build last 6 months bucket
  const months = useMemo(() => {
    const now = new Date();
    const arr = [];
    for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("default", { month: "short" }),
      });
    }
    return arr;
  }, []);

  // Count assets by month
  const assetsOverTime = useMemo(() => {
    const bucket = months.reduce((m, x) => {
      m[x.key] = 0;
      return m;
    }, {});

    const addToBucket = (item) => {
      const dateStr = item.createdAt || item.DOP;
      if (!dateStr) return;
      const dt = new Date(dateStr);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (bucket[key] !== undefined) bucket[key] += 1;
    };

    recentHardware.forEach(addToBucket);
    recentSoftware.forEach(addToBucket);

    return months.map((m) => bucket[m.key]);
  }, [months, recentHardware, recentSoftware]);

  const lineData = {
    labels: months.map((m) => m.label),
    datasets: [
      {
        label: "Assets added",
        data: assetsOverTime,
        borderColor: "#6366F1",
        backgroundColor: "rgba(99,102,241,0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  // merge recent
  const recent = [...recentHardware, ...recentSoftware]
    .sort((a, b) => new Date(b.createdAt || b.DOP) - new Date(a.createdAt || a.DOP))
    .slice(0, MAX_RECENT);

  return (
    <div className="a1-dashboard-container">
      {/* KPI Row */}
      <div className="a1-kpi-row">
        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faCubes} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Hardware</div>
            <span>{hardwareCount}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faBoxOpen} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Software</div>
            <span>{softwareCount}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faUsers} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Categories</div>
            <span>{categoryCount}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faChartSimple} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Total Assets</div>
            <span>{totalAssets}</span>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="a1-middle-row" style={{ gap: 12 }}>
        <div className="a1-chart-card">
          <div className="a1-card-title">Assets (last {MONTHS_TO_SHOW} months)</div>
          <div className="a1-chart-box">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="a1-recent-card">
          <div className="a1-card-title">Recent Activity</div>
          <div className="a1-recent-list">
            {recent.length === 0 ? (
              <div className="a1-empty">No recent items</div>
            ) : (
              recent.map((item, i) => (
                <div className="a1-recent-item" key={i}>
                  <img
                    src={item.image || "/assets/placeholder.png"}
                    alt=""
                    className="a1-thumb"
                  />
                  <div className="a1-recent-info">
                    <div className="a1-recent-name">
                      {item.assetName || item.name || "Unnamed"}
                    </div>
                    <div className="a1-recent-date">
                      {new Date(item.createdAt || item.DOP).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mini Footer KPIs */}
      <div className="a1-footer-row">
        <div>Categories: <strong>{categoryCount}</strong></div>
        <div>Locations: <strong>{locationCount}</strong></div>
      </div>
    </div>
  );
};

export default DashboardCompact;
