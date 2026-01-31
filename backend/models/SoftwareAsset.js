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
            organizationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          index: true,
        },
    assetSpecification: { type: String },
    purchaseFrom: { type: String },
            type: {
      type: String,
      enum: ["monthly", "yearly", "one_time"],
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

    locationAddress: {
      type: String,
      required: true,
      trim: true,
    },

    licenseKey: String,
    licenseType: String,
    licenseModel: String,
    licenseMetric: String,
    licenseUse: String,

    DOP: { type: String },
    DOE: { type: String },
    assetLifetime: { type: String },

    assetStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },

    assetQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    inUse: {
      type: Number,
      default: 0,
      min: 0,
    },

    assetCost: {
      type: costSchema,
      required: true,
      min: 0,
    },


    assignedUsers: [{ type: String }],
    linkedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
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
