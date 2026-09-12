const mongoose = require("mongoose");

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["processing", "processed"],
      default: "processing",
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RazorpayWebhookEvent",
  razorpayWebhookEventSchema
);