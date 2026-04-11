const mongoose = require("mongoose");
const costSchema = require("./CostSchema");
const assetInstanceSchema = new mongoose.Schema(
{
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "assetTypeRef",
    required: true
  },

  assetTypeRef: {
    type: String,
    enum: ["Asset", "SoftwareAsset"],
    required: true
  },

  assetType: {
    type: String,
    enum: ["hardware", "software"],
    required: true
  },

  /* 🔹 BASIC UI FIELDS */
  instanceCode: { type: String, required: true },

  deviceName: String, // 👉 Assigned Device Name

  serialNumber: {
    type: String, // 👉 Device Serial Number
    sparse: true
  },

  location: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["in_stock", "in_use", "maintenance", "retired"],
    default: "in_stock"
  },

  condition: {
    type: String,
    enum: ["new", "used", "damaged"],
    default: "new"
  },

  notes: String,

  /* 🔹 ASSIGNMENT (COMMON) */
assignedTo: {
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  employeeName: String
},

  /* 🔹 HARDWARE SECTION (UI BLOCK) */
hardware: {
  modelNo: String,
  specifications: String,

  purchaseDate: Date,        // ✅ UI
  installationDate: Date,    // ✅ UI
  warrantyPurchaseDate: Date,
  warrantyExpiry: Date,
  insurancePurchaseDate: Date,
  insuranceExpiry: Date,
  insuranceId: String,       // ✅ UI
    // ✅ NEW FIELD
  insuranceTerm: {
    type: String,
    enum: ["6_months", "1_year", "3_years"],
    default: "1_year"
  },

  nextMaintenanceDate: Date,
  purchaseCost: costSchema,   // 🔥 NEW
  costs: {
    maintenanceCost: Number,
    warrantyRenewalCost: Number,
    insuranceCost: Number
  }
},

  /* 🔹 SOFTWARE SECTION (UI BLOCK) */
software: {
  licenseKey: String,
  licenseNumber: String,

  purchaseDate: Date,
  installationDate: Date,   // ✅ UI
  renewalDate: Date,
  lastUsedDate: Date,
  purchaseCost: costSchema,   // 🔥 NEW
  costs: {
    renewalCost: Number     // ✅ UI
  }
},

  /* 🔹 UI DERIVED FIELD (IMPORTANT) */
  licenseAssignedTo: {
    type: String // 👉 shown in UI ("Licences Assigned To")
  },

  /* 🔹 LIFECYCLE (KEEP AS IS - GOOD DESIGN) */
  lifecycle: [
    {
      action: String,
      from: Object,
      to: Object,
      date: { type: Date, default: Date.now },
      notes: String
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},
{ timestamps: true }
);
module.exports = mongoose.model("AssetInstance", assetInstanceSchema);