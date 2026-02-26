const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const razorpayPlans = require("../config/razorpayPlans");
const pricingTiers = require("../config/pricingTiers");
const Subscription = require("../models/Subscription");

const isProduction = process.env.NODE_ENV === "production";

/* -----------------------------------------
   Utility: Resolve Razorpay Plan ID
------------------------------------------ */
function getPlanId(tierKey, billingCycle) {
  const plan = razorpayPlans[tierKey]?.[billingCycle];
  if (!plan) return null;

  return isProduction ? plan.live : plan.test;
}

/* -----------------------------------------
   Get Pricing Tiers (UI)
------------------------------------------ */
const getTiers = (req, res) => {
  return res.json({
    success: true,
    tiers: pricingTiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      users: tier.users,
      assets: tier.assets,
      features: tier.features,
      popular: tier.popular,
      prices: {
        monthly: tier.priceMonthly,
        yearly: tier.priceYearly,
      },
      currency: "USD",
    })),
  });
};

/* -----------------------------------------
   Preview Price (UI Confirmation)
------------------------------------------ */
const previewPrice = (req, res) => {
  const { tierId, billingCycle } = req.body;

  if (!tierId || !billingCycle) {
    return res.status(400).json({
      error: "tierId and billingCycle are required",
    });
  }

  const tier = pricingTiers.find((t) => t.id === tierId);

  if (!tier) {
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
      currency: "USD",
    },
  });
};

/* -----------------------------------------
   Create Razorpay Subscription
------------------------------------------ */
const createCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tierKey, billingCycle } = req.body;

    if (!tierKey || !billingCycle) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const planId = getPlanId(tierKey, billingCycle);

    if (!planId) {
      return res.status(400).json({ message: "Invalid plan selection" });
    }

    const totalCount =
      billingCycle === "monthly" ? 120 : 10;

    // Create Razorpay subscription
    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: totalCount,
        customer_notify: 1,
      });

    // Store in DB as pending/created
    const subscription = await Subscription.create({
      userId,
      tier: tierKey,
      billingCycle,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayPlanId: planId,
      status: razorpaySubscription.status, // usually "created"
    });

    return res.json({
      success: true,
      subscriptionId: razorpaySubscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("Razorpay subscription error:", err);
    return res.status(500).json({
      message: "Subscription creation failed",
    });
  }
};

/* -----------------------------------------
   Razorpay Webhook Handler
------------------------------------------ */
const handleWebhook = async (req, res) => {
  console.log("Is Buffer:", Buffer.isBuffer(req.body));

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // 1️⃣ Verify signature using RAW buffer
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.log("❌ Signature mismatch");
      return res.status(400).send("Invalid signature");
    }

    // 2️⃣ Parse JSON AFTER verification
    const parsedBody = JSON.parse(req.body.toString());

    const event = parsedBody.event;
    const payload = parsedBody.payload;

    console.log("✅ Webhook verified:", event);

    /* -----------------------------------------
       subscription.activated
    ------------------------------------------ */
    if (event === "subscription.activated") {
      const subscriptionId = payload.subscription.entity.id;

      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId: subscriptionId },
        {
          status: "active",
          currentStart: new Date(
            payload.subscription.entity.current_start * 1000
          ),
          currentEnd: new Date(
            payload.subscription.entity.current_end * 1000
          ),
        }
      );
    }

    /* -----------------------------------------
       subscription.cancelled
    ------------------------------------------ */
    if (event === "subscription.cancelled") {
      const subscriptionId = payload.subscription.entity.id;

      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId: subscriptionId },
        { status: "cancelled" }
      );
    }

    /* -----------------------------------------
       subscription.charged
    ------------------------------------------ */
    if (event === "subscription.charged") {
      const subscriptionId = payload.subscription.entity.id;

      await Subscription.findOneAndUpdate(
        { razorpaySubscriptionId: subscriptionId },
        {
          status: "active",
          currentStart: new Date(
            payload.subscription.entity.current_start * 1000
          ),
          currentEnd: new Date(
            payload.subscription.entity.current_end * 1000
          ),
        }
      );
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
  handleWebhook,
};