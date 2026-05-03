const Subscription = require("../models/Subscription");
const pricingTiers = require("../config/pricingTiers");
const resolveSubscriptionState = require("../utils/subscriptionStateResolver");
const mongoose = require("mongoose");

const requireActiveSubscription = async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;

    if (!orgId) {
      return res.status(403).json({
        error: "User not linked to organization",
      });
    }

    const subscription = await Subscription.findOne({
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    // 🔥 Resolve state (single source of truth)
    const state = resolveSubscriptionState(subscription);

    // 🔴 Block access if not allowed
    if (!state.access.hasAccess) {
      return res.status(402).json({
        error: "subscription_required",
        ...state,
      });
    }

    // ✅ Allow access
    return allowAccess(
      subscription,
      subscription.tier,
      req,
      res,
      next
    );

  } catch (err) {
    console.error("Subscription check failed:", err);
    return res.status(500).json({
      error: "Subscription validation error",
    });
  }
};
/* --------------------------------------------
   Access Resolver Helper
-------------------------------------------- */
function allowAccess(subscription, tierKey, req, res, next) {
  const tierConfig = pricingTiers.find(
    (t) => t.key === tierKey
  );

  if (!tierConfig) {
    return res.status(500).json({
      error: "Invalid subscription tier configuration",
    });
  }

  req.subscription = subscription;
  req.tierConfig = tierConfig;
  req.effectiveTier = tierConfig.name;

  return next();
}

module.exports = requireActiveSubscription;