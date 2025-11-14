const mongoose = require("mongoose");

const CoreCompanyLicenseSchema = new mongoose.Schema(
  {
    // Selected by User Dropdowns
    licenseType: { type: String, required: true },  
    businessLocation: { type: String, required: true },

    // Extracted fields stored dynamically
    extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Final saved & edited fields by user
    finalizedData: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Documents uploaded
    documents: [
      {
        fileName: String,
        fileType: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Status
    status: {
      type: String,
      default: "Pending Verification", // or Active, Expired, etc.
    },

    // Audit log
    auditTrail: [
      {
        action: String,
        user: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoreCompanyLicense", CoreCompanyLicenseSchema);
