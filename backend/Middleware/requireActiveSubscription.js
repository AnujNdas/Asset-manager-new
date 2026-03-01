const Subscription = require("../models/Subscription");
const pricingTiers = require("../config/pricingTiers");
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

    if (!subscription) {
      return res.status(403).json({
        error: "Subscription not found",
      });
    }

    const now = new Date();

    /* --------------------------------------------
       1️⃣ TRIAL ACCESS
    -------------------------------------------- */
    if (
      subscription.status === "trialing" &&
      subscription.trialEnd &&
      subscription.trialEnd > now
    ) {
      return allowAccess(subscription, "omni", req, res, next);
    }

    /* --------------------------------------------
       2️⃣ ACTIVE (VALID PERIOD)
    -------------------------------------------- */
    if (
      subscription.status === "active" &&
      subscription.currentEnd &&
      subscription.currentEnd > now
    ) {
      return allowAccess(
        subscription,
        subscription.tier,
        req,
        res,
        next
      );
    }

    /* --------------------------------------------
       3️⃣ PAST DUE WITH 3-DAY GRACE
    -------------------------------------------- */
    if (
      subscription.status === "past_due" &&
      subscription.pastDueAt
    ) {
      const graceEnd = new Date(subscription.pastDueAt);
      graceEnd.setDate(graceEnd.getDate() + 3);

      if (now < graceEnd) {
        return allowAccess(
          subscription,
          subscription.tier,
          req,
          res,
          next
        );
      }

      return res.status(402).json({
        error: "subscription_required",
        reason: "payment_overdue",
      });
    }

    /* --------------------------------------------
       4️⃣ TRIAL EXPIRED
    -------------------------------------------- */
    if (
      subscription.status === "trialing" &&
      subscription.trialEnd &&
      subscription.trialEnd <= now
    ) {
      return res.status(402).json({
        error: "subscription_required",
        reason: "trial_expired",
      });
    }

    /* --------------------------------------------
       5️⃣ PLAN EXPIRED (Hard Stop)
    -------------------------------------------- */
    if (
      subscription.currentEnd &&
      subscription.currentEnd <= now
    ) {
      return res.status(402).json({
        error: "subscription_required",
        reason: "plan_expired",
      });
    }

    /* --------------------------------------------
       6️⃣ EVERYTHING ELSE
    -------------------------------------------- */
    return res.status(402).json({
      error: "subscription_required",
      reason: "no_active_subscription",
    });

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