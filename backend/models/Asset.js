const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  assetCode: {
    type: String,
    required: true,
  },
  assetCategory: {
    type: String,
    required: true,
  },
  barcodeNumber: {
    type: String,
  },
  assetName: {
    type: String,
    required: true,
  },
  associateUnit: {
    type: String,
    required: true,
  },

  locationName: {
    type: String,
    required: true,
  },
  assetSpecification: {
    type: String,
    required: true,
  },
  assetStatus: {
    type: String,
    required: true,
  },
  DOP: {
    type: String,
    required: true,
  },
  DOE: {
    type: String,
    required: true,
  },
  assetLifetime: {
    type: String,
    required: true,
  },
  purchaseFrom: {
    type: String,
    required: true,
  },
  PMD: {
    type: String,
  },

  // -------------------------------
  // ⭐ NEW FIELDS (MOST COMMON IN SAAS)
  // -------------------------------
  
  // Cost per 1 asset (e.g., ₹50,000 for a laptop)
  assetCost: {
    type: Number,
    required: true,
    default: 0,
  },

  // Quantity of the asset (e.g., 10 laptops)
  assetQuantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const Asset = mongoose.model("Asset", assetSchema);
module.exports = Asset;
