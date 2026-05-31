const processAffiliateConversion = async (subscription) => {
  try {
    const referral = await AffiliateReferral.findOne({
      organizationId: subscription.organizationId,
      status: "signed_up"
    });

    if (!referral) {
      console.log("No eligible affiliate referral found");
      return;
    }

    /* =============================
       PAYMENT INFO
    ============================== */

    const amountPaid =
      subscription.lastPaymentAmount ||
      subscription.planPrice ||
      0;

    const currency =
      subscription.currency || "USD";

    if (amountPaid <= 0) {
      console.log("No payment amount found");
      return;
    }

    /* =============================
       COMMISSION RATE
    ============================== */

    const tier =
      (subscription.tier || "").toLowerCase();

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

    const commissionAmount = Number(
      (amountPaid * commissionRate).toFixed(2)
    );

    /* =============================
       UPDATE REFERRAL
    ============================== */

    referral.status = "converted";

    referral.convertedAt = new Date();

    referral.subscriptionId =
      subscription._id;

    referral.planName =
      subscription.tier;

    referral.billingCycle =
      subscription.billingCycle;

    referral.paymentAmount =
      amountPaid;

    referral.paymentCurrency =
      currency;

    referral.commissionRate =
      commissionRate * 100; // 5 or 10

    referral.commissionAmount =
      commissionAmount;

    referral.commissionStatus =
      "pending";

    referral.lastPaymentDate =
      new Date();

    await referral.save();

    console.log(
      `Affiliate conversion completed | Tier: ${subscription.tier} | Commission: ${commissionAmount} ${currency}`
    );

  } catch (error) {
    console.error(
      "Affiliate conversion failed:",
      error
    );
  }
};