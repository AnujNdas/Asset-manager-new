import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip,
  faLaptop,
  faCopy,
  faUsers,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import Chart from "chart.js/auto";
import "../Page_styles/AdminDashboard.css";
import { getAdminStats } from "../Services/ApiServices";

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧩 Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminStats();
        setStatsData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 📊 Initialize Charts once data loads
  useEffect(() => {
    if (!statsData) return;

    const charts = [];

    // Bar Chart (Active vs Expired Licenses)
    const bar = document.getElementById("barchart");
    if (bar) {
      const barChart = new Chart(bar, {
        type: "bar",
        data: {
          labels: ["Active", "Expired"],
          datasets: [
            {
              label: "Licenses",
              data: [statsData.activeLicenses, statsData.expiredLicenses],
              backgroundColor: ["#22c55e", "#ef4444"],
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
        },
      });
      charts.push(barChart);
    }

    // Doughnut Chart (Asset Overview)
    const doughnut = document.getElementById("doughnutchart");
    if (doughnut) {
      const doughnutChart = new Chart(doughnut, {
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
            },
          ],
        },
        options: { cutout: "70%" },
      });
      charts.push(doughnutChart);
    }

    // Line Chart (Mock Monthly Data)
    const line = document.getElementById("lineChart");
    if (line) {
      const lineChart = new Chart(line, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              label: "System Usage",
              data: [10, 15, 20, 18, 25],
              borderColor: "#8b5cf6",
              fill: false,
              tension: 0.4,
            },
          ],
        },
      });
      charts.push(lineChart);
    }

    // Radar Chart (Mock Performance Data)
    const radar = document.getElementById("radarChart");
    if (radar) {
      const radarChart = new Chart(radar, {
        type: "radar",
        data: {
          labels: ["Speed", "Quality", "Support", "Efficiency", "Security"],
          datasets: [
            {
              label: "Performance",
              data: [8, 9, 7, 8, 9],
              backgroundColor: "rgba(99,102,241,0.3)",
              borderColor: "#6366f1",
            },
          ],
        },
      });
      charts.push(radarChart);
    }

    // Cleanup
    return () => charts.forEach((chart) => chart.destroy());
  }, [statsData]);

  if (loading)
    return <div className="dashboard-container">Loading dashboard...</div>;
  if (error)
    return <div className="dashboard-container error">{error}</div>;

  const stats = [
    { icon: faMicrochip, title: "Hardware", value: statsData.hardwareCount, color: "#6366f1", tab: "hardware" },
    { icon: faLaptop, title: "Software", value: statsData.softwareCount, color: "#a855f7", tab: "software" },
    { icon: faCopy, title: "Licenses", value: statsData.coreLicensesCount, color: "#f59e0b", tab: "core" },
    { icon: faUsers, title: "Users", value: statsData.usersCount, color: "#f43f5e", tab: "users" },
  ];

  return (
    <div className="dashboard-container">
      {/* --- Top Stats --- */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div
            className={`stat-card ${activeCard === item.tab ? "active-card" : ""}`}
            key={index}
            onClick={() => handleCardClick(item.tab)}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon" style={{ backgroundColor: item.color }}>
              <FontAwesomeIcon icon={item.icon} />
            </div>
            <div className="stat-data">
              <h4>{item.value}</h4>
              <p>{item.title}</p>
            </div>
            <FontAwesomeIcon icon={faEllipsisH} className="menu-icon" />
          </div>
        ))}
      </div>

      {/* --- Middle Charts --- */}
      <div className="middle-section">
        <div className="chart-card">
          <div className="chart-header">
            <p>License Status</p>
            <p>Active vs Expired</p>
          </div>
          <canvas id="barchart"></canvas>
        </div>

        <div className="chart-card">
          <p className="chart-title">Asset Distribution</p>
          <canvas id="doughnutchart"></canvas>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <p>Usage Trends</p>
            <p>Show by Month</p>
          </div>
          <canvas id="lineChart"></canvas>
        </div>
      </div>

      {/* --- Bottom Section --- */}
      <div className="bottom-section">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
              </tr>
            </thead>
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

        <div className="chart-card monthly">
          <h4>{statsData.activeLicenses}</h4>
          <p>Active Licenses</p>
          <canvas id="radarChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
