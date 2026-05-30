const processAffiliateConversion = async (subscription) => {

  const referral = await AffiliateReferral.findOne({
    organizationId: subscription.organizationId
  });

  if (!referral) {
    console.log("No affiliate referral found");
    return;
  }

  // Prevent duplicate commissions
  if (referral.status === "converted") {
    console.log("Referral already converted");
    return;
  }

  /* =============================
     PLAN PRICING
  ============================== */

const amountPaid =
  subscription.lastPaymentAmount ||
  subscription.planPrice ||
  0;

const currency =
  subscription.currency || "USD";

  const commissionRate = 0.20;

  const commissionAmount =
    amountPaid * commissionRate;

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
    commissionRate * 100;

  referral.commissionAmount =
    commissionAmount;

  referral.commissionStatus =
    "pending";

  referral.lastPaymentDate =
    new Date();

  await referral.save();

  console.log(
    "Affiliate commission generated"
  );
};