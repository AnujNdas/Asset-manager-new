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

  // Cloudinary fields
  image: {
    type: String, // Cloudinary URL
  },
  imagePublicId: {
    type: String, // Cloudinary public_id (for delete/update)
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
});

const Asset = mongoose.model("Asset", assetSchema);
module.exports = Asset;
