// models/AffiliateProfile.js

const mongoose = require("mongoose");

const AffiliateProfileSchema = new mongoose.Schema(
  {
    // 🔹 Linked User Account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // 🔹 Affiliate Identity
    affiliateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // 🔹 Approval Workflow
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "suspended",
      ],
      default: "pending",
      index: true,
    },

    // 🔹 Basic Profile
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    // 🔹 Promotion Details
    website: {
      type: String,
      default: "",
    },

    audienceType: {
      type: String,
      enum: [
        "linkedin",
        "youtube",
        "blog",
        "agency",
        "community",
        "other",
      ],
      default: "other",
    },

    promotionMethod: {
      type: String,
      default: "",
    },

    // 🔹 Analytics
    totalClicks: {
      type: Number,
      default: 0,
    },

    totalReferrals: {
      type: Number,
      default: 0,
    },

    totalConversions: {
      type: Number,
      default: 0,
    },

    // 🔹 Earnings
    pendingEarnings: {
      type: Number,
      default: 0,
    },

    approvedEarnings: {
      type: Number,
      default: 0,
    },

    paidEarnings: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    // 🔹 Payout Config
    payoutMethod: {
      type: String,
      enum: [
        "upi",
        "bank",
        "paypal",
      ],
      default: "upi",
    },

    payoutDetails: {
      upiId: {
        type: String,
        default: "",
      },

      accountName: {
        type: String,
        default: "",
      },

      accountNumber: {
        type: String,
        default: "",
      },

      ifscCode: {
        type: String,
        default: "",
      },

      paypalEmail: {
        type: String,
        default: "",
      },
    },

    // 🔹 Referral Link
    referralLink: {
      type: String,
      default: "",
    },

    // 🔹 Activity
    lastReferralAt: {
      type: Date,
      default: null,
    },

    lastPayoutAt: {
      type: Date,
      default: null,
    },

    // 🔹 Flags
    isActive: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AffiliateProfile",
  AffiliateProfileSchema
);