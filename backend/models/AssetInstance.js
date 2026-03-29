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
  enum: ["in_stock", "assigned", "maintenance", "retired"],
  default: "in_stock"
},

  condition: {
    type: String,
    enum: ["new", "used", "damaged"],
    default: "new"
  },

location: {
  type: String,
  required: true,
  trim: true
},

  /* 🔥 ASSIGNMENT */
assignedTo: {
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  employeeName: String, // ✅ ADD THIS
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  departmentName: String, // ✅ ADD THIS
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
  employeeName: String, // ✅ ADD THIS
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  departmentName: String, // ✅ ADD THIS
  assignedAt: Date
},

},

  /* 🔥 LIFECYCLE */
lifecycle: [
  {
    action: {
      type: String,
      enum: ["CREATED", "ASSIGNED", "REASSIGNED", "UNASSIGNED", "MAINTENANCE", "UPGRADE"]
    },

    from: {
      employeeName: String,
      departmentName: String
    },

    to: {
      employeeName: String,
      departmentName: String
    },

    snapshot: {
      location: String,

      assignedTo: {
        employeeName: String,
        departmentName: String
      },

      warrantyExpiry: Date,
      insuranceExpiry: Date,

      condition: String,

      costTracking: {
        maintenanceCost: Number,
        warrantyRenewalCost: Number,
        insuranceCost: Number
      }
    },

    date: {
      type: Date,
      default: Date.now
    },

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
  {
    unique: true,
    partialFilterExpression: {
      uniqueIdentifier: { $exists: true, $ne: null }
    }
  }
);
// 🔥 Fast lookup for assignments
assetInstanceSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model("AssetInstance", assetInstanceSchema);