const mongoose = require("mongoose");
const costSchema = require("./CostSchema");
const assetSchema = new mongoose.Schema(
  {
    assetCode: { type: String, required: true },

    assetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
          organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    barcodeNumber: { type: String },

    assetName: { type: String, required: true },

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

    assetSpecification: { type: String, required: true },

    assetStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },

    DOP: { type: String, required: true },
    DOE: { type: String, required: true },
    assetLifetime: { type: String, required: true },

    purchaseFrom: { type: String, required: true },
    modelNo: { type: String, unique: true },
    PMD: { type: String },

    assetCost: {
      type: costSchema,
      required: true,
      min: 0,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assetSchema.virtual("inStock").get(function () {
  return this.assetQuantity - this.inUse;
});

module.exports = mongoose.model("Asset", assetSchema);
