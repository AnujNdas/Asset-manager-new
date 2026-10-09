import React, { useEffect, useState } from "react";
import BillingToggle from "../Components/subscription/BillingToggle";
import PlanCard from "../Components/subscription/PlanCard";
import Swal from "sweetalert2";

import {
  getTiers,
  previewPrice,
  createCheckout,
  verifyPayment,
  getMySubscription,
  cancelAutoPay,
  removePendingUpgrade
} from "../Services/Subscription";
import {
  FiGrid, 
  FiInbox ,
  FiClock,
  FiArrowRight,
  FiArrowLeft,
  FiX,
  FiCreditCard,
  FiInfo,
  FiTrendingUp,
  FiXCircle,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiFileText,
  FiLock,
  FiShield,
  FiLayers,
  FiActivity,
  FiRefreshCw,
  FiCalendar,
  FiBarChart2,
  FiPackage,
  FiUsers,
  FiCheckSquare,
  FiCheck,
} from "react-icons/fi";
import "../Page_styles/TestSubscriptionFile.css";
import Loader from "../Components/Loader";
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};
const Subscription = () => {

const [tiers, setTiers] = useState([]);
const [billing, setBilling] = useState("monthly");
const [isAffiliate, setIsAffiliate] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [upgradeMode, setUpgradeMode] = useState(false);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCheckoutPreview, setShowCheckoutPreview] = useState(false);
const [checkoutPreview, setCheckoutPreview] = useState(null);
  const PLAN_ORDER = ["base", "grow", "omni"];
const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const activeTier = subscription?.tier;
  const isActive =
  subscription?.status === "active" ||
  subscription?.status === "trialing";

  /* -------------------------
     CENTRAL SUBSCRIPTION LOADER
  ------------------------- */

const loadSubscription = async () => {
  console.log("Loading subscription...");

  const sub = await getMySubscription();

  console.log("Subscription result:", sub);

  setSubscription(sub);
  setSubscriptionLoaded(true);

  return sub;
};
  /* -------------------------
     INITIAL LOAD
  ------------------------- */

 useEffect(() => {

  const init = async () => {

    try {

      const tierRes = await getTiers();

      console.log("Pricing tiers:", tierRes);
      console.log("Affiliate user:", tierRes.isAffiliate);

      setTiers(tierRes.tiers);

      setIsAffiliate(Boolean(tierRes.isAffiliate));

      if (tierRes.isAffiliate) {
        setBilling("yearly");
      }

      const sub = await loadSubscription();

      if (!sub) {
        setSelectedTier(tierRes.tiers[0]?.key);
      }

    } catch (err) {

      console.error(err);

    }

  };

  init();

}, []);

  /* -------------------------
     PRICE PREVIEW
  ------------------------- */

  useEffect(() => {

    if (!selectedTier) return;

    previewPrice({
      tierId: selectedTier,
      billingCycle: billing
    });

  }, [selectedTier, billing]);

  /* -------------------------
     REOPEN PENDING CHECKOUT
  ------------------------- */

  const reopenPendingCheckout = async (pending) => {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        Swal.fire("Error", "Failed to load payment gateway.", "error");
        return;
      }
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      subscription_id: pending.razorpaySubscriptionId,
      name: "Socialfly AMS",
      description: `${selectedTier.toUpperCase()} Plan - ${
  billing === "yearly" && isAffiliate
    ? "Affiliate Annual"
    : billing === "yearly"
      ? "Annual"
      : "Monthly"
}`,

      handler: async function (response) {

        await verifyPayment(response);

        await loadSubscription();

        setUpgradeMode(false);

        Swal.fire("Success", "Subscription activated.", "success");

      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  };

  /* -------------------------
     HANDLE UPGRADE CLICK
  ------------------------- */
