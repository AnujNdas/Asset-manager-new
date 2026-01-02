import React from "react";

const tiers = [
  { id: "tier_10_1000", label: "10 Users • 1000 Assets" },
  { id: "tier_20_2500", label: "20 Users • 2500 Assets" },
  { id: "tier_50_5000", label: "50 Users • 5000 Assets" },
];

const TierSelector = ({ tierId, setTierId }) => {
  return (
    <div className="usage-selector">
      <label>Select Plan</label>
      <select
        value={tierId}
        onChange={(e) => setTierId(e.target.value)}
      >
        {tiers.map((tier) => (
          <option key={tier.id} value={tier.id}>
            {tier.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TierSelector;
