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
const [expandedUser, setExpandedUser] = useState(null);
const [selectedUser, setSelectedUser] = useState(null);
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

  return logs.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase())
  );
}, [logs, search]);

  const uniqueCountries = new Set(logs.map(l => l.country)).size;

  return (
    <div className="login-activity-wrapper">

      <div className="header">
        <h2>Security Monitoring Dashboard</h2>
      </div>

      {/* ===== Summary Cards ===== */}
      <div className="summary-grid">
<div className="summary-card">
    <h4>Total Users</h4>
    <p>{logs.length}</p>
</div>

<div className="summary-card">
    <h4>Total Logins</h4>
    <p>
        {logs.reduce(
            (total, user) => total + user.history.length,
            0
        )}
    </p>
</div>

<div className="summary-card">
    <h4>Unique Organizations</h4>
    <p>
        {
            new Set(
                logs.map(user => user.organization)
            ).size
        }
    </p>
</div>

<div className="summary-card">
    <h4>Today's Logins</h4>
    <p>
        {
            logs.reduce((count, user) => {

                return (
                    count +
                    user.history.filter(
                        h =>
                            new Date(
                                h.loginAt
                            ).toDateString() ===
                            new Date().toDateString()
                    ).length
                );

            }, 0)
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
{
filtered
.filter(user =>
    user.history.length &&
    user.history[0].latitude &&
    user.history[0].longitude
)
.map(user => {

    const latest = user.history[0];

    return (

        <Marker
            key={user.userId}
            position={[
                latest.latitude,
                latest.longitude
            ]}
        >

            <Popup>

                <strong>{user.username}</strong>

                <br/>

                {user.email}

                <br/>

                {latest.city}

                <br/>

                {new Date(
                    latest.loginAt
                ).toLocaleString()}

            </Popup>

        </Marker>

    );

})
}
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

{filtered.map(user => {

const latest = user.history[0];

return (

<div
className="activity-card"
key={user.userId}
>

<div className="activity-top">

<div>

<h3>{user.username}</h3>

<p>{user.email}</p>
<p><strong>Country:</strong> {latest.country}</p>
<p><strong>Region:</strong> {latest.region}</p>
<p><strong>City:</strong> {latest.city}</p>
</div>

<button
className="expand-btn"
onClick={() => setSelectedUser(user)}
>

View History

</button>

</div>

<div className="activity-body">

<p>

<strong>Role:</strong>

{user.role}

</p>

<p>

<strong>Organization:</strong>

{user.organization || "-"}

</p>

<p>

<strong>Last Login:</strong>

{new Date(
user.lastLogin
).toLocaleString()}

</p>

<p>

<strong>Latest IP:</strong>

{user.latestIP}

</p>

<p>

<strong>Latest City:</strong>

{user.latestCity}

</p>

<p>

<strong>Latest Browser:</strong>

{user.latestBrowser}

</p>

</div>

</div>

);

})}

</div>
{selectedUser && (

<div
className="history-modal-overlay"
onClick={() => setSelectedUser(null)}
>

<div
className="history-modal"
onClick={(e) => e.stopPropagation()}
>

<div className="history-modal-header">

<div>

<h2>{selectedUser.username}</h2>

<p>{selectedUser.email}</p>

</div>

<button
className="close-modal"
onClick={() => setSelectedUser(null)}
>

✕

</button>

</div>

<div className="history-modal-body">

<div className="timeline">

{selectedUser.history.map(login => (

<div
className="timeline-item"
key={login.id}
>

<div className="timeline-dot"/>

<div className="timeline-content">

<div className="timeline-header">

<strong>

{
new Date(login.loginAt)
.toLocaleString()
}

</strong>

</div>

<p>

<b>IP:</b> {login.ip}

</p>

<p>

<b>Country:</b> {login.country}

</p>

<p>

<b>Region:</b> {login.region}

</p>

<p>

<b>City:</b> {login.city}

</p>

<p>

<b>ISP:</b> {login.isp}

</p>

<p>

<b>Browser:</b> {login.browser}

</p>

<p>

<b>Organization:</b>

{" "}

{login.organization || "-"}

</p>

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
