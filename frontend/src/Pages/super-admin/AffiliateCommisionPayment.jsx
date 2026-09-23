import React, { useEffect, useMemo, useState } from "react";
import ThemeSwal from "../../utils/swalTheme";

import {
  getAffiliateCommissionPayments,
} from "../../Services/AdminServices";

import "../../Page_styles/AffiliateCommission.css";

const AffiliateCommissionPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  /* ==========================================
     LOAD DATA
  ========================================== */

  const loadPayments = async () => {
    try {
      setLoading(true);

      const response =
        await getAffiliateCommissionPayments();

      console.log(
        "Affiliate commission payments:",
        response
      );

      setPayments(
        response?.data || []
      );

    } catch (error) {
      console.error(
        "Failed to load affiliate payments:",
        error
      );

      ThemeSwal.fire({
        icon: "error",
        title: "Failed to Load",
        text:
          error?.message ||
          "Unable to load affiliate commission payments.",
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  /* ==========================================
     STATISTICS
  ========================================== */

  const stats = useMemo(() => {

    const pending =
      payments.filter(
        (payment) =>
          payment.status === "pending"
      );

    const approved =
      payments.filter(
        (payment) =>
          payment.status === "approved"
      );

    const paid =
      payments.filter(
        (payment) =>
          payment.status === "paid"
      );

    const pendingAmount =
      pending.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.commissionAmount || 0
          ),
        0
      );

    const approvedAmount =
      approved.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.commissionAmount || 0
          ),
        0
      );

    const paidAmount =
      paid.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.commissionAmount || 0
          ),
        0
      );

    return {
      total: payments.length,
      pending: pending.length,
      approved: approved.length,
      paid: paid.length,
      pendingAmount,
      approvedAmount,
      paidAmount,
    };

  }, [payments]);

  /* ==========================================
     FILTER
  ========================================== */

  const filteredPayments = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    return payments.filter((payment) => {

      const affiliate =
        payment.affiliateId || {};

      const organization =
        payment.organizationId || {};

      const matchesSearch =
        !query ||
        affiliate.fullName
          ?.toLowerCase()
          .includes(query) ||
        affiliate.email
          ?.toLowerCase()
          .includes(query) ||
        affiliate.affiliateCode
          ?.toLowerCase()
          .includes(query) ||
        organization.name
          ?.toLowerCase()
          .includes(query) ||
        organization.orgCode
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        payment.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        payment.commissionType === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });

  }, [
    payments,
    search,
    statusFilter,
    typeFilter,
  ]);

  /* ==========================================
     HELPERS
  ========================================== */

  const formatCurrency = (
    amount,
    currency = "USD"
  ) => {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
      }
    ).format(Number(amount || 0));
  };

  const formatDate = (date) => {

    if (!date) return "-";

    return new Date(date)
      .toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
  };

  const getCommissionTypeLabel = (
    type
  ) => {

    if (!type) return "-";

    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="affiliate-payments-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="affiliate-payments-header">

        <div>
          <h1>
            Affiliate Commission Payments
          </h1>

          <p>
            Review affiliate commissions,
            payout information and offline
            payment records.
          </p>
        </div>

        <button
          className="affiliate-refresh-btn"
          onClick={loadPayments}
          disabled={loading}
        >
          ↻ &nbsp;
          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ======================================
          STAT CARDS
      ====================================== */}

      <div className="affiliate-payment-stats">

        <div className="affiliate-stat-card">

          <div className="affiliate-stat-icon">
            ◎
          </div>

          <span>
            TOTAL COMMISSIONS
          </span>

          <strong>
            {stats.total}
          </strong>

        </div>


        <div className="affiliate-stat-card">

          <div className="affiliate-stat-icon">
            ◷
          </div>

          <span>
            PENDING
          </span>

          <strong>
            {stats.pending}
          </strong>

          <small>
            {formatCurrency(
              stats.pendingAmount
            )}
          </small>

        </div>


        <div className="affiliate-stat-card">

          <div className="affiliate-stat-icon">
            ✓
          </div>

          <span>
            APPROVED
          </span>

          <strong>
            {stats.approved}
          </strong>

          <small>
            {formatCurrency(
              stats.approvedAmount
            )}
          </small>

        </div>


        <div className="affiliate-stat-card">

          <div className="affiliate-stat-icon">
            $
          </div>

          <span>
            PAID
          </span>

          <strong>
            {stats.paid}
          </strong>

          <small>
            {formatCurrency(
              stats.paidAmount
            )}
          </small>

        </div>

      </div>


      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="affiliate-payment-filters">

        <div className="affiliate-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search affiliate, organization or code..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
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
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Commission Types
          </option>

          <option value="initial">
            Initial
          </option>

          <option value="renewal">
            Renewal
          </option>

          <option value="upgrade">
            Upgrade
          </option>

          <option value="downgrade">
            Downgrade
          </option>

          <option value="plan_change">
            Plan Change
          </option>
        </select>

      </div>


      {/* ======================================
          SECTION TITLE
      ====================================== */}

      <div className="affiliate-payment-section-heading">

        <div>

          <h2>
            Affiliate Commissions
          </h2>

          <p>
            Commission records generated from
            affiliate subscription activity.
          </p>

        </div>

        <span>
          Showing{" "}
          {filteredPayments.length}
          {" "}of{" "}
          {payments.length}
          {" "}records
        </span>

      </div>


      {/* ======================================
          PAYMENT LIST
      ====================================== */}

      <div className="affiliate-payment-list">

        {loading ? (

          <div className="affiliate-payment-empty">
            Loading commission payments...
          </div>

        ) : filteredPayments.length === 0 ? (

          <div className="affiliate-payment-empty">
            No affiliate commission payments
            found.
          </div>

        ) : (

          filteredPayments.map(
            (payment) => {

              const affiliate =
                payment.affiliateId || {};

              const organization =
                payment.organizationId || {};

              return (

                <div
                  className="affiliate-payment-card"
                  key={payment._id}
                >

                  {/* LEFT */}

                  <div className="affiliate-payment-main">

                    <div className="affiliate-payment-icon">
                      $
                    </div>

                    <div>

                      <div className="affiliate-payment-title-row">

                        <h3>
                          {affiliate.fullName ||
                            payment.affiliateCode ||
                            "Affiliate"}
                        </h3>

                        <span className="affiliate-code">
                          {payment.affiliateCode}
                        </span>

                      </div>


                      <div className="affiliate-payment-meta">

                        <span>
                          {organization.name ||
                            "Organization"}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {organization.orgCode ||
                            "-"}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {formatDate(
                            payment.generatedAt ||
                            payment.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* MIDDLE */}

                  <div className="affiliate-payment-details">

                    <div>
                      <span>
                        PLAN
                      </span>

                      <strong>
                        {payment.planName ||
                          "-"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        TYPE
                      </span>

                      <strong>
                        {getCommissionTypeLabel(
                          payment.commissionType
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        COMMISSION
                      </span>

                      <strong>
                        {formatCurrency(
                          payment.commissionAmount,
                          payment.paymentCurrency
                        )}
                      </strong>

                      <small>
                        {payment.commissionRate}%
                      </small>
                    </div>

                  </div>


                  {/* RIGHT */}

                  <div className="affiliate-payment-actions">

                    <span
                      className={`affiliate-payment-status ${payment.status}`}
                    >
                      {payment.status}
                    </span>

                    <button
                      className="affiliate-view-btn"
                      onClick={() =>
                        setSelectedPayment(
                          payment
                        )
                      }
                    >
                      View Details
                    </button>

                  </div>

                </div>

              );

            }
          )

        )}

      </div>


      {/* ======================================
          DETAIL MODAL
      ====================================== */}

      {selectedPayment && (

        <div
          className="affiliate-payment-modal-overlay"
          onClick={() =>
            setSelectedPayment(null)
          }
        >

          <div
            className="affiliate-payment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="affiliate-modal-header">

              <div>

                <h2>
                  Commission Details
                </h2>

                <p>
                  {selectedPayment.affiliateCode}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedPayment(null)
                }
              >
                ×
              </button>

            </div>


            <div className="affiliate-modal-body">

              <div className="detail-section">

                <h3>
                  Affiliate
                </h3>

                <div className="detail-grid">

                  <div>
                    <span>
                      Name
                    </span>

                    <strong>
                      {selectedPayment
                        .affiliateId
                        ?.fullName || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {selectedPayment
                        .affiliateId
                        ?.email || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Affiliate Code
                    </span>

                    <strong>
                      {selectedPayment
                        .affiliateCode || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payout Method
                    </span>

                    <strong>
                      {selectedPayment
                        .payoutMethod ||
                        selectedPayment
                          .affiliateId
                          ?.payoutMethod ||
                        "-"}
                    </strong>
                  </div>

                </div>

              </div>


              <div className="detail-section">

                <h3>
                  Organization
                </h3>

                <div className="detail-grid">

                  <div>
                    <span>
                      Organization
                    </span>

                    <strong>
                      {selectedPayment
                        .organizationId
                        ?.name || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Organization Code
                    </span>

                    <strong>
                      {selectedPayment
                        .organizationId
                        ?.orgCode || "-"}
                    </strong>
                  </div>

                </div>

              </div>


              <div className="detail-section">

                <h3>
                  Subscription
                </h3>

                <div className="detail-grid">

                  <div>
                    <span>
                      Plan
                    </span>

                    <strong>
                      {selectedPayment
                        .planName || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Billing Cycle
                    </span>

                    <strong>
                      {selectedPayment
                        .billingCycle || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Commission Type
                    </span>

                    <strong>
                      {getCommissionTypeLabel(
                        selectedPayment
                          .commissionType
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Subscription ID
                    </span>

                    <strong className="break-text">
                      {selectedPayment
                        .subscriptionId || "-"}
                    </strong>
                  </div>

                </div>

              </div>


              <div className="detail-section">

                <h3>
                  Commission
                </h3>

                <div className="commission-summary">

                  <div>
                    <span>
                      Customer Payment
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedPayment
                          .paymentAmount,
                        selectedPayment
                          .paymentCurrency
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Commission Rate
                    </span>

                    <strong>
                      {selectedPayment
                        .commissionRate}%
                    </strong>
                  </div>

                  <div className="commission-total">

                    <span>
                      Commission Due
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedPayment
                          .commissionAmount,
                        selectedPayment
                          .paymentCurrency
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              <div className="detail-section">

                <h3>
                  Payment
                </h3>

                <div className="detail-grid">

                  <div>
                    <span>
                      Status
                    </span>

                    <strong>
                      {selectedPayment.status}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Transaction ID
                    </span>

                    <strong>
                      {selectedPayment
                        .transactionId || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Paid At
                    </span>

                    <strong>
                      {formatDate(
                        selectedPayment.paidAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Generated
                    </span>

                    <strong>
                      {formatDate(
                        selectedPayment
                          .generatedAt
                      )}
                    </strong>
                  </div>

                </div>

              </div>


              {selectedPayment.adminNotes && (

                <div className="detail-section">

                  <h3>
                    Admin Notes
                  </h3>

                  <p className="admin-note">
                    {selectedPayment.adminNotes}
                  </p>

                </div>

              )}

            </div>


            <div className="affiliate-modal-footer">

              <button
                className="affiliate-modal-close"
                onClick={() =>
                  setSelectedPayment(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AffiliateCommissionPayments;