import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip, // hardwareChipOutline
  faLaptop, // laptopOutline
  faCopy, // copyOutline
  faUsers, // peopleOutline
  faEllipsisH, // ellipsisHorizontalOutline
} from "@fortawesome/free-solid-svg-icons";

import Chart from "chart.js/auto";
import "../Page_styles/AdminDashboard.css";

const Dashboard = () => {
useEffect(() => {
  const chartInstances = [];

  // Bar Chart
  const bar = document.getElementById("barchart");
  if (bar) {
    const barChart = new Chart(bar, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            label: "Active",
            data: [10, 20, 15, 30, 25],
            backgroundColor: "#6366f1",
            borderRadius: 8,
          },
          {
            label: "Expired",
            data: [5, 10, 7, 12, 8],
            backgroundColor: "#f43f5e",
            borderRadius: 8,
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: true } } },
    });
    chartInstances.push(barChart);
  }

  // Doughnut Chart
  const doughnut = document.getElementById("doughnutchart");
  if (doughnut) {
    const doughnutChart = new Chart(doughnut, {
      type: "doughnut",
      data: {
        labels: ["Active", "Expired"],
        datasets: [
          {
            data: [70, 30],
            backgroundColor: ["#22c55e", "#ef4444"],
          },
        ],
      },
      options: { cutout: "70%" },
    });
    chartInstances.push(doughnutChart);
  }

  // Pie Chart
  const pie = document.getElementById("pieChart");
  if (pie) {
    const pieChart = new Chart(pie, {
      type: "pie",
      data: {
        labels: ["Hardware", "Software", "Licenses"],
        datasets: [
          {
            data: [40, 35, 25],
            backgroundColor: ["#6366f1", "#a855f7", "#f59e0b"],
          },
        ],
      },
    });
    chartInstances.push(pieChart);
  }

  // Line Chart
  const line = document.getElementById("lineChart");
  if (line) {
    const lineChart = new Chart(line, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [
          {
            label: "Usage",
            data: [10, 12, 9, 14, 18],
            borderColor: "#8b5cf6",
            fill: false,
            tension: 0.4,
          },
        ],
      },
    });
    chartInstances.push(lineChart);
  }

  // Radar Chart
  const radar = document.getElementById("radarChart");
  if (radar) {
    const radarChart = new Chart(radar, {
      type: "radar",
      data: {
        labels: ["Speed", "Quality", "Support", "Efficiency", "Security"],
        datasets: [
          {
            label: "Performance",
            data: [8, 7, 9, 6, 8],
            backgroundColor: "rgba(99,102,241,0.3)",
            borderColor: "#6366f1",
          },
        ],
      },
    });
    chartInstances.push(radarChart);
  }

  // 🧹 Cleanup function to destroy charts
  return () => {
    chartInstances.forEach((chart) => chart.destroy());
  };
}, []);


  const stats = [
    { icon: faMicrochip, title: "Hardware", value: 55, color: "#6366f1" },
    { icon: faLaptop, title: "Software", value: 61, color: "#a855f7" },
    { icon: faCopy, title: "Licenses", value: 15, color: "#f59e0b" },
    { icon: faUsers, title: "Users", value: 6, color: "#f43f5e" },
  ];

  return (
    <div className="dashboard-container">
      {/* Top Stats Section */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div
              className="stat-icon"
              style={{ backgroundColor: item.color }}
            >
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

      {/* Middle Charts Section */}
      <div className="middle-section">
        <div className="chart-card">
          <div className="chart-header">
            <p>Active vs Expire</p>
            <p>Show by Month</p>
          </div>
          <div className="chart-flex">
            <canvas id="barchart"></canvas>
            <canvas id="pieChart"></canvas>
          </div>
        </div>

        <div className="chart-card">
          <p className="chart-title">Status</p>
          <canvas id="doughnutchart"></canvas>
          <div className="chart-buttons">
            <button className="btn active">Active</button>
            <button className="btn expire">Expire</button>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <p>Usage Trends</p>
            <p>Show by Month</p>
          </div>
          <canvas id="lineChart"></canvas>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>❤️</th>
                <th>Category</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>⚙️</td>
                <td>Electronics</td>
                <td>$1200.00</td>
              </tr>
              <tr>
                <td>⚙️</td>
                <td>Furniture</td>
                <td>$150.00</td>
              </tr>
              <tr>
                <td>⚙️</td>
                <td>Electronics</td>
                <td>$800.00</td>
              </tr>
              <tr>
                <td>⚙️</td>
                <td>Appliances</td>
                <td>$75.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="chart-card monthly">
          <h4>3240</h4>
          <p>Monthly Data</p>
          <canvas id="radarChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
