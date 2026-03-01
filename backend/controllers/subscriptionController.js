const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const razorpayPlans = require("../config/razorpayPlans");
const pricingTiers = require("../config/pricingTiers");
const Subscription = require("../models/Subscription");

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

    const subscription = await Subscription.findOne({
      organizationId: orgId,
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    if (subscription.status === "active") {
      return res.status(400).json({
        message: "Already on active plan",
      });
    }

    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: billingCycle === "monthly" ? 60 : 5,
      });

    subscription.razorpaySubscriptionId =
      razorpaySubscription.id;
    subscription.razorpayPlanId = planId;
    subscription.tier = tierKey;
    subscription.billingCycle = billingCycle;
    subscription.status = "created"; // explicit lifecycle state

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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    const parsedBody = JSON.parse(req.body.toString());
    const event = parsedBody.event;
    const entity = parsedBody.payload.subscription?.entity;

    if (!entity) {
      return res.status(200).json({ received: true });
    }

    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: entity.id,
    });

    if (!subscription) {
      return res.status(200).json({ received: true });
    }

    /* Activation */
    if (event === "subscription.activated") {
      subscription.status = "active";
      subscription.currentStart = new Date(
        entity.current_start * 1000
      );
      subscription.currentEnd = new Date(
        entity.current_end * 1000
      );
      subscription.pastDueAt = null;
      await subscription.save();
    }

    /* Renewal */
    if (event === "subscription.charged") {
      subscription.status = "active";
      subscription.currentStart = new Date(
        entity.current_start * 1000
      );
      subscription.currentEnd = new Date(
        entity.current_end * 1000
      );
      subscription.pastDueAt = null;
      await subscription.save();
    }

    /* Cancellation */
    if (event === "subscription.cancelled") {
      subscription.status = "cancelled";
      subscription.cancelAtPeriodEnd = false;
      await subscription.save();
    }

    /* Payment Failure */
    if (event === "payment.failed") {
      subscription.status = "past_due";
      subscription.pastDueAt = new Date();
      await subscription.save();
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Webhook processing failed");
  }
};

module.exports = {
  getTiers,
  previewPrice,
  createCheckout,
  verifyPayment,
  cancelAutoPay,
  handleWebhook,
};