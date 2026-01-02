const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // 🔑 Tier reference (immutable)
    tierId: {
      type: String,
      required: true,
    },

    // 🔒 Snapshot of limits at purchase time
    usersLimit: {
      type: Number,
      required: true,
    },
    assetsLimit: {
      type: Number,
      required: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    // 🔒 Locked-in amount (important for audits)
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },

    status: {
      type: String,
      enum: ["inactive", "pending", "active", "cancelled"],
      default: "inactive",
    },

    provider: {
      type: String,
      default: "lemonsqueezy",
    },

    providerSubscriptionId: String,
    providerCustomerId: String,

    currentPeriodEnd: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
