const mongoose = require("mongoose")

const CoreCompanyLicenseSchema = new mongoose.Schema({
  documentType: { type: String, required: true }, 
  licenseNumber: { type: String, required: true, unique: true },
  issuingAuthority: { type: String, required: true },
  licenseHolder: { type: String, required: true }, // Company Name
  businessActivity: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  renewalCycle: { type: String},
  reminderDaysBefore: { type: Number, default: 30 }, // e.g., send alert 30 days before expiry
  status: { type: String},
}, { timestamps: true });

const CoreCompanyLicense =  mongoose.model("CoreCompanyLicense", CoreCompanyLicenseSchema);
module.exports = CoreCompanyLicense;
