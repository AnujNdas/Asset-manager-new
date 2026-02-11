const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
    isp: String,
    userAgent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
