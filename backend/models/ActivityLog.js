const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    ipAddress: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
