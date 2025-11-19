import React, { useEffect, useMemo, useState } from "react";
import "../Page_styles/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartSimple,
  faList,
  faLocationDot,
  faCircleCheck,
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
import {
  getHardwareAssets,
  getSoftwareAssets,
  getCategories,
  getStatuses,
  getLocations,
  getAllUsers,
} from "../Services/ApiServices";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const MONTHS_TO_SHOW = 6; // last 6 months
const MAX_RECENT = 5; // recent items to show

const DashboardCompact = () => {
  const [hardware, setHardware] = useState([]);
  const [software, setSoftware] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [
          hwRes,
          swRes,
          catsRes,
          statsRes,
          locsRes,
          usersRes
        ] = await Promise.all([
          getHardwareAssets(),
          getSoftwareAssets(),
          getCategories(),
          getStatuses(),
          getLocations(),
          getAllUsers(),
        ]);

        if (!mounted) return;

        // api service returns data (see your ApiServices.js)
        setHardware(Array.isArray(hwRes) ? hwRes : (hwRes?.data ?? []));
        setSoftware(Array.isArray(swRes) ? swRes : (swRes?.data ?? []));
        setCategories(Array.isArray(catsRes) ? catsRes : (catsRes?.data ?? []));
        setStatuses(Array.isArray(statsRes) ? statsRes : (statsRes?.data ?? []));
        setLocations(Array.isArray(locsRes) ? locsRes : (locsRes?.data ?? []));
        setUsers(Array.isArray(usersRes) ? usersRes : (usersRes?.data ?? []));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, []);

  // KPI values
  const hardwareCount = hardware.length;
  const softwareCount = software.length;
  const usersCount = users.length;
  const categoriesCount = categories.length;
  const locationsCount = locations.length;
  const totalAssets = hardwareCount + softwareCount;

  // status mapping to find "Check Out"
  const statusNameById = useMemo(() => {
    const map = {};
    statuses.forEach((s) => { map[String(s._id)] = s.name; });
    return map;
  }, [statuses]);

  const inUseCount = useMemo(() => {
    // prefer hardware.assetStatus (id or object) and software.assetStatus
    const all = [...hardware, ...software];
    return all.filter(a => {
      const sid = (typeof a.assetStatus === "object") ? a.assetStatus?._id : a.assetStatus;
      return statusNameById[String(sid)] === "Check Out";
    }).length;
  }, [hardware, software, statusNameById]);

  // Build month buckets for last 6 months
  const months = useMemo(() => {
    const now = new Date();
    const arr = [];
    for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("default", { month: "short" }) });
    }
    return arr;
  }, []);

  // assetsOverTime: combine hardware (DOP) and software (createdAt)
  const assetsOverTime = useMemo(() => {
    const map = months.reduce((acc, m) => { acc[m.key] = 0; return acc; }, {});
    const incByDate = (dateStr) => {
      if (!dateStr) return;
      const dt = new Date(dateStr);
      if (isNaN(dt)) return;
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (map[key] !== undefined) map[key] += 1;
    };

    hardware.forEach(h => {
      // hardware uses DOP for timeline per your note
      incByDate(h.DOP);
    });
    software.forEach(s => {
      // software has createdAt
      incByDate(s.createdAt || s.created_at || s.created);
    });

    return months.map(m => map[m.key] || 0);
  }, [hardware, software, months]);

  const lineData = {
    labels: months.map(m => m.label),
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
    plugins: { legend: { display: false }, tooltip: { mode: "index" } },
    scales: {
      x: { ticks: { maxRotation: 0, minRotation: 0 } },
      y: { beginAtZero: true, precision: 0 },
    },
  };

  // Recent: combine both, get date field (software: createdAt, hardware: DOP)
  const recent = useMemo(() => {
    const combined = [
      ...hardware.map(h => ({ __type: "hardware", date: h.DOP || h.createdAt || h.created_at, item: h })),
      ...software.map(s => ({ __type: "software", date: s.createdAt || s.created_at || s.DOP, item: s })),
    ];

    combined.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return combined.slice(0, MAX_RECENT);
  }, [hardware, software]);

  return (
    <div className="a1-dashboard-container" aria-busy={loading}>
      {/* KPI Row */}
      <div className="a1-kpi-row">
        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faCubes} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Hardware</div>
            <span>{loading ? <Spinner size="sm" /> : hardwareCount}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faBoxOpen} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Software</div>
            <span>{loading ? <Spinner size="sm" /> : softwareCount}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faUsers} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Users</div>
            <span>{loading ? <Spinner size="sm" /> : usersCount}</span>
          </div>
        </div>

        <div className="a1-kpi-card">
          <FontAwesomeIcon icon={faChartSimple} className="a1-kpi-icon" />
          <div className="a1-kpi-data">
            <div>Total Assets</div>
            <span>{loading ? <Spinner size="sm" /> : totalAssets}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart + Recent (keeps inside viewport) */}
      <div className="a1-middle-row" style={{ gap: 12 }}>
        <div className="a1-chart-card">
          <div className="a1-card-title">Assets (last {MONTHS_TO_SHOW} months)</div>
          <div className="a1-chart-box" style={{ minHeight: 200 }}>
            {loading ? <Spinner /> : <Line data={lineData} options={lineOptions} />}
          </div>
        </div>

        <div className="a1-recent-card">
          <div className="a1-card-title">Recent Activity</div>
          <div className="a1-recent-list" style={{ overflowY: "auto", paddingRight: 6 }}>
            {recent.length === 0 ? (
              <div className="a1-empty">No recent assets</div>
            ) : (
              recent.map((r, idx) => {
                const item = r.item || {};
                const title = item.assetName || item.assetCode || item.name || "Untitled";
                const date = r.date ? new Date(r.date).toLocaleDateString() : "No date";
                const thumb = item.image && item.image !== "N/A" ? item.image : "/assets/placeholder.png";
                return (
                  <div className="a1-recent-item" key={idx}>
                    <img src={thumb} alt={title} className="a1-thumb" />
                    <div className="a1-recent-info">
                      <div className="a1-recent-name">{title}</div>
                      <div className="a1-recent-date">{date}</div>
                    </div>
                  </div>
                );
              })
            )}
            {/* small spacer to ensure content doesn't touch bottom */}
            <div style={{ height: 6 }} />
          </div>
        </div>
      </div>

      {/* Tiny footer KPIs row (compact) */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "#6B7280" }}>Categories: <strong>{categoriesCount}</strong></div>
        <div style={{ fontSize: 13, color: "#6B7280" }}>Locations: <strong>{locationsCount}</strong></div>
        <div style={{ fontSize: 13, color: "#6B7280" }}>In Use: <strong>{inUseCount}</strong></div>
      </div>
    </div>
  );
};

export default DashboardCompact;
