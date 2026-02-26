const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // Internal plan reference
    tier: {
      type: String,
      enum: ["trial", "base", "grow", "omni"],
      default: "trial",
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },

    // Razorpay identifiers
    razorpaySubscriptionId: {
      type: String,
      index: true,
    },

    razorpayPlanId: String,

    // Razorpay subscription status
    status: {
      type: String,
      enum: [
        "trialing",
        "created",
        "authenticated",
        "active",
        "paused",
        "cancelled",
        "completed",
        "expired",
      ],
      default: "trialing",
    },

    currentStart: Date,
    currentEnd: Date,

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);