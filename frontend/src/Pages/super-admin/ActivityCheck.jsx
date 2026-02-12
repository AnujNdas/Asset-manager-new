import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { getLoginActivity } from "../../Services/AdminServices";
import "../../Page_styles/ActivityCheck.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LoginActivity() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getLoginActivity();
      console.log("Login Activity:", res);
      setLogs(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load login activity", "error");
    }
  };

  const filtered = useMemo(() => {
    if (!search) return logs;
    return logs.filter((log) =>
      log?.userId?.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, logs]);

  const uniqueCountries = new Set(logs.map(l => l.country)).size;

  return (
    <div className="login-activity-wrapper">

      <div className="header">
        <h2>Security Monitoring Dashboard</h2>
      </div>

      {/* ===== Summary Cards ===== */}
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Total Logins</h4>
          <p>{logs.length}</p>
        </div>

        <div className="summary-card">
          <h4>Unique Countries</h4>
          <p>{uniqueCountries}</p>
        </div>

        <div className="summary-card">
          <h4>Unique Users</h4>
          <p>{new Set(logs.map(l => l.userId?._id)).size}</p>
        </div>

        <div className="summary-card">
          <h4>Active Today</h4>
          <p>
            {
              logs.filter(
                l =>
                  new Date(l.createdAt).toDateString() ===
                  new Date().toDateString()
              ).length
            }
          </p>
        </div>
      </div>

      {/* ===== Map Section (Placeholder) ===== */}
<div style={{ height: "400px", marginBottom: "20px" }}>
  <MapContainer
    center={[20, 0]}
    zoom={2}
    style={{ height: "100%", width: "100%", borderRadius: "12px" }}
  >
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {filtered
      .filter((log) => log.latitude && log.longitude)

      .map((log) => (
        <Marker
          key={log._id}
          position={[log.latitude, log.longitude]}

        >
          <Popup>
            <strong>{log.userId?.username}</strong>
            <br />
            {log.userId?.email}
            <br />
            IP: {log.ipAddress}
            <br />
            {log.city}, {log.country}
            <br />
            {new Date(log.createdAt).toLocaleString()}
          </Popup>
        </Marker>
      ))}
  </MapContainer>
</div>

      {/* ===== Filters ===== */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ===== Activity Cards ===== */}
      <div className="activity-grid">
        {filtered.map((log) => (
          <div className="activity-card" key={log._id}>
            <div className="activity-top">
              <div>
                <h4>{log.userId?.username}</h4>
                <span>{log.userId?.email}</span>
              </div>
              <div className="badge">
                {log.country || "Unknown"}
              </div>
            </div>

            <div className="activity-body">
              <p><strong>IP:</strong> {log.ipAddress}</p>
              <p><strong>City:</strong> {log.city || "-"}</p>
              <p><strong>ISP:</strong> {log.isp || "-"}</p>
              <p><strong>Org:</strong> {log.organizationId?.name || "-"}</p>
              <p><strong>Browser:</strong> {log.userAgent}</p>
            </div>

            <div className="activity-footer">
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
