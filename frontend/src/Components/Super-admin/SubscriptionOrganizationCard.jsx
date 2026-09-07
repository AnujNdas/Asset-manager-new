import React from "react";
import {
  Building2,
  CalendarDays,
  CreditCard,
  Clock3,
  ExternalLink,
  Users,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return <CheckCircle2 size={16} />;

    case "trialing":
      return <Clock3 size={16} />;

    case "paused":
      return <PauseCircle size={16} />;

    case "cancelled":
    case "expired":
      return <XCircle size={16} />;

    case "past_due":
      return <AlertCircle size={16} />;

    default:
      return <Clock3 size={16} />;
  }
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getPlanLabel = (tier) => {
  if (!tier) return "—";

  return tier.charAt(0).toUpperCase() + tier.slice(1);
};

const getBillingLabel = (billingCycle) => {
  if (!billingCycle) return "—";

  return billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1);
};

const calculateDaysRemaining = (currentEnd) => {
  if (!currentEnd) return null;

  const end = new Date(currentEnd);
  const now = new Date();

  const difference = end.getTime() - now.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

const SubscriptionOrganizationCard = ({
  data,
  onViewHistory,
}) => {
  const {
    subscription,
    organization,
    referral,
    affiliate,
  } = data || {};

  if (!organization) {
    return null;
  }

  const status = subscription?.status || "unknown";

  const daysRemaining = calculateDaysRemaining(
    subscription?.currentEnd
  );

  const currency =
    subscription?.currency ||
    organization?.currency ||
    "USD";

  return (
    <div className="subscription-organization-card">

      {/* =====================================================
          ORGANIZATION HEADER
      ===================================================== */}

      <div className="subscription-card-header">

        <div className="subscription-organization-info">

          <div className="subscription-organization-icon">
            <Building2 size={20} />
          </div>

          <div>
            <div className="subscription-organization-name-row">

              <h3>
                {organization.name || "Unnamed Organization"}
              </h3>

              <span className="subscription-org-code">
                {organization.orgCode || "—"}
              </span>

            </div>

            <div className="subscription-organization-meta">

              {organization.organizationType && (
                <span>
                  {organization.organizationType}
                </span>
              )}

              {organization.city && (
                <span>
                  {organization.city}
                </span>
              )}

              {organization.country && (
                <span>
                  {organization.country}
                </span>
              )}

              <span>
                {currency}
              </span>

              <span
                className={`organization-status organization-status-${organization.status}`}
              >
                {organization.status || "unknown"}
              </span>

            </div>
          </div>

        </div>

        <button
          type="button"
          className="subscription-history-btn"
          onClick={() => onViewHistory?.(data)}
        >
          <Clock3 size={15} />

          View History
        </button>

      </div>


      {/* =====================================================
          CURRENT SUBSCRIPTION
      ===================================================== */}

      <div className="subscription-card-section">

        <div className="subscription-section-title">
          <CreditCard size={16} />

          <span>
            Current Subscription
          </span>
        </div>


        <div className="subscription-main-grid">

          {/* PLAN */}

          <div className="subscription-main-item">

            <span className="subscription-item-label">
              Plan
            </span>

            <strong className="subscription-plan-name">
              {getPlanLabel(subscription?.tier)}
            </strong>

          </div>


          {/* STATUS */}

          <div className="subscription-main-item">

            <span className="subscription-item-label">
              Status
            </span>

            <span
              className={`subscription-status-badge subscription-status-${status}`}
            >
              {getStatusIcon(status)}

              {getStatusLabel(status)}
            </span>

          </div>


          {/* BILLING */}

          <div className="subscription-main-item">

            <span className="subscription-item-label">
              Billing Cycle
            </span>

            <strong>
              {getBillingLabel(subscription?.billingCycle)}
            </strong>

          </div>


          {/* PERIOD */}

          <div className="subscription-main-item subscription-period-item">

            <span className="subscription-item-label">
              Current Period
            </span>

            <strong>
              {formatDate(subscription?.currentStart)}
            </strong>

            <span className="subscription-period-arrow">
              →
            </span>

            <strong>
              {formatDate(subscription?.currentEnd)}
            </strong>

            {daysRemaining !== null && (
              <small
                className={
                  daysRemaining < 0
                    ? "subscription-expired-text"
                    : "subscription-days-text"
                }
              >
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days remaining`}
              </small>
            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          PAYMENT INFORMATION
      ===================================================== */}

      <div className="subscription-card-section">

        <div className="subscription-section-title">
          <CreditCard size={16} />

          <span>
            Payment Information
          </span>
        </div>


        <div className="subscription-info-grid">

          <div className="subscription-info-item">
            <span>Plan Price</span>

            <strong>
              {formatCurrency(
                subscription?.planPrice,
                currency
              )}
            </strong>
          </div>


          <div className="subscription-info-item">
            <span>Last Payment</span>

            <strong>
              {formatCurrency(
                subscription?.lastPaymentAmount,
                currency
              )}
            </strong>
          </div>


          <div className="subscription-info-item">
            <span>Total Paid</span>

            <strong>
              {formatCurrency(
                subscription?.totalPaid,
                currency
              )}
            </strong>
          </div>


          <div className="subscription-info-item">
            <span>Last Payment Date</span>

            <strong>
              {formatDate(
                subscription?.lastPaymentDate
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          SUBSCRIPTION HEALTH / LIFECYCLE
      ===================================================== */}

      <div className="subscription-health-row">

        <div className="subscription-health-item">

          <span>
            Cancel at Period End
          </span>

          <strong
            className={
              subscription?.cancelAtPeriodEnd
                ? "subscription-warning-value"
                : "subscription-good-value"
            }
          >
            {subscription?.cancelAtPeriodEnd
              ? "Yes"
              : "No"}
          </strong>

        </div>


        <div className="subscription-health-item">

          <span>
            Past Due
          </span>

          <strong
            className={
              subscription?.pastDueAt
                ? "subscription-warning-value"
                : "subscription-good-value"
            }
          >
            {subscription?.pastDueAt
              ? formatDate(subscription.pastDueAt)
              : "No"}
          </strong>

        </div>


        <div className="subscription-health-item">

          <span>
            Created
          </span>

          <strong>
            {formatDate(subscription?.createdAt)}
          </strong>

        </div>


        <div className="subscription-health-item">

          <span>
            Last Updated
          </span>

          <strong>
            {formatDate(subscription?.updatedAt)}
          </strong>

        </div>

      </div>


      {/* =====================================================
          TECHNICAL DETAILS
      ===================================================== */}

      <details className="subscription-technical-details">

        <summary>
          Subscription Technical Details
        </summary>

        <div className="subscription-technical-grid">

          <div>
            <span>Subscription ID</span>

            <strong>
              {subscription?._id || "—"}
            </strong>
          </div>


          <div>
            <span>Razorpay Subscription ID</span>

            <strong>
              {subscription?.razorpaySubscriptionId || "—"}
            </strong>
          </div>


          <div>
            <span>Razorpay Plan ID</span>

            <strong>
              {subscription?.razorpayPlanId || "—"}
            </strong>
          </div>


          <div>
            <span>Organization ID</span>

            <strong>
              {organization?._id || "—"}
            </strong>
          </div>


          <div>
            <span>Subscription Created</span>

            <strong>
              {formatDateTime(subscription?.createdAt)}
            </strong>
          </div>


          <div>
            <span>Subscription Updated</span>

            <strong>
              {formatDateTime(subscription?.updatedAt)}
            </strong>
          </div>

        </div>

      </details>


      {/* =====================================================
          AFFILIATE / REFERRAL
      ===================================================== */}

      {(affiliate || referral) && (

        <div className="subscription-affiliate-section">

          <div className="subscription-section-title">
            <Users size={16} />

            <span>
              Affiliate Referral
            </span>
          </div>


          <div className="subscription-affiliate-content">

            <div>
              <span>
                Affiliate
              </span>

              <strong>
                {affiliate?.fullName || "—"}
              </strong>
            </div>


            <div>
              <span>
                Affiliate Code
              </span>

              <strong>
                {affiliate?.affiliateCode ||
                  referral?.affiliateCode ||
                  "—"}
              </strong>
            </div>


            <div>
              <span>
                Referral Status
              </span>

              <strong>
                {referral?.status
                  ? getStatusLabel(referral.status)
                  : "—"}
              </strong>
            </div>


            <div>
              <span>
                Commission
              </span>

              <strong>
                {referral?.commissionAmount !== undefined
                  ? formatCurrency(
                      referral.commissionAmount,
                      referral.paymentCurrency || currency
                    )
                  : "—"}
              </strong>
            </div>


            <div>
              <span>
                Commission Rate
              </span>

              <strong>
                {referral?.commissionRate !== undefined
                  ? `${referral.commissionRate}%`
                  : "—"}
              </strong>
            </div>


            <div>
              <span>
                Commission Status
              </span>

              <strong>
                {referral?.commissionStatus
                  ? getStatusLabel(
                      referral.commissionStatus
                    )
                  : "—"}
              </strong>
            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default SubscriptionOrganizationCard;