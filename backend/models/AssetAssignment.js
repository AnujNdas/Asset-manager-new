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
      enum: ["Asset", "SoftwareAsset"],
      required: true,
    },

    assetType: {
      type: String,
      enum: ["hardware", "software", "consumable"],
      required: true,
    },

    /* 🔥 CORE CHANGE: Instance Required */

    assetInstanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetInstance",
      required: true,
      unique: true, // 🔥 prevents double assignment
      index: true,
    },

    /* 🔹 Ownership */

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    /* 🔹 Device Info (Optional) */

    deviceInfo: {
      assetTag: String,
      serialNumber: String,
      modelNumber: String,
      deviceName: String,
    },

    /* 🔹 Status */

    status: {
      type: String,
      enum: ["active", "returned", "transferred"],
      default: "active",
      index: true,
    },

    /* 🔹 Lifecycle */

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    returnedAt: Date,

    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* 🔥 Reassignment */

    reassignedFrom: {
      employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
      date: Date,
    },

    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);
assignmentSchema.index(
  { assetInstanceId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);
/* 🔹 Optimized Index */
assignmentSchema.index({
  organizationId: 1,
  assetId: 1,
  employeeId: 1,
  status: 1,
});

module.exports = mongoose.model("AssetAssignment", assignmentSchema);