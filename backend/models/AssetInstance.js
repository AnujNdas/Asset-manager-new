const mongoose = require("mongoose");

const assetInstanceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "assetTypeRef"
    },

    assetTypeRef: {
      type: String,
      required: true,
      enum: ["Asset", "SoftwareAsset"]
    },

    assetType: {
      type: String,
      enum: ["hardware", "software"],
      required: true
    },

     instanceCode: { type: String, required: true },

  uniqueIdentifier: { // serial / IMEI
    type: String,
    trim: true,
    sparse: true
  },

  status: {
    type: String,
    enum: ["in_stock", "assigned", "under_repair", "retired", "lost"],
    default: "in_stock",
    index: true
  },

  condition: {
    type: String,
    enum: ["new", "used", "damaged"],
    default: "new"
  },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location"
  },

  /* 🔥 ASSIGNMENT */
  assignedTo: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    assignedAt: Date
  },

  /* 🔥 HARDWARE DETAILS */
  hardwareDetails: {
    modelNo: String,
    specifications: String // 👉 "i5 13th Gen, 8GB RAM..."
  },

  /* 🔥 WARRANTY */
  warranty: {
    expiryDate: Date,
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active"
    }
  },

  /* 🔥 INSURANCE */
  insurance: {
    provider: String,
    policyId: String,
    expiryDate: Date
  },

  /* 🔥 INSTALLATION */
  installationDate: Date,

  /* 🔥 COST TRACKING (INSTANCE LEVEL) */
  costTracking: {
    maintenanceCost: Number,
    warrantyRenewalCost: Number,
    insuranceCost: Number
  },

  /* 🔥 SOFTWARE (if applicable) */
softwareDetails: {
  licenseKey: String,
  licenseNumber: String,
  vendor: String,

  purchaseDate: Date,
  renewalDate: Date,
  lastUsedDate: Date,

  assignedTo: {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    deviceName: String,
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }
  }
},

  /* 🔥 LIFECYCLE */
  lifecycle: [
    {
      action: String,
      date: { type: Date, default: Date.now },
      notes: String
    }
  ],

  /* 🔥 FLEXIBLE EXTENSION */
  meta: mongoose.Schema.Types.Mixed,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  },
  { timestamps: true }
);

// 🔥 Ensure unique instanceCode per org
assetInstanceSchema.index(
  { organizationId: 1, instanceCode: 1 },
  { unique: true }
);
assetInstanceSchema.index(
  { organizationId: 1, uniqueIdentifier: 1 },
  { unique: true, sparse: true }
);
// 🔥 Fast lookup for assignments
assetInstanceSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model("AssetInstance", assetInstanceSchema);