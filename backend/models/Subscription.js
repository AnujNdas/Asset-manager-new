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
    "active",
    "paused",
    "cancelled",
    "expired",
    "past_due",
  ],
  default: "trialing",
},

    currentStart: Date,
    currentEnd: Date,

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    pastDueAt: {
  type: Date,
},
planPrice: {
  type: Number,
  default: 0,
},

currency: {
  type: String,
  default: "USD",
},

lastPaymentAmount: {
  type: Number,
  default: 0,
},

lastPaymentDate: Date,

totalPaid: {
  type: Number,
  default: 0,
},
pendingUpgrade: {
  tier: String,
  billingCycle: String,
  razorpayPlanId: String,
  razorpaySubscriptionId: String,

  planPrice: Number,
  currency: String,
},
  },
  { timestamps: true }
);
subscriptionSchema.index(
  { organizationId: 1, status: 1 },
  { partialFilterExpression: { status: "active" }, unique: true }
);
module.exports = mongoose.model("Subscription", subscriptionSchema);