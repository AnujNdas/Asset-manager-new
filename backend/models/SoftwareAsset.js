const mongoose = require("mongoose");
const costSchema = require("./CostSchema");

const SoftwareAssetSchema = new mongoose.Schema(
  {
    assetCode: { type: String, required: true },
    assetName: { type: String, required: true },

    assetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    assetSpecification: { type: String },
    purchaseFrom: { type: String },

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

    locationAddress: {
      type: String,
      required: true,
      trim: true,
    },

    licenseType: String,
    licenseModel: String,
    licenseMetric: String,
    licenseUse: String,

    // ✅ Changed to Date
    DOP: { type: Date, required: true },
    DOE: {
      type: Date,
      required: function () {
        return this.type !== "one_time";
      },
    },

    assetLifetime: { type: String },

    assetStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
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
      min: 0,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },

    // Cost per billing cycle (for all licenses)
    assetCost: {
      type: costSchema,
      required: true,
    },

    // ✅ NEW: Cost for full contract duration
    overallCost: {
      type: costSchema,
      required: true,
    },

    type: {
      type: String,
      enum: ["monthly", "yearly", "one_time"],
      required: true,
    },

    auditHistory: {
      type: [
        {
          date: { type: Date, default: Date.now },
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          action: {
            type: String,
            enum: ["CREATE", "UPDATE", "DELETE", "ASSIGN", "UNASSIGN"],
            default: "UPDATE",
          },
          notes: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SoftwareAssetSchema.virtual("inStock").get(function () {
  return this.assetQuantity - this.inUse;
});

module.exports = mongoose.model("SoftwareAsset", SoftwareAssetSchema);
