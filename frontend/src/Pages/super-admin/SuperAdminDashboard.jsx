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

        setError(
          err.userMessage || "Failed to load dashboard"
        );
      }
    };

    loadDashboard();
  }, []);

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!stats) {
    return <h2>Loading platform overview...</h2>;
  }

  const {
    totalOrganizations,
    activeOrganizations,
    totalUsers,
    activeUsers,
    totalAffiliates,
    pendingAffiliates,
    subscriptions,
    revenue,
    organizationTypes,
    billingCycles,
    expiringSubscriptions,
    recentOrganizations,
  } = stats;

  return (
    <div className="sa-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="sa-dashboard-header">
        <div>
          <h1>Platform Overview</h1>

          <p>
            Monitor organizations, users, subscriptions,
            revenue and affiliate activity.
          </p>
        </div>
      </div>


      {/* =====================================================
          PLATFORM METRICS
      ===================================================== */}

      <div className="sa-cards sa-main-metrics">

        <MetricCard
          label="Organizations"
          value={totalOrganizations}
        />

        <MetricCard
          label="Users"
          value={totalUsers}
        />

        <MetricCard
          label="Affiliates"
          value={totalAffiliates}
        />

        <MetricCard
          label="Active Subscriptions"
          value={subscriptions.active}
          className="success"
        />

      </div>


      {/* =====================================================
          SMALL METRIC DETAILS
      ===================================================== */}

      <div className="sa-detail-strip">

        <div className="sa-detail-item">
          <span>Active Organizations</span>
          <strong>{activeOrganizations}</strong>
        </div>

        <div className="sa-detail-item">
          <span>Active Users</span>
          <strong>{activeUsers}</strong>
        </div>

        <div className="sa-detail-item">
          <span>Pending Affiliates</span>
          <strong>{pendingAffiliates}</strong>
        </div>

        <div className="sa-detail-item">
          <span>Total Revenue</span>
          <strong>
            ${Number(
              revenue.totalRevenue || 0
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>

      </div>


      {/* =====================================================
          SUBSCRIPTIONS
      ===================================================== */}

      <h2 className="section-title">
        Subscription Overview
      </h2>

      <div className="sa-cards sa-subscription-cards">

        <MetricCard
          label="Trialing"
          value={subscriptions.trialing}
          className="info"
        />

        <MetricCard
          label="Active"
          value={subscriptions.active}
          className="success"
        />

        <MetricCard
          label="Past Due"
          value={subscriptions.pastDue}
          className="danger"
        />

        <MetricCard
          label="Paused"
          value={subscriptions.paused}
        />

        <MetricCard
          label="Cancelled"
          value={subscriptions.cancelled}
        />

        <MetricCard
          label="Expired"
          value={subscriptions.expired}
          className="danger"
        />

      </div>


      {/* =====================================================
          REVENUE + BILLING
      ===================================================== */}

      <div className="sa-two-column">

        {/* REVENUE */}

        <div className="sa-panel">

          <div className="sa-panel-header">
            <div>
              <h2>Revenue Overview</h2>
              <p>Subscription revenue by month</p>
            </div>

            <div className="sa-revenue-total">
              <span>Total Revenue</span>

              <strong>
                ${Number(
                  revenue.totalRevenue || 0
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          <div className="sa-chart-wrapper">
            {revenue.revenueByMonth?.length > 0 ? (
              <RevenueChart
                data={revenue.revenueByMonth}
              />
            ) : (
              <div className="sa-empty-state">
                No revenue data available
              </div>
            )}
          </div>

        </div>


        {/* BILLING */}

        <div className="sa-panel">

          <div className="sa-panel-header">
            <div>
              <h2>Billing Overview</h2>
              <p>Current subscription billing cycles</p>
            </div>
          </div>


          <div className="sa-billing-list">

            {billingCycles?.map((cycle) => (
              <div
                className="sa-billing-row"
                key={cycle._id}
              >
                <span>
                  {cycle._id === "monthly"
                    ? "Monthly"
                    : cycle._id === "yearly"
                    ? "Yearly"
                    : cycle._id}
                </span>

                <strong>
                  {cycle.count}
                </strong>
              </div>
            ))}

          </div>


          <div className="sa-billing-summary">

            <div>
              <span>Monthly Recurring Revenue</span>

              <strong>
                ${Number(
                  revenue.monthlyRecurringRevenue || 0
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div>
              <span>Expiring in 7 Days</span>

              <strong>
                {expiringSubscriptions}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ORGANIZATION TYPE + RECENT ORGANIZATIONS
      ===================================================== */}

      <div className="sa-two-column">

        {/* ORGANIZATION TYPES */}

        <div className="sa-panel">

          <div className="sa-panel-header">
            <div>
              <h2>Organizations by Type</h2>
              <p>Distribution across the platform</p>
            </div>
          </div>


          <div className="sa-org-types">

            {organizationTypes?.map((type) => {

              const typeName =
                type._id?.trim() || "Not Specified";

              const percentage =
                totalOrganizations > 0
                  ? Math.round(
                      (type.count /
                        totalOrganizations) *
                        100
                    )
                  : 0;

              return (
                <div
                  className="sa-org-type"
                  key={type._id || "empty"}
                >

                  <div className="sa-org-type-top">

                    <span>
                      {typeName}
                    </span>

                    <strong>
                      {type.count}
                    </strong>

                  </div>

                  <div className="sa-progress">

                    <div
                      className="sa-progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* RECENT ORGANIZATIONS */}

        <div className="sa-panel">

          <div className="sa-panel-header">

            <div>
              <h2>Recent Organizations</h2>
              <p>Latest organizations added</p>
            </div>

          </div>


          <div className="sa-recent-orgs">

            {recentOrganizations?.map((organization) => (

              <div
                className="sa-org-row"
                key={organization._id}
              >

                <div className="sa-org-info">

                  <strong>
                    {organization.name}
                  </strong>

                  <span>
                    {organization.orgCode}
                    {" · "}
                    {organization.organizationType ||
                      "Not Specified"}
                  </span>

                </div>


                <span
                  className={`sa-status ${
                    organization.status === "active"
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {organization.status}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* =====================================================
          ATTENTION
      ===================================================== */}

      <div className="sa-panel sa-attention-panel">

        <div className="sa-panel-header">

          <div>
            <h2>Platform Attention</h2>
            <p>
              Items that may require administrative action
            </p>
          </div>

        </div>


        <div className="sa-attention-grid">

          <div className="sa-attention-item">

            <div className="sa-attention-icon info">
              !
            </div>

            <div>
              <strong>
                {pendingAffiliates}
              </strong>

              <span>
                Affiliate applications pending review
              </span>
            </div>

          </div>


          <div className="sa-attention-item">

            <div className="sa-attention-icon warning">
              !
            </div>

            <div>
              <strong>
                {expiringSubscriptions}
              </strong>

              <span>
                Subscriptions expiring within 7 days
              </span>
            </div>

          </div>


          <div className="sa-attention-item">

            <div className="sa-attention-icon danger">
              !
            </div>

            <div>
              <strong>
                {subscriptions.pastDue}
              </strong>

              <span>
                Past-due subscriptions
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;