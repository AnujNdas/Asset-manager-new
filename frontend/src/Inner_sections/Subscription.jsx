import React, { useEffect, useState } from "react";
import BillingToggle from "../Components/subscription/BillingToggle";
import PlanCard from "../Components/subscription/PlanCard";
import {
  getTiers,
  previewPrice,
  createCheckout,
  verifyPayment,
  getMySubscription
} from "../Services/Subscription";
import "../Page_styles/Subscription.css";

const Subscription = () => {
  const [tiers, setTiers] = useState([]);
  const [billing, setBilling] = useState("monthly");
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

  useEffect(() => {
    const loadTiers = async () => {
      const res = await getTiers();
      setTiers(res.tiers);
      console.log(res.tiers);
      setSelectedTier(res.tiers[0]?.key);
    };
    loadTiers();
  }, []);

  useEffect(() => {
    if (!selectedTier) return;

    previewPrice({
      tierId: selectedTier,
      billingCycle: billing,
    });
  }, [selectedTier, billing]);
  const handleCheckout = async () => {
  try {
    setError(null);
    setLoading(true);

    // 1️⃣ Create checkout session
    const checkoutRes = await createCheckout({
      tierKey: selectedTier,
      billingCycle: billing,
    });

    const { subscriptionId, razorpayKey } = checkoutRes;

    if (!subscriptionId) {
      throw new Error("Invalid checkout response");
    }
    if (!window.Razorpay) {
  alert("Payment gateway not loaded.");
  return;
}
    // 2️⃣ Configure Razorpay
    const options = {
      key: razorpayKey,
      subscription_id: subscriptionId,
      name: "Your App Name",
      description: `${selectedTier.toUpperCase()} Plan`,
      handler: async function (response) {
        try {
          // 3️⃣ Verify payment on backend
          await verifyPayment(response);

          // 4️⃣ Refresh subscription state
          await getMySubscription();

          alert("Payment successful. Subscription activated.");

          window.location.reload();
        } catch (err) {
          console.error("Verification failed:", err);
          alert("Payment verification failed.");
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
      theme: {
        color: "#4f46e5",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    setError(err.userMessage || "Checkout failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="subscription-page">
      <h2>Subscription & Billing</h2>
      <p>Choose the plan that fits your business</p>

      <BillingToggle billing={billing} setBilling={setBilling} />

<div className="plans-grid">
  {tiers.map((tier) => (
    <PlanCard
      key={tier.key}
      tier={tier}   // ✅ pass full object
      billing={billing}
      selected={tier.key === selectedTier}
      onSelect={() => setSelectedTier(tier.key)}
    />
  ))}
</div>

<button
  className="btn primary proceed"
  onClick={handleCheckout}
  disabled={loading}
>
  {loading ? "Processing..." : "Proceed to Checkout"}
</button>
    </div>
  );
};

export default Subscription;
