const mongoose = require("mongoose");

const OrganizationInviteSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    inviteToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    email: {
      type: String, // optional (for restricted invites)
    },

    maxUses: {
      type: Number,
      default: null, // null = unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("organization_invite", OrganizationInviteSchema);
