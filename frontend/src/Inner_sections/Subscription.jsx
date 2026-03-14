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

import "../Page_styles/Subscription.css";
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
  const [selectedTier, setSelectedTier] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [upgradeMode, setUpgradeMode] = useState(false);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const PLAN_ORDER = ["base", "grow", "omni"];
const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  const activeTier = subscription?.tier;
  const isActive = subscription?.status === "active";

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
        setTiers(tierRes.tiers);

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
      description: `${pending.tier.toUpperCase()} Plan`,

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
        billingCycle: billing
      });

      const { subscriptionId, razorpayKey } = checkoutRes;

      const options = {

        key: razorpayKey,
        subscription_id: subscriptionId,
        name: "Socialfly AMS",
        description: `${selectedTier.toUpperCase()} Plan`,

        handler: async function (response) {

          await verifyPayment(response);

          await loadSubscription();

          setUpgradeMode(false);

          Swal.fire("Success", "Subscription activated.", "success");

        },

       modal: {
  ondismiss: async () => {
    setLoading(false);
    await removePendingUpgrade();
    await loadSubscription();
  }
}

      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {

      setError(err.userMessage || "Checkout failed");

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

  {/* Usage Limits */}
  <div className="plan-usage-section">

    <h3 className="section-title">Usage Limits</h3>

    <div className="usage-grid">

      <div className="usage-card">
        <span className="usage-label">Hardware Assets</span>
        <span className="usage-value">
          {subscription.usage?.hardwareAssets || 0} / {subscription.limits?.hardwareAssets || "∞"}
        </span>

        <div className="usage-bar">
          <div
            className="usage-progress"
            style={{
              width: `${
                subscription.limits?.hardwareAssets
                  ? (subscription.usage?.hardwareAssets / subscription.limits.hardwareAssets) * 100
                  : 0
              }%`
            }}
          />
        </div>
      </div>

      <div className="usage-card">
        <span className="usage-label">Software Assets</span>
        <span className="usage-value">
          {subscription.usage?.softwareAssets || 0} / {subscription.limits?.softwareAssets || "∞"}
        </span>

        <div className="usage-bar">
          <div
            className="usage-progress"
            style={{
              width: `${
                subscription.limits?.softwareAssets
                  ? (subscription.usage?.softwareAssets / subscription.limits.softwareAssets) * 100
                  : 0
              }%`
            }}
          />
        </div>
      </div>

      <div className="usage-card">
        <span className="usage-label">Admin Users</span>
        <span className="usage-value">
          {subscription.usage?.admins || 0} / {subscription.limits?.admins || "∞"}
        </span>

        <div className="usage-bar">
          <div
            className="usage-progress"
            style={{
              width: `${
                subscription.limits?.admins
                  ? (subscription.usage?.admins / subscription.limits.admins) * 100
                  : 0
              }%`
            }}
          />
        </div>
      </div>

    </div>

  </div>


  {/* Feature List */}
  {currentPlan?.features && (
    <div className="plan-features-section">

      <h3 className="section-title">Included Features</h3>

      <div className="feature-grid">
        {currentPlan.features.map((feature, i) => (
          <div key={i} className="feature-pill">
            ✓ {feature}
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

      <div className="plans-grid">

        {visiblePlans.map((tier) => (

          <PlanCard
            key={tier.key}
            tier={tier}
            billing={billing}
            selected={tier.key === selectedTier}
            isActive={false}
            isAdmin={isAdmin}
            isRecommended={tier.key === recommendedTier}
            onSelect={() => setSelectedTier(tier.key)}
          />

        ))}

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

    <h2>Subscription & Billing</h2>
    <p>
      {isActive
        ? "Manage your current subscription and usage"
        : "Choose the plan that fits your business"}
    </p>

    {/* -------------------------
       STATE 1: Pending Upgrade
    ------------------------- */}

    {hasPendingUpgrade && (
      <div className="pending-upgrade-banner">

        Pending upgrade to{" "}
        <strong>{subscription.pendingUpgrade.tier.toUpperCase()}</strong>

        <div className="pending-actions">

          <button
            className="btn small"
            onClick={() =>
              reopenPendingCheckout(subscription.pendingUpgrade)
            }
          >
            Continue
          </button>

          <button
            className="btn small danger"
            onClick={async () => {

  await removePendingUpgrade();

  const refreshed = await loadSubscription();

  if (!refreshed?.pendingUpgrade) {
    setUpgradeMode(true);
    setSelectedTier(null);
  }

}}
          >
            Remove
          </button>

        </div>

      </div>
    )}

    {/* -------------------------
       STATE 2: Active Plan View
    ------------------------- */}

    {isActive && !upgradeMode && (
      <>
        <CurrentPlanSection />

        <div className="current-plan-actions">

          <button
            className="btn upgrade-btn"
            onClick={handleUpgradeClick}
          >
            Upgrade Plan
          </button>

          {!subscription.cancelAtPeriodEnd && (
            <button
              className="btn btn-danger cancel-autopay"
              onClick={handleCancelAutoPay}
            >
              Cancel AutoPay
            </button>
          )}

        </div>
      </>
    )}

    {/* -------------------------
       STATE 3: Upgrade Mode
    ------------------------- */}

    {!hasPendingUpgrade && upgradeMode && (
      <>
        <button
          className="btn secondary"
          onClick={() => {
            setUpgradeMode(false);
            setSelectedTier(null);
          }}
        >
          ← Back to Current Plan
        </button>

        <BillingToggle billing={billing} setBilling={setBilling} />

        <PlanSelectionSection />

        {selectedTier && (
          <button
            className="btn primary proceed"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        )}
      </>
    )}

    {/* -------------------------
       STATE 4: No Subscription
    ------------------------- */}

{!hasPendingUpgrade && !isActive && !upgradeMode && (
      <>
        <BillingToggle billing={billing} setBilling={setBilling} />
        <PlanSelectionSection />

        {selectedTier && (
          <button
            className="btn primary proceed"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        )}
      </>
    )}

    {error && <p className="error">{error}</p>}

  </div>
);

};

export default Subscription;