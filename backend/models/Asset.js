  const mongoose = require("mongoose");
  const costSchema = require("./CostSchema");

  const assetSchema = new mongoose.Schema(
    {
      assetCode: { type: String, required: true },

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
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: ["one_time", "maintenance"],
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

      DOE: { type: Date },


      assetQuantity: {
        type: Number,
        required: true,
        min: 1,
      },

      inUse: {
        type: Number,
        default: 0,
      },

financialTracking: {
  totalAssetCost: { type: Number, default: 0 },   // 🔥 sum of all instances
  monthlyCost: { type: Number, default: 0 },
  yearlyCost: { type: Number, default: 0 },
  maintenanceTotalCost: { type: Number, default: 0 },
},
    },
    { timestamps: true }
  );

  // indexes
  assetSchema.index({ organizationId: 1, assetCategory: 1 });
  assetSchema.index({ organizationId: 1, locationName: 1 });
  assetSchema.index({ organizationId: 1, assetStatus: 1 });

  assetSchema.virtual("inStock").get(function () {
    return this.assetQuantity - this.inUse;
  });

  module.exports = mongoose.model("Asset", assetSchema);