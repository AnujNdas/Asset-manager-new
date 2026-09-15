const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const {
  previewPrice,
  createCheckout, 
  handleWebhook,
  getTiers,
  verifyPayment,
  cancelAutoPay,
  clearPendingUpgrade
} = require("../controllers/subscriptionController");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");
const router = express.Router();
const Subscription = require("../models/Subscription");
const razorpay = require("../config/razorpay");
const HardwareAsset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const User = require("../models/User");
const resolveSubscriptionState = require("../utils/subscriptionStateResolver");
const pricingTiers = require("../config/pricingTiers");
const AssetInstance = require("../models/AssetInstance")
router.post(
  "/preview-price",
  authenticateToken(),
  previewPrice
);
router.get("/tiers", getTiers);
router.post(
  "/create-checkout",
  authenticateToken(),
  createCheckout
);
router.get("/me", authenticateToken(), async (req, res) => {
  try {
    const now = new Date();

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    });

    // 🔥 Resolve state
    const state = resolveSubscriptionState(subscription);

    // 🔥 Safe defaults if no subscription
    const tierConfig = subscription
      ? pricingTiers.find(t => t.key === subscription.tier)
      : null;

    const currentEnd = subscription?.currentEnd || null;

    const daysRemaining = currentEnd
      ? Math.max(
          0,
          Math.ceil((currentEnd - now) / (1000 * 60 * 60 * 24))
        )
      : null;

    const timeRemainingMs = currentEnd
      ? Math.max(0, currentEnd - now)
      : null;

    /* -------------------------
       USAGE CALCULATION
    ------------------------- */

    const orgId = subscription?.organizationId;

const hardwareCount = orgId
  ? await AssetInstance.countDocuments({
      organizationId: orgId,
      assetType: "hardware"
    })
  : 0;

const softwareCount = orgId
  ? await AssetInstance.countDocuments({
      organizationId: orgId,
      assetType: "software"
    })
  : 0;
    const adminCount = orgId
      ? await User.countDocuments({
          organizationId: orgId,
          role: "admin"
        })
      : 0;

    /* -------------------------
       RESPONSE
    ------------------------- */

    return res.json({
      ...state,

      tier: subscription?.tier || null,
      effectiveTier: tierConfig?.name || null,
      status: subscription?.status || "none",
      billingCycle: subscription?.billingCycle || null,
      currentEnd,

      daysRemaining,
      timeRemainingMs,

      pendingUpgrade: subscription?.pendingUpgrade || null,

      /* PLAN LIMITS */
      limits: {
        hardwareAssets:
          tierConfig?.hardwareAssets === "unlimited"
            ? Infinity
            : tierConfig?.hardwareAssets || 0,

        softwareAssets:
          tierConfig?.softwareAssets === "unlimited"
            ? Infinity
            : tierConfig?.softwareAssets || 0,

        admins:
          tierConfig?.admins === "unlimited"
            ? Infinity
            : tierConfig?.admins || 0
      },

      /* CURRENT USAGE */
      usage: {
        hardwareAssets: hardwareCount,
        softwareAssets: softwareCount,
        admins: adminCount
      },

      isTrial: subscription?.status === "trialing"
    });

  } catch (err) {
    console.error("Subscription /me error:", err);
    return res.status(500).json({
      error: "Failed to fetch subscription details"
    });
  }
});
router.post(
  "/verify-payment",
  authenticateToken(),
  verifyPayment
);
router.post(
  "/cancel-auto-pay",
  authenticateToken(),
  cancelAutoPay
);

router.post("/webhook", handleWebhook);
router.get("/fix-sub", async (req, res) => {
  const razorSub = await razorpay.subscriptions.fetch("sub_SOFVQ7JIryQYZO");

  const subscription = await Subscription.findOne({
    "pendingUpgrade.razorpaySubscriptionId": razorSub.id,
  });

  subscription.tier = subscription.pendingUpgrade.tier;
  subscription.billingCycle = subscription.pendingUpgrade.billingCycle;
  subscription.razorpaySubscriptionId =
    subscription.pendingUpgrade.razorpaySubscriptionId;

  subscription.status = "active";
  subscription.currentStart = new Date(razorSub.current_start * 1000);
  subscription.currentEnd = new Date(razorSub.current_end * 1000);

  subscription.pendingUpgrade = null;

  await subscription.save();

  res.json({ success: true });
});
// routes/subscriptionRoutes.js

router.delete(
  "/pending-upgrade",
  authenticateToken(),
  clearPendingUpgrade
);
module.exports = router;
