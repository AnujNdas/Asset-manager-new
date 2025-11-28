import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip, faLaptop, faUsers } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getTopLocations,
  getExpiringAssets,
  getRecentAssets,
  getActiveUsers,
} from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [topLocations, setTopLocations] = useState([]);
  const [expiringAssets, setExpiringAssets] = useState(null);
  const [recentAssets, setRecentAssets] = useState(null);
  const [activeUsers, setActiveUsers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await getAdminStats();
        const locations = await getTopLocations();
        const expiring = await getExpiringAssets();
        const recent = await getRecentAssets();
        const active = await getActiveUsers();

        setStatsData(stats);
        setTopLocations(locations);
        setExpiringAssets(expiring);
        setRecentAssets(recent);
        setActiveUsers(active);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to load dashboard data.",
        });
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="saas-dashboard">

      {/* ---- Page Header ---- */}
      <div className="dashboard-header">
        <h2>Admin Overview</h2>
        <p className="sub">System analytics & important insights.</p>
      </div>

      {/* ---- Only 3 Cards ---- */}
      <div className="top-cards">
        <div className="card" onClick={() => navigate("/inventory?tab=hardware")}>
          <div className="icon purple"><FontAwesomeIcon icon={faMicrochip} /></div>
          <div>
            <h3>{statsData.hardwareCount}</h3>
            <p>Hardware Assets</p>
          </div>
        </div>

        <div className="card" onClick={() => navigate("/inventory?tab=software")}>
          <div className="icon violet"><FontAwesomeIcon icon={faLaptop} /></div>
          <div>
            <h3>{statsData.softwareCount}</h3>
            <p>Software Assets</p>
          </div>
        </div>

        <div className="card" onClick={() => navigate("/setting/users")}>
          <div className="icon red"><FontAwesomeIcon icon={faUsers} /></div>
          <div>
            <h3>{statsData.usersCount}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      {/* ---- Top 5 Locations ---- */}
      <div className="dashboard-section">
        <h3>Top 5 Locations with Most Assets</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Assets Count</th>
            </tr>
          </thead>
          <tbody>
            {topLocations.map((loc, idx) => (
              <tr key={idx}>
                <td>{loc._id}</td>
                <td>{loc.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Expiring Assets ---- */}
      <div className="dashboard-section">
        <h3>Assets Expiring in Next 3 Months</h3>
        <div className="expiring-grid">

          <div>
            <h4>Hardware</h4>
            <ul>
              {expiringAssets?.expiringHardware?.map((item) => (
                <li key={item._id}>{item.assetName} → {item.DOE}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Software</h4>
            <ul>
              {expiringAssets?.expiringSoftware?.map((item) => (
                <li key={item._id}>{item.name} → {item.licenseExpiry}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ---- Recent Assets ---- */}
      <div className="dashboard-section">
        <h3>Recently Added Assets (5)</h3>
        <div className="recent-grid">

          <div>
            <h4>Hardware</h4>
            <ul>
              {recentAssets?.hardware?.map((item) => (
                <li key={item._id}>{item.assetName}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Software</h4>
            <ul>
              {recentAssets?.software?.map((item) => (
                <li key={item._id}>{item.name}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ---- Active Users ---- */}
      <div className="dashboard-section">
        <h3>Most Active Users (Last 30 Days)</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers?.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{new Date(user.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