const handleUpgradeClick = async () => {
  try {

    if (!subscriptionLoaded) {
      console.log("Subscription not loaded yet");
      return;
    }

    const sub = subscription;

    /* -------------------------
       PENDING UPGRADE FOUND
    ------------------------- */

    if (sub?.pendingUpgrade && Object.keys(sub.pendingUpgrade).length > 0) {

      const pending = sub.pendingUpgrade;

      const pendingTier = tiers.find(
        (t) => t.key === pending.tier
      );

      const result = await Swal.fire({
        title: "Pending Upgrade Found",
        html: `
          <p>You already started upgrading to 
          <b>${pendingTier?.name || pending.tier}</b>.</p>
          <p>Continue or cancel it?</p>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Continue Upgrade",
        cancelButtonText: "Cancel Upgrade"
      });

      /* CONTINUE CHECKOUT */

      if (result.isConfirmed) {
        reopenPendingCheckout(pending);
        return;
      }

      /* CANCEL PENDING */

      if (result.dismiss === Swal.DismissReason.cancel) {

        await removePendingUpgrade();

        const refreshed = await loadSubscription();

        if (!refreshed?.pendingUpgrade) {
          setUpgradeMode(true);
          setSelectedTier(null);
        }

        return;
      }

      return;
    }

    /* -------------------------
       NO PENDING UPGRADE
    ------------------------- */

    setUpgradeMode(true);
    setSelectedTier(null);

  } catch (err) {
    console.error(err);
  }
};

const handleOpenCheckoutPreview = async () => {
  try {

    setLoading(true);

    const preview = await previewPrice({
      tierId: selectedTier,
      billingCycle: billing,
    });
    console.log("PREVIEW RESPONSE =>", preview);
    setCheckoutPreview(preview);

    setShowCheckoutPreview(true);

  } catch (err) {

    Swal.fire(
      "Error",
      err.userMessage || "Failed to load pricing preview",
      "error"
    );

  } finally {
    setLoading(false);
  }
};

  /* -------------------------
     CHECKOUT
  ------------------------- */

const handleCheckout = async () => {
  try {
    setLoading(true);
    setError(null);

    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Failed to load Razorpay SDK");
    }

    const checkoutRes = await createCheckout({
      tierKey: selectedTier,
      billingCycle: billing,
    });

    const { subscriptionId, razorpayKey } = checkoutRes;

    if (!subscriptionId || !razorpayKey) {
      throw new Error("Invalid Razorpay checkout response");
    }

    const options = {
      key: razorpayKey,
      subscription_id: subscriptionId,

      name: "AssetPegasus",
      description: `${selectedTier.toUpperCase()} Plan`,

      prefill: {
        name: user?.fullName || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },

      theme: {
        color: "#2563eb",
      },

      handler: async function (response) {
        try {
          setLoading(true);

          console.log("Razorpay payment response:", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            hasSignature: Boolean(response.razorpay_signature),
          });

          await verifyPayment(response);

          await loadSubscription();

          setUpgradeMode(false);

          Swal.fire(
            "Payment Received",
            "Your payment was verified. Subscription activation may take a few moments.",
            "success"
          );
        } catch (error) {
          console.error("Payment verification failed:", error);

          setError(
            error?.userMessage ||
              error?.response?.data?.message ||
              "Payment verification failed"
          );
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: async () => {
          try {
            setLoading(false);

            await removePendingUpgrade();
            await loadSubscription();
          } catch (error) {
            console.error("Error while dismissing Razorpay checkout:", error);
          }
        },
      },
    };

    console.log("Opening Razorpay checkout:", {
      keyLoaded: Boolean(options.key),
      subscriptionId: options.subscription_id,
      tier: selectedTier,
      billingCycle: billing,
    });

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);

      setError(
        response?.error?.description ||
          "Payment failed. Please try another payment method."
      );
    });

    rzp.open();
  } catch (err) {
    console.error("Checkout failed:", err);

    setError(
      err?.userMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "Checkout failed"
    );
  } finally {
    setLoading(false);
  }
};

  /* -------------------------
     CANCEL AUTOPAY
  ------------------------- */

  const handleCancelAutoPay = async () => {

    if (!window.confirm("Cancel auto-renewal?")) return;

    try {

      setLoading(true);

      await cancelAutoPay();

      await loadSubscription();

      Swal.fire("Cancelled", "AutoPay cancelled.", "success");

    } catch {

      Swal.fire("Error", "Failed to cancel AutoPay.", "error");

    } finally {

      setLoading(false);

    }

  };

  /* -------------------------
     CURRENT PLAN SECTION
  ------------------------- */

  const CurrentPlanSection = () => {

    if (!subscription) return null;

    const currentPlan = tiers.find((t) => t.key === activeTier);

    return (

<div className="current-plan-insights">

  {/* =====================================================
      CURRENT PLAN OVERVIEW
  ===================================================== */}

  <div className="current-plan-banner">

    <div className="current-plan-overview-header">

      <div className="current-plan-overview-title">

        <span className="current-plan-overview-icon">
          <FiCreditCard />
        </span>

        <div>
          <h3>Subscription Overview</h3>
          <p>Your current plan and billing information</p>
        </div>

      </div>

      <span className="current-plan-overview-badge">
        <FiShield />
        Plan Details
      </span>

    </div>


    <div className="banner-grid">

      {/* CURRENT PLAN */}

      <div className="current-plan-info-card">

        <div className="current-plan-info-top">

          <span className="current-plan-info-icon">
            <FiLayers />
          </span>

          <span className="label">
            Current Plan
          </span>

        </div>

        <span className="value current-plan-name">
          {currentPlan?.name || activeTier?.toUpperCase() || "-"}
        </span>

        <span className="current-plan-info-description">
          Your subscribed plan
        </span>

      </div>


      {/* SUBSCRIPTION STATUS */}

      <div className="current-plan-info-card">

        <div className="current-plan-info-top">

          <span className="current-plan-info-icon">
            <FiActivity />
          </span>

          <span className="label">
            Subscription Status
          </span>

        </div>

        <span
          className={`value current-plan-status status-${
            subscription.status
          }`}
        >
          <span className="current-plan-status-dot" />

          {subscription.status
            ? subscription.status.charAt(0).toUpperCase() +
              subscription.status.slice(1).replace(/_/g, " ")
            : "Unknown"}
        </span>

        <span className="current-plan-info-description">
          Current account status
        </span>

      </div>


      {/* BILLING CYCLE */}

      <div className="current-plan-info-card">

        <div className="current-plan-info-top">

          <span className="current-plan-info-icon">
            <FiRefreshCw />
          </span>

          <span className="label">
            Billing Cycle
          </span>

        </div>

        <span className="value current-plan-billing">
          {subscription.billingCycle || billing || "-"}
        </span>

        <span className="current-plan-info-description">
          Renewal frequency
        </span>

      </div>


      {/* DAYS REMAINING */}

      <div className="current-plan-info-card">

        <div className="current-plan-info-top">

          <span className="current-plan-info-icon">
            <FiCalendar />
          </span>

          <span className="label">
            Days Remaining
          </span>

        </div>

        <span className="value current-plan-days">

          {subscription.status === "active" ||
          subscription.status === "trialing"
            ? `${subscription.daysRemaining ?? "-"} days`
            : "Expired"}

        </span>

        <span className="current-plan-info-description">
          Current subscription period
        </span>

      </div>

    </div>

  </div>


  {/* =====================================================
      USAGE LIMITS
  ===================================================== */}

  <div className="plan-usage-section">

    <div className="current-plan-section-header">

      <div className="current-plan-section-heading">

        <span className="current-plan-section-icon">
          <FiBarChart2 />
        </span>

        <div>
          <h3 className="section-title">
            Usage Limits
          </h3>

          <p>
            Monitor resource consumption against your plan limits.
          </p>
        </div>

      </div>

      <span className="current-plan-section-count">
        2 Resources
      </span>

    </div>


    <div className="usage-grid">

      {/* ================= TOTAL ASSETS ================= */}

      <div className="usage-card">

        <div className="usage-card-header">

          <div className="usage-card-heading">

            <span className="usage-card-icon">
              <FiPackage />
            </span>

            <div>
              <span className="usage-label">
                Total Assets
              </span>

              <small className="usage-description">
                Hardware and software combined
              </small>
            </div>

          </div>

        </div>


        <div className="usage-card-value-row">

          <span className="usage-value">

            {Number(
              subscription.usage?.assets ?? 0
            ).toLocaleString()}

            <span className="usage-value-divider"> / </span>

            <span className="usage-limit">
              {subscription.limits?.totalAssets != null
                ? Number(
                    subscription.limits.totalAssets
                  ).toLocaleString()
                : "∞"}
            </span>

          </span>


          <span className="usage-percentage">

            {subscription.limits?.totalAssets
              ? `${Math.round(
                  ((subscription.usage?.assets ?? 0) /
                    subscription.limits.totalAssets) *
                    100
                )}%`
              : "Unlimited"}

          </span>

        </div>


        <div
          className="usage-bar"
          role="progressbar"
          aria-label="Total assets usage"
          aria-valuemin={0}
          aria-valuemax={
            subscription.limits?.totalAssets || 100
          }
          aria-valuenow={
            subscription.limits?.totalAssets
              ? Math.min(
                  subscription.usage?.assets ?? 0,
                  subscription.limits.totalAssets
                )
              : 0
          }
        >

          <div
            className="usage-progress"
            style={{
              width: `${
                subscription.limits?.totalAssets
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        ((subscription.usage?.assets ?? 0) /
                          subscription.limits.totalAssets) *
                          100
                      )
                    )
                  : 0
              }%`,
            }}
          />

        </div>


        <div className="usage-card-footer">

          <span>
            <FiInfo />
            Asset capacity
          </span>

          <span>
            {subscription.limits?.totalAssets != null
              ? `${Math.max(
                  0,
                  subscription.limits.totalAssets -
                    (subscription.usage?.assets ?? 0)
                ).toLocaleString()} remaining`
              : "No limit"}
          </span>

        </div>

      </div>


      {/* ================= ADMIN USERS ================= */}

      <div className="usage-card">

        <div className="usage-card-header">

          <div className="usage-card-heading">

            <span className="usage-card-icon">
              <FiUsers />
            </span>

            <div>
              <span className="usage-label">
                Admin Users
              </span>

              <small className="usage-description">
                Organization administrators
              </small>
            </div>

          </div>

        </div>


        <div className="usage-card-value-row">

          <span className="usage-value">

            {Number(
              subscription.usage?.admins ?? 0
            ).toLocaleString()}

            <span className="usage-value-divider"> / </span>

            <span className="usage-limit">
              {subscription.limits?.admins != null
                ? Number(
                    subscription.limits.admins
                  ).toLocaleString()
                : "∞"}
            </span>

          </span>


          <span className="usage-percentage">

            {subscription.limits?.admins
              ? `${Math.round(
                  ((subscription.usage?.admins ?? 0) /
                    subscription.limits.admins) *
                    100
                )}%`
              : "Unlimited"}

          </span>

        </div>


        <div
          className="usage-bar"
          role="progressbar"
          aria-label="Admin users usage"
          aria-valuemin={0}
          aria-valuemax={
            subscription.limits?.admins || 100
          }
          aria-valuenow={
            subscription.limits?.admins
              ? Math.min(
                  subscription.usage?.admins ?? 0,
                  subscription.limits.admins
                )
              : 0
          }
        >

          <div
            className="usage-progress"
            style={{
              width: `${
                subscription.limits?.admins
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        ((subscription.usage?.admins ?? 0) /
                          subscription.limits.admins) *
                          100
                      )
                    )
                  : 0
              }%`,
            }}
          />

        </div>


        <div className="usage-card-footer">

          <span>
            <FiInfo />
            Admin capacity
          </span>

          <span>
            {subscription.limits?.admins != null
              ? `${Math.max(
                  0,
                  subscription.limits.admins -
                    (subscription.usage?.admins ?? 0)
                ).toLocaleString()} remaining`
              : "No limit"}
          </span>

        </div>

      </div>

    </div>

  </div>


  {/* =====================================================
      INCLUDED FEATURES
  ===================================================== */}

  {currentPlan?.features && (

    <div className="plan-features-section">

      <div className="current-plan-section-header">

        <div className="current-plan-section-heading">

          <span className="current-plan-section-icon">
            <FiCheckSquare />
          </span>

          <div>
            <h3 className="section-title">
              Included Features
            </h3>

            <p>
              Features available with your current subscription.
            </p>
          </div>

        </div>


        <span className="current-plan-section-count">
          {currentPlan.features.length} Features
        </span>

      </div>


      <div className="feature-grid">

        {currentPlan.features.map((feature, i) => (

          <div
            key={i}
            className="feature-pill"
          >

            <span className="feature-check-icon">
              <FiCheck />
            </span>

            <span>{feature}</span>

          </div>

        ))}

      </div>

    </div>

  )}

</div>

);

  };
const getRecommendedTier = () => {
  if (!activeTier) return null;

  const currentIndex = PLAN_ORDER.indexOf(activeTier);

  if (currentIndex === -1) return null;

  return PLAN_ORDER[currentIndex + 1] || null;
};

const recommendedTier = getRecommendedTier();
  /* -------------------------
     PLAN LIST
  ------------------------- */

  const PlanSelectionSection = () => {

    const visiblePlans = tiers.filter(
      (tier) => tier.key !== activeTier
    );

    return (


<div className="subscription-plans-container">

  {/* ================= PLAN SECTION HEADER ================= */}

  <div className="subscription-plans-header">

    <div className="subscription-plans-heading">

      <span className="subscription-plans-icon">
        <FiGrid />
      </span>

      <div>
        <h3>Available Plans</h3>
        <p>
          Compare subscription plans and choose the
          right option for your organization.
        </p>
      </div>

    </div>

    <span className="subscription-plans-count">
      {visiblePlans.length} Plans Available
    </span>

  </div>


  {/* ================= PLAN GRID ================= */}

  <div className="plans-grid">

    {visiblePlans.map((tier) => (

      <div
        key={tier.key}
        className={`subscription-plan-grid-item ${
          tier.key === selectedTier
            ? "subscription-plan-grid-item-selected"
            : ""
        }`}
      >

        <PlanCard
          tier={tier}
          billing={billing}
          selected={tier.key === selectedTier}
          isActive={false}
          isAdmin={isAdmin}
          isRecommended={tier.key === recommendedTier}
          onSelect={() => setSelectedTier(tier.key)}
        />

      </div>

    ))}

  </div>


  {/* ================= EMPTY STATE ================= */}

  {visiblePlans.length === 0 && (

    <div className="subscription-plans-empty">
      <FiInbox />
      <h4>No Plans Available</h4>
      <p>
        There are currently no subscription plans
        available for selection.
      </p>
    </div>

  )}

</div>


    );

  };
  const hasPendingUpgrade =
  subscription?.pendingUpgrade &&
  Object.keys(subscription.pendingUpgrade).length > 0;
  /* -------------------------
     RENDER
  ------------------------- */
    // 🔎 DEBUG LOGS
  console.log("RENDER STATE");
  console.log("subscriptionLoaded:", subscriptionLoaded);
  console.log("subscription:", subscription);
  console.log("pendingUpgrade:", subscription?.pendingUpgrade);
  console.log("upgradeMode:", upgradeMode);
  if (!subscriptionLoaded) {
  return <Loader/>;
}

return (

<div className="subscription-page">

  {/* =====================================================
      PAGE HEADER
  ===================================================== */}

  <div className="subscription-page-header">

    <div className="subscription-page-heading">

      <span className="subscription-eyebrow">
        ACCOUNT MANAGEMENT
      </span>

      <h2>Subscription & Billing</h2>

      <p>
        {isActive
          ? "Manage your current subscription, billing and usage."
          : "Choose the subscription plan that fits your business."}
      </p>

    </div>

    <div className="subscription-header-status">

      <span
        className={`subscription-status-pill ${
          isActive ? "is-active" : "is-inactive"
        }`}
      >
        <span className="subscription-status-dot" />

        {isActive ? "Active Subscription" : "Plan Selection"}
      </span>

    </div>

  </div>


  {/* =====================================================
      STATE 1 — PENDING UPGRADE
  ===================================================== */}

  {hasPendingUpgrade && (

    <div className="pending-upgrade-banner">

      <div className="subscription-pending-content">

        <div className="subscription-pending-icon">
          <FiClock />
        </div>

        <div className="subscription-pending-text">

          <span className="subscription-section-eyebrow">
            ACTION REQUIRED
          </span>

          <h3>Pending Plan Upgrade</h3>

          <p>
            Your upgrade to{" "}
            <strong>
              {subscription.pendingUpgrade.tier.toUpperCase()}
            </strong>{" "}
            is waiting for checkout completion.
          </p>

        </div>

      </div>


      <div className="pending-actions">

        <button
          type="button"
          className="btn small subscription-pending-continue"
          onClick={() =>
            reopenPendingCheckout(subscription.pendingUpgrade)
          }
        >
          <FiArrowRight />
          Continue
        </button>


        <button
          type="button"
          className="btn small danger subscription-pending-remove"
          onClick={async () => {

            await removePendingUpgrade();

            const refreshed = await loadSubscription();

            if (!refreshed?.pendingUpgrade) {
              setUpgradeMode(true);
              setSelectedTier(null);
            }

          }}
        >
          <FiX />
          Remove
        </button>

      </div>

    </div>

  )}


  {/* =====================================================
      STATE 2 — CURRENT ACTIVE PLAN
  ===================================================== */}

  {isActive && !upgradeMode && (

    <section className="subscription-current-section">

      <div className="subscription-section-header">

        <div className="subscription-section-heading">

          <span className="subscription-section-icon">
            <FiCreditCard />
          </span>

          <div>
            <h3>Current Subscription</h3>

            <p>
              Your active plan, usage and billing details.
            </p>
          </div>

        </div>

        <span className="subscription-section-tag">
          CURRENT PLAN
        </span>

      </div>


      <div className="subscription-current-content">
        <CurrentPlanSection />
      </div>


      <div className="current-plan-actions">

        <div className="subscription-action-description">
          <FiInfo />
          <span>
            Manage your plan or update automatic renewal.
          </span>
        </div>


        <div className="subscription-action-buttons">

          <button
            type="button"
            className="btn upgrade-btn"
            onClick={handleUpgradeClick}
          >
            <FiTrendingUp />
            Upgrade Plan
          </button>


          {!subscription.cancelAtPeriodEnd && (

            <button
              type="button"
              className="btn btn-danger cancel-autopay"
              onClick={handleCancelAutoPay}
            >
              <FiXCircle />
              Cancel AutoPay
            </button>

          )}

        </div>

      </div>

    </section>

  )}


  {/* =====================================================
      STATE 3 — UPGRADE MODE
  ===================================================== */}

  {!hasPendingUpgrade && upgradeMode && (

    <section className="subscription-selection-section">

      <div className="subscription-selection-header">

        <div className="subscription-selection-heading">

          <span className="subscription-section-eyebrow">
            SUBSCRIPTION PLANS
          </span>

          <h3>Upgrade Your Plan</h3>

          <p>
            Compare available plans and select your preferred
            subscription.
          </p>

        </div>


        <button
          type="button"
          className="btn secondary subscription-back-btn"
          onClick={() => {
            setUpgradeMode(false);
            setSelectedTier(null);
          }}
        >
          <FiArrowLeft />
          Back to Current Plan
        </button>

      </div>


      {!isAffiliate && (

        <div className="subscription-billing-container">

          <div className="subscription-billing-heading">

            <FiCalendar />

            <span>Billing Frequency</span>

          </div>

          <BillingToggle
            billing={billing}
            setBilling={setBilling}
          />

        </div>

      )}


      <div className="subscription-plan-selection">
        <PlanSelectionSection />
      </div>


      {selectedTier && (

        <div className="subscription-checkout-footer">

          <div className="subscription-selected-plan">

            <span className="subscription-selected-icon">
              <FiCheckCircle />
            </span>

            <div>
              <span>Selected Plan</span>

              <strong>
                {selectedTier.toUpperCase()}
              </strong>
            </div>

          </div>


          <button
            type="button"
            className="btn primary proceed"
            onClick={handleOpenCheckoutPreview}
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="subscription-loading-icon" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Checkout
                <FiArrowRight />
              </>
            )}
          </button>

        </div>

      )}

    </section>

  )}


  {/* =====================================================
      STATE 4 — NO ACTIVE SUBSCRIPTION
  ===================================================== */}

  {!hasPendingUpgrade && !isActive && !upgradeMode && (

    <section className="subscription-selection-section">

      <div className="subscription-selection-header">

        <div className="subscription-selection-heading">

          <span className="subscription-section-eyebrow">
            AVAILABLE SUBSCRIPTIONS
          </span>

          <h3>Choose Your Plan</h3>

          <p>
            Select the right plan for your organization's
            asset management requirements.
          </p>

        </div>

      </div>


      {!isAffiliate && (

        <div className="subscription-billing-container">

          <div className="subscription-billing-heading">
            <FiCalendar />
            <span>Billing Frequency</span>
          </div>

          <BillingToggle
            billing={billing}
            setBilling={setBilling}
          />

        </div>

      )}


      <div className="subscription-plan-selection">
        <PlanSelectionSection />
      </div>


      {selectedTier && (

        <div className="subscription-checkout-footer">

          <div className="subscription-selected-plan">

            <span className="subscription-selected-icon">
              <FiCheckCircle />
            </span>

            <div>
              <span>Selected Plan</span>

              <strong>
                {selectedTier.toUpperCase()}
              </strong>
            </div>

          </div>


          <button
            type="button"
            className="btn primary proceed"
            onClick={handleOpenCheckoutPreview}
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="subscription-loading-icon" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Checkout
                <FiArrowRight />
              </>
            )}
          </button>

        </div>

      )}

    </section>

  )}


  {/* =====================================================
      ERROR MESSAGE
  ===================================================== */}

  {error && (

    <div className="subscription-error">

      <FiAlertCircle />

      <p className="error">
        {error}
      </p>

    </div>

  )}


  {/* =====================================================
      CHECKOUT PREVIEW MODAL
  ===================================================== */}

  {showCheckoutPreview && checkoutPreview && (() => {

    const today = new Date();

    const expiryDate = new Date(today);

    if (billing === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    const formatDate = (date) =>
      date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    const baseAmount =
      checkoutPreview?.pricing?.amount ?? 0;

    const totalAmount =
      checkoutPreview?.pricing?.amount ?? 0;

    const currency =
      checkoutPreview?.pricing?.currency ?? "USD";

    return (

      <div className="checkout-preview-overlay">

        <div
          className="checkout-preview-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-preview-title"
        >

          {/* ================= MODAL HEADER ================= */}

          <div className="checkout-preview-header">

            <div className="checkout-preview-header-info">

              <span className="checkout-preview-icon">
                <FiCreditCard />
              </span>

              <div>

                <span className="subscription-section-eyebrow">
                  CHECKOUT SUMMARY
                </span>

                <h3 id="checkout-preview-title">
                  Review Subscription
                </h3>

                <p>
                  Verify your plan details before payment.
                </p>

              </div>

            </div>


            <button
              type="button"
              className="close-btn"
              onClick={() => setShowCheckoutPreview(false)}
              aria-label="Close checkout preview"
            >
              <FiX />
            </button>

          </div>


          {/* ================= MODAL BODY ================= */}

          <div className="checkout-preview-body">

            {/* PLAN CARD */}

            <div className="checkout-plan-card">

              <div className="checkout-plan-info">

                <span>SELECTED SUBSCRIPTION</span>

                <h2>
                  {selectedTier?.toUpperCase() || "-"} Plan
                </h2>

                <p>
                  Subscription billing and plan activation
                </p>

              </div>


              <span className="billing-cycle">
                <FiCalendar />
                {billing === "yearly" ? "Yearly" : "Monthly"}
              </span>

            </div>


            {/* ================= DATES ================= */}

            <div className="checkout-section-title">

              <FiCalendar />

              <h4>Subscription Period</h4>

            </div>


            <div className="checkout-dates">

              <div className="date-box">

                <span className="label">
                  Starts On
                </span>

                <span className="value">
                  {formatDate(today)}
                </span>

              </div>


              <span className="checkout-date-arrow">
                <FiArrowRight />
              </span>


              <div className="date-box">

                <span className="label">
                  Expires On
                </span>

                <span className="value">
                  {formatDate(expiryDate)}
                </span>

              </div>

            </div>


            {/* ================= PRICE BREAKDOWN ================= */}

            <div className="checkout-section-title">

              <FiFileText />

              <h4>Payment Breakdown</h4>

            </div>


            <div className="checkout-breakdown">

              <div className="breakdown-row">

                <span>Plan Price</span>

                <strong>
                  {currency}{" "}
                  {Number(baseAmount).toLocaleString()}
                </strong>

              </div>


              <div className="breakdown-row">

                <span>Billing Cycle</span>

                <strong>
                  {billing === "yearly"
                    ? "1 Year"
                    : "1 Month"}
                </strong>

              </div>


              <div className="breakdown-row total">

                <span>Total Payable</span>

                <strong>
                  {currency}{" "}
                  {Number(totalAmount).toLocaleString()}
                </strong>

              </div>

            </div>


            {/* ================= INFO ================= */}

            <div className="checkout-info">

              <FiInfo className="checkout-info-icon" />

              <div>

                <p>
                  Your subscription will renew automatically
                  every <strong>{billing}</strong>.
                </p>

                <p>
                  You can cancel auto-renewal anytime from
                  your subscription settings.
                </p>

              </div>

            </div>

          </div>


          {/* ================= MODAL FOOTER ================= */}

          <div className="checkout-actions">

            <button
              type="button"
              className="btn secondary"
              onClick={() => setShowCheckoutPreview(false)}
            >
              Cancel
            </button>


            <button
              type="button"
              className="btn primary"
              disabled={loading}
              onClick={async () => {

                setShowCheckoutPreview(false);

                await handleCheckout();

              }}
            >
              <FiLock />

              {loading ? "Processing..." : "Confirm & Pay"}

            </button>

          </div>

        </div>

      </div>

    );

  })()}

</div>

);

};

export default Subscription;