const express = require("express");
const {
  createCompanyLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  updateCompanyLicense,
  deleteCompanyLicense
} = require("../controllers/coreCompanyLicenseController");

const router = express.Router();

router.post("/", createCompanyLicense);
router.get("/", getCompanyLicenses);
router.get("/:id", getCompanyLicenseById);
router.put("/:id", updateCompanyLicense);
router.delete("/:id", deleteCompanyLicense);
router.post("/bulk-upload", async (req, res) => {
  try {
    const { assets } = req.body;
    const formatted = assets.map(a => ({
      documentType: a["Document Type"],
      licenseNumber: a["License Number"],
      issuingAuthority: a["Issuing Authority"],
      licenseHolder: a["License Holder"],
      businessActivity: a["Business Activity"],
      issueDate: new Date(a["Issue Date"]),
      expiryDate: new Date(a["Expiry Date"]),
      renewalCycle: a["Renewal Cycle"],
      reminderDaysBefore: Number(a["Reminder Days"] || 30),
      status: a["Status"],
    }));
    const inserted = await CoreCompanyLicense.insertMany(formatted);
    res.status(201).json({ success: true, insertedCount: inserted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;

