const express = require("express");
const SoftwareAsset = require("../models/SoftwareAsset"); // ✅ import your software model
const {
  createSoftwareAsset,
  getSoftwareAssets,
  getSoftwareAssetById,
  updateSoftwareAsset,
  deleteSoftwareAsset
} = require("../controllers/softwareAssetController");

const router = express.Router();

router.post("/", createSoftwareAsset);
router.get("/", getSoftwareAssets);
router.get("/:id", getSoftwareAssetById);
router.put("/:id", updateSoftwareAsset);
router.delete("/:id", deleteSoftwareAsset);

router.post("/bulk-upload", async (req, res) => {
  try {
    const { assets } = req.body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: "No software assets provided" });
    }

    const formatted = assets.map(a => ({
      name: a["Software Name"] || "N/A",
      version: a["Version"] || "N/A",
      publisher: a["Publisher"] || "N/A",
      category: a["Category"] || "N/A",
      licenseKey: a["License Key"] || "N/A",
      licenseType: a["License Type"] || "N/A",
      totalLicenses: Number(a["Total Licenses"] || 0),
      licensesAssigned: Number(a["Licenses Assigned"] || 0),
      licenseExpiry: a["License Expiry"] ? new Date(a["License Expiry"]) : null,
      purchaseDate: a["Purchase Date"] ? new Date(a["Purchase Date"]) : null,
      complianceStatus: a["Compliance Status"] || "N/A",
      assignedTo: a["Assigned To"] || "N/A",
      installLocation: a["Install Location"] || "N/A",
      purchaseOrder: a["Purchase Order"] || "N/A",
      cost: a["Cost"] || 0,
      licenseModel: a["License Model"] || "N/A",
      licenseUse: a["License Use"] || "N/A",
    }));

    const inserted = await SoftwareAsset.insertMany(formatted, { ordered: false });

    res.status(201).json({ success: true, insertedCount: inserted.length });
  } catch (err) {
    console.error("Software bulk upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
