import React from "react";
import {
  FiLayers,
  FiCheckCircle,
  FiStar,
  FiTag,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";
const PlanCard = ({
  tier,
  billing,
  selected,
  onSelect,
  hideSelect,
  isRecommended,
  isAffiliate,
}) => {

  if (!tier || !tier.prices) {
    return null;
  }

  const price =
    billing === "yearly"
      ? tier.prices.yearly
      : tier.prices.monthly;

  return (

<div
  className={`plan-card ${
    selected ? "active" : ""
  } ${isRecommended ? "recommended" : ""}`}
  onClick={() => onSelect(tier.key)}
>
  {/* ================= CARD HEADER ================= */}

  <div className="plan-card-header">

    <div className="plan-card-title-row">

      <div className="plan-card-title-group">

        <span className="plan-card-icon">
          <FiLayers />
        </span>

        <h3>{tier.name}</h3>

      </div>

      {selected && (
        <span className="plan-selected-indicator">
          <FiCheckCircle />
        </span>
      )}

    </div>


    {/* BADGES */}

    {(isRecommended ||
      (isAffiliate && billing === "yearly")) && (

      <div className="plan-card-badges">

        {isRecommended && (
          <span className="recommended-badge">
            <FiStar />
            Recommended
          </span>
        )}

        {isAffiliate && billing === "yearly" && (
          <span className="affiliate-badge">
            <FiTag />
            Affiliate Discount
          </span>
        )}

      </div>

    )}

  </div>


  {/* ================= PRICING ================= */}

  <div className="plan-card-pricing">

    <span className="plan-price-label">
      SUBSCRIPTION PRICE
    </span>

    <div className="plan-price">

      <span className="amount">
        ${Number(price).toLocaleString()}
      </span>

      <span className="duration">
        {billing === "monthly"
          ? "/month"
          : "/year"}
      </span>

    </div>

    <p className="plan-price-description">
      {billing === "monthly"
        ? "Billed monthly"
        : "Billed annually"}
    </p>

  </div>


  {/* ================= FEATURES ================= */}

  <div className="plan-card-features-section">

    <div className="plan-features-heading">

      <span>What's Included</span>

      <span className="plan-feature-count">
        {tier.features.length} Features
      </span>

    </div>


    <ul className="plan-features">

      {tier.features.map((f, i) => (

        <li key={i}>

          <span className="plan-feature-icon">
            <FiCheck />
          </span>

          <span className="plan-feature-text">
            {f}
          </span>

        </li>

      ))}

    </ul>

  </div>


  {/* ================= CARD FOOTER ================= */}

  {!hideSelect && (

    <div className="plan-card-footer">

      <button
        className={`btn-primary plan-select-btn ${
          selected ? "is-selected" : ""
        }`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(tier.key);
        }}
      >

        {selected ? (
          <>
            <FiCheckCircle />
            Selected Plan
          </>
        ) : (
          <>
            Select Plan
            <FiArrowRight />
          </>
        )}

      </button>

    </div>

  )}

</div>

  );
};

export default PlanCard;