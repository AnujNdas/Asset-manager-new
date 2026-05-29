const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const razorpayPlans = require("../config/razorpayPlans");
const pricingTiers = require("../config/pricingTiers");
const Subscription = require("../models/Subscription");
const processAffiliateConversion = require("../../utils/processAffiliateConversion");
const isProduction = process.env.NODE_ENV === "production";

/* ------------------------------------------------
   Utility: Resolve Razorpay Plan ID
------------------------------------------------ */
function getPlanId(tierKey, billingCycle) {
  const plan = razorpayPlans[tierKey]?.[billingCycle];
  if (!plan) return null;
  return isProduction ? plan.live : plan.test;
}

/* ------------------------------------------------
   Get Pricing Tiers
------------------------------------------------ */
const getTiers = (req, res) => {
  return res.json({
    success: true,
    tiers: pricingTiers
      .filter((tier) => !tier.internal) // 🔥 hide internal tiers
      .map((tier) => ({
        id: tier.id,
        key: tier.key,
        name: tier.name,
        users: tier.users,
        assets: tier.assets,
        features: tier.features,
        popular: tier.popular,
        prices: {
          monthly: tier.priceMonthly,
          yearly: tier.priceYearly,
        },
        currency: tier.currency,
      })),
  });
};
/* ------------------------------------------------
   Preview Price
------------------------------------------------ */
const previewPrice = (req, res) => {
  const { tierId, billingCycle } = req.body;

  if (!tierId || !billingCycle) {
    return res.status(400).json({
      error: "tierId and billingCycle are required",
    });
  }

  const tier = pricingTiers.find((t) => t.key === tierId);

  if (!tier || tier.internal) {
    return res.status(400).json({
      error: "Invalid tier selected",
    });
  }

  const amount =
    billingCycle === "yearly"
      ? tier.priceYearly
      : tier.priceMonthly;

  return res.json({
    success: true,
    pricing: {
      tierId: tier.id,
      billingCycle,
      amount,
      currency: tier.currency,
    },
  });
};
/* ------------------------------------------------
   Create Razorpay Subscription
------------------------------------------------ */
const createCheckout = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const { tierKey, billingCycle } = req.body;

    if (!tierKey || !billingCycle) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const planId = getPlanId(tierKey, billingCycle);
    if (!planId) {
      return res.status(400).json({ message: "Invalid plan selection" });
    }
    const tier = pricingTiers.find(
  (t) => t.key === tierKey
);

if (!tier) {
  return res.status(400).json({
    message: "Invalid tier",
  });
}

const amount =
  billingCycle === "yearly"
    ? tier.priceYearly
    : tier.priceMonthly;

const currency =
  tier.currency || "USD";
    const subscription = await Subscription.findOne({
      organizationId: orgId,
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    // Prevent duplicate pending upgrade
    if (subscription.pendingUpgrade?.razorpaySubscriptionId) {
      return res.status(400).json({
        message: "Upgrade already in progress",
      });
    }

    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: billingCycle === "monthly" ? 60 : 5,
      });

    // 🔥 DO NOT TOUCH ACTIVE/TRIAL DATA
subscription.pendingUpgrade = {
  tier: tierKey,

  billingCycle,

  razorpayPlanId: planId,

  razorpaySubscriptionId:
    razorpaySubscription.id,

  planPrice: amount,

  currency,
};

    await subscription.save();

    return res.json({
      success: true,
      subscriptionId: razorpaySubscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({
      message: "Subscription creation failed",
    });
  }
};
/* ------------------------------------------------
   Verify Payment (ONLY verifies signature)
   Activation handled by webhook
------------------------------------------------ */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing verification parameters",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_payment_id}|${razorpay_subscription_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified. Awaiting activation.",
    });
  } catch (err) {
    console.error("Verification failed:", err);
    return res.status(500).json({
      message: "Verification process failed",
    });
  }
};

/* ------------------------------------------------
   Cancel Auto Pay (Cancel at Period End)
------------------------------------------------ */
const cancelAutoPay = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const subscription = await Subscription.findOne({
      organizationId: orgId,
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    if (!subscription.razorpaySubscriptionId) {
      return res.status(400).json({
        message: "No Razorpay subscription attached",
      });
    }

    if (subscription.status === "cancelled") {
      return res.json({
        success: true,
        message: "Subscription already cancelled",
      });
    }

    if (!["active", "created"].includes(subscription.status)) {
      return res.status(400).json({
        message: "No cancellable subscription found",
      });
    }

    if (subscription.cancelAtPeriodEnd) {
      return res.json({
        success: true,
        message: "Auto-pay already scheduled for cancellation",
      });
    }

    await razorpay.subscriptions.cancel(
      subscription.razorpaySubscriptionId,
      { cancel_at_cycle_end: 1 }
    );

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    return res.json({
      success: true,
      message:
        "Auto-pay cancelled. Access valid until billing period ends.",
    });
  } catch (err) {
    console.error("Cancel auto-pay error:", err);
    return res.status(500).json({
      message: "Failed to cancel auto-pay",
    });
  }
};

/* ------------------------------------------------
   Razorpay Webhook (Single Source of Truth)
------------------------------------------------ */
const handleWebhook = async (req, res) => {
  try {
    console.log("----- RAZORPAY WEBHOOK RECEIVED -----");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    console.log("Webhook signature received:", signature);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);

    if (signature !== expectedSignature) {
      console.error("❌ Webhook signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    console.log("✅ Webhook signature verified");

    const parsedBody = JSON.parse(req.body.toString());

    const event = parsedBody.event;
    const entity = parsedBody.payload.subscription?.entity;

    console.log("Webhook Event:", event);

    if (!entity) {
      console.log("No subscription entity found in payload");
      return res.status(200).json({ received: true });
    }

    console.log("Subscription ID from Razorpay:", entity.id);

    const subscription = await Subscription.findOne({
      $or: [
        { razorpaySubscriptionId: entity.id },
        { "pendingUpgrade.razorpaySubscriptionId": entity.id }
      ]
    });

    if (!subscription) {
      console.log("⚠️ Subscription not found in DB for:", entity.id);
      return res.status(200).json({ received: true });
    }

    console.log("Subscription found in DB:", subscription._id);

    /* ---------------- Activation ---------------- */

    if (event === "subscription.activated") {
      console.log("Subscription activated event received");

      if (subscription.pendingUpgrade) {
        console.log("Applying pending upgrade:", subscription.pendingUpgrade);

        subscription.tier = subscription.pendingUpgrade.tier;
        subscription.billingCycle = subscription.pendingUpgrade.billingCycle;
        subscription.razorpaySubscriptionId =
          subscription.pendingUpgrade.razorpaySubscriptionId;

        subscription.planPrice =
  subscription.pendingUpgrade.planPrice || 0;

subscription.currency =
  subscription.pendingUpgrade.currency || "USD";

subscription.lastPaymentAmount =
  subscription.pendingUpgrade.planPrice || 0;

subscription.lastPaymentDate =
  new Date();

subscription.totalPaid =
  (subscription.totalPaid || 0) +
  (subscription.pendingUpgrade.planPrice || 0);

subscription.pendingUpgrade = null;
      } else {
        console.log("No pending upgrade found");
      }

      subscription.status = "active";
      subscription.currentStart = new Date(entity.current_start * 1000);
      subscription.currentEnd = new Date(entity.current_end * 1000);
      subscription.pastDueAt = null;

      await subscription.save();
      if (
  subscription.tier !== "trial" &&
  subscription.status === "active"
) {
  await processAffiliateConversion(subscription);
}

      console.log("✅ Subscription activated and saved to DB");
    }

    /* ---------------- Renewal ---------------- */

    if (event === "subscription.charged") {
      console.log("Subscription renewal charge event");

      subscription.status = "active";
      subscription.currentStart = new Date(entity.current_start * 1000);
      subscription.currentEnd = new Date(entity.current_end * 1000);
      subscription.pastDueAt = null;
      subscription.lastPaymentDate =
  new Date();

subscription.lastPaymentAmount =
  subscription.planPrice || 0;

subscription.totalPaid =
  (subscription.totalPaid || 0) +
  (subscription.planPrice || 0);
      await subscription.save();

      console.log("✅ Subscription renewed and DB updated");
    }

    /* ---------------- Cancellation ---------------- */

    if (event === "subscription.cancelled") {
      console.log("Subscription cancelled event");

      subscription.status = "cancelled";
      subscription.cancelAtPeriodEnd = false;

      await subscription.save();

      console.log("Subscription marked as cancelled in DB");
    }

    /* ---------------- Payment Failure ---------------- */

    if (event === "payment.failed") {
      console.log("Payment failed event received");

      subscription.status = "past_due";
      subscription.pastDueAt = new Date();

      await subscription.save();

      console.log("Subscription marked as past_due");
    }

    console.log("----- WEBHOOK PROCESSING COMPLETE -----");

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).send("Webhook processing failed");
  }
};
// controllers/subscriptionController.js

const clearPendingUpgrade = async (req, res) => {
  try {

    const organizationId = req.user.organizationId;

    await Subscription.updateOne(
      { organizationId },
      { $unset: { pendingUpgrade: 1 } }
    );

    res.status(200).json({
      success: true,
      message: "Pending upgrade removed",
    });

  } catch (error) {

    console.error("Clear pending upgrade error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear pending upgrade",
    });

  }
};
module.exports = {
  getTiers,
  previewPrice,
  createCheckout,
  verifyPayment,
  cancelAutoPay,
  handleWebhook,
  clearPendingUpgrade
};