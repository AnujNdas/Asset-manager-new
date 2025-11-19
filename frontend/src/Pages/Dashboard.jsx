import React, { useState, useEffect, useMemo } from "react";
import "../Page_styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faList,
  faLocationDot,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
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

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const API_BASE = "https://asset-manager-new.onrender.com/api";

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [assetsRes, categoriesRes, statusesRes, locationsRes] =
          await Promise.all([
            fetch(`${API_BASE}/assets`),
            fetch(`${API_BASE}/category`),
            fetch(`${API_BASE}/status`),
            fetch(`${API_BASE}/location`),
          ]);

        setAssets(await assetsRes.json());
        setCategories(await categoriesRes.json());
        setStatuses(await statusesRes.json());
        setLocations(await locationsRes.json());
      } catch (err) {
        Swal.fire("Error", "Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const resolveId = (v) => (typeof v === "object" ? v?._id : v);

  const totalAssets = assets.length;

  const inUseCount = (() => {
    const statusMap = {};
    statuses.forEach((s) => (statusMap[s._id] = s.name));
    return assets.filter(
      (a) => statusMap[resolveId(a.assetStatus)] === "Check Out"
    ).length;
  })();

  // --- Assets Over Time Chart (6 months)
  const assetsOverTime = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        label: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth(),
        count: 0,
      });
    }

    assets.forEach((a) => {
      const dop = a.DOP ? new Date(a.DOP) : null;
      if (!dop) return;

      result.forEach((m) => {
        if (m.year === dop.getFullYear() && m.month === dop.getMonth()) {
          m.count++;
        }
      });
    });

    return result;
  }, [assets]);

  const lineData = {
    labels: assetsOverTime.map((m) => m.label),
    datasets: [
      {
        label: "Assets Added",
        data: assetsOverTime.map((m) => m.count),
        borderColor: "#6366F1",
        backgroundColor: "rgba(99,102,241,0.12)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  // --- Recent Activity (last 4 only to avoid scroll)
  const recent = [...assets]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  return (
    <div className="saas-dashboard">

      {/* KPIs */}
      <div className="saas-kpi-row">
        <div className="saas-kpi-card">
          <FontAwesomeIcon icon={faChartSimple} className="saas-kpi-icon" />
          <div className="saas-kpi-info">
            <div className="saas-kpi-label">Total Assets</div>
            <div className="saas-kpi-value">
              {loading ? <Spinner size="sm" /> : totalAssets}
            </div>
          </div>
        </div>

        <div className="saas-kpi-card">
          <FontAwesomeIcon icon={faCircleCheck} className="saas-kpi-icon" />
          <div className="saas-kpi-info">
            <div className="saas-kpi-label">In Use</div>
            <div className="saas-kpi-value">{inUseCount}</div>
          </div>
        </div>

        <div className="saas-kpi-card">
          <FontAwesomeIcon icon={faList} className="saas-kpi-icon" />
          <div className="saas-kpi-info">
            <div className="saas-kpi-label">Categories</div>
            <div className="saas-kpi-value">{categories.length}</div>
          </div>
        </div>

        <div className="saas-kpi-card">
          <FontAwesomeIcon icon={faLocationDot} className="saas-kpi-icon" />
          <div className="saas-kpi-info">
            <div className="saas-kpi-label">Locations</div>
            <div className="saas-kpi-value">{locations.length}</div>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart + Recent */}
      <div className="saas-middle-row">

        {/* Chart */}
        <div className="saas-chart-card">
          <h3 className="saas-section-title">Assets Over Time</h3>
          <div className="saas-chart-wrapper">
            {loading ? <Spinner /> : <Line data={lineData} options={lineOptions} />}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="saas-recent-card">
          <h3 className="saas-section-title">Recent Activity</h3>
          <div className="saas-recent-list">
            {recent.length === 0 ? (
              <p className="saas-empty">No recent assets</p>
            ) : (
              recent.map((r) => (
                <div className="saas-recent-item" key={r._id}>
                  <img
                    src={r.image || "/assets/placeholder.png"}
                    className="saas-thumb"
                    alt="asset"
                  />
                  <div>
                    <div className="saas-recent-name">{r.assetName || r.assetCode}</div>
                    <div className="saas-recent-date">
                      {r.DOP ? new Date(r.DOP).toLocaleDateString() : "No Date"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
