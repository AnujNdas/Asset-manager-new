const mongoose = require("mongoose");

const subscriptionHistorySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
      index: true,
    },

    // --------------------------------
    // Subscription snapshot
    // --------------------------------

    tier: {
      type: String,
      enum: ["trial", "base", "grow", "omni"],
      required: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },

    status: {
      type: String,
      enum: [
        "trialing",
        "created",
        "active",
        "paused",
        "cancelled",
        "expired",
        "past_due",
      ],
      required: true,
    },

    currentStart: {
      type: Date,
      default: null,
    },

    currentEnd: {
      type: Date,
      default: null,
    },

    planPrice: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },

    // --------------------------------
    // Payment snapshot
    // --------------------------------

    lastPaymentAmount: {
      type: Number,
      default: 0,
    },

    lastPaymentDate: {
      type: Date,
      default: null,
    },

    totalPaid: {
      type: Number,
      default: 0,
    },

    // --------------------------------
    // Cancellation / Past Due
    // --------------------------------

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    pastDueAt: {
      type: Date,
      default: null,
    },

    // --------------------------------
    // Razorpay
    // --------------------------------

    razorpaySubscriptionId: {
      type: String,
      default: null,
    },

    razorpayPlanId: {
      type: String,
      default: null,
    },

    // --------------------------------
    // What happened?
    // --------------------------------

eventType: {
  type: String,
  enum: [
    "created",
    "activated",
    "renewed",
    "upgraded",
    "downgraded",
    "paused",
    "resumed",
    "cancelled",
    "expired",
    "past_due",
    "payment",
    "plan_change",
    "billing_cycle_change",
    "cancellation_scheduled",
  ],
  required: true,
  index: true,
},

    notes: {
      type: String,
      default: "",
    },

    // --------------------------------
    // Who caused the event?
    // --------------------------------

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Fast history lookup for an organization
subscriptionHistorySchema.index({
  organizationId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SubscriptionHistory",
  subscriptionHistorySchema
);