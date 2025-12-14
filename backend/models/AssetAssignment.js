const mongoose = require("mongoose");

const AssetAssignmentSchema = new mongoose.Schema(
  {
    assetType: {
      type: String,
      enum: ["hardware", "software"],
      required: true,
    },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "assetModel",
    },

    assetModel: {
      type: String,
      enum: ["Asset", "SoftwareAsset"],
      required: true,
    },

    assignedToType: {
      type: String,
      enum: ["User", "Department", "Unit", "Device"],
      required: true,
    },

    assignedTo: {
      type: String, // username / dept name / device id
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "returned"],
      default: "active",
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    returnedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssetAssignment", AssetAssignmentSchema);
