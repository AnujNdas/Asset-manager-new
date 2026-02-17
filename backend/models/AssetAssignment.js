const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

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

    /* 🔹 Physical Placement */

    assignLocation: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "returned", "transferred"],
      default: "active",
      index: true,
    },

    /* 🔹 Audit Fields */

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin / manager
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
  },
  { timestamps: true }
);

/* 🔹 Strong compound index */
assignmentSchema.index({
  organizationId: 1,
  assetId: 1,
  employeeId: 1,
  status: 1,
});

module.exports = mongoose.model("AssetAssignment", assignmentSchema);
