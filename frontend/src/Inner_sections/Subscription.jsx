import React, { useEffect, useState } from "react";
import BillingToggle from "../Components/subscription/BillingToggle";
import PlanCard from "../Components/subscription/PlanCard";
import { getTiers, previewPrice } from "../Services/Subscription";
import "../Page_styles/Subscription.css";

const Subscription = () => {
  const [tiers, setTiers] = useState([]);
  const [billing, setBilling] = useState("monthly");
  const [selectedTier, setSelectedTier] = useState(null);

  useEffect(() => {
    const loadTiers = async () => {
      const res = await getTiers();
      setTiers(res.tiers);
      console.log(res.tiers);
      setSelectedTier(res.tiers[0]?.id);
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

  return (
    <div className="subscription-page">
      <h2>Subscription & Billing</h2>
      <p>Choose the plan that fits your business</p>

      <BillingToggle billing={billing} setBilling={setBilling} />

      <div className="plans-grid">
        {tiers.map((tier) => (
          <PlanCard
            key={tier.id}
            tier={tier}
            billing={billing}
            selected={tier.id === selectedTier}
            onSelect={setSelectedTier}
          />
        ))}
      </div>

      <button className="btn primary proceed">
        Proceed to Checkout
      </button>
    </div>
  );
};

export default Subscription;
