const AffiliateReferral = require("../models/AffiliateReferral");
const AffiliateProfile = require("../models/AffiliateProfile");
const AffiliateCommissionPayment = require(
  "../models/AffiliateCommissionPayment"
);

const processAffiliateConversion = async (
  subscription,
  paymentEntity = null
) => {
  try {

    console.log(
      "========== AFFILIATE COMMISSION START =========="
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
       FIND AFFILIATE REFERRAL
    ========================================== */

    const referral =
      await AffiliateReferral.findOne({
        organizationId:
          subscription.organizationId,

        isFraud: false,

        status: {
          $in: [
            "signed_up",
            "converted",
          ],
        },
      });

    if (!referral) {

      console.log(
        "No eligible affiliate referral found."
      );

      return;
    }


    console.log(
      "Affiliate referral found:",
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
       PAYMENT INFORMATION
    ========================================== */

    let amountPaid = 0;

    let currency =
      subscription.currency || "USD";

    let paymentId = "";


    /*
     * Razorpay payment ID
     *
     * Example:
     *
     * pay_TePnnGN1PviMzt
     */

    if (paymentEntity) {

      paymentId =
        paymentEntity.id ||
        paymentEntity.payment_id ||
        "";

      if (
        paymentEntity.amount != null
      ) {

        amountPaid =
          Number(paymentEntity.amount) / 100;
      }

      currency =
        paymentEntity.currency ||
        currency;
    }


    /*
     * Fallback to database values
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
        "No payment amount found."
      );

      return;
    }


    console.log(
      "Affiliate payment:",
      {
        paymentId,
        amountPaid,
        currency,
      }
    );


    /* ==========================================
       DUPLICATE PAYMENT PROTECTION
    ========================================== */

    if (paymentId) {

      const existingCommission =
        await AffiliateCommissionPayment.findOne({
          paymentId,
        });

      if (existingCommission) {

        console.log(
          "Commission already exists for payment:",
          paymentId
        );

        return;
      }
    }


    /* ==========================================
       COMMISSION RATE
    ========================================== */

    const tier =
      String(subscription.tier || "")
        .toLowerCase();

    let commissionRate = 0;

    switch (tier) {

      case "base":
        commissionRate = 0.10; // 10%
        break;

      case "grow":
        commissionRate = 0.15; // 15%
        break;

      case "omni":
        commissionRate = 0.20; // 20%
        break;

      default:
        commissionRate = 0;
    }


    if (commissionRate <= 0) {

      console.log(
        "No commission configured for tier:",
        tier
      );

      return;
    }


    /* ==========================================
       CALCULATE COMMISSION
    ========================================== */

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
       FIND AFFILIATE PROFILE
    ========================================== */

    const affiliateProfile =
      await AffiliateProfile.findOne({
        affiliateCode:
          referral.affiliateCode,
      });

    if (!affiliateProfile) {

      console.log(
        "Affiliate profile not found:",
        referral.affiliateCode
      );

      return;
    }


    /* ==========================================
       CREATE COMMISSION PAYMENT
    ========================================== */

    const commissionPayment =
      await AffiliateCommissionPayment.create({

        affiliateId:
          affiliateProfile._id,

        affiliateCode:
          referral.affiliateCode,

        referralId:
          referral._id,

        organizationId:
          subscription.organizationId,

        referredUserId:
          referral.referredUserId,


        /* Subscription */

        subscriptionId:
          subscription.razorpaySubscriptionId,

        planName:
          subscription.tier,

        billingCycle:
          subscription.billingCycle,


        /* Payment */

        paymentId,

        paymentAmount:
          amountPaid,

        paymentCurrency:
          currency,


        /* Commission */

        commissionRate:
          commissionRate * 100,

        commissionAmount:
          commissionAmount,


        /* Payout */

        status:
          "pending",

        payoutMethod:
          affiliateProfile.payoutMethod || null,

        generatedAt:
          new Date(),
      });


    console.log(
      "Affiliate commission payment created:",
      {
        commissionPaymentId:
          String(
            commissionPayment._id
          ),

        paymentId,

        commissionAmount,
      }
    );


    /* ==========================================
       UPDATE AFFILIATE EARNINGS
    ========================================== */

    affiliateProfile.pendingEarnings =
      Number(
        affiliateProfile.pendingEarnings || 0
      ) + commissionAmount;

    affiliateProfile.totalEarnings =
      Number(
        affiliateProfile.totalEarnings || 0
      ) + commissionAmount;

    affiliateProfile.totalConversions =
      referral.status === "signed_up"
        ? Number(
            affiliateProfile.totalConversions || 0
          ) + 1
        : affiliateProfile.totalConversions;

    await affiliateProfile.save();


    /* ==========================================
       MARK INITIAL REFERRAL AS CONVERTED
    ========================================== */

    if (referral.status === "signed_up") {

      referral.status =
        "converted";

      referral.convertedAt =
        new Date();

      /*
       * These fields represent the
       * initial conversion.
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

    } else {

      /*
       * Referral is already converted.
       *
       * Do NOT change its original
       * conversion status.
       *
       * The individual commission is
       * already stored in
       * AffiliateCommissionPayment.
       */

      console.log(
        "Existing converted referral - " +
        "creating additional commission record."
      );
    }


    console.log(
      "========== AFFILIATE COMMISSION COMPLETED ==========",
      {
        commissionPaymentId:
          String(
            commissionPayment._id
          ),

        referralId:
          String(referral._id),

        affiliateCode:
          referral.affiliateCode,

        paymentId,

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

        commissionAmount,

        currency,
      }
    );

  } catch (error) {

    /*
     * Duplicate payment race condition
     *
     * If two webhook requests arrive
     * simultaneously and both try to create
     * the same payment record, MongoDB's
     * unique paymentId index protects us.
     */

    if (
      error.code === 11000
    ) {

      console.log(
        "Duplicate affiliate commission prevented:",
        error.keyValue
      );

      return;
    }

    console.error(
      "Affiliate commission failed:",
      error
    );
  }
};


module.exports = {
  processAffiliateConversion,
};