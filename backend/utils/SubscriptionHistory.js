const SubscriptionHistory = require("../models/SubscriptionHistory");

const createSubscriptionHistory = async ({
  subscription,
  eventType,
  changedBy = null,
  notes = "",
}) => {

  if (!subscription) {
    throw new Error(
      "Subscription is required to create history."
    );
  }

  return await SubscriptionHistory.create({
    organizationId: subscription.organizationId,

    subscriptionId: subscription._id,

    tier: subscription.tier,

    billingCycle: subscription.billingCycle,

    status: subscription.status,

    currentStart: subscription.currentStart,

    currentEnd: subscription.currentEnd,

    planPrice: subscription.planPrice,

    currency: subscription.currency,

    lastPaymentAmount:
      subscription.lastPaymentAmount,

    lastPaymentDate:
      subscription.lastPaymentDate,

    totalPaid:
      subscription.totalPaid,

    cancelAtPeriodEnd:
      subscription.cancelAtPeriodEnd,

    pastDueAt:
      subscription.pastDueAt,

    razorpaySubscriptionId:
      subscription.razorpaySubscriptionId,

    razorpayPlanId:
      subscription.razorpayPlanId,

    eventType,

    changedBy,

    notes,
  });
};

module.exports = {
  createSubscriptionHistory,
};