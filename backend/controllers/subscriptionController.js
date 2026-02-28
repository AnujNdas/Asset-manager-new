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
      key : tier.key,
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

const verifyPayment = async (req, res) => {
  try {
    const orgId = req.user.organizationId;

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

    // 🔐 Generate signature
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

    // 🔎 Find subscription in DB
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: razorpay_subscription_id,
      organizationId: orgId,
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    // 🚫 Prevent double activation
    if (subscription.status === "active") {
      return res.json({
        message: "Subscription already active",
      });
    }

    // 🟢 Activate subscription
    subscription.status = "active";
    subscription.currentStart = new Date();

    const end = new Date();

    if (subscription.billingCycle === "monthly") {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }

    subscription.currentEnd = end;
    subscription.lastPaymentId = razorpay_payment_id;

    await subscription.save();

    return res.json({
      success: true,
      message: "Subscription activated",
    });
  } catch (err) {
    console.error("Payment verification failed:", err);
    return res.status(500).json({
      message: "Verification process failed",
    });
  }
};
/* -----------------------------------------
   Create Razorpay Subscription
------------------------------------------ */
const createCheckout = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const { tierKey, billingCycle } = req.body;

    if (!tierKey || !billingCycle) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    if (!["base", "grow", "omni"].includes(tierKey)) {
      return res.status(400).json({ message: "Invalid tier" });
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ message: "Invalid billing cycle" });
    }

    const planId = getPlanId(tierKey, billingCycle);

    if (!planId) {
      return res.status(400).json({ message: "Invalid plan selection" });
    }

    // 🔎 Find existing org subscription (trial one)
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
        message: "Already on an active paid plan",
      });
    }

    // 🔥 Create Razorpay subscription
    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
      });

    // 📝 Update existing document
    subscription.razorpaySubscriptionId =
      razorpaySubscription.id;
    subscription.razorpayPlanId = planId;
    subscription.tier = tierKey;
    subscription.billingCycle = billingCycle;
    subscription.status = "created";

    await subscription.save();

    return res.json({
      success: true,
      subscriptionId: razorpaySubscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("Subscription creation error:", err);
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
const entity = parsedBody.payload.subscription?.entity;

if (!entity) {
  return res.status(200).json({ received: true });
}

const subscriptionId = entity.id;

const subscription = await Subscription.findOne({
  razorpaySubscriptionId: subscriptionId,
});

if (!subscription) {
  console.log("Subscription not found in DB");
  return res.status(200).json({ received: true });
}

/* -----------------------------------------
   ACTIVATION (First Payment Success)
------------------------------------------ */
if (event === "subscription.activated") {
  subscription.status = "active";
  subscription.currentStart = new Date(
    entity.current_start * 1000
  );
  subscription.currentEnd = new Date(
    entity.current_end * 1000
  );

  await subscription.save();
  console.log("✅ Subscription activated");
}

/* -----------------------------------------
   RECURRING PAYMENT SUCCESS
------------------------------------------ */
if (event === "subscription.charged") {
  subscription.status = "active";
  subscription.currentStart = new Date(
    entity.current_start * 1000
  );
  subscription.currentEnd = new Date(
    entity.current_end * 1000
  );

  await subscription.save();
  console.log("🔁 Subscription renewed");
}

/* -----------------------------------------
   CANCELLATION
------------------------------------------ */
if (event === "subscription.cancelled") {
  subscription.status = "cancelled";
  await subscription.save();
  console.log("❌ Subscription cancelled");
}

/* -----------------------------------------
   PAYMENT FAILURE
------------------------------------------ */
if (event === "payment.failed") {
  subscription.status = "past_due";
  await subscription.save();
  console.log("⚠️ Payment failed");
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
  verifyPayment,
};