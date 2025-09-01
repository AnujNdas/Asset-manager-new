const mongoose = require("mongoose")

const SoftwareAssetSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Software Name
  version: String,
  publisher: String,
  category: String,
  installLocation: String,
  licenseKey: String,
  licenseType: String, // Perpetual, Subscription, Trial
  licenseModel: String, // Per User, Per Device, etc.
  totalLicenses: Number,
  licensesAssigned: Number,
  licensesAvailable: Number,
  licenseExpiry: Date,
  purchaseDate: Date,
  contractTerm: String,
  purchaseOrder: String,
  costPerUnit: Number,
  totalCost: Number,
  assignedTo: [{ type: String }], // users, departments
  linkedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "HardwareAsset" }],
  complianceStatus: { type: String, enum: ["Compliant", "Over-Used", "Expired", "Under-Utilized"] },
  supportContract: {
    startDate: Date,
    endDate: Date,
    vendorContact: String,
  },
  subscriptionId: String, // SaaS Tenant ID
  lastAccess: Date,
  authenticationMethod: String,
  businessUnit: String,
  criticality: String, // High, Medium, Low
  riskClassification: String,
  vendorContactDetails: String,
  contractDocs: [{ type: String }], // file links
  integrationDependencies: [{ type: String }],
  auditHistory: [{ date: Date, notes: String }],
  optimizationRecommendation: String,
}, { timestamps: true });

const SoftwareAsset =  mongoose.model("SoftwareAsset", SoftwareAssetSchema);
module.exports = SoftwareAsset;
