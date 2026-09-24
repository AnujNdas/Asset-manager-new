import React, { useEffect, useState } from "react";
import "../../Page_styles/AffiliateDashboard.css";

import Loader from "../../Components/Loader";

import {
  FaCopy,
  FaExternalLinkAlt,
  FaUsers,
  FaMousePointer,
  FaMoneyBillWave,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaWallet,
} from "react-icons/fa";

import {
  getAffiliateDashboard,
} from "../../Services/AffiliateServices";

const AffiliateDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [affiliate, setAffiliate] = useState(null);
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState(null);

  const [recentReferrals, setRecentReferrals] =
    useState([]);

  const [recentEarnings, setRecentEarnings] =
    useState([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res =
        await getAffiliateDashboard();

      setAffiliate(res?.affiliate || null);
      setStats(res?.stats || null);
      setEarnings(res?.earnings || null);
      setPayouts(res?.payouts || null);

      setRecentReferrals(
        res?.recentReferrals || []
      );

      setRecentEarnings(
        res?.recentEarnings || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch affiliate dashboard:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(
        affiliate?.referralLink || ""
      );
    } catch (err) {
      console.error(
        "Failed to copy referral link:",
        err
      );
    }
  };

  const formatCurrency = (
    amount,
    currency = "USD"
  ) => {
    const value = Number(amount || 0);

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currency || "USD"} ${value.toFixed(
        2
      )}`;
    }
  };

  const formatPlanName = (plan) => {
    if (!plan) return "-";

    return (
      plan.charAt(0).toUpperCase() +
      plan.slice(1)
    );
  };

  const formatCommissionType = (type) => {
    if (!type) return "-";

    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="affiliate-loader">
        <Loader />
      </div>
    );
  }

  return (
    <div className="affiliate-dashboard">

      {/* =================================================
          HERO
      ================================================= */}

      <div className="dashboard-top-grid">

        {/* WELCOME CARD */}

        <div className="dashboard-card hero-card">

          <span className="card-label">
            AFFILIATE PROGRAM
          </span>

          <h2>
            Welcome back,
            <br />
            {affiliate?.fullName || "Affiliate"}
          </h2>

          <p>
            Share your referral link and earn
            commissions from successful
            subscription payments.
          </p>

          <div
            className={`affiliate-status ${
              affiliate?.status || ""
            }`}
          >
            {formatStatus(
              affiliate?.status
            )}
          </div>

        </div>


        {/* REFERRAL LINK */}

        <div className="dashboard-card link-card">

          <div className="link-header">

            <div>
              <span>
                Your Referral Link
              </span>

              <h3>
                {affiliate?.affiliateCode ||
                  "-"}
              </h3>
            </div>

            {affiliate?.referralLink && (
              <a
                href={affiliate.referralLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Open referral link"
              >
                <FaExternalLinkAlt />
              </a>
            )}

          </div>

          <div className="referral-link-box">
            {affiliate?.referralLink ||
              "Referral link unavailable"}
          </div>

          <button
            className="copy-btn"
            onClick={copyReferralLink}
            type="button"
          >
            <FaCopy />
            Copy Link
          </button>

        </div>

      </div>


      {/* =================================================
          CORE KPI
      ================================================= */}

      <div className="kpi-grid">

        <div className="dashboard-card stat-card">
          <FaMousePointer />

          <h2>
            {affiliate?.totalClicks || 0}
          </h2>

          <p>
            Total Clicks
          </p>
        </div>


        <div className="dashboard-card stat-card">
          <FaUsers />

          <h2>
            {affiliate?.totalReferrals || 0}
          </h2>

          <p>
            Total Referrals
          </p>
        </div>


        <div className="dashboard-card stat-card">
          <FaChartLine />

          <h2>
            {affiliate?.totalConversions || 0}
          </h2>

          <p>
            Total Conversions
          </p>
        </div>


        <div className="dashboard-card stat-card">

          <FaChartLine />

          <h2>
            {stats?.conversionRate || 0}%
          </h2>

          <p>
            Conversion Rate
          </p>

        </div>

      </div>


      {/* =================================================
          EARNINGS OVERVIEW
      ================================================= */}

      <div className="dashboard-section-title">

        <div>
          <h2>
            Earnings Overview
          </h2>

          <p>
            Track your commission performance
            and payout progress.
          </p>
        </div>

      </div>


      <div className="earnings-overview-grid">

        {/* TOTAL EARNINGS */}

        <div className="dashboard-card earnings-stat-card">

          <div className="earnings-stat-icon total">
            <FaMoneyBillWave />
          </div>

          <div>

            <span>
              Total Earnings
            </span>

            <h2>
              {formatCurrency(
                earnings?.totalEarnings,
                earnings?.currency
              )}
            </h2>

            <small>
              {earnings?.commissionCount || 0}{" "}
              commission payments
            </small>

          </div>

        </div>


        {/* THIS MONTH */}

        <div className="dashboard-card earnings-stat-card">

          <div className="earnings-stat-icon month">
            <FaChartLine />
          </div>

          <div>

            <span>
              This Month
            </span>

            <h2>
              {formatCurrency(
                earnings?.earningsThisMonth,
                earnings?.currency
              )}
            </h2>

            <small>
              {earnings?.commissionsThisMonth ||
                0}{" "}
              commissions
            </small>

          </div>

        </div>


        {/* PENDING */}

        <div className="dashboard-card earnings-stat-card">

          <div className="earnings-stat-icon pending">
            <FaClock />
          </div>

          <div>

            <span>
              Pending Earnings
            </span>

            <h2>
              {formatCurrency(
                earnings?.pendingEarnings,
                earnings?.currency
              )}
            </h2>

            <small>
              Awaiting payout
            </small>

          </div>

        </div>


        {/* PAID */}

        <div className="dashboard-card earnings-stat-card">

          <div className="earnings-stat-icon paid">
            <FaCheckCircle />
          </div>

          <div>

            <span>
              Paid Earnings
            </span>

            <h2>
              {formatCurrency(
                earnings?.paidEarnings,
                earnings?.currency
              )}
            </h2>

            <small>
              Successfully paid
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          RECENT EARNINGS
      ================================================= */}

      <div className="dashboard-bottom-grid">

        <div className="dashboard-card">

          <div className="dashboard-card-heading">

            <div>
              <h2>
                Recent Earnings
              </h2>

              <p>
                Latest commission payments
              </p>
            </div>

          </div>


          <div className="dashboard-table-wrapper">

            <table className="referral-table">

              <thead>
                <tr>
                  <th>
                    Organization
                  </th>

                  <th>
                    Plan
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Commission
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentEarnings.length > 0 ? (
                  recentEarnings.map(
                    (item) => (
                      <tr key={item.id}>

                        <td>
                          <div className="table-primary">
                            {item.organizationName ||
                              "-"}
                          </div>

                          {item.organizationCode && (
                            <div className="table-secondary">
                              {
                                item.organizationCode
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {formatPlanName(
                            item.planName
                          )}
                        </td>

                        <td>
                          <span
                            className={`commission-type ${item.commissionType || ""}`}
                          >
                            {formatCommissionType(
                              item.commissionType
                            )}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              item.commissionAmount,
                              item.paymentCurrency
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              item.status || ""
                            }`}
                          >
                            {formatStatus(
                              item.status
                            )}
                          </span>
                        </td>

                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="empty-table"
                    >
                      No commission payments yet.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =================================================
            RECENT REFERRALS
        ================================================= */}

        <div className="dashboard-card">

          <div className="dashboard-card-heading">

            <div>
              <h2>
                Recent Referrals
              </h2>

              <p>
                Latest users referred through
                your affiliate link.
              </p>
            </div>

          </div>


          <div className="dashboard-table-wrapper">

            <table className="referral-table">

              <thead>
                <tr>
                  <th>
                    User
                  </th>

                  <th>
                    Organization
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentReferrals.length > 0 ? (
                  recentReferrals.map(
                    (item) => (
                      <tr key={item._id}>

                        <td>
                          <div className="table-primary">
                            {item.referredUserId
                              ?.email || "-"}
                          </div>
                        </td>

                        <td>
                          {item.organizationId
                            ?.name || "-"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              item.status || ""
                            }`}
                          >
                            {formatStatus(
                              item.status
                            )}
                          </span>
                        </td>

                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="empty-table"
                    >
                      No referrals yet.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* =================================================
          TODAY + PAYOUT
      ================================================= */}

      <div className="dashboard-bottom-grid">

        {/* TODAY'S ACTIVITY */}

        <div className="dashboard-card">

          <div className="dashboard-card-heading">

            <div>
              <h2>
                Today's Activity
              </h2>

              <p>
                Referral and commission activity
                for today.
              </p>
            </div>

          </div>


          <div className="today-stats">

            <div>
              <span>
                Clicks
              </span>

              <h3>
                {stats?.clicksToday || 0}
              </h3>
            </div>


            <div>
              <span>
                Referrals
              </span>

              <h3>
                {stats?.referralsToday || 0}
              </h3>
            </div>


            <div>
              <span>
                Conversions
              </span>

              <h3>
                {stats?.conversionsToday || 0}
              </h3>
            </div>


            <div>
              <span>
                Earnings
              </span>

              <h3>
                {formatCurrency(
                  earnings?.earningsToday,
                  earnings?.currency
                )}
              </h3>
            </div>

          </div>

        </div>


        {/* PAYOUT STATUS */}

        <div className="dashboard-card payout-status-card">

          <div className="dashboard-card-heading">

            <div>
              <h2>
                Payout Status
              </h2>

              <p>
                Current affiliate payout requests.
              </p>
            </div>

            <FaWallet className="payout-wallet-icon" />

          </div>


          <div className="payout-status-grid">

            <div>
              <span>
                Pending
              </span>

              <strong>
                {payouts?.pendingTickets || 0}
              </strong>
            </div>


            <div>
              <span>
                Processing
              </span>

              <strong>
                {payouts?.processingTickets || 0}
              </strong>
            </div>


            <div>
              <span>
                Resolved
              </span>

              <strong>
                {payouts?.resolvedTickets || 0}
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AffiliateDashboard;