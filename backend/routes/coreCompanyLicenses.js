const express = require("express");
const CoreCompanyLicense = require("../models/CoreCompanyLicense"); // ✅ import model
const {
  createCompanyLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  updateCompanyLicense,
  deleteCompanyLicense
} = require("../controllers/coreCompanyLicenseController");

const authenticateToken = require("../Middleware/Authentication-token");
const router = express.Router();

router.post("/",authenticateToken(), createCompanyLicense);
router.get("/",authenticateToken(), getCompanyLicenses);
router.get("/:id" , authenticateToken(), getCompanyLicenseById);
router.put("/:id",authenticateToken(), updateCompanyLicense);
router.delete("/:id",authenticateToken(), deleteCompanyLicense);
router.post("/bulk-upload",authenticateToken(), async (req, res) => {
  try {
    const { assets } = req.body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: "No core licenses provided" });
    }

    const formatted = assets.map(a => ({
      documentType: a["Document Type"] || "N/A",
      licenseNumber: a["License Number"] || "N/A",
      issuingAuthority: a["Issuing Authority"] || "N/A",
      licenseHolder: a["License Holder"] || "N/A",
      businessActivity: a["Business Activity"] || "N/A",
      issueDate: a["Issue Date"] ? new Date(a["Issue Date"]) : null,
      expiryDate: a["Expiry Date"] ? new Date(a["Expiry Date"]) : null,
      renewalCycle: a["Renewal Cycle"] || "Annual",
      reminderDaysBefore: Number(a["Reminder Days"] || 30),
      status: a["Status"] || "Active",
    }));

    const inserted = await CoreCompanyLicense.insertMany(formatted, { ordered: false });

    res.status(201).json({ success: true, insertedCount: inserted.length });
  } catch (err) {
    console.error("Core License bulk upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;
