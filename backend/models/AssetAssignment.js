const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    /* 🔹 Asset Reference */

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assetModel",
      required: true,
      index: true,
    },

    assetModel: {
      type: String,
      required: true,
      enum: ["Asset", "SoftwareAsset"],
    },

    assetType: {
      type: String,
      enum: ["hardware", "software", "consumable"],
      required: true,
    },

    // 🔥 FUTURE READY (optional for now)
    assetInstanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetInstance",
      default: null,
      index: true,
    },

    /* 🔹 Ownership Context */

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    /* 🔹 Location (FIXED) */

    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },

    /* 🔹 Device Context (PDF REQUIREMENT) */

    deviceInfo: {
      assetTag: String,       // DELLIDEA001
      serialNumber: String,
      modelNumber: String,
      deviceName: String
    },

    /* 🔹 Quantity (TEMP until instance model) */

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /* 🔹 Status */

    status: {
      type: String,
      enum: ["active", "returned", "transferred"],
      default: "active",
      index: true,
    },

    /* 🔹 Assignment Lifecycle */

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* 🔥 NEW: Reassignment Tracking */

    reassignedFrom: {
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
      date: Date,
    },

    /* 🔥 Metadata (AI-ready) */

    metadata: {
      type: mongoose.Schema.Types.Mixed
    }

  },
  { timestamps: true }
);

/* 🔹 Optimized Index */
assignmentSchema.index({
  organizationId: 1,
  assetId: 1,
  employeeId: 1,
  status: 1,
});

module.exports = mongoose.model("AssetAssignment", assignmentSchema);