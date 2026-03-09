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
router.get("/me", authenticateToken(), requireActiveSubscription, async (req, res) => {

  const now = new Date();

  const daysRemaining = req.subscription.currentEnd
    ? Math.max(
        0,
        Math.ceil(
          (req.subscription.currentEnd - now) /
          (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const timeRemainingMs = req.subscription.currentEnd
    ? Math.max(0, req.subscription.currentEnd - now)
    : null;


  /* -------------------------
     USAGE CALCULATION
  ------------------------- */

  const hardwareCount = await HardwareAsset.countDocuments({
    organizationId: req.subscription.organizationId
  });

  const softwareCount = await SoftwareAsset.countDocuments({
    organizationId: req.subscription.organizationId
  });

  const adminCount = await User.countDocuments({
    organizationId: req.subscription.organizationId,
    role: "admin"
  });


  res.json({

    tier: req.subscription.tier,
    effectiveTier: req.effectiveTier,
    status: req.subscription.status,
    billingCycle: req.subscription.billingCycle,
    currentEnd: req.subscription.currentEnd,
    daysRemaining,
    timeRemainingMs,

    pendingUpgrade: req.subscription.pendingUpgrade || null,

    /* PLAN LIMITS */
    limits: {
      hardwareAssets: req.tierConfig.hardwareAssets,
      softwareAssets: req.tierConfig.softwareAssets,
      admins: req.tierConfig.admins
    },

    /* CURRENT USAGE */
    usage: {
      hardwareAssets: hardwareCount,
      softwareAssets: softwareCount,
      admins: adminCount
    },

    isTrial: req.subscription.status === "trialing"

  });
});
router.post(
  "/verify-payment",
  authenticateToken(),
  verifyPayment
);
router.post(
  "/cancel-auto-pay",
  authenticateToken(),
  requireActiveSubscription,
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
