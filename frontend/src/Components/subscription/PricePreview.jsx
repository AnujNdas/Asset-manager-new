import React from "react";

const PricePreview = ({ pricing }) => {
  if (!pricing) {
    return (
      <div className="price-preview loading">
        Select a plan to see pricing
      </div>
    );
  }

  return (
    <div className="price-preview card">
      <h3>Selected Plan</h3>

      <div className="plan-summary">
        <div>
          <strong>{pricing.users}</strong> Users
        </div>
        <div>
          <strong>{pricing.assets}</strong> Assets
        </div>
      </div>

      <div className="price-amount">
        ${pricing.amount}
        <span className="cycle">
          /{pricing.billingCycle === "monthly" ? "month" : "year"}
        </span>
      </div>

      {pricing.billingCycle === "yearly" && (
        <p className="discount-note">
          Yearly billing includes a 10% discount
        </p>
      )}
    </div>
  );
};

export default PricePreview;
