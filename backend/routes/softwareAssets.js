const express = require("express");
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
    const formatted = assets.map(a => ({
      name: a["Software Name"],
      version: a["Version"],
      publisher: a["Publisher"],
      category: a["Category"],
      licenseKey: a["License Key"],
      licenseType: a["License Type"],
      totalLicenses: Number(a["Total Licenses"] || 0),
      licensesAssigned: Number(a["Licenses Assigned"] || 0),
      licenseExpiry: a["License Expiry"] ? new Date(a["License Expiry"]) : null,
      purchaseDate: a["Purchase Date"] ? new Date(a["Purchase Date"]) : null,
      complianceStatus: a["Compliance Status"],
    }));
    const inserted = await SoftwareAsset.insertMany(formatted);
    res.status(201).json({ success: true, insertedCount: inserted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;
