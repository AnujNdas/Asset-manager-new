const mongoose = require("mongoose");

const CoreCompanyLicenseSchema = new mongoose.Schema(
  {
    // ✅ Basic License / Document Info
    licenseName: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    documentType: { type: String, required: true }, // Pollution, GST, Import, etc.
    licenseCategory: { type: String }, // Optional if more specific categorization
    issuingAuthority: { type: String, required: true },
    businessType: { type: String }, // Sole Proprietorship, Pvt Ltd, etc.
    jurisdiction: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
    },
    industrySector: { type: String },
    description: { type: String },

    // ✅ Validity & Renewal Details
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    renewalTerms: { type: String }, // e.g., Renewable every 1 year
    renewalFrequency: { type: String }, // "Annual", "Bi-Annual", etc.
    gracePeriod: { type: Number, default: 0 }, // Days after expiry
    reminderDaysBefore: { type: Number, default: 30 },
    status: { type: String, default: "Active" }, // Active, Expired, Pending Renewal

    // ✅ Business Identification
    businessDetails: {
      legalName: { type: String, required: true },
      registrationNumber: { type: String }, // CIN, GSTIN, Udyam No.
      address: {
        registered: { type: String },
        operational: { type: String },
      },
      contact: {
        phone: { type: String },
        email: { type: String },
        fax: { type: String },
      },
      authorizedSignatories: [
        {
          name: String,
          designation: String,
          contact: String,
        },
      ],
    },

    // ✅ Compliance & Regulatory
    complianceChecklist: [{ type: String }], // e.g., [Fire NOC, Pollution Certificate]
    verificationStatus: { type: String, default: "Pending" }, // Verified / Rejected
    auditTrail: [
      {
        action: String,
        user: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ✅ Document Uploads
    documents: [
      {
        fileName: String,
        fileType: String, // PDF, Image, DOC
        fileUrl: String, // Cloudinary / AWS path
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ Financial / Payment Info
    financialDetails: {
      licenseCost: { type: Number },
      paymentStatus: { type: String, default: "Unpaid" }, // Paid, Due, Overdue
      paymentDate: { type: Date },
      invoiceNumber: { type: String },
      penalties: { type: Number, default: 0 },
    },

    // ✅ Role-Based Access & Security
    accessControl: {
      viewableBy: [{ type: String }], // Roles: Admin, Manager, Auditor
      editableBy: [{ type: String }],
    },

    // ✅ Optional Cross-Border / Other Licensing Info
    crossBorderDetails: {
      isCrossBorder: { type: Boolean, default: false },
      importExportLicenseNo: { type: String },
      foreignJurisdiction: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoreCompanyLicense", CoreCompanyLicenseSchema);
