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
       FIND + CLAIM REFERRAL
       
       IMPORTANT:
       Only a "signed_up" referral can be
       converted.

       Once converted, it will never be
       eligible for another commission.
    ========================================== */

    const referral =
      await AffiliateReferral.findOneAndUpdate(
        {
          organizationId:
            subscription.organizationId,

          status: "signed_up",

          isFraud: false,
        },
        {
          $set: {
            status: "processing",
          },
        },
        {
          new: true,
        }
      );

    if (!referral) {
      console.log(
        "No eligible affiliate referral found."
      );

      return;
    }

    console.log(
      "Affiliate referral claimed:",
      {
        referralId:
          String(referral._id),

        affiliateCode:
          referral.affiliateCode,

        referredUserId:
          String(referral.referredUserId),

        status:
          referral.status,
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
     *
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

      /*
       * No valid payment was found.
       *
       * Return referral to signed_up so that
       * a later valid payment can process it.
       */

      await AffiliateReferral.updateOne(
        {
          _id: referral._id,
          status: "processing",
        },
        {
          $set: {
            status: "signed_up",
          },
        }
      );

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
        commissionRate = 0.05; // 5%
        break;

      case "grow":
        commissionRate = 0.10; // 10%
        break;

      case "omni":
        commissionRate = 0.15; // 15%
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
       FINALIZE REFERRAL
    ========================================== */

    const result =
      await AffiliateReferral.updateOne(
        {
          _id: referral._id,

          /*
           * Only the process that successfully
           * claimed this referral may finalize it.
           */

          status: "processing",
        },
        {
          $set: {

            status: "converted",

            convertedAt:
              new Date(),

            /*
             * Store Razorpay subscription ID,
             * NOT MongoDB Subscription _id.
             */

            subscriptionId:
              subscription.razorpaySubscriptionId,

            planName:
              subscription.tier,

            billingCycle:
              subscription.billingCycle,

            paymentAmount:
              amountPaid,

            paymentCurrency:
              currency,

            commissionRate:
              commissionRate * 100,

            commissionAmount:
              commissionAmount,

            commissionStatus:
              "pending",

            lastPaymentDate:
              new Date(),
          },
        }
      );

    /* ==========================================
       FINALIZATION CHECK
    ========================================== */

    if (result.modifiedCount !== 1) {
      console.warn(
        "Affiliate referral could not be finalized."
      );

      return;
    }

    console.log(
      "========== AFFILIATE CONVERSION COMPLETED ==========",
      {
        referralId:
          String(referral._id),

        affiliateCode:
          referral.affiliateCode,

        subscriptionId:
          subscription.razorpaySubscriptionId,

        tier:
          subscription.tier,

        billingCycle:
          subscription.billingCycle,

        paymentAmount:
          amountPaid,

        commissionRate:
          commissionRate * 100,

        commissionAmount:
          commissionAmount,

        currency:
          currency,
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