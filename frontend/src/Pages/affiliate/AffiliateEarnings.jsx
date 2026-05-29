// ✅ src/Pages/AffiliateEarningsPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import "../Page_styles/AffiliateEarnings.css";
import Loader from "../Components/Loader";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getAffiliateEarnings } from "../Services/ApiServices";

const AffiliateEarningsPage = () => {

  const [summary, setSummary] = useState({});
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  /* =========================================
     FETCH
  ========================================= */

  const fetchEarnings = async () => {
    try {

      const res = await getAffiliateEarnings();

      setSummary(res.summary || {});
      setEarnings(res.earnings || []);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  /* =========================================
     FILTERS
  ========================================= */

  const filteredEarnings = useMemo(() => {

    return earnings.filter((item) => {

      const statusMatch =
        statusFilter === "all" ||
        item.commissionStatus === statusFilter;

      const billingMatch =
        billingFilter === "all" ||
        item.billingCycle === billingFilter;

      const planMatch =
        planFilter === "all" ||
        item.planName === planFilter;

      return (
        statusMatch &&
        billingMatch &&
        planMatch
      );
    });

  }, [
    earnings,
    statusFilter,
    billingFilter,
    planFilter
  ]);

  /* =========================================
     CHART DATA
  ========================================= */

  const monthlyData = [
    { month: "Jan", earnings: 120 },
    { month: "Feb", earnings: 340 },
    { month: "Mar", earnings: 240 },
    { month: "Apr", earnings: 600 },
    { month: "May", earnings: 890 },
    { month: "Jun", earnings: 1200 },
  ];

  const conversionData = [
    { month: "Jan", conversions: 2 },
    { month: "Feb", conversions: 4 },
    { month: "Mar", conversions: 3 },
    { month: "Apr", conversions: 8 },
    { month: "May", conversions: 10 },
  ];

  const planData = [
    { name: "Base", value: 40 },
    { name: "Grow", value: 35 },
    { name: "Omni", value: 25 },
  ];

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b"
  ];

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="affiliate-loader">
        <Loader />
      </div>
    );
  }

  return (
    <div className="affiliate-earnings-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="affiliate-header">

        <div>
          <h1>Affiliate Earnings</h1>

          <p>
            Track referrals, commissions,
            conversions and payouts.
          </p>
        </div>

        <button className="withdraw-btn">
          Withdraw Earnings
        </button>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="earnings-summary-grid">

        <div className="earning-card">
          <span>Total Earnings</span>
          <h2>${summary.totalEarnings || 0}</h2>
        </div>

        <div className="earning-card pending">
          <span>Pending</span>
          <h2>${summary.pendingEarnings || 0}</h2>
        </div>

        <div className="earning-card success">
          <span>Paid</span>
          <h2>${summary.paidEarnings || 0}</h2>
        </div>

        <div className="earning-card">
          <span>Total Referrals</span>
          <h2>{summary.totalReferrals || 0}</h2>
        </div>

        <div className="earning-card">
          <span>Converted</span>
          <h2>{summary.convertedReferrals || 0}</h2>
        </div>

        <div className="earning-card">
          <span>Conversion Rate</span>
          <h2>{summary.conversionRate || 0}%</h2>
        </div>

      </div>

      {/* =========================================
          CHARTS
      ========================================= */}

      <div className="analytics-grid">

        {/* LINE CHART */}
        <div className="chart-card">

          <div className="chart-header">
            <h3>Monthly Earnings</h3>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="earnings"
                strokeWidth={3}
                stroke="#6366f1"
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* BAR CHART */}
        <div className="chart-card">

          <div className="chart-header">
            <h3>Conversions</h3>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="conversions"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* PIE CHART */}
        <div className="chart-card">

          <div className="chart-header">
            <h3>Plan Distribution</h3>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>

              <Pie
                data={planData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {planData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* =========================================
          FILTERS
      ========================================= */}

      <div className="earnings-filters">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>

        <select
          value={billingFilter}
          onChange={(e) =>
            setBillingFilter(e.target.value)
          }
        >
          <option value="all">All Billing</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) =>
            setPlanFilter(e.target.value)
          }
        >
          <option value="all">All Plans</option>
          <option value="base">Base</option>
          <option value="grow">Grow</option>
          <option value="omni">Omni</option>
        </select>

      </div>

      {/* =========================================
          TABLE
      ========================================= */}

      <div className="earnings-table-wrapper">

        <table className="earnings-table">

          <thead>
            <tr>
              <th>Organization</th>
              <th>Plan</th>
              <th>Billing</th>
              <th>Paid</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {filteredEarnings.length ? (

              filteredEarnings.map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.organizationId?.slice(0, 10)}
                  </td>

                  <td>
                    {item.planName}
                  </td>

                  <td>
                    {item.billingCycle}
                  </td>

                  <td>
                    ${item.paymentAmount}
                  </td>

                  <td>
                    ${item.commissionAmount}
                  </td>

                  <td>

                    <span
                      className={`status-badge ${item.commissionStatus}`}
                    >
                      {item.commissionStatus}
                    </span>

                  </td>

                  <td>
                    {new Date(
                      item.convertedAt
                    ).toLocaleDateString()}
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    No earnings found
                  </div>
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* =========================================
          PAYOUT SECTION
      ========================================= */}

      <div className="payout-card">

        <div>
          <h3>Pending Payout</h3>
          <p>
            ${summary.pendingEarnings || 0}
          </p>
        </div>

        <div>
          <h3>Next Settlement</h3>
          <p>1 June 2026</p>
        </div>

        <div>
          <h3>Minimum Threshold</h3>
          <p>$100</p>
        </div>

      </div>

    </div>
  );
};

export default AffiliateEarningsPage;