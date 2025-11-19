import React, { useState, useEffect, useMemo } from "react";
import "../Page_styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faList, faLocationDot, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
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

        const [assetsRes, categoriesRes, statusesRes, locationsRes] = await Promise.all([
          fetch(`${API_BASE}/assets`),
          fetch(`${API_BASE}/category`),
          fetch(`${API_BASE}/status`),
          fetch(`${API_BASE}/location`),
        ]);

        const assetsData = await assetsRes.json();
        const categoriesData = await categoriesRes.json();
        const statusesData = await statusesRes.json();
        const locationsData = await locationsRes.json();

        setAssets(assetsData);
        setCategories(categoriesData);
        setStatuses(statusesData);
        setLocations(locationsData);
      } catch (err) {
        Swal.fire("Error", "Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const resolveId = (v) => (typeof v === "object" ? v?._id : v);

  // --- A1 Metrics ---
  const totalAssets = assets.length;

  const inUseCount = (() => {
    const statusMap = {};
    statuses.forEach((s) => (statusMap[s._id] = s.name));
    return assets.filter((a) => statusMap[resolveId(a.assetStatus)] === "Check Out").length;
  })();

  // --- Assets Over Time Chart (last 6 months) ---
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
        borderColor: "#2563EB",
        backgroundColor: "rgba(37,99,235,0.1)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
  };

  // --- Recent Activity (last 6 assets) ---
  const recent = [...assets]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  return (
    <div className="a1-dashboard">

      {/* --- KPI CARDS --- */}
      <div className="a1-kpi-grid">
        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faChartSimple} className="a1-kpi-icon" />
          <div className="a1-kpi-label">Total Assets</div>
          <div className="a1-kpi-value">{loading ? <Spinner size="sm" /> : totalAssets}</div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faCircleCheck} className="a1-kpi-icon" />
          <div className="a1-kpi-label">In Use</div>
          <div className="a1-kpi-value">{inUseCount}</div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faList} className="a1-kpi-icon" />
          <div className="a1-kpi-label">Categories</div>
          <div className="a1-kpi-value">{categories.length}</div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faLocationDot} className="a1-kpi-icon" />
          <div className="a1-kpi-label">Locations</div>
          <div className="a1-kpi-value">{locations.length}</div>
        </div>
      </div>

      {/* --- SINGLE MAIN CHART (A1 Requirement) --- */}
      <div className="a1-chart-card">
        <h3 className="a1-section-title">Assets Over Time</h3>
        {loading ? <Spinner /> : <Line data={lineData} options={lineOptions} />}
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="a1-recent-card">
        <h3 className="a1-section-title">Recent Activity</h3>

        {recent.length === 0 ? (
          <p className="a1-empty">No recent assets</p>
        ) : (
          recent.map((r) => (
            <div className="a1-recent-item" key={r._id}>
              <img src={r.image || "/assets/placeholder.png"} className="a1-thumb" />
              <div>
                <div className="a1-recent-name">{r.assetName || r.assetCode}</div>
                <div className="a1-recent-date">
                  {r.DOP ? new Date(r.DOP).toLocaleDateString() : "No Date"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Dashboard;
