import React, { useState } from "react";
import { PLANS } from "../constants/plans";
import PlanCard from "../Components/subscription/PlanCard";
import BillingToggle from "../Components/subscription/BillingToggle";
import "../Page_styles/Subscription.css";

const Subscription = () => {
  const [billing, setBilling] = useState("monthly");
  const currentPlan = "FREE"; // later from backend

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h2>Subscription & Billing</h2>
        <p>Choose a plan that fits your organization</p>
        <BillingToggle billing={billing} setBilling={setBilling} />
      </div>

      <div className="plans-grid">
        {Object.values(PLANS).map((plan) => (
          <PlanCard
            key={plan.code}
            plan={plan}
            billing={billing}
            isCurrent={plan.code === currentPlan}
          />
        ))}
      </div>
    </div>
  );
};

export default Subscription;
