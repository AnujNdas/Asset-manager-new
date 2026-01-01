import React from "react";

const PlanCard = ({ plan, billing, isCurrent }) => {
  let price = null;
  if (billing === "monthly") {
    price = plan.priceMonthly;
  } else if (billing === "yearly") {
    price = plan.priceYearly;
  } else if (billing === "multipleYearly") {
    price = plan.pricemultipleYearly;
  }

  return (
    <div className={`plan-card ${isCurrent ? "active" : ""}`}>
      <h3>{plan.name}</h3>

      <div className="plan-price">
        {price === null ? (
          <span className="contact-sales">Contact Sales</span>
        ) : (
          <>
            <span className="amount">{price}</span>
            <span className="duration">
              /{billing === "monthly" ? "mo" : "yr"}
            </span>
          </>
        )}
      </div>

      <ul className="plan-features">
        <li>Assets: {plan.limits.assets === Infinity ? "Unlimited" : plan.limits.assets}</li>
        <li>Users: {plan.limits.users === Infinity ? "Unlimited" : plan.limits.users}</li>
        <li>Reports: {plan.limits.reports ? "Included" : "Not Included"}</li>
      </ul>

      {isCurrent ? (
        <button className="btn current" disabled>
          Current Plan
        </button>
      ) : plan.code === "ENTERPRISE" ? (
        <button className="btn outline">Contact Sales</button>
      ) : (
        <button className="btn primary">Upgrade</button>
      )}
    </div>
  );
};

export default PlanCard;
