const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const razorpayPlans = require("../config/razorpayPlans");
const pricingTiers = require("../config/pricingTiers");
const Subscription = require("../models/Subscription");
const RazorpayWebhookEvent = require(
  "../models/RazorpayWebhookEvent"
);
const processAffiliateConversion = require("../utils/processAffiliateConversion");
const isProduction = process.env.NODE_ENV === "production";
const {
  createSubscriptionHistory,
} = require("../utils/SubscriptionHistory");
/* ------------------------------------------------
   Utility: Resolve Razorpay Plan ID
------------------------------------------------ */
function getPlanId(tierKey, billingCycle) {
  const plan = razorpayPlans[tierKey]?.[billingCycle];
  if (!plan) return null;
  return isProduction ? plan.live : plan.test;
}


/* ------------------------------------------------
   Utility: Resolve Plan Price
------------------------------------------------ */
function getPlanPrice(tierKey, billingCycle) {
  const tier = pricingTiers.find(
    (t) => t.key === tierKey
  );

  if (!tier) return 0;

  return billingCycle === "yearly"
    ? tier.priceYearly
    : tier.priceMonthly;
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
  const requestId = `checkout-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    const orgId = req.user?.organizationId;
    const { tierKey, billingCycle } = req.body;

    console.log(`[${requestId}] Checkout started`, {
      orgId: String(orgId || ""),
      tierKey,
      billingCycle,
      nodeEnv: process.env.NODE_ENV,
      isProduction,
    });

    if (!orgId) {
      console.error(`[${requestId}] Missing organizationId in user`);
      return res.status(401).json({
        message: "Organization information is missing",
      });
    }

    if (!tierKey || !billingCycle) {
      console.warn(`[${requestId}] Missing checkout parameters`, {
        tierKey,
        billingCycle,
      });

      return res.status(400).json({
        message: "Missing parameters",
      });
    }

    const planId = getPlanId(tierKey, billingCycle);

    console.log(`[${requestId}] Resolved Razorpay plan`, {
      tierKey,
      billingCycle,
      planId,
      planIdFound: Boolean(planId),
    });

    if (!planId) {
      console.error(`[${requestId}] Invalid Razorpay plan selection`, {
        tierKey,
        billingCycle,
      });

      return res.status(400).json({
        message: "Invalid plan selection",
      });
    }

    const tier = pricingTiers.find(
      (t) => t.key === tierKey
    );

    if (!tier) {
      console.error(`[${requestId}] Pricing tier not found`, {
        tierKey,
      });

      return res.status(400).json({
        message: "Invalid tier",
      });
    }

    const amount =
      billingCycle === "yearly"
        ? tier.priceYearly
        : tier.priceMonthly;

    const currency = tier.currency || "USD";

    const subscription = await Subscription.findOne({
      organizationId: orgId,
    });

    if (!subscription) {
      console.error(`[${requestId}] Database subscription not found`, {
        orgId: String(orgId),
      });

      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    console.log(`[${requestId}] Existing subscription state`, {
      dbSubscriptionId: String(subscription._id),
      currentTier: subscription.tier,
      currentBillingCycle: subscription.billingCycle,
      currentStatus: subscription.status,
      currentRazorpaySubscriptionId:
        subscription.razorpaySubscriptionId || null,
      hasPendingUpgrade: Boolean(
        subscription.pendingUpgrade
      ),
      pendingUpgradeId:
        subscription.pendingUpgrade
          ?.razorpaySubscriptionId || null,
      pendingUpgradeTier:
        subscription.pendingUpgrade?.tier || null,
      pendingUpgradeBillingCycle:
        subscription.pendingUpgrade?.billingCycle || null,
    });

    if (
      subscription.pendingUpgrade?.razorpaySubscriptionId
    ) {
      console.warn(
        `[${requestId}] Duplicate pending upgrade blocked`,
        {
          pendingUpgradeId:
            subscription.pendingUpgrade
              .razorpaySubscriptionId,
        }
      );

      return res.status(400).json({
        message: "Upgrade already in progress",
      });
    }

    console.log(`[${requestId}] Creating Razorpay subscription`, {
      planId,
      tierKey,
      billingCycle,
      totalCount:
        billingCycle === "monthly" ? 60 : 5,
    });

    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count:
          billingCycle === "monthly" ? 60 : 5,
      });

    console.log(`[${requestId}] Razorpay subscription created`, {
      razorpaySubscriptionId:
        razorpaySubscription.id,
      razorpayStatus:
        razorpaySubscription.status,
      razorpayPlanId:
        razorpaySubscription.plan_id,
      razorpayCurrentStart:
        razorpaySubscription.current_start || null,
      razorpayCurrentEnd:
        razorpaySubscription.current_end || null,
    });

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

    console.log(`[${requestId}] Pending upgrade saved`, {
      dbSubscriptionId: String(subscription._id),
      pendingUpgrade:
        subscription.pendingUpgrade
          ?.razorpaySubscriptionId,
      pendingTier:
        subscription.pendingUpgrade?.tier,
      pendingBillingCycle:
        subscription.pendingUpgrade?.billingCycle,
    });

    return res.json({
      success: true,
      subscriptionId: razorpaySubscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(
      `[${requestId}] Checkout failed`,
      {
        name: err.name,
        message: err.message,
        stack: err.stack,
      }
    );

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
  const requestId = `verify-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    console.log(`[${requestId}] Payment verification started`, {
      hasPaymentId: Boolean(razorpay_payment_id),
      hasSubscriptionId: Boolean(
        razorpay_subscription_id
      ),
      hasSignature: Boolean(razorpay_signature),
      subscriptionId:
        razorpay_subscription_id || null,
    });

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      console.warn(
        `[${requestId}] Missing verification parameters`
      );

      return res.status(400).json({
        message: "Missing verification parameters",
      });
    }

    const razorpaySecret = process.env.RAZORPAY_SECRET;

    console.log(`[${requestId}] Razorpay secret status`, {
      secretLoaded: Boolean(razorpaySecret),
    });

    if (!razorpaySecret) {
      console.error(
        `[${requestId}] RAZORPAY_SECRET is missing`
      );

      return res.status(500).json({
        message:
          "Payment verification configuration is missing",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(
        `${razorpay_payment_id}|${razorpay_subscription_id}`
      )
      .digest("hex");

    const signatureMatches =
      generatedSignature === razorpay_signature;

    console.log(`[${requestId}] Signature comparison completed`, {
      signatureMatches,
      paymentId: razorpay_payment_id,
      subscriptionId: razorpay_subscription_id,
    });

    if (!signatureMatches) {
      console.error(
        `[${requestId}] Invalid payment signature`
      );

      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const subscription = await Subscription.findOne({
      $or: [
        {
          razorpaySubscriptionId:
            razorpay_subscription_id,
        },
        {
          "pendingUpgrade.razorpaySubscriptionId":
            razorpay_subscription_id,
        },
      ],
    }).lean();

    console.log(`[${requestId}] Database lookup after verification`, {
      subscriptionFound: Boolean(subscription),
      dbSubscriptionId:
        subscription?._id
          ? String(subscription._id)
          : null,
      currentTier: subscription?.tier || null,
      currentStatus: subscription?.status || null,
      pendingUpgradeId:
        subscription?.pendingUpgrade
          ?.razorpaySubscriptionId || null,
      pendingUpgradeTier:
        subscription?.pendingUpgrade?.tier || null,
    });

    return res.json({
      success: true,
      message: "Payment verified. Awaiting activation.",
    });
  } catch (err) {
    console.error(`[${requestId}] Verification failed`, {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

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
    await createSubscriptionHistory({
  subscription,
  eventType: "cancellation_scheduled",
  notes:
    "Auto-pay cancelled. Subscription remains active until the current billing period ends.",
});
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
   Utility: Mark Razorpay Webhook as Processed
------------------------------------------------ */
async function markWebhookProcessed(eventId) {
  await RazorpayWebhookEvent.updateOne(
    { eventId },
    {
      $set: {
        status: "processed",
        processedAt: new Date(),
      },
    }
  );
}


/* ------------------------------------------------
   Razorpay Webhook (Single Source of Truth)
------------------------------------------------ */
const handleWebhook = async (req, res) => {
  const requestId = `webhook-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  let eventId = null;
  let event = null;

  try {
    console.log(
      `\n========== [${requestId}] WEBHOOK STARTED ==========`
    );

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature =
      req.headers["x-razorpay-signature"];

    console.log(`[${requestId}] Webhook configuration`, {
      secretLoaded: Boolean(webhookSecret),
      signatureReceived: Boolean(signature),
      bodyType: typeof req.body,
      bodyIsBuffer: Buffer.isBuffer(req.body),
      bodyLength: req.body?.length || 0,
    });

    if (!webhookSecret) {
      console.error(
        `[${requestId}] RAZORPAY_WEBHOOK_SECRET is missing`
      );

      return res.status(500).send(
        "Webhook secret is not configured"
      );
    }

    if (!signature) {
      console.error(
        `[${requestId}] Webhook signature header missing`
      );

      return res.status(400).send(
        "Webhook signature missing"
      );
    }

    if (!Buffer.isBuffer(req.body)) {
      console.error(
        `[${requestId}] req.body is not a raw Buffer`
      );

      return res.status(400).send(
        "Webhook body must be received as raw bytes"
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const signatureMatches =
      signature === expectedSignature;

    console.log(`[${requestId}] Webhook signature result`, {
      signatureMatches,
    });

    if (!signatureMatches) {
      console.error(
        `[${requestId}] Webhook signature mismatch`
      );

      return res.status(400).send(
        "Invalid signature"
      );
    }

    console.log(
      `[${requestId}] Webhook signature verified`
    );

    const parsedBody = JSON.parse(
      req.body.toString("utf8")
    );

    event = parsedBody.event;
    eventId = parsedBody.id;

    const subscriptionEntity =
      parsedBody.payload?.subscription?.entity || null;

    const paymentEntity =
      parsedBody.payload?.payment?.entity || null;

    console.log(`[${requestId}] Webhook event information`, {
      event,
      eventId,
      hasSubscriptionEntity: Boolean(
        subscriptionEntity
      ),
      subscriptionId:
        subscriptionEntity?.id || null,
      subscriptionStatus:
        subscriptionEntity?.status || null,
      hasPaymentEntity: Boolean(paymentEntity),
      paymentId: paymentEntity?.id || null,
      paymentStatus:
        paymentEntity?.status || null,
    });

    if (!eventId) {
      console.error(
        `[${requestId}] Webhook event ID missing`
      );

      return res.status(400).send(
        "Webhook event ID missing"
      );
    }

    const existingEvent =
      await RazorpayWebhookEvent.findOne({
        eventId,
      }).lean();

    if (existingEvent) {
      console.log(
        `[${requestId}] Existing webhook event found`,
        {
          eventId,
          previousStatus: existingEvent.status,
          previousProcessedAt:
            existingEvent.processedAt || null,
        }
      );

      if (existingEvent.status === "processed") {
        console.log(
          `[${requestId}] Webhook already processed`
        );

        return res.status(200).json({
          received: true,
          duplicate: true,
        });
      }
    }

    try {
      await RazorpayWebhookEvent.create({
        eventId,
        event,
        status: "processing",
      });

      console.log(
        `[${requestId}] Webhook event marked as processing`
      );
    } catch (error) {
      if (error.code === 11000) {
        console.warn(
          `[${requestId}] Concurrent duplicate webhook`
        );

        return res.status(200).json({
          received: true,
          duplicate: true,
        });
      }

      throw error;
    }

    // --------------------------------------------------
    // Only subscription events have subscription.entity
    // --------------------------------------------------

    if (!subscriptionEntity) {
      console.warn(
        `[${requestId}] No subscription entity found`,
        {
          event,
          paymentId: paymentEntity?.id || null,
        }
      );

      await markWebhookProcessed(eventId);

      return res.status(200).json({
        received: true,
        ignored: true,
        reason: "No subscription entity found",
        event,
      });
    }

    const razorpaySubscriptionId =
      subscriptionEntity.id;

    console.log(`[${requestId}] Looking up database subscription`, {
      razorpaySubscriptionId,
    });

    const subscription =
      await Subscription.findOne({
        $or: [
          {
            razorpaySubscriptionId:
              razorpaySubscriptionId,
          },
          {
            "pendingUpgrade.razorpaySubscriptionId":
              razorpaySubscriptionId,
          },
        ],
      });

    if (!subscription) {
      console.error(
        `[${requestId}] Database subscription not found`,
        {
          razorpaySubscriptionId,
          event,
        }
      );

      await markWebhookProcessed(eventId);

      return res.status(200).json({
        received: true,
        ignored: true,
        reason: "Subscription not found",
      });
    }

    console.log(`[${requestId}] Database subscription found`, {
      dbSubscriptionId: String(subscription._id),
      currentTier: subscription.tier,
      currentBillingCycle:
        subscription.billingCycle,
      currentStatus: subscription.status,
      currentRazorpaySubscriptionId:
        subscription.razorpaySubscriptionId || null,
      pendingUpgradeId:
        subscription.pendingUpgrade
          ?.razorpaySubscriptionId || null,
      pendingUpgradeTier:
        subscription.pendingUpgrade?.tier || null,
      pendingUpgradeBillingCycle:
        subscription.pendingUpgrade?.billingCycle || null,
    });

    // ==================================================
    // ACTIVATION
    // ==================================================

    if (event === "subscription.activated") {
      console.log(
        `[${requestId}] Processing subscription.activated`
      );

      if (subscription.pendingUpgrade) {
        const pendingUpgrade =
          subscription.pendingUpgrade;

        console.log(
          `[${requestId}] Applying pending upgrade`,
          {
            pendingTier: pendingUpgrade.tier,
            pendingBillingCycle:
              pendingUpgrade.billingCycle,
            pendingRazorpaySubscriptionId:
              pendingUpgrade.razorpaySubscriptionId,
            pendingPlanPrice:
              pendingUpgrade.planPrice,
            pendingCurrency:
              pendingUpgrade.currency,
          }
        );

        subscription.tier = pendingUpgrade.tier;
        subscription.billingCycle =
          pendingUpgrade.billingCycle;

        subscription.razorpaySubscriptionId =
          pendingUpgrade.razorpaySubscriptionId;

        subscription.razorpayPlanId =
          pendingUpgrade.razorpayPlanId;

        subscription.planPrice =
          pendingUpgrade.planPrice || 0;

        subscription.currency =
          pendingUpgrade.currency || "USD";

        subscription.lastPaymentAmount =
          pendingUpgrade.planPrice || 0;

        subscription.lastPaymentDate = new Date();

        subscription.totalPaid =
          (subscription.totalPaid || 0) +
          (pendingUpgrade.planPrice || 0);

        subscription.pendingUpgrade = null;
      } else {
        console.warn(
          `[${requestId}] Activation received without pendingUpgrade`
        );

        const planPrice = getPlanPrice(
          subscription.tier,
          subscription.billingCycle
        );

        subscription.planPrice = planPrice;
        subscription.currency =
          subscription.currency || "USD";
      }

      subscription.status = "active";

      if (
        subscriptionEntity.current_start
      ) {
        subscription.currentStart = new Date(
          subscriptionEntity.current_start * 1000
        );
      }

      if (
        subscriptionEntity.current_end
      ) {
        subscription.currentEnd = new Date(
          subscriptionEntity.current_end * 1000
        );
      }

      subscription.pastDueAt = null;

      await subscription.save();

      console.log(
        `[${requestId}] Subscription activated and saved`,
        {
          dbSubscriptionId: String(subscription._id),
          tier: subscription.tier,
          billingCycle:
            subscription.billingCycle,
          status: subscription.status,
          razorpaySubscriptionId:
            subscription.razorpaySubscriptionId,
          pendingUpgradeCleared:
            !subscription.pendingUpgrade,
        }
      );

      await createSubscriptionHistory({
        subscription,
        eventType: "activated",
        notes:
          subscription.tier === "trial"
            ? "Trial subscription activated."
            : `Subscription activated on ${subscription.tier} plan.`,
      });

      if (
        subscription.tier !== "trial" &&
        subscription.status === "active"
      ) {
        await processAffiliateConversion(
          subscription
        );
      }
    }

    // ==================================================
    // RENEWAL
    // ==================================================

    if (event === "subscription.charged") {
      console.log(
        `[${requestId}] Processing subscription.charged`
      );

      subscription.status = "active";

      if (subscriptionEntity.current_start) {
        subscription.currentStart = new Date(
          subscriptionEntity.current_start * 1000
        );
      }

      if (subscriptionEntity.current_end) {
        subscription.currentEnd = new Date(
          subscriptionEntity.current_end * 1000
        );
      }

      subscription.pastDueAt = null;
      subscription.lastPaymentDate = new Date();

      subscription.lastPaymentAmount =
        subscription.planPrice || 0;

      subscription.totalPaid =
        (subscription.totalPaid || 0) +
        (subscription.planPrice || 0);

      await subscription.save();

      console.log(
        `[${requestId}] Renewal saved`,
        {
          dbSubscriptionId: String(subscription._id),
          status: subscription.status,
          currentEnd:
            subscription.currentEnd || null,
        }
      );

      await createSubscriptionHistory({
        subscription,
        eventType: "renewed",
        notes: `Subscription renewed successfully for ${
          subscription.tier
        } ${subscription.billingCycle || ""}.`,
      });
    }

    // ==================================================
    // CANCELLATION
    // ==================================================

    if (event === "subscription.cancelled") {
      console.log(
        `[${requestId}] Processing subscription.cancelled`
      );

      subscription.status = "cancelled";
      subscription.cancelAtPeriodEnd = false;

      await subscription.save();

      console.log(
        `[${requestId}] Cancellation saved`
      );

      await createSubscriptionHistory({
        subscription,
        eventType: "cancelled",
        notes: "Subscription cancelled by Razorpay.",
      });
    }

    // ==================================================
    // PAYMENT FAILURE
    // ==================================================

    if (event === "payment.failed") {
      console.log(
        `[${requestId}] Processing payment.failed`
      );

      /*
       * This event usually contains payment.entity,
       * not subscription.entity. Since this handler currently
       * requires subscriptionEntity above, payment.failed
       * will be ignored unless separately mapped.
       */

      console.warn(
        `[${requestId}] payment.failed requires separate payment lookup`
      );
    }

    await markWebhookProcessed(eventId);

    console.log(`[${requestId}] Webhook marked as processed`);

    console.log(
      `========== [${requestId}] WEBHOOK COMPLETE ==========\n`
    );

    return res.status(200).json({
      received: true,
    });
  } catch (err) {
    console.error(
      `[${requestId}] Webhook processing failed`,
      {
        eventId,
        event,
        name: err.name,
        message: err.message,
        stack: err.stack,
      }
    );

    /*
     * Do not mark the event as processed if processing failed.
     * Razorpay can retry the webhook.
     */

    return res.status(500).send(
      "Webhook processing failed"
    );
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