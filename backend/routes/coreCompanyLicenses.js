const express = require("express");
const CoreCompanyLicense = require("../models/CoreCompanyLicense"); // ✅ import model
const {
  createCompanyLicense,
  getCompanyLicenses,
  getCompanyLicenseById,
  updateCompanyLicense,
  deleteCompanyLicense
} = require("../controllers/coreCompanyLicenseController");

const Status = require("../models/Status")
const authenticateToken = require("../Middleware/Authentication-token");
const router = express.Router();

router.post("/",authenticateToken(), createCompanyLicense);
router.get("/",authenticateToken(), getCompanyLicenses);
router.get("/:id" , authenticateToken(), getCompanyLicenseById);
router.put("/:id",authenticateToken(), updateCompanyLicense);
router.delete("/:id",authenticateToken(), deleteCompanyLicense);
router.post("/bulk-upload", async (req, res) => {
  try {
    const { assets, mode } = req.body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: "No core licenses provided" });
    }

    // Fetch existing statuses
    const statuses = await Status.find({});
    const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

    const formatted = [];

    for (const [index, a] of assets.entries()) {
      let statusId = statusMap.get(a["Status"]?.toLowerCase() || "");

      if (mode === "auto" && !statusId && a["Status"]) {
        // Create missing status safely
        try {
          const newStatus = await Status.create({ name: a["Status"] });
          statusId = newStatus._id;
          statusMap.set(a["Status"].toLowerCase(), statusId);
        } catch (err) {
          // Handle duplicate key race
          const existing = await Status.findOne({ name: a["Status"] });
          statusId = existing._id;
          statusMap.set(a["Status"].toLowerCase(), statusId);
        }
      }

      formatted.push({
        documentType: a["Document Type"] || "N/A",
        licenseNumber: a["License Number"] || "N/A",
        issuingAuthority: a["Issuing Authority"] || "N/A",
        licenseHolder: a["License Holder"] || "N/A",
        businessActivity: a["Business Activity"] || "N/A",
        issueDate: a["Issue Date"] ? new Date(a["Issue Date"]) : null,
        expiryDate: a["Expiry Date"] ? new Date(a["Expiry Date"]) : null,
        renewalCycle: a["Renewal Cycle"] || "Annual",
        reminderDaysBefore: Number(a["Reminder Days"] || 30),
        status: statusId || null, // store reference if exists
      });
    }

    const inserted = await CoreCompanyLicense.insertMany(formatted, { ordered: false });

    res.status(201).json({
      success: true,
      insertedCount: inserted.length,
      mode: mode || "strict",
    });
  } catch (err) {
    console.error("Core License bulk upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
