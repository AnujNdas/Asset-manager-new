import React from "react";

const PlanCard = ({ tier, billing, selected, onSelect , hideSelect , isRecommended }) => {
  if (!tier || !tier.prices) return null;

  const price =
    billing === "yearly"
      ? tier.prices.yearly
      : tier.prices.monthly;

  return (
    <div
      className={`plan-card ${selected ? "active" : ""}`}
      onClick={() => onSelect(tier.id)}
    >
      <h3>{tier.name}</h3>
            {isRecommended && (
        <div className="recommended-badge">
          Recommended
        </div>
      )}

      <div className="plan-price">
        <span className="amount">${price}</span>
        <span className="duration">
          /{billing === "monthly" ? "mo" : "mo"}
        </span>
      </div>

      <ul className="plan-features">
        {tier.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      {!hideSelect && (
        <button className="btn-primary">
          {selected ? "Selected" : "Select Plan"}
        </button>
      )}
    </div>
  );
};


export default PlanCard;
