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
      enum: ["Open", "In Progress", "Resolved", "Closed"],
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
      required: true,
      index: true
    },

    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    adminReplies: [
      {
        message: String,
        repliedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        repliedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("SupportTicket", supportTicketSchema);
// mongoose.model("SupportTicket", supportTicketSchema);