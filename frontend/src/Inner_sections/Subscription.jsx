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
     INITIAL LOAD
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
      billingCycle: billing
    });

  }, [selectedTier, billing]);

  /* -----------------------------
     CHECKOUT
  ----------------------------- */

  const handleCheckout = async () => {

    try {

      setError(null);
      setLoading(true);

      const checkoutRes = await createCheckout({
        tierKey: selectedTier,
        billingCycle: billing
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

          alert("Subscription activated");

        },

        modal: {
          ondismiss: () => setLoading(false)
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

  /* -----------------------------
     CANCEL AUTOPAY
  ----------------------------- */

  const handleCancelAutoPay = async () => {

    if (!window.confirm("Cancel auto renewal? Access continues until period end.")) {
      return;
    }

    try {

      setLoading(true);

      await cancelAutoPay();

      const subRes = await getMySubscription();
      setSubscription(subRes);

      alert("AutoPay cancelled");

    } catch (err) {

      alert("Failed to cancel AutoPay");

    } finally {

      setLoading(false);

    }
  };

  /* -----------------------------
     DEBUG
  ----------------------------- */

  console.log("SUB DEBUG:", {
    subscription,
    role: user?.role,
    isAdmin,
    status: subscription?.status,
    isActive,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd
  });

  return (

    <div className="subscription-page">

      <h2>Subscription & Billing</h2>
      <p>Choose the plan that fits your business</p>

      {/* =========================
         ACTIVE PLAN BANNER
      ========================= */}

      {subscription && (

        <div className="current-plan-banner">

          <div className="banner-grid">

            <div>
              <span className="label">Plan</span>
              <span className="value">
                {activeTier?.toUpperCase()}
              </span>
            </div>

            <div>
              <span className="label">Status</span>
              <span className={`value status-${subscription.status}`}>
                {subscription.status}
              </span>
            </div>

            <div>
              <span className="label">Billing</span>
              <span className="value">
                {subscription.billingCycle}
              </span>
            </div>

            <div>
              <span className="label">Valid Until</span>
              <span className="value">
                {subscription.currentEnd
                  ? new Date(subscription.currentEnd).toLocaleDateString()
                  : "—"}
              </span>
            </div>

            <div>
              <span className="label">AutoPay</span>
              <span className="value">
                {subscription.cancelAtPeriodEnd ? "Disabled" : "Enabled"}
              </span>
            </div>

          </div>

          {subscription.cancelAtPeriodEnd && (

            <div className="cancel-warning">
              AutoPay cancelled. Plan will end at period expiry.
            </div>

          )}

        </div>

      )}

      {/* =========================
         CURRENT PLAN FEATURES
      ========================= */}

      {isActive && !upgradeMode && (

        <div className="current-plan-view">

          {tiers
            .filter(tier => tier.key === activeTier)
            .map(tier => (

              <PlanCard
                key={tier.key}
                tier={tier}
                billing={subscription.billingCycle}
                selected={false}
                isActive={true}
                isAdmin={isAdmin}
                hideButton={true}
              />

            ))}

          <button
            className="btn upgrade-btn"
            onClick={() => {
              setUpgradeMode(true);
              setSelectedTier(null);
            }}
          >
            Upgrade Plan
          </button>

        </div>

      )}

      {/* =========================
         BILLING TOGGLE
      ========================= */}

      {(!isActive || upgradeMode) && (

        <BillingToggle
          billing={billing}
          setBilling={setBilling}
        />

      )}

      {/* =========================
         ALL PLANS
      ========================= */}

      {(!isActive || upgradeMode) && (

        <div className="plans-grid">

          {tiers.map(tier => (

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

      )}

      {/* =========================
         CHECKOUT
      ========================= */}

      {selectedTier && selectedTier !== activeTier && (

        <button
          className="btn primary proceed"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>

      )}

      {/* =========================
         CANCEL AUTOPAY
      ========================= */}

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