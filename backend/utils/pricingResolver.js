const pricing = require("../config/pricingTiers");

function resolvePrice({ users, assets, billingCycle }) {
  const bundle = pricing.bundles.find(
    (b) => b.users === users && b.assets === assets
  );

  if (!bundle) {
    throw new Error("Invalid pricing selection");
  }

  let amount = bundle.priceMonthly;

  if (billingCycle === "yearly") {
    amount = Math.round(amount * 12 * (1 - pricing.yearlyDiscount));
  }

  return {
    users,
    assets,
    billingCycle,
    amount,
    currency: "USD",
    discountApplied: billingCycle === "yearly",
  };
}

module.exports = { resolvePrice };
