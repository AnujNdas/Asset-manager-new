const express = require("express");
const SoftwareAsset = require("../models/SoftwareAsset"); // ✅ import your software model
const {
  createSoftwareAsset,
  getSoftwareAssets,
  getSoftwareAssetById,
  updateSoftwareAsset,
  deleteSoftwareAsset
} = require("../controllers/softwareAssetController");
const Category = require("../models/Category");
const Status = require("../models/Status")
const authenticateToken = require("../Middleware/Authentication-token");
const router = express.Router();

router.post("/",authenticateToken(), createSoftwareAsset);
router.get("/",authenticateToken(),getSoftwareAssets);
router.get("/:id",authenticateToken(), getSoftwareAssetById);
router.put("/:id",authenticateToken(), updateSoftwareAsset);
router.delete("/:id",authenticateToken(), deleteSoftwareAsset);

router.post("/bulk-upload", async (req, res) => {
  try {
    const { assets, mode } = req.body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: "No software assets provided" });
    }

    // Fetch existing categories and statuses
    const categories = await Category.find({});
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c._id]));

    const statuses = await Status.find({});
    const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

    const formatted = [];

    for (const a of assets) {
      // Handle category
      let categoryId = categoryMap.get(a["Category"]?.toLowerCase() || "");
      if (mode === "auto" && !categoryId && a["Category"]) {
        try {
          const newCategory = await Category.create({ name: a["Category"] });
          categoryId = newCategory._id;
          categoryMap.set(a["Category"].toLowerCase(), categoryId);
        } catch (err) {
          const existing = await Category.findOne({ name: a["Category"] });
          categoryId = existing._id;
          categoryMap.set(a["Category"].toLowerCase(), categoryId);
        }
      }

      // Handle compliance status
      let statusId = statusMap.get(a["Compliance Status"]?.toLowerCase() || "");
      if (mode === "auto" && !statusId && a["Compliance Status"]) {
        try {
          const newStatus = await Status.create({ name: a["Compliance Status"] });
          statusId = newStatus._id;
          statusMap.set(a["Compliance Status"].toLowerCase(), statusId);
        } catch (err) {
          const existing = await Status.findOne({ name: a["Compliance Status"] });
          statusId = existing._id;
          statusMap.set(a["Compliance Status"].toLowerCase(), statusId);
        }
      }

      formatted.push({
        name: a["Software Name"] || "N/A",
        version: a["Version"] || "N/A",
        publisher: a["Publisher"] || "N/A",
        category: categoryId || null,
        licenseKey: a["License Key"] || "N/A",
        licenseType: a["License Type"] || "N/A",
        totalLicenses: Number(a["Total Licenses"] || 0),
        licensesAssigned: Number(a["Licenses Assigned"] || 0),
        licenseExpiry: a["License Expiry"] ? new Date(a["License Expiry"]) : null,
        purchaseDate: a["Purchase Date"] ? new Date(a["Purchase Date"]) : null,
        complianceStatus: statusId || null, // store reference
        assignedTo: a["Assigned To"] || "N/A",
        installLocation: a["Install Location"] || "N/A",
        purchaseOrder: a["Purchase Order"] || "N/A",
        cost: a["Cost"] || 0,
        licenseModel: a["License Model"] || "N/A",
        licenseUse: a["License Use"] || "N/A",
      });
    }

    const inserted = await SoftwareAsset.insertMany(formatted, { ordered: false });

    res.status(201).json({
      success: true,
      insertedCount: inserted.length,
      mode: mode || "strict",
    });
  } catch (err) {
    console.error("Software bulk upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router;
