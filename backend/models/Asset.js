const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    assetCode: { type: String, required: true },
    assetCategory: { type: String, required: true },
    barcodeNumber: { type: String },
    assetName: { type: String, required: true },
    associateUnit: { type: String, required: true },
    locationName: { type: String, required: true },
    assetSpecification: { type: String, required: true },
    assetStatus: { type: String, required: true },
    DOP: { type: String, required: true },
    DOE: { type: String, required: true },
    assetLifetime: { type: String, required: true },
    purchaseFrom: { type: String, required: true },
    PMD: { type: String },

    assetCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    assetQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    // ✅ NEW FIELD
    inUse: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
module.exports = mongoose.model("Asset", assetSchema);

