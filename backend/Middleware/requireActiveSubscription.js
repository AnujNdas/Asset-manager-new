const Subscription = require("../models/Subscription");
const pricingTiers = require("../config/pricingTiers");
const mongoose = require("mongoose");
const requireActiveSubscription = async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;
    console.log(
      `[SUB CHECK] Org: ${orgId}`
    );

    if (!orgId) {
      return res.status(403).json({
        error: "User not linked to organization",
      });
    }

 const subscription = await Subscription.findOne({
  organizationId: new mongoose.Types.ObjectId(orgId),
});

    if (!subscription) {
      return res.status(403).json({
        error: "Subscription not found",
      });
    }

    const now = new Date();

    /* ----------------------------
       TRIAL EXPIRY CHECK
    ----------------------------- */
    if (subscription.status === "trialing" && subscription.trialEnd) {
      if (subscription.trialEnd < now) {
        subscription.status = "expired";
        await subscription.save();

        return res.status(402).json({
  error: "subscription_required",
  reason: "trial_expired",
});
      }
    }

    /* ----------------------------
       PAID PLAN EXPIRY CHECK
    ----------------------------- */
    if (
      subscription.status === "active" &&
      subscription.currentEnd &&
      subscription.currentEnd < now
    ) {
      subscription.status = "expired";
      await subscription.save();

      return res.status(402).json({
  error: "subscription_required",
  reason: "plan_expired",
});
    }

    /* ----------------------------
       GRACE PERIOD FOR FAILED PAYMENTS
    ----------------------------- */
    if (subscription.status === "past_due") {
      const graceEnd = new Date(subscription.updatedAt);
      graceEnd.setDate(graceEnd.getDate() + 3);

      if (now >= graceEnd) {
        return res.status(402).json({
  error: "subscription_required",
  reason: "payment_overdue",
});
      }
    }

    /* ----------------------------
       STATUS VALIDATION
    ----------------------------- */
    if (!["active", "trialing", "past_due"].includes(subscription.status)) {
      return res.status(403).json({
        error: "No active subscription",
      });
    }

    /* ----------------------------
       EFFECTIVE TIER RESOLUTION
    ----------------------------- */
const effectiveTierName =
  subscription.status === "trialing"
    ? "omni"
    : subscription.tier;

const tierConfig = pricingTiers.find(
  (t) => t.key === effectiveTierName
);

if (!tierConfig) {
  console.error("Invalid tier config:", effectiveTierName);
  return res.status(500).json({
    error: "Invalid subscription tier configuration",
  });
}

    req.subscription = subscription;
    req.tierConfig = tierConfig;
    req.effectiveTier = tierConfig.name;

    next();
  } catch (err) {
    console.error("Subscription check failed:", err.message);
    return res.status(500).json({
      error: "Subscription validation error",
    });
  }
};

module.exports = requireActiveSubscription;