// models/AffiliatePaymentTicket.js

const mongoose = require("mongoose");

const AffiliatePaymentTicketSchema =
  new mongoose.Schema(
    {
      /* ==========================================
         TICKET
      ========================================== */

      ticketNumber: {
        type: String,
        unique: true,
        index: true,
      },

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
      },

      /* ==========================================
         COMMISSIONS
      ========================================== */

      commissionIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AffiliateCommissionPayment",
          required: true,
        },
      ],

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        required: true,
        uppercase: true,
        default: "USD",
      },

      /* ==========================================
         PAYOUT SNAPSHOT
      ========================================== */

      payoutMethod: {
        type: String,
        enum: [
          "upi",
          "bank",
          "paypal",
        ],
        required: true,
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

      /* ==========================================
         AFFILIATE MESSAGE
      ========================================== */

      affiliateMessage: {
        type: String,
        default: "",
        trim: true,
      },

      /* ==========================================
         TICKET STATUS
      ========================================== */

      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "paid",
          "resolved",
          "rejected",
        ],
        default: "pending",
        index: true,
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

      /* ==========================================
         PAYMENT
      ========================================== */

      transactionId: {
        type: String,
        default: "",
        trim: true,
      },

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

      paidAt: {
        type: Date,
        default: null,
      },

      resolvedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "AffiliatePaymentTicket",
    AffiliatePaymentTicketSchema
  );