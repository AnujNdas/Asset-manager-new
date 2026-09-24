// src/Pages/AffiliateEarningsPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import "../../Page_styles/AffiliateEarnings.css";
import Loader from "../../Components/Loader";

import { getAffiliateEarnings } from "../../Services/AffiliateServices";

const AffiliateEarningsPage = () => {
  const [summary, setSummary] = useState({});
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  /* =====================================================
     FETCH EARNINGS
  ===================================================== */

  const fetchEarnings = async () => {
    try {
      setLoading(true);

      const res = await getAffiliateEarnings();

      /*
        Depending on your axios service, res.data is usually
        the actual API response.

        If your AffiliateServices function already returns
        response.data, this also works with the fallback.
      */

      const data = res?.data || res;

      setSummary(data?.summary || {});
      setEarnings(data?.earnings || []);
    } catch (err) {
      console.error("Failed to fetch affiliate earnings:", err);

      setSummary({});
      setEarnings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);


  /* =====================================================
     FILTERS
  ===================================================== */

  const filteredEarnings = useMemo(() => {
    return earnings.filter((item) => {
      const statusMatch =
        statusFilter === "all" ||
        item.status === statusFilter;

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
    planFilter,
  ]);


  /* =====================================================
     HELPERS
  ===================================================== */

  const formatPlanName = (plan) => {
    if (!plan) return "N/A";

    return (
      plan.charAt(0).toUpperCase() +
      plan.slice(1)
    );
  };

  const formatBillingCycle = (cycle) => {
    if (!cycle) return "N/A";

    return (
      cycle.charAt(0).toUpperCase() +
      cycle.slice(1)
    );
  };

  const formatCommissionType = (type) => {
    if (!type) return "N/A";

    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatCurrency = (
    amount,
    currency = "USD"
  ) => {
    const numericAmount = Number(amount || 0);

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      return `${currency || "USD"} ${numericAmount.toFixed(2)}`;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
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


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="affiliate-loader">
        <Loader />
      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="affiliate-earnings-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="affiliate-header">

        <div>
          <span className="affiliate-page-label">
            AFFILIATE PORTAL
          </span>

          <h2>
            Earnings
          </h2>

          <p>
            Track your commissions, subscription
            payments and affiliate payouts.
          </p>
        </div>

        <button
          className="withdraw-btn"
          type="button"
        >
          Withdraw Earnings
        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="earnings-summary-grid">

        {/* Total Earnings */}

        <div className="earning-card total-card">

          <div className="earning-card-top">
            <span>Total Earnings</span>

            <div className="earning-card-icon">
              $
            </div>
          </div>

          <h2>
            {formatCurrency(
              summary.totalEarnings,
              summary.currency || "USD"
            )}
          </h2>

          <small>
            Lifetime commission earnings
          </small>

        </div>


        {/* Pending */}

        <div className="earning-card pending">

          <div className="earning-card-top">
            <span>Pending</span>

            <div className="earning-card-icon">
              ◷
            </div>
          </div>

          <h2>
            {formatCurrency(
              summary.pendingEarnings,
              summary.currency || "USD"
            )}
          </h2>

          <small>
            Awaiting payout
          </small>

        </div>


        {/* Paid */}

        <div className="earning-card success">

          <div className="earning-card-top">
            <span>Paid</span>

            <div className="earning-card-icon">
              ✓
            </div>
          </div>

          <h2>
            {formatCurrency(
              summary.paidEarnings,
              summary.currency || "USD"
            )}
          </h2>

          <small>
            Successfully paid
          </small>

        </div>


        {/* Referrals */}

        <div className="earning-card">

          <div className="earning-card-top">
            <span>Total Referrals</span>

            <div className="earning-card-icon">
              ↗
            </div>
          </div>

          <h2>
            {summary.totalReferrals || 0}
          </h2>

          <small>
            Referred users
          </small>

        </div>


        {/* Converted */}

        <div className="earning-card">

          <div className="earning-card-top">
            <span>Converted</span>

            <div className="earning-card-icon">
              ✓
            </div>
          </div>

          <h2>
            {summary.convertedReferrals || 0}
          </h2>

          <small>
            Successful conversions
          </small>

        </div>


        {/* Conversion Rate */}

        <div className="earning-card">

          <div className="earning-card-top">
            <span>Conversion Rate</span>

            <div className="earning-card-icon">
              %
            </div>
          </div>

          <h2>
            {summary.conversionRate || 0}%
          </h2>

          <small>
            Referral conversion
          </small>

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="earnings-section-header">

        <div>
          <h3>
            Commission History
          </h3>

          <p>
            Every successful subscription payment
            generates a separate commission.
          </p>
        </div>

      </div>


      <div className="earnings-filters">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="paid">
            Paid
          </option>

          <option value="rejected">
            Rejected
          </option>
        </select>


        <select
          value={billingFilter}
          onChange={(e) =>
            setBillingFilter(e.target.value)
          }
        >
          <option value="all">
            All Billing
          </option>

          <option value="monthly">
            Monthly
          </option>

          <option value="yearly">
            Yearly
          </option>
        </select>


        <select
          value={planFilter}
          onChange={(e) =>
            setPlanFilter(e.target.value)
          }
        >
          <option value="all">
            All Plans
          </option>

          <option value="base">
            Base
          </option>

          <option value="grow">
            Grow
          </option>

          <option value="omni">
            Omni
          </option>
        </select>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="earnings-table-wrapper">

        <table className="earnings-table">

          <thead>

            <tr>
              <th>Organization</th>
              <th>Plan</th>
              <th>Type</th>
              <th>Billing</th>
              <th>Payment</th>
              <th>Commission</th>
              <th>Status</th>
              <th>Date</th>
            </tr>

          </thead>

          <tbody>

            {filteredEarnings.length > 0 ? (

              filteredEarnings.map((item) => (

                <tr key={item.id}>

                  {/* Organization */}

                  <td>

                    <div className="organization-cell">

                      <strong>
                        {item.organizationName ||
                          "N/A"}
                      </strong>

                      {item.organizationCode && (
                        <small>
                          {item.organizationCode}
                        </small>
                      )}

                    </div>

                  </td>


                  {/* Plan */}

                  <td>

                    <span className="plan-name">
                      {formatPlanName(
                        item.planName
                      )}
                    </span>

                  </td>


                  {/* Commission type */}

                  <td>

                    <span
                      className={`commission-type ${item.commissionType || ""}`}
                    >
                      {formatCommissionType(
                        item.commissionType
                      )}
                    </span>

                  </td>


                  {/* Billing */}

                  <td>
                    {formatBillingCycle(
                      item.billingCycle
                    )}
                  </td>


                  {/* Payment */}

                  <td>

                    <span className="payment-amount">
                      {formatCurrency(
                        item.paymentAmount,
                        item.paymentCurrency
                      )}
                    </span>

                  </td>


                  {/* Commission */}

                  <td>

                    <div className="commission-cell">

                      <strong>
                        {formatCurrency(
                          item.commissionAmount,
                          item.paymentCurrency
                        )}
                      </strong>

                      <small>
                        {item.commissionRate || 0}%
                      </small>

                    </div>

                  </td>


                  {/* Status */}

                  <td>

                    <span
                      className={`status-badge ${
                        item.status || "unknown"
                      }`}
                    >
                      {formatStatus(
                        item.status
                      )}
                    </span>

                  </td>


                  {/* Date */}

                  <td>
                    {formatDate(
                      item.createdAt ||
                        item.generatedAt
                    )}
                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="earnings-empty-cell"
                >

                  <div className="empty-state">

                    <div className="empty-state-icon">
                      $
                    </div>

                    <h4>
                      No earnings found
                    </h4>

                    <p>
                      There are no commission
                      records matching your filters.
                    </p>

                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          PAYOUT SUMMARY
      ================================================= */}

      <div className="payout-card">

        <div className="payout-card-item">

          <span>
            Pending Payout
          </span>

          <strong>
            {formatCurrency(
              summary.pendingEarnings,
              summary.currency || "USD"
            )}
          </strong>

        </div>


        <div className="payout-card-item">

          <span>
            Payout Status
          </span>

          <strong>
            {Number(
              summary.pendingEarnings || 0
            ) > 0
              ? "Available"
              : "No Pending Payout"}
          </strong>

        </div>


        <div className="payout-card-item">

          <span>
            Paid Earnings
          </span>

          <strong>
            {formatCurrency(
              summary.paidEarnings,
              summary.currency || "USD"
            )}
          </strong>

        </div>

      </div>

    </div>
  );
};

export default AffiliateEarningsPage;