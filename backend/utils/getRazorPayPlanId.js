const plans = require("../config/razorpayPlans");

const getRazorpayPlanId = (tier, billingCycle) => {
  if (!plans[tier] || !plans[tier][billingCycle]) {
    throw new Error("Invalid plan configuration");
  }

  const mode =
    process.env.NODE_ENV === "production" ? "live" : "test";
    console.log(`Using Razorpay ${mode} plan for ${tier} ${billingCycle}`);

  const planId = plans[tier][billingCycle][mode];

  if (!planId || planId.startsWith("REPLACE")) {
    throw new Error(
      `Razorpay ${mode} plan ID missing for ${tier} ${billingCycle}`
    );
  }

  return planId;
};

module.exports = getRazorpayPlanId;