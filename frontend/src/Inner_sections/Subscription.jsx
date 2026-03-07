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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")); // adjust if using context
  const isAdmin = user?.role === "admin";

  /* ----------------------------------
     Load Tiers + Current Subscription
  ---------------------------------- */
  useEffect(() => {
    const init = async () => {
      const tierRes = await getTiers();
      setTiers(tierRes.tiers);
      setSelectedTier(tierRes.tiers[0]?.key);

      const subRes = await getMySubscription();
      if (subRes) {
        setSubscription(subRes);
      }
    };

    init();
  }, []);

  /* ----------------------------------
     Price Preview
  ---------------------------------- */
  useEffect(() => {
    if (!selectedTier) return;

    previewPrice({
      tierId: selectedTier,
      billingCycle: billing,
    });
  }, [selectedTier, billing]);

  /* ----------------------------------
     Checkout
  ---------------------------------- */
  const handleCheckout = async () => {
    try {
      setError(null);
      setLoading(true);

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

  /* ----------------------------------
     Cancel AutoPay
  ---------------------------------- */
  const handleCancelAutoPay = async () => {
    if (!window.confirm("Cancel auto-renewal? Access remains until period ends.")) {
      return;
    }

    try {
      setLoading(true);
      await cancelAutoPay();
      const subRes = await getMySubscription();
      setSubscription(subRes);
      alert("AutoPay cancelled. Plan remains active until expiry.");
    } catch (err) {
      alert("Failed to cancel AutoPay.");
    } finally {
      setLoading(false);
    }
  };

  const activeTier = subscription?.tier;
  const isActive = subscription?.status === "active";

  return (
    <div className="subscription-page">
      <h2>Subscription & Billing</h2>
      <p>Choose the plan that fits your business</p>

      {subscription && (
        <div className="current-plan-box">
          <strong>Current Plan:</strong>{" "}
          {activeTier?.toUpperCase() || "None"}
          <br />
          <strong>Status:</strong> {subscription.status}
          <br />
          <strong>Valid Until:</strong>{" "}
          {subscription.currentEnd
            ? new Date(subscription.currentEnd).toLocaleDateString()
            : "—"}
          <br />
          {subscription.cancelAtPeriodEnd && (
            <span className="cancel-warning">
              AutoPay cancelled. Ends at period expiry.
            </span>
          )}
        </div>
      )}

      <BillingToggle billing={billing} setBilling={setBilling} />

      <div className="plans-grid">
        {tiers.map((tier) => (
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

      {/* Checkout Button */}
      {(!isActive || selectedTier !== activeTier) && (
        <button
          className="btn primary proceed"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>
      )}

      {/* Cancel AutoPay - Admin Only */}
      {isAdmin &&
        isActive &&
        !subscription?.cancelAtPeriodEnd && (
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