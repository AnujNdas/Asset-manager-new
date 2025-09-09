// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const HardwareAsset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const CoreCompanyLicense = require("../models/CoreCompanyLicense");
const User = require("../models/User");

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const hardwareCount = await HardwareAsset.countDocuments();
    const softwareCount = await SoftwareAsset.countDocuments();
    const coreLicensesCount = await CoreCompanyLicense.countDocuments();
    const activeLicenses = await CoreCompanyLicense.countDocuments({ status: "Active" });
    const expiredLicenses = await CoreCompanyLicense.countDocuments({ status: "Expired" });
    const usersCount = await User.countDocuments();

    res.json({
      hardwareCount,
      softwareCount,
      coreLicensesCount,
      activeLicenses,
      expiredLicenses,
      usersCount
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
