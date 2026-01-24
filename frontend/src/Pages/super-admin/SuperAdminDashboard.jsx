import { useEffect, useState } from "react";
import { getSuperAdminOverview } from "../../Services/AdminServices";
import "../../Page_styles/SuperAdminDashboard.css";
import MetricCard from "../../Components/MetricCard";
import RevenueChart from "../../Components/RevenueChart";
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getSuperAdminOverview();
        setStats(data);
        console.log("Super Admin Dashboard Data:", data);
      } catch (err) {
        console.error(err);
        setError(err.userMessage || "Failed to load dashboard");
      }
    };

    loadDashboard();
  }, []);

  if (error) return <h2>{error}</h2>;
  if (!stats) return <h2>Loading platform overview...</h2>;

  return (
    <>
      <h1>Platform Overview</h1>

      {/* TOP METRICS */}
      <div className="sa-cards">
        <MetricCard label="Total Organizations" value={stats.totalOrganizations} />
        <MetricCard label="Active Organizations" value={stats.activeOrganizations} />
        <MetricCard label="Total Users" value={stats.totalUsers} />
        <MetricCard label="Active Users" value={stats.activeUsers} />
      </div>

      {/* SUBSCRIPTIONS */}
      <h2 className="section-title">Subscriptions</h2>
      <div className="sa-cards">
        <MetricCard
          label="Trial"
          value={stats.subscriptions.trial}
          className="info"
        />
        <MetricCard
          label="Active"
          value={stats.subscriptions.active}
          className="success"
        />
        <MetricCard
          label="Expired"
          value={stats.subscriptions.expired}
          className="danger"
        />
      </div>

      {/* REVENUE */}
      <h2 className="section-title">Revenue by Month</h2>
      <RevenueChart data={stats.revenueByMonth} />
    </>
  );
};

export default Dashboard;
