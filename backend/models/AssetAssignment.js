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
      enum: ["Department"], // lock for now
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
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
  {
    timestamps: true,
  }
);

/* INDEXES (IMPORTANT) */
AssetAssignmentSchema.index({ assetId: 1, status: 1 });
AssetAssignmentSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model("AssetAssignment", AssetAssignmentSchema);
