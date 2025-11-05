const mongoose = require("mongoose");

const SoftwareAssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: String,
  publisher: String,
  category: String,
  installLocation: String,
  assetTag: String, // ✅ Unique Software Asset ID

  // License Info
  licenseKey: String,
  licenseType: String,
  licenseModel: String,
  licenseMetric: String, // ✅ Per User / Device / Concurrent
  licenseUse: String,
  licenseStartDate: Date, // ✅ Added
  licenseExpiry: Date,
  renewalCycle: String, // ✅ Monthly / Yearly
  renewalReminder: { type: Boolean, default: true }, // ✅ Notify before expiration

  totalLicenses: Number,
  licensesAssigned: Number,
  licensesAvailable: Number,

  // Financial Info
  purchaseDate: Date,
  costPerUnit: Number,
  totalCost: Number,
  currency: String, // ✅ INR, USD
  costCenter: String, // ✅ IT Dept, Finance Dept
  purchaseOrder: String,

  // Assignment & Usage
  assignedTo: [{ type: String }],
  assignedUsers: [{ type: String }], // ✅ Usernames/Emails
  linkedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "HardwareAsset" }],
  geoRestriction: String, // ✅ Region Locking

  // Contract / Compliance
  contractTerm: String,
  contractDocs: [{ type: String }],
  supportContract: {
    startDate: Date,
    endDate: Date,
    vendorContact: String,
  },
  licenseDocument: [{ type: String }], // ✅ New field for additional files
  subscriptionId: String,
  complianceStatus: { type: String },

  // System Info
  lastAccess: Date,
  authenticationMethod: String,
  businessUnit: String,
  criticality: String,
  riskClassification: String,
  vendorContactDetails: String,
  integrationDependencies: [{ type: String }],
  auditHistory: [{ date: Date, notes: String }],
  optimizationRecommendation: String,

}, { timestamps: true });

const SoftwareAsset = mongoose.model("SoftwareAsset", SoftwareAssetSchema);
module.exports = SoftwareAsset;
