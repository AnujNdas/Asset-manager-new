const AffiliateReferral = require("../models/AffiliateReferral")
const processAffiliateConversion = async (
  subscription,
  paymentEntity = null
) => {
  try {
    console.log(
      "========== AFFILIATE CONVERSION START =========="
    );

    console.log("Subscription:", {
      id: String(subscription._id),
      organizationId: String(subscription.organizationId),
      tier: subscription.tier,
      billingCycle: subscription.billingCycle,
      razorpaySubscriptionId:
        subscription.razorpaySubscriptionId,
      lastPaymentAmount:
        subscription.lastPaymentAmount,
      planPrice:
        subscription.planPrice,
    });

    /* ==========================================
       FIND REFERRAL
    ========================================== */

    const referral =
      await AffiliateReferral.findOne({
        organizationId:
          subscription.organizationId,

        status: "signed_up",

        isFraud: false,
      });

    if (!referral) {
      console.log(
        "No eligible affiliate referral found"
      );

      return;
    }

    console.log(
      "Affiliate referral found:",
      {
        referralId: String(referral._id),
        affiliateCode:
          referral.affiliateCode,
        referredUserId:
          String(referral.referredUserId),
      }
    );

    /* ==========================================
       PAYMENT INFO
    ========================================== */

    let amountPaid = 0;

    let currency =
      subscription.currency || "USD";

    /*
     * Razorpay amount is stored in the
     * smallest currency unit.
     *
     * Example:
     * 27000 -> 270 USD
     */

    if (
      paymentEntity &&
      paymentEntity.amount != null
    ) {
      amountPaid =
        Number(paymentEntity.amount) / 100;

      currency =
        paymentEntity.currency ||
        currency;
    }

    /*
     * Fallback to DB values
     */

    if (amountPaid <= 0) {
      amountPaid =
        Number(
          subscription.lastPaymentAmount ||
          subscription.planPrice ||
          0
        );
    }

    if (amountPaid <= 0) {
      console.log(
        "No payment amount found for affiliate conversion"
      );

      return;
    }

    console.log(
      "Affiliate payment:",
      {
        amountPaid,
        currency,
      }
    );

    /* ==========================================
       COMMISSION RATE
    ========================================== */

    const tier =
      String(subscription.tier || "")
        .toLowerCase();

    let commissionRate = 0;

    switch (tier) {
      case "base":
        commissionRate = 0.05;
        break;

      case "grow":
        commissionRate = 0.05;
        break;

      case "omni":
        commissionRate = 0.10;
        break;

      default:
        commissionRate = 0;
    }

    const commissionAmount =
      Number(
        (
          amountPaid *
          commissionRate
        ).toFixed(2)
      );

    console.log(
      "Affiliate commission calculated:",
      {
        tier,
        commissionRate:
          commissionRate * 100,
        amountPaid,
        commissionAmount,
      }
    );

    /* ==========================================
       UPDATE REFERRAL
    ========================================== */

    referral.status =
      "converted";

    referral.convertedAt =
      new Date();

    /*
     * IMPORTANT:
     * Store Razorpay subscription ID,
     * NOT MongoDB Subscription _id.
     */

    referral.subscriptionId =
      subscription.razorpaySubscriptionId;

    referral.planName =
      subscription.tier;

    referral.billingCycle =
      subscription.billingCycle;

    referral.paymentAmount =
      amountPaid;

    referral.paymentCurrency =
      currency;

    referral.commissionRate =
      commissionRate * 100;

    referral.commissionAmount =
      commissionAmount;

    referral.commissionStatus =
      "pending";

    referral.lastPaymentDate =
      new Date();

    await referral.save();

    console.log(
      "========== AFFILIATE CONVERSION COMPLETED ==========",
      {
        referralId:
          String(referral._id),

        affiliateCode:
          referral.affiliateCode,

        subscriptionId:
          referral.subscriptionId,

        tier:
          referral.planName,

        billingCycle:
          referral.billingCycle,

        paymentAmount:
          referral.paymentAmount,

        commissionRate:
          referral.commissionRate,

        commissionAmount:
          referral.commissionAmount,

        currency:
          referral.paymentCurrency,
      }
    );

  } catch (error) {
    console.error(
      "Affiliate conversion failed:",
      error
    );
  }
};

module.exports = {
  processAffiliateConversion,
};