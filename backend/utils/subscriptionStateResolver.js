function resolveSubscriptionState(subscription) {
  const now = new Date();

  /* --------------------------------------------
     NO SUBSCRIPTION
  -------------------------------------------- */
  if (!subscription) {
    return {
      status: "none",
      access: { hasAccess: false, reason: "no_subscription" },
      lifecycle: { isExpired: true, isInGracePeriod: false },
      actions: { canUpgrade: true }
    };
  }

  /* --------------------------------------------
     TRIAL ACTIVE
  -------------------------------------------- */
  if (
    subscription.status === "trialing" &&
    subscription.currentEnd &&
    subscription.currentEnd > now
  ) {
    return {
      status: "trialing",
      access: { hasAccess: true, reason: null },
      lifecycle: { isExpired: false, isInGracePeriod: false },
      actions: { canUseApp: true, canUpgrade: true }
    };
  }

  /* --------------------------------------------
     ACTIVE PLAN
  -------------------------------------------- */
  if (
    subscription.status === "active" &&
    subscription.currentEnd &&
    subscription.currentEnd > now
  ) {
    return {
      status: "active",
      access: { hasAccess: true, reason: null },
      lifecycle: { isExpired: false, isInGracePeriod: false },
      actions: { canUseApp: true, canUpgrade: true }
    };
  }

  /* --------------------------------------------
     PAST DUE (GRACE PERIOD)
  -------------------------------------------- */
  if (
    subscription.status === "past_due" &&
    subscription.pastDueAt
  ) {
    const graceEnd = new Date(subscription.pastDueAt);
    graceEnd.setDate(graceEnd.getDate() + 3);

    if (now < graceEnd) {
      return {
        status: "past_due",
        access: { hasAccess: true, reason: "grace_period" },
        lifecycle: { isExpired: false, isInGracePeriod: true },
        actions: { canUseApp: true, canPay: true }
      };
    }

    return {
      status: "past_due",
      access: { hasAccess: false, reason: "payment_overdue" },
      lifecycle: { isExpired: true, isInGracePeriod: false },
      actions: { canUpgrade: true }
    };
  }

  /* --------------------------------------------
     EXPIRED (trial or active)
  -------------------------------------------- */
  if (
    subscription.currentEnd &&
    subscription.currentEnd <= now
  ) {
    return {
      status: "expired",
      access: { hasAccess: false, reason: "plan_expired" },
      lifecycle: { isExpired: true, isInGracePeriod: false },
      actions: { canUpgrade: true }
    };
  }

  /* --------------------------------------------
     FALLBACK
  -------------------------------------------- */
  return {
    status: "unknown",
    access: { hasAccess: false, reason: "invalid_state" },
    lifecycle: { isExpired: true },
    actions: {}
  };
}

module.exports = resolveSubscriptionState;