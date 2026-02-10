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
    type: {
      type: String,
      enum: ["one_time", "maintenance"],
      required: true,
    },
    locationAddress: {
      type: String,
      required: true,
      trim: true,
    },
      organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
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
    maintenanceTerm: {
  type: String,
  trim: true
},

insurance: {
  insuranceId: { type: String, trim: true },
  insuranceName: { type: String, trim: true },
  purchaseDate: { type: Date },
  expiryDate: { type: Date }
}
,
warranty: {
  warrantyId: { type: String, trim: true },
  expiryDate: { type: Date }
},

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
assetSchema.virtual("warrantyLifetime").get(function () {
  if (!this.DOP || !this.warranty?.expiryDate) return null;

  const dop = new Date(this.DOP);
  const expiry = new Date(this.warranty.expiryDate);

  let years = expiry.getFullYear() - dop.getFullYear();
  let months = expiry.getMonth() - dop.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} Years ${months} Months`;
});

module.exports = mongoose.model("Asset", assetSchema);
