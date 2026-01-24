const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true
    },

    issueType: {
      type: String,
      enum: ["Hardware", "Software", "Account", "Other"],
      required: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open"
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    adminRemark: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
