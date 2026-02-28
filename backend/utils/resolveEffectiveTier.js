const resolveEffectiveTier = (subscription) => {
  if (!subscription) return null;

  if (subscription.status === "trialing") {
    return "omni"; // trial gets highest tier access
  }

  return subscription.tier;
};

module.exports = resolveEffectiveTier;