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
  type: new mongoose.Schema({
    modelNo: String,
    specifications: String,
    purchaseDate: Date,
    installationDate: Date,
    warrantyPurchaseDate: Date,
    warrantyExpiry: Date,
    insurancePurchaseDate: Date,
    insuranceExpiry: Date,
    insuranceId: String,
    qrCode: {
      url: String,
      public_id: String
    },
    insuranceTerm: {
      type: String,
      enum: ["6_months", "1_year", "3_years"],
      default: "1_year"
    },
    coverageType: {
      type: [String],
      enum: [
    "comprehensive",
    "accidental_damage",
    "third_party",
    "other",
    "theft_burglary",
    "fire_lightning",
    "natural_disasters",
    "vandalism",
    "business_interruption",
    "transit_marine_cargo",
    "cyber_physical_damage",
    "electrical_surge",
    "mechanical_breakdown",
    "none"
  ],
      default: ["comprehensive"]
    },
    nextMaintenanceDate: Date,
    purchaseCost: costSchema,
    costs: {
      maintenanceCost: Number,
      warrantyRenewalCost: Number,
      insuranceCost: Number
    }
  }, { _id: false }),

  default: undefined   // 🔥 CRITICAL FIX
},

  /* 🔹 SOFTWARE SECTION (UI BLOCK) */
software: {
  type: new mongoose.Schema({
    licenseKey: String,
    licenseNumber: String,
    purchaseDate: Date,
    installationDate: Date,
    renewalDate: Date,
    lastUsedDate: Date,
    purchaseCost: costSchema,
    costs: {
      renewalCost: Number
    }
  }, { _id: false }),

  default: undefined   // 🔥 IMPORTANT
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
