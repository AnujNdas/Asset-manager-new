
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
        Yearly 
      </button>
      <button
        className={billing === "multipleYearly" ? "active" : ""}
        onClick={() => setBilling("multipleYearly")}
      >
        Multiple (Save 5%)
      </button>
    </div>
  );
};

export default BillingToggle;
