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
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getLoginActivity();
      setLogs(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load login activity", "error");
    }
  };

  const filtered = useMemo(() => {
    if (!search) return logs;
    return logs.filter(
      (user) =>
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.username?.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  const totalLogins = useMemo(
    () => logs.reduce((total, user) => total + (user.history?.length || 0), 0),
    [logs]
  );

  const uniqueOrgs = useMemo(
    () => new Set(logs.map((user) => user.organization)).size,
    [logs]
  );

  const todaysLogins = useMemo(() => {
    return logs.reduce((count, user) => {
      return (
        count +
        (user.history || []).filter(
          (h) =>
            new Date(h.loginAt).toDateString() === new Date().toDateString()
        ).length
      );
    }, 0);
  }, [logs]);

  return (
    <div className="login-activity-wrapper">
      {/* Header */}
      <div className="api-header">
        <div>
          <h2>Security Monitoring Dashboard</h2>
          <p className="header-subtitle">
            Monitor real-time user authentication, geographic distribution, and login history.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Users</h3>
          <p>{logs.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Logins</h3>
          <p>{totalLogins}</p>
        </div>
        <div className="summary-card">
          <h3>Unique Organizations</h3>
          <p>{uniqueOrgs}</p>
        </div>
        <div className="summary-card">
          <h3>Today's Logins</h3>
          <p>{todaysLogins}</p>
        </div>
      </div>

      {/* Map Section with Clean CartoDB Positron Tiles */}
      <div className="map-section-container">
        <div className="map-header-title">
          <h3>Global Login Distribution</h3>
        </div>
        <div className="map-wrapper">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%", borderRadius: "12px" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=cb1_43b4_1_e5beeadcb1fab5458343b268"
            />
            {filtered
              .filter(
                (user) =>
                  user.history &&
                  user.history.length &&
                  user.history[0].latitude &&
                  user.history[0].longitude
              )
              .map((user) => {
                const latest = user.history[0];
                return (
                  <Marker
                    key={user.userId}
                    position={[latest.latitude, latest.longitude]}
                  >
                    <Popup>
                      <div className="map-popup-content">
                        <strong>{user.username}</strong>
                        <br />
                        <span>{user.email}</span>
                        <br />
                        <small>{latest.city}, {latest.country}</small>
                        <br />
                        <small>{new Date(latest.loginAt).toLocaleString()}</small>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by email or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Activity Grid */}
      <div className="route-grid">
        {filtered.map((user) => {
          const latest = user.history && user.history[0] ? user.history[0] : {};
          return (
            <div className="route-card" key={user.userId}>
              <div className="route-top">
                <div>
                  <span className="method get">{user.role || "User"}</span>
                  <h3>{user.username}</h3>
                  <small>{user.email}</small>
                </div>
                <span className="health-badge healthy">
                  {latest.country || "Unknown"}
                </span>
              </div>

              <div className="route-stats">
                <div>
                  <span>Organization</span>
                  <strong>{user.organization || "-"}</strong>
                </div>
                <div>
                  <span>Latest IP</span>
                  <strong>{user.latestIP || latest.ip || "-"}</strong>
                </div>
                <div>
                  <span>City</span>
                  <strong>{user.latestCity || latest.city || "-"}</strong>
                </div>
                <div>
                  <span>Browser</span>
                  <strong>{user.latestBrowser || latest.browser || "-"}</strong>
                </div>
              </div>

              <div className="route-extra">
                <div>
                  <b>Last Login</b>
                  <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}</p>
                </div>
                <div>
                  <b>Total Sessions</b>
                  <p>{user.history?.length || 0}</p>
                </div>
              </div>

              <button
                className="view-btn"
                onClick={() => setSelectedUser(user)}
              >
                View History
              </button>
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      {selectedUser && (
        <div
          className="route-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="route-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{selectedUser.username}</h2>
                <p className="modal-subtitle">{selectedUser.email}</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-grid">
              <div className="modal-card-item">
                <strong>Role</strong>
                <p>{selectedUser.role || "-"}</p>
              </div>
              <div className="modal-card-item">
                <strong>Organization</strong>
                <p>{selectedUser.organization || "-"}</p>
              </div>
              <div className="modal-card-item">
                <strong>Total Sessions</strong>
                <p>{selectedUser.history?.length || 0}</p>
              </div>
              <div className="modal-card-item">
                <strong>Latest IP</strong>
                <p>{selectedUser.latestIP || "-"}</p>
              </div>
            </div>

            <h3 className="history-title">Authentication Timeline</h3>

            <div className="timeline-container">
              <div className="timeline">
                {selectedUser.history?.map((login, i) => (
                  <div className="timeline-item" key={login.id || i}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <strong>{new Date(login.loginAt).toLocaleString()}</strong>
                        <span className="status-badge healthy">Success</span>
                      </div>
                      <div className="timeline-details-grid">
                        <p><b>IP:</b> {login.ip}</p>
                        <p><b>Location:</b> {login.city}, {login.region}, {login.country}</p>
                        <p><b>ISP:</b> {login.isp || "-"}</p>
                        <p><b>Browser:</b> {login.browser}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}