const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const {
  previewPrice,
  createCheckout,
  handleWebhook,
  getTiers
} = require("../controllers/subscriptionController");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");
const router = express.Router();

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
router.get("/me", requireActiveSubscription, (req, res) => {
  const now = new Date();

  const daysRemaining = req.subscription.currentEnd
    ? Math.ceil(
        (req.subscription.currentEnd - now) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  res.json({
    tier: req.subscription.tier,
    effectiveTier: req.effectiveTier,
    status: req.subscription.status,
    billingCycle: req.subscription.billingCycle,
    currentEnd: req.subscription.currentEnd,
    daysRemaining,
    limits: {
      users: req.tierConfig.users,
      assets: req.tierConfig.assets,
    },
    isTrial: req.subscription.status === "trialing",
  });
});
router.post(
  "/verify-payment",
  authenticateToken(),
  verifyPayment
);
router.post("/webhook", handleWebhook);

module.exports = router;
