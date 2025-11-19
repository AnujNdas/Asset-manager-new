import React, { useState, useEffect, useMemo } from "react";
import "../Page_styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faList, faChartSimple, faCircleCheck, faPlus, faFileUpload, faDownload } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale,
} from "chart.js";
import { Spinner } from "react-bootstrap";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "https://asset-manager-new.onrender.com/api";

// calm neutral palette (Notion-like)
const PALETTE = {
  bg: "#FFFFFF",
  surface: "#F5F6F7",
  text: "#2B2B2B",
  muted: "#6B7280",
  accent: "#2563EB",
  cardShadow: "rgba(15, 23, 42, 0.06)",
  grey: "#E6E9EE",
};

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setLoadingAssets(true);

        const [assetsRes, categoriesRes, statusesRes, locationsRes] = await Promise.all([
          fetch(`${API_BASE}/assets`),
          fetch(`${API_BASE}/category`),
          fetch(`${API_BASE}/status`),
          fetch(`${API_BASE}/location`),
        ]);

        if (!assetsRes.ok) throw new Error("Failed to fetch assets");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        if (!statusesRes.ok) throw new Error("Failed to fetch statuses");
        if (!locationsRes.ok) throw new Error("Failed to fetch locations");

        const assetsData = await assetsRes.json();
        const categoriesData = await categoriesRes.json();
        const statusesData = await statusesRes.json();
        const locationsData = await locationsRes.json();

        setAssets(Array.isArray(assetsData) ? assetsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setStatuses(Array.isArray(statusesData) ? statusesData : []);
        setLocations(Array.isArray(locationsData) ? locationsData : []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message || "Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
        setLoadingAssets(false);
      }
    };

    fetchAll();
  }, []);

  // safe resolver: field may be id or object
  const resolveId = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value._id ?? value.id ?? null;
    return String(value);
  };

  // basic KPIs
  const totalAssets = assets.length;
  const hardwareAssets = assets.filter((a) => (a.assetCategory ? true : true)).length; // placeholder - keep count same as total for now
  const softwareAssets = 0; // you can derive separately if you store software in same collection
  const inUseCount = (() => {
    // try to map status names to IDs
    const statusMap = {};
    statuses.forEach((s) => (statusMap[String(s._id)] = s.name));
    return assets.filter((a) => statusMap[resolveId(a.assetStatus)] === "Check Out").length;
  })();

  // locations counts
  const locationCounts = useMemo(() => {
    const map = {};
    locations.forEach((loc) => (map[String(loc._id)] = { name: loc.name, count: 0 }));
    assets.forEach((asset) => {
      const id = resolveId(asset.locationName);
      if (id && map[id]) map[id].count++;
    });
    return Object.values(map);
  }, [assets, locations]);

  // category counts
  const categoryCounts = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[String(c._id)] = { name: c.name, count: 0 }));
    assets.forEach((asset) => {
      const id = resolveId(asset.assetCategory);
      if (id && map[id]) map[id].count++;
    });
    return Object.values(map);
  }, [assets, categories]);

  // status counts (map IDs to names)
  const statusCounts = useMemo(() => {
    const map = {};
    statuses.forEach((s) => (map[String(s._id)] = { name: s.name, count: 0 }));
    assets.forEach((asset) => {
      const id = resolveId(asset.assetStatus);
      if (id && map[id]) map[id].count++;
    });
    return Object.values(map);
  }, [assets, statuses]);

  // assets over time (last 6 months) based on DOP
  const assetsOverTime = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "numeric" });
      months.push({ label, key: `${d.getFullYear()}-${d.getMonth()}` , count: 0 });
    }
    const keys = months.map(m => m.key);
    assets.forEach((a) => {
      const dop = a.DOP || a.purchaseDate || a.purchase_date || null;
      if (!dop) return;
      const dt = new Date(dop);
      if (isNaN(dt)) return;
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const idx = keys.indexOf(key);
      if (idx !== -1) months[idx].count++;
    });
    return months;
  }, [assets]);

  // chart datasets
  const piePalette = [PALETTE.accent, "#94A3B8", "#CBD5E1", "#F1F5F9", "#E2E8F0"];
  const statusPieData = {
    labels: statusCounts.map((s) => s.name),
    datasets: [{ data: statusCounts.map((s) => s.count), backgroundColor: piePalette.slice(0, statusCounts.length) }],
  };

  const locationBarData = {
    labels: locationCounts.map((l) => l.name),
    datasets: [{ label: "Assets", data: locationCounts.map((l) => l.count), backgroundColor: "#CBD5E1" }],
  };

  const categoryBarData = {
    labels: categoryCounts.map((c) => c.name),
    datasets: [{ label: "Assets", data: categoryCounts.map((c) => c.count), backgroundColor: "#E6EEF8" }],
  };

  const lineData = {
    labels: assetsOverTime.map((m) => m.label),
    datasets: [
      {
        label: "Assets added",
        data: assetsOverTime.map((m) => m.count),
        fill: true,
        tension: 0.3,
        borderColor: PALETTE.accent,
        backgroundColor: "rgba(37,99,235,0.08)",
        pointRadius: 3,
      },
    ],
  };

  const smallOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { ticks: { color: PALETTE.muted } },
      y: { ticks: { color: PALETTE.muted }, beginAtZero: true, precision: 0 },
    },
  };

  // recent activity (last 6 assets)
  const recent = [...assets].sort((a,b) => new Date(b.createdAt || b.DOP || 0) - new Date(a.createdAt || a.DOP || 0)).slice(0, 6);

  return (
    <div className="notion-dashboard">
      <div className="dashboard-top">
        <h1 className="dash-title">Assets Overview</h1>

        <div className="quick-actions">
          <button className="qa-btn primary"><FontAwesomeIcon icon={faPlus} /> Add Asset</button>
          <button className="qa-btn"><FontAwesomeIcon icon={faFileUpload} /> Bulk Upload</button>
          <button className="qa-btn"><FontAwesomeIcon icon={faDownload} /> Export</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-left">
            <div className="kpi-icon"><FontAwesomeIcon icon={faChartSimple} /></div>
          </div>
          <div className="kpi-right">
            <div className="kpi-label">Total Assets</div>
            <div className="kpi-value">{loadingAssets ? <Spinner animation="border" size="sm" /> : totalAssets}</div>
            <div className="kpi-meta">Managed assets in system</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left"><div className="kpi-icon"><FontAwesomeIcon icon={faList} /></div></div>
          <div className="kpi-right">
            <div className="kpi-label">Categories</div>
            <div className="kpi-value">{categories.length}</div>
            <div className="kpi-meta">Configured categories</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left"><div className="kpi-icon"><FontAwesomeIcon icon={faLocationDot} /></div></div>
          <div className="kpi-right">
            <div className="kpi-label">Locations</div>
            <div className="kpi-value">{locations.length}</div>
            <div className="kpi-meta">Tracked locations</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-left"><div className="kpi-icon"><FontAwesomeIcon icon={faCircleCheck} /></div></div>
          <div className="kpi-right">
            <div className="kpi-label">Checked out</div>
            <div className="kpi-value">{inUseCount}</div>
            <div className="kpi-meta">Assets currently in use</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-title">Status Distribution</div>
          </div>
          <div className="chart-area">
            {loading ? <div className="chart-loading"><Spinner /></div> : <Pie data={statusPieData} options={smallOptions} />}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-head"><div className="chart-title">Assets by Location</div></div>
          <div className="chart-area">{loading ? <Spinner /> : <Bar data={locationBarData} options={smallOptions} />}</div>
        </div>

        <div className="chart-card wide">
          <div className="chart-card-head"><div className="chart-title">Assets Over Time</div></div>
          <div className="chart-area">{loading ? <Spinner /> : <Line data={lineData} options={smallOptions} />}</div>
        </div>

        <div className="chart-card">
          <div className="chart-card-head"><div className="chart-title">Categories</div></div>
          <div className="chart-area">{loading ? <Spinner /> : <Bar data={categoryBarData} options={smallOptions} />}</div>
        </div>
      </div>

      <div className="lower-grid">
        <div className="recent-card">
          <div className="card-head">
            <div className="card-title">Recent Activity</div>
          </div>
          <div className="recent-list">
            {recent.length === 0 ? (
              <div className="empty">No recent assets</div>
            ) : (
              recent.map((r) => (
                <div key={r._id} className="recent-item">
                  <div className="ri-left">
                    <img src={r.image || "/assets/placeholder.png"} alt="" className="ri-thumb" />
                  </div>
                  <div className="ri-right">
                    <div className="ri-title">{r.assetName || r.assetCode}</div>
                    <div className="ri-sub">{r.assetSpecification || r.purchaseFrom || "—"}</div>
                    <div className="ri-meta">{r.DOP ? new Date(r.DOP).toLocaleDateString() : "Date N/A"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="todo-card">
          <div className="card-head"><div className="card-title">Quick Insights</div></div>
          <ul className="insights-list">
            <li>Assets expiring within 30 days: <strong>{assets.filter(a => { if(!a.DOE) return false; const diff = (new Date(a.DOE) - new Date())/(1000*60*60*24); return diff <= 30 && diff >= 0; }).length}</strong></li>
            <li>Assets missing images: <strong>{assets.filter(a => !a.image || a.image === "N/A").length}</strong></li>
            <li>Assets without category: <strong>{assets.filter(a => !a.assetCategory).length}</strong></li>
            <li>Low inventory categories: <strong>{categoryCounts.filter(c => c.count <= 2).length}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
