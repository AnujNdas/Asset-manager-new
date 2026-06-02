const mongoose = require("mongoose");

const AffiliateTicketSchema =
  new mongoose.Schema(
    {
      affiliateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AffiliateProfile",
        required: true,
      },

      ticketNumber: {
        type: String,
        unique: true,
      },

      subject: {
        type: String,
        required: true,
      },

      category: {
        type: String,
        enum: [
          "commission",
          "payout",
          "tracking",
          "account",
          "technical",
          "general",
        ],
        required: true,
      },

      priority: {
        type: String,
        enum: [
          "low",
          "medium",
          "high",
          "urgent",
        ],
        default: "medium",
      },

      message: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "open",
          "in_progress",
          "resolved",
          "closed",
        ],
        default: "open",
      },

      adminReply: {
        type: String,
        default: "",
      },

      resolvedAt: Date,

      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "AffiliateTicket",
    AffiliateTicketSchema
  );