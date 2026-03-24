const mongoose = require("mongoose");
const costSchema = require("./CostSchema");

const SoftwareAssetSchema = new mongoose.Schema(
  {
    assetCode: { type: String, unique: true },

    assetName: { type: String, required: true },

    assetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    associateUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    locationName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    assetStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },

    type: {
      type: String,
      enum: ["monthly", "yearly", "one_time"],
      required: true,
    },

    purchaseDetails: {
      purchaseDate: { type: Date, required: true },
      vendor: {
        name: String,
        contact: String,
        supportEmail: String,
      },
    },

    assetCost: {
      type: costSchema,
      required: true,
    },

    assetQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    inUse: {
      type: Number,
      default: 0,
    },
    DOE: { type: Date },
    financialTracking: {
      monthlyCost: { type: Number, default: 0 },
      yearlyCost: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
    },

    // Parent-level renewal config only
    renewal: {
      expiryDate: Date,
      renewalTerm: {
        type: String,
        enum: ["6_month", "1_year", "2_year"],
      },
    },

    auditHistory: [
      {
        date: { type: Date, default: Date.now },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: String,
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

// indexes
SoftwareAssetSchema.index({ organizationId: 1, assetCategory: 1 });
SoftwareAssetSchema.index({ organizationId: 1, assetStatus: 1 });
SoftwareAssetSchema.index({ organizationId: 1, locationName: 1 });

SoftwareAssetSchema.virtual("inStock").get(function () {
  return this.assetQuantity - this.inUse;
});

module.exports = mongoose.model("SoftwareAsset", SoftwareAssetSchema);