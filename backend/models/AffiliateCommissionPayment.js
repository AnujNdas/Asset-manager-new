const mongoose = require("mongoose");

const AffiliateCommissionPaymentSchema =
  new mongoose.Schema(
    {
      /* ==========================================
         AFFILIATE
      ========================================== */

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
        trim: true,
        index: true,
      },

      /* ==========================================
         REFERRAL / CONVERSION
      ========================================== */

      referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AffiliateReferral",
        required: true,
        index: true,
      },
      commissionType: {
  type: String,
  enum: [
    "initial",
    "renewal",
    "upgrade",
    "downgrade",
    "plan_change",
  ],
  required: true,
  index: true,
},

      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true,
      },

      referredUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      /* ==========================================
         SUBSCRIPTION INFORMATION
      ========================================== */

      subscriptionId: {
        type: String,
        required: true,
      },

      planName: {
        type: String,
        required: true,
        trim: true,
      },

      billingCycle: {
        type: String,
        enum: [
          "monthly",
          "yearly",
        ],
        required: true,
      },

      /* ==========================================
         COMMISSION CALCULATION
      ========================================== */

      paymentAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      paymentCurrency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        default: "USD",
      },

      commissionRate: {
        type: Number,
        required: true,
        min: 0,
      },

      commissionAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      /* ==========================================
         PAYOUT STATUS
      ========================================== */

      status: {
        type: String,
        enum: [
          "pending",
          "requested",
          "approved",
          "paid",
          "rejected",
        ],
        default: "pending",
        index: true,
      },

      /* ==========================================
         PAYOUT INFORMATION
      ========================================== */

      payoutMethod: {
        type: String,
        enum: [
          "upi",
          "bank",
          "paypal",
        ],
        default: null,
      },

      transactionId: {
        type: String,
        default: "",
        trim: true,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      /* ==========================================
         PAYMENT PROOF
      ========================================== */

      paymentProof: {
        url: {
          type: String,
          default: "",
        },

        publicId: {
          type: String,
          default: "",
        },

        uploadedAt: {
          type: Date,
          default: null,
        },
      },

      /* ==========================================
         ADMIN PROCESSING
      ========================================== */

      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      adminNotes: {
        type: String,
        default: "",
        trim: true,
      },
      razorpayPaymentId: {
  type: String,
  required: true,
  unique: true,
  index: true,
},
ticketId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "AffiliatePaymentTicket",
  default: null,
  index: true,
},
      /* ==========================================
         PAYMENT TIMELINE
      ========================================== */

      generatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "AffiliateCommissionPayment",
    AffiliateCommissionPaymentSchema
  );