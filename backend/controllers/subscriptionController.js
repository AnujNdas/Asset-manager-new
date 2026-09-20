const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const razorpayPlans = require("../config/razorpayPlans");
const pricingTiers = require("../config/pricingTiers");
const AffiliateReferral = require("../models/AffiliateReferral")
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
function getPlanId(
  tierKey,
  billingCycle,
  isAffiliate = false
) {

  // Affiliate plans are yearly only
  if (isAffiliate && billingCycle !== "yearly") {
    return null;
  }

  const planKey = isAffiliate
    ? "affiliateYearly"
    : billingCycle;

  const plan =
    razorpayPlans[tierKey]?.[planKey];

  if (!plan) return null;

  return isProduction
    ? plan.live
    : plan.test;
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
const getTiers = async (req, res) => {
  try {
    let isAffiliate = false;

    /* ==========================================
       AFFILIATE DETECTION
    ========================================== */

    const referralToken =
      req.signedCookies?.affiliate_ref;

    if (referralToken) {
      const affiliateReferral =
        await AffiliateReferral.findOne({
          referralToken,
          status: {
            $in: ["clicked", "signed_up"],
          },
          isFraud: false,
        });

      if (affiliateReferral) {
        isAffiliate = true;
      }
    }

    /* ==========================================
       RETURN PLANS
    ========================================== */

    const tiers = pricingTiers
      .filter((tier) => !tier.internal)
      .map((tier) => {

        if (isAffiliate) {

          const affiliatePlan =
            razorpayPlans[tier.key]?.affiliateYearly;

          return {
            id: tier.id,
            key: tier.key,
            name: tier.name,

            users: tier.users,
            assets: tier.assets,

            features: tier.features,
            popular: tier.popular,

            prices: {
              yearly: affiliatePlan?.price ?? null,
            },

            currency: tier.currency,

            isAffiliate: true,
            billingCycles: ["yearly"],
          };
        }

        return {
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

          isAffiliate: false,
          billingCycles: ["monthly", "yearly"],
        };
      });

    return res.json({
      success: true,
      isAffiliate,
      tiers,
    });

  } catch (error) {

    console.error(
      "Get pricing tiers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load pricing plans",
    });
  }
};
/* ------------------------------------------------
   Preview Price
------------------------------------------------ */

const previewPrice = async (req, res) => {
  try {

    const { tierId, billingCycle } = req.body;

    if (!tierId || !billingCycle) {
      return res.status(400).json({
        error: "tierId and billingCycle are required",
      });
    }

    /* ==========================================
       FIND TIER
    ========================================== */

    const tier = pricingTiers.find(
      (t) => t.key === tierId
    );

    if (!tier || tier.internal) {
      return res.status(400).json({
        error: "Invalid tier selected",
      });
    }

    /* ==========================================
       AFFILIATE DETECTION
    ========================================== */

    const orgId = req.user?.organizationId;
    const userId = req.user?.id;

    let affiliateReferral = null;
    let isAffiliate = false;

    const referralToken =
      req.signedCookies?.affiliate_ref;

    /* ------------------------------------------
       COOKIE + USER + ORGANIZATION
    ------------------------------------------ */

    if (referralToken && userId && orgId) {

      affiliateReferral =
        await AffiliateReferral.findOne({
          referralToken,
          referredUserId: userId,
          organizationId: orgId,
          status: "signed_up",
          isFraud: false,
        });

      if (affiliateReferral) {
        isAffiliate = true;
      }
    }

    /* ------------------------------------------
       FALLBACK
    ------------------------------------------ */

    if (!affiliateReferral && userId && orgId) {

      affiliateReferral =
        await AffiliateReferral.findOne({
          referredUserId: userId,
          organizationId: orgId,
          status: "signed_up",
          isFraud: false,
        }).sort({
          createdAt: -1,
        });

      if (affiliateReferral) {
        isAffiliate = true;
      }
    }

    /* ==========================================
       AFFILIATE BILLING RESTRICTION
    ========================================== */

    if (
      isAffiliate &&
      billingCycle !== "yearly"
    ) {
      return res.status(400).json({
        error:
          "Affiliate pricing is available only for yearly plans.",
      });
    }

    /* ==========================================
       SELECT ACTUAL PRICE
    ========================================== */

    const planKey = isAffiliate
      ? "affiliateYearly"
      : billingCycle;

    const selectedPlan =
      razorpayPlans[tierId]?.[planKey];

    if (!selectedPlan) {
      return res.status(400).json({
        error: isAffiliate
          ? "Affiliate yearly plan is not configured."
          : "Plan is not configured.",
      });
    }

    const amount = selectedPlan.price;

    const currency =
      tier.currency || "USD";

    /* ==========================================
       RESPONSE
    ========================================== */

    return res.json({
      success: true,

      isAffiliate,

      pricing: {
        tierId: tier.id,
        tierKey: tier.key,
        billingCycle,
        amount,
        currency,
      },
    });

  } catch (error) {

    console.error(
      "Preview price error:",
      error
    );

    return res.status(500).json({
      error: "Failed to calculate pricing preview",
    });
  }
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
    const userId = req.user?.id;

    const { tierKey, billingCycle } = req.body;

    console.log(`[${requestId}] Checkout started`, {
      orgId: String(orgId || ""),
      userId: String(userId || ""),
      tierKey,
      billingCycle,
      nodeEnv: process.env.NODE_ENV,
      isProduction,
    });

    /* ==========================================
       VALIDATION
    ========================================== */

    if (!orgId) {
      return res.status(401).json({
        message: "Organization information is missing",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User information is missing",
      });
    }

    if (!tierKey || !billingCycle) {
      return res.status(400).json({
        message: "Missing parameters",
      });
    }


    /* ==========================================
       AFFILIATE DETECTION
    ========================================== */

    let affiliateReferral = null;
    let isAffiliate = false;

    const referralToken =
      req.signedCookies?.affiliate_ref;

    if (referralToken) {
      affiliateReferral =
        await AffiliateReferral.findOne({
          referralToken,
          referredUserId: userId,
          organizationId: orgId,
          status: "signed_up",
          isFraud: false,
        });

      if (affiliateReferral) {
        isAffiliate = true;
      }
    }


    /* ==========================================
       FALLBACK AFFILIATE DETECTION
    ========================================== */

    if (!affiliateReferral) {
      affiliateReferral =
        await AffiliateReferral.findOne({
          referredUserId: userId,
          organizationId: orgId,
          status: "signed_up",
          isFraud: false,
        }).sort({
          createdAt: -1,
        });

      if (affiliateReferral) {
        isAffiliate = true;
      }
    }


    console.log(
      `[${requestId}] Affiliate checkout detection`,
      {
        userId: String(userId),
        orgId: String(orgId),
        isAffiliate,
        affiliateReferralId:
          affiliateReferral
            ? String(affiliateReferral._id)
            : null,
        affiliateCode:
          affiliateReferral?.affiliateCode || null,
        billingCycle,
        tierKey,
      }
    );


    /* ==========================================
       AFFILIATE BILLING RESTRICTION
    ========================================== */

    if (
      isAffiliate &&
      billingCycle !== "yearly"
    ) {
      return res.status(400).json({
        message:
          "Affiliate pricing is available only for yearly plans.",
      });
    }


    /* ==========================================
       FIND PRICING TIER
    ========================================== */

    const tier = pricingTiers.find(
      (t) => t.key === tierKey
    );

    if (!tier) {
      console.error(
        `[${requestId}] Pricing tier not found`,
        {
          tierKey,
        }
      );

      return res.status(400).json({
        message: "Invalid tier",
      });
    }


    /* ==========================================
       RESOLVE RAZORPAY PLAN
    ========================================== */

    const planKey = isAffiliate
      ? "affiliateYearly"
      : billingCycle;

    const selectedPlan =
      razorpayPlans[tierKey]?.[planKey];

    if (!selectedPlan) {
      console.error(
        `[${requestId}] Razorpay plan configuration missing`,
        {
          tierKey,
          billingCycle,
          isAffiliate,
          planKey,
        }
      );

      return res.status(400).json({
        message: isAffiliate
          ? "Affiliate yearly plan is not configured."
          : "Invalid plan selection",
      });
    }


    const planId = getPlanId(
      tierKey,
      billingCycle,
      isAffiliate
    );

    if (!planId) {
      console.error(
        `[${requestId}] Razorpay plan ID missing`,
        {
          tierKey,
          billingCycle,
          isAffiliate,
          planKey,
          isProduction,
        }
      );

      return res.status(400).json({
        message: isAffiliate
          ? "Affiliate yearly plan is not configured for this environment."
          : "Invalid plan selection",
      });
    }


    /* ==========================================
       ACTUAL PLAN PRICE
    ========================================== */

    const amount = selectedPlan.price;

    const currency =
      tier.currency || "USD";

    if (
      amount === undefined ||
      amount === null
    ) {
      return res.status(400).json({
        message:
          "Plan price is not configured",
      });
    }


    console.log(
      `[${requestId}] Resolved checkout plan`,
      {
        tierKey,
        billingCycle,
        isAffiliate,
        planKey,
        planId,
        amount,
        currency,
      }
    );


    /* ==========================================
       FIND CURRENT SUBSCRIPTION
    ========================================== */

    const subscription =
      await Subscription.findOne({
        organizationId: orgId,
      });

    if (!subscription) {
      console.error(
        `[${requestId}] Database subscription not found`,
        {
          orgId: String(orgId),
        }
      );

      return res.status(404).json({
        message: "Subscription not found",
      });
    }


    /* ==========================================
       EXISTING SUBSCRIPTION STATE
    ========================================== */

    console.log(
      `[${requestId}] Existing subscription state`,
      {
        dbSubscriptionId:
          String(subscription._id),

        currentTier:
          subscription.tier,

        currentBillingCycle:
          subscription.billingCycle,

        currentStatus:
          subscription.status,

        currentRazorpaySubscriptionId:
          subscription.razorpaySubscriptionId ||
          null,

        hasPendingUpgrade:
          Boolean(
            subscription.pendingUpgrade
          ),

        pendingUpgradeId:
          subscription.pendingUpgrade
            ?.razorpaySubscriptionId ||
          null,

        pendingUpgradeTier:
          subscription.pendingUpgrade
            ?.tier ||
          null,

        pendingUpgradeBillingCycle:
          subscription.pendingUpgrade
            ?.billingCycle ||
          null,
      }
    );


    /* ==========================================
       PREVENT DUPLICATE CHECKOUT
    ========================================== */

    if (
      subscription.pendingUpgrade
        ?.razorpaySubscriptionId
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
        message:
          "Upgrade already in progress",
      });
    }


    /* ==========================================
       CREATE RAZORPAY SUBSCRIPTION
    ========================================== */

    const totalCount =
      billingCycle === "monthly"
        ? 60
        : 5;

    console.log(
      `[${requestId}] Creating Razorpay subscription`,
      {
        planId,
        tierKey,
        billingCycle,
        isAffiliate,
        totalCount,
      }
    );


    console.log(
      `[${requestId}] Final Razorpay configuration`,
      {
        nodeEnv:
          process.env.NODE_ENV,

        isProduction,

        selectedPlanId:
          planId,

        tierKey,

        billingCycle,

        isAffiliate,

        planKey,

        keyId:
          process.env.RAZORPAY_KEY_ID
            ? `${process.env.RAZORPAY_KEY_ID.slice(
                0,
                10
              )}...`
            : null,

        keySecretLoaded:
          Boolean(
            process.env.RAZORPAY_SECRET
          ),
      }
    );


    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: planId,

        customer_notify: 1,

        total_count: totalCount,
      });


    console.log(
      `[${requestId}] Razorpay subscription created`,
      {
        razorpaySubscriptionId:
          razorpaySubscription.id,

        razorpayStatus:
          razorpaySubscription.status,

        razorpayPlanId:
          razorpaySubscription.plan_id,

        razorpayCurrentStart:
          razorpaySubscription.current_start ||
          null,

        razorpayCurrentEnd:
          razorpaySubscription.current_end ||
          null,
      }
    );


    /* ==========================================
       SAVE PENDING UPGRADE
    ========================================== */

    subscription.pendingUpgrade = {
      tier: tierKey,

      billingCycle,

      razorpayPlanId:
        planId,

      razorpaySubscriptionId:
        razorpaySubscription.id,

      planPrice:
        amount,

      currency,
    };

    await subscription.save();


    console.log(
      `[${requestId}] Pending upgrade saved`,
      {
        dbSubscriptionId:
          String(subscription._id),

        pendingUpgrade:
          subscription.pendingUpgrade
            ?.razorpaySubscriptionId,

        pendingTier:
          subscription.pendingUpgrade
            ?.tier,

        pendingBillingCycle:
          subscription.pendingUpgrade
            ?.billingCycle,

        pendingPlanPrice:
          subscription.pendingUpgrade
            ?.planPrice,

        isAffiliate,
      }
    );


    /* ==========================================
       UPDATE AFFILIATE REFERRAL
    ========================================== */

    if (affiliateReferral) {
      affiliateReferral.planName =
        tier.name;

      affiliateReferral.billingCycle =
        billingCycle;

      affiliateReferral.paymentAmount =
        amount;

      affiliateReferral.paymentCurrency =
        currency;

      await affiliateReferral.save();

      console.log(
        `[${requestId}] Affiliate referral updated`,
        {
          referralId:
            String(
              affiliateReferral._id
            ),

          affiliateCode:
            affiliateReferral.affiliateCode,

          planName:
            affiliateReferral.planName,

          billingCycle:
            affiliateReferral.billingCycle,

          paymentAmount:
            affiliateReferral.paymentAmount,
        }
      );
    }


    /* ==========================================
       RESPONSE
    ========================================== */

    return res.json({
      success: true,

      subscriptionId:
        razorpaySubscription.id,

      razorpayKey:
        process.env.RAZORPAY_KEY_ID,

      isAffiliate,

      billingCycle,

      tierKey,
    });

  } catch (err) {

    console.error(
      `[${requestId}] Checkout failed - FULL ERROR:`
    );

    console.dir(err, {
      depth: null,
    });

    console.error(
      `[${requestId}] Checkout error details:`,
      {
        typeofError:
          typeof err,

        stringifiedError:
          JSON.stringify(
            err,
            null,
            2
          ),

        name:
          err?.name,

        message:
          err?.message,

        error:
          err?.error,

        description:
          err?.description,

        code:
          err?.code,

        statusCode:
          err?.statusCode,

        response:
          err?.response,

        responseData:
          err?.response?.data,

        stack:
          err?.stack,
      }
    );

    return res.status(500).json({
      message:
        "Subscription creation failed",

      error:
        process.env.NODE_ENV ===
        "development"
          ? err?.error?.description ||
            err?.description ||
            err?.message ||
            "Unknown Razorpay error"
          : undefined,
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

    console.log("📦 Raw webhook body:", req.body.toString("utf8"));

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

const parsedBody = JSON.parse(req.body.toString("utf8"));

console.log(
  "📦 Parsed webhook payload:",
  JSON.stringify(parsedBody, null, 2)
);

// --------------------------------------------------
// Extract webhook data before using the variables
// --------------------------------------------------

event = parsedBody.event || null;

const subscriptionEntity =
  parsedBody.payload?.subscription?.entity || null;

const paymentEntity =
  parsedBody.payload?.payment?.entity || null;

const orderEntity =
  parsedBody.payload?.order?.entity || null;

const invoiceEntity =
  parsedBody.payload?.invoice?.entity || null;

// Some events contain the subscription directly.
// invoice.paid contains it inside invoice.entity.subscription_id.
const razorpaySubscriptionId =
  subscriptionEntity?.id ||
  invoiceEntity?.subscription_id ||
  null;

// Razorpay payloads may not contain parsedBody.id.
// Use a deterministic fallback for now.
eventId =
  parsedBody.id ||
  `${event}:${razorpaySubscriptionId || "unknown"}:${parsedBody.created_at}`;

// Diagnostic logging
console.log("Webhook identifiers:", {
  topLevelId: parsedBody.id || null,
  event,
  subscriptionId: razorpaySubscriptionId,
  paymentId: paymentEntity?.id || null,
  invoiceId: invoiceEntity?.id || null,
  createdAt: parsedBody.created_at || null,
});

console.log(`[${requestId}] Webhook event information`, {
  event,
  eventId,
  hasSubscriptionEntity: Boolean(subscriptionEntity),
  subscriptionId: razorpaySubscriptionId,
  subscriptionStatus: subscriptionEntity?.status || null,
  hasPaymentEntity: Boolean(paymentEntity),
  paymentId: paymentEntity?.id || null,
  paymentStatus: paymentEntity?.status || null,
});
if (!eventId) {
  console.error(`[${requestId}] Unable to create webhook event ID`);
  return res.status(400).json({
    success: false,
    message: "Unable to identify webhook event",
  });
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

if (!razorpaySubscriptionId) {
  console.warn(
    `[${requestId}] No subscription ID found in webhook`,
    { event }
  );

  await markWebhookProcessed(eventId);

  return res.status(200).json({
    received: true,
    ignored: true,
    reason: "No subscription ID found",
    event,
  });
}
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

    if (event === "invoice.paid") {
  console.log(`[${requestId}] Invoice paid successfully`, {
    invoiceId: invoiceEntity?.id || null,
    paymentId: paymentEntity?.id || null,
    subscriptionId: razorpaySubscriptionId,
  });

  // Acknowledge the event.
  // Do not add to totalPaid here if subscription.charged
  // also performs that accounting, or payment may be counted twice.
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