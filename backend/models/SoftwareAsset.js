const mongoose = require("mongoose");

const SoftwareAssetSchema = new mongoose.Schema(
  {
    // Core Identity
    assetCode: { type: String, required: true }, // same as hardware
    assetName: { type: String, required: true },
    assetCategory: { type: String, required: true },
    assetSpecification: { type: String }, // version
    purchaseFrom: { type: String }, // publisher
    associateUnit: { type: String, required: true },

    // Location
    locationName: { type: String, required: true }, // install location
    locationAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // License Info
    licenseKey: String,
    licenseType: String,
    licenseModel: String,
    licenseMetric: String,
    licenseUse: String,

    // Lifecycle
    DOP: { type: String }, // purchase date
    DOE: { type: String }, // license expiry
    assetLifetime: { type: String },

    // Status
    assetStatus: { type: String, required: true },

    // Quantity
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

    // Financial
    assetCost: {
      type: Number,
      min: 0,
    },

    // Assignment
    assignedUsers: [{ type: String }],
    linkedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual: Available licenses
SoftwareAssetSchema.virtual("inStock").get(function () {
  return this.assetQuantity - this.inUse;
});

module.exports = mongoose.model("SoftwareAsset", SoftwareAssetSchema);
