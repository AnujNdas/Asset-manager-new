import React, { useEffect, useState } from "react";
import BillingToggle from "../Components/subscription/BillingToggle";
import PlanCard from "../Components/subscription/PlanCard";

import {
  getTiers,
  previewPrice,
  createCheckout,
  verifyPayment,
  getMySubscription,
  cancelAutoPay,
} from "../Services/Subscription";

import "../Page_styles/Subscription.css";

const Subscription = () => {

  const [tiers, setTiers] = useState([]);
  const [billing, setBilling] = useState("monthly");
  const [selectedTier, setSelectedTier] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [upgradeMode, setUpgradeMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const activeTier = subscription?.tier;
  const isActive = subscription?.status === "active";

  /* -----------------------------
     LOAD DATA
  ----------------------------- */

  useEffect(() => {

    const init = async () => {

      try {

        const tierRes = await getTiers();
        setTiers(tierRes.tiers);

        const subRes = await getMySubscription();

        if (subRes) {
          setSubscription(subRes);
        } else {
          setSelectedTier(tierRes.tiers[0]?.key);
        }

      } catch (err) {
        console.error(err);
      }

    };

    init();

  }, []);

  /* -----------------------------
     PRICE PREVIEW
  ----------------------------- */

  useEffect(() => {

    if (!selectedTier) return;

    previewPrice({
      tierId: selectedTier,
      billingCycle: billing,
    });

  }, [selectedTier, billing]);

  /* -----------------------------
     CHECKOUT
  ----------------------------- */

  const handleCheckout = async () => {

    try {

      setLoading(true);
      setError(null);

      const checkoutRes = await createCheckout({
        tierKey: selectedTier,
        billingCycle: billing,
      });

      const { subscriptionId, razorpayKey } = checkoutRes;

      const options = {
        key: razorpayKey,
        subscription_id: subscriptionId,
        name: "Your App Name",
        description: `${selectedTier.toUpperCase()} Plan`,
        handler: async function (response) {

          await verifyPayment(response);

          const subRes = await getMySubscription();
          setSubscription(subRes);

          setUpgradeMode(false);

          alert("Subscription activated.");

        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {

      setError(err.userMessage || "Checkout failed");

    } finally {

      setLoading(false);
    }
  };

  /* -----------------------------
     CANCEL AUTOPAY
  ----------------------------- */

  const handleCancelAutoPay = async () => {

    if (!window.confirm("Cancel auto-renewal? Access remains until period ends.")) {
      return;
    }

    try {

      setLoading(true);

      await cancelAutoPay();

      const subRes = await getMySubscription();
      setSubscription(subRes);

      alert("AutoPay cancelled.");

    } catch {

      alert("Failed to cancel AutoPay.");

    } finally {

      setLoading(false);
    }

  };

  /* -----------------------------
     CURRENT PLAN SECTION
  ----------------------------- */

  const CurrentPlanSection = () => {

    if (!subscription) return null;

    const currentPlan = tiers.find((t) => t.key === activeTier);

    return (
      <>
        <div className="current-plan-box">

          <div className="plan-item">
            <span className="plan-label">Plan</span>
            <span className="plan-value">
              {activeTier?.toUpperCase()}
            </span>
          </div>

          <div className="plan-item">
            <span className="plan-label">Status</span>
            <span className={`plan-value status-${subscription.status}`}>
              {subscription.status}
            </span>
          </div>

          <div className="plan-item">
            <span className="plan-label">Valid Until</span>
            <span className="plan-value">
              {subscription.currentEnd
                ? new Date(subscription.currentEnd).toLocaleDateString()
                : "—"}
            </span>
          </div>

        </div>

        {/* CURRENT PLAN CARD (shows features) */}

        {currentPlan && (

          <div className="current-plan-card">

            <PlanCard
              tier={currentPlan}
              billing={subscription.billingCycle}
              selected={true}
              isActive={true}
              isAdmin={isAdmin}
            />

          </div>

        )}

        {subscription.cancelAtPeriodEnd && (

          <div className="cancel-warning">
            AutoPay cancelled. Ends at period expiry.
          </div>

        )}
      </>
    );
  };

  /* -----------------------------
     PLAN LIST SECTION
  ----------------------------- */

  const PlanSelectionSection = () => {

    const visiblePlans = upgradeMode
      ? tiers.filter((tier) => tier.key !== activeTier)
      : tiers;

    return (
      <div className="plans-grid">

        {visiblePlans.map((tier) => (

          <PlanCard
            key={tier.key}
            tier={tier}
            billing={billing}
            selected={tier.key === selectedTier}
            isActive={tier.key === activeTier}
            isAdmin={isAdmin}
            onSelect={() => setSelectedTier(tier.key)}
          />

        ))}

      </div>
    );
  };

  return (

    <div className="subscription-page">

      <h2>Subscription & Billing</h2>
      <p>Choose the plan that fits your business</p>

      {/* CURRENT PLAN */}

      <CurrentPlanSection />

      {/* BILLING TOGGLE */}

      {(!isActive || upgradeMode) && (

        <BillingToggle billing={billing} setBilling={setBilling} />

      )}

      {/* CURRENT PLAN ACTION */}

      {isActive && !upgradeMode && (

        <div className="current-plan-view">

          <button
            className="btn upgrade-btn"
            onClick={() => {

              const firstUpgrade = tiers.find(
                (tier) => tier.key !== activeTier
              );

              setUpgradeMode(true);
              setSelectedTier(firstUpgrade?.key || null);

            }}
          >
            Upgrade Plan
          </button>

        </div>

      )}

      {/* BACK BUTTON */}

      {upgradeMode && (

        <div className="upgrade-controls">

          <button
            className="btn secondary"
            onClick={() => {

              setUpgradeMode(false);
              setSelectedTier(null);

            }}
          >
            ← Back to Current Plan
          </button>

        </div>

      )}

      {/* PLAN LIST */}

      {(!isActive || upgradeMode) && <PlanSelectionSection />}

      {/* CHECKOUT */}

      {selectedTier && selectedTier !== activeTier && (

        <button
          className="btn primary proceed"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>

      )}

      {/* CANCEL AUTOPAY */}

      {subscription &&
        subscription.status === "active" &&
        !subscription.cancelAtPeriodEnd && (

          <button
            className="btn danger cancel-autopay"
            onClick={handleCancelAutoPay}
            disabled={loading}
          >
            Cancel AutoPay
          </button>

        )}

      {error && <p className="error">{error}</p>}

    </div>

  );
};

export default Subscription;