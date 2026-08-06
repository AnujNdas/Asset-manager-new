const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    orgCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    /* ==============================
       ✅ ORGANIZATION ONBOARDING
    ============================== */

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    organizationType: {
      type: String,
      enum: ["Startup", "Enterprise", "Agency", "NGO", "Other"],
      default: "Other",
    },

    country: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    officeLocation: {
      type: String,
      default: "",
    },
      // ✅ New field
currency: {
  type: String,
  required: true,
  default: "USD",
  uppercase: true,
  trim: true,
},
lastActivityAt: {
    type: Date,
    default: null,
},

warningEmailSentAt: {
    type: Date,
    default: null,
},

scheduledDeletionAt: {
    type: Date,
    default: null,
},

finalReminderSentAt: {
    type: Date,
    default: null,
},

cleanupReason: {
    type: String,
    enum: ["NO_USERS", "INACTIVE_ADMIN", null],
    default: null,
},

status: {
    type: String,
    enum: [
        "active",
        "inactive",
        "pending_deletion"
    ],
    default: "active",
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);