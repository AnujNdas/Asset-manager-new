import React from "react";
const BillingToggle = ({ billing, setBilling }) => {
  return (
    <div className="billing-toggle">
      <button
        className={billing === "monthly" ? "active" : ""}
        onClick={() => setBilling("monthly")}
      >
        Monthly
      </button>
      <button
        className={billing === "yearly" ? "active" : ""}
        onClick={() => setBilling("yearly")}
      >
        Yearly (Save 10%)
      </button>
    </div>
  );
};


export default BillingToggle;
