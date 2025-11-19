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

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

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
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const recent = [...assets]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  return (
    <div className="a1-dashboard-container">

      {/* KPI Row */}
      <div className="a1-kpi-row">
        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faChartSimple} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Total Assets</div>
            <span>{loading ? <Spinner size="sm" /> : totalAssets}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faCircleCheck} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>In Use</div>
            <span>{inUseCount}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faList} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Categories</div>
            <span>{categories.length}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faLocationDot} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Locations</div>
            <span>{locations.length}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart + Recent */}
      <div className="a1-middle-row">
        <div className="a1-chart-card">
          <div className="a1-card-title">Assets Over Time</div>
          <div className="a1-chart-box">
            {loading ? <Spinner /> : <Line data={lineData} options={lineOptions} />}
          </div>
        </div>

        <div className="a1-recent-card">
          <div className="a1-card-title">Recent Activity</div>

          {recent.length === 0 ? (
            <p className="a1-empty">No recent assets</p>
          ) : (
            <div className="a1-recent-list">
              {recent.map((r) => (
                <div className="a1-recent-item" key={r._id}>
                  <img
                    src={r.image || "/assets/placeholder.png"}
                    alt=""
                    className="a1-thumb"
                  />
                  <div className="a1-recent-info">
                    <div className="a1-recent-name">
                      {r.assetName || r.assetCode}
                    </div>
                    <div className="a1-recent-date">
                      {r.DOP ? new Date(r.DOP).toLocaleDateString() : "No Date"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
