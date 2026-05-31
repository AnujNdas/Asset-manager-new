const mongoose = require("mongoose");

const AffiliateReferralSchema = new mongoose.Schema(
  {
    // 🔹 Affiliate
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AffiliateProfile",
      required: true,
      index: true,
    },

    affiliateCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },

    // 🔹 Referred User
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔹 Referral Session
    referralToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 🔹 Tracking
    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    referrerUrl: {
      type: String,
      default: "",
    },

    landingPage: {
      type: String,
      default: "",
    },

    // 🔹 Status Flow
    status: {
      type: String,
      enum: [
        "clicked",
        "signed_up",
        "converted",
        "rejected",
      ],
      default: "clicked",
      index: true,
    },

    // 🔹 Commission
    commissionAmount: {
      type: Number,
      default: 0,
    },

    commissionStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "paid",
        "rejected",
      ],
      default: "pending",
    },
    // 🔹 Conversion Financials
planName: {
  type: String,
  default: null,
},

billingCycle: {
  type: String,
  default: null,
},

paymentAmount: {
  type: Number,
  default: 0,
},

paymentCurrency: {
  type: String,
  default: "USD",
},

commissionRate: {
  type: Number,
  default: 0,
},

lastPaymentDate: {
  type: Date,
  default: null,
},
    // 🔹 Conversion Tracking
    signupAt: {
      type: Date,
      default: null,
    },

    convertedAt: {
      type: Date,
      default: null,
    },

    // 🔹 Subscription Tracking
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    // 🔹 Fraud Protection
    isFraud: {
      type: Boolean,
      default: false,
    },

    fraudReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AffiliateReferral",
  AffiliateReferralSchema
);