import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip,
  faLaptop,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Chart from "chart.js/auto";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getAdminStats } from "../Services/ApiServices";
import "../Page_styles/AdminDashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        setStatsData(res);
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
    fetchStats();
  }, []);

  useEffect(() => {
    if (!statsData) return;

    new Chart(document.getElementById("assetsChart"), {
      type: "doughnut",
      data: {
        labels: ["Hardware", "Software", "Licenses"],
        datasets: [
          {
            data: [
              statsData.hardwareCount,
              statsData.softwareCount,
              statsData.coreLicensesCount,
            ],
            backgroundColor: ["#6366f1", "#a855f7", "#f59e0b"],
            cutout: "75%",
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });

  }, [statsData]);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="saas-dashboard">
      {/* ---- Page Title ---- */}
      <div className="dashboard-header">
        <h2>Admin Overview</h2>
        <p className="sub">Summary of your system activity and assets.</p>
      </div>

      {/* ---- Top Stats Cards ---- */}
      <div className="top-cards">
        <div className="card" onClick={() => navigate("/inventory?tab=hardware")}>
          <div className="icon purple">
            <FontAwesomeIcon icon={faMicrochip} />
          </div>
          <div>
            <h3>{statsData.hardwareCount}</h3>
            <p>Hardware Assets</p>
          </div>
        </div>

        <div className="card" onClick={() => navigate("/inventory?tab=software")}>
          <div className="icon violet">
            <FontAwesomeIcon icon={faLaptop} />
          </div>
          <div>
            <h3>{statsData.softwareCount}</h3>
            <p>Software Assets</p>
          </div>
        </div>

        <div className="card" onClick={() => navigate("/setting/users")}>
          <div className="icon red">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <h3>{statsData.usersCount}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      {/* ---- Middle Section ---- */}
      <div className="middle-grid">
        {/* Chart */}
        <div className="chart-wrapper">
          <h4>Asset Distribution</h4>
          <canvas id="assetsChart"></canvas>
        </div>

        {/* Summary Table */}
        <div className="summary-card">
          <h4>Overall Summary</h4>
          <table>
            <tbody>
              <tr>
                <td>Hardware</td>
                <td>{statsData.hardwareCount}</td>
              </tr>
              <tr>
                <td>Software</td>
                <td>{statsData.softwareCount}</td>
              </tr>
              <tr>
                <td>Licenses</td>
                <td>{statsData.coreLicensesCount}</td>
              </tr>
              <tr>
                <td>Users</td>
                <td>{statsData.usersCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
