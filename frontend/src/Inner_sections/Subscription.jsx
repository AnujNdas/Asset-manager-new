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

  /* LOAD DATA */

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

  /* PRICE PREVIEW */

  useEffect(() => {

    if (!selectedTier) return;

    previewPrice({
      tierId: selectedTier,
      billingCycle: billing,
    });

  }, [selectedTier, billing]);

  /* CHECKOUT */

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

  /* CANCEL AUTOPAY */

  const handleCancelAutoPay = async () => {

    if (!window.confirm("Cancel auto-renewal?")) return;

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

  /* CURRENT PLAN */

  const CurrentPlanSection = () => {

    if (!subscription) return null;

    const currentPlan = tiers.find((t) => t.key === activeTier);

    return (

      <div className="current-plan-wrapper">

        {/* Banner Row */}

        <div className="current-plan-banner">

          <div className="banner-item">
            <span>Plan</span>
            <strong>{activeTier?.toUpperCase()}</strong>
          </div>

          <div className="banner-item">
            <span>Status</span>
            <strong>{subscription.status}</strong>
          </div>

          <div className="banner-item">
            <span>Valid Until</span>
            <strong>
              {subscription.currentEnd
                ? new Date(subscription.currentEnd).toLocaleDateString()
                : "—"}
            </strong>
          </div>

          <div className="banner-item">
            <span>AutoPay</span>
            <strong>
              {subscription.cancelAtPeriodEnd ? "Disabled" : "Active"}
            </strong>
          </div>

        </div>

        {/* Current Plan Features */}

        {currentPlan && (

          <PlanCard
            tier={currentPlan}
            billing={subscription.billingCycle}
            selected={true}
            isActive={true}
            isAdmin={isAdmin}
            hideSelect={true}
          />

        )}

      </div>

    );
  };

  /* PLAN LIST */

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
            isActive={false}
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

      {/* CURRENT PLAN VIEW */}

      {isActive && !upgradeMode && (

        <>
          <CurrentPlanSection />

          <div className="current-plan-actions">

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

            {!subscription.cancelAtPeriodEnd && (

              <button
                className="btn danger cancel-autopay"
                onClick={handleCancelAutoPay}
              >
                Cancel AutoPay
              </button>

            )}

          </div>

        </>
      )}

      {/* UPGRADE VIEW */}

      {(upgradeMode || !isActive) && (

        <>

          <div className="upgrade-controls">

            {upgradeMode && (

              <button
                className="btn secondary"
                onClick={() => {

                  setUpgradeMode(false);
                  setSelectedTier(null);

                }}
              >
                ← Back to Current Plan
              </button>

            )}

          </div>

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