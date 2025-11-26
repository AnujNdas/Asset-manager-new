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
const multer = require("multer");
const upload = multer();

router.post("/",authenticateToken(), createSoftwareAsset);
router.get("/",authenticateToken(),getSoftwareAssets);
router.get("/:id",authenticateToken(), getSoftwareAssetById);
router.put("/:id",authenticateToken(), updateSoftwareAsset);
router.delete("/:id",authenticateToken(), deleteSoftwareAsset);


router.post("/bulk-upload", upload.none(), async (req, res) => {
  try {
    let assets = [];

    // Parse JSON array
    try {
      assets = JSON.parse(req.body.assets);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid assets JSON received",
      });
    }

    const mode = req.body.mode || "strict";

    // Fetch existing categories & statuses
    const categories = await Category.find({});
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c._id]));

    const statuses = await Status.find({});
    const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

    const formatted = [];

    for (const row of assets) {
      let categoryId = null;
      const categoryName = row["Category"]?.toLowerCase();

      if (categoryName && categoryMap.has(categoryName)) {
        categoryId = categoryMap.get(categoryName);
      } else if (mode === "auto" && categoryName) {
        const newCat = await Category.create({ name: row["Category"] });
        categoryId = newCat._id;
        categoryMap.set(categoryName, newCat._id);
      }

      let statusId = null;
      const statusName = row["Compliance Status"]?.toLowerCase();

      if (statusName && statusMap.has(statusName)) {
        statusId = statusMap.get(statusName);
      } else if (mode === "auto" && statusName) {
        const newStatus = await Status.create({ name: row["Compliance Status"] });
        statusId = newStatus._id;
        statusMap.set(statusName, newStatus._id);
      }

      formatted.push({
        name: row["Software Name"],
        version: row["Version"] || null,
        publisher: row["Publisher"] || null,
        category: categoryId,
        licenseKey: row["License Key"] || null,
        licenseType: row["License Type"] || null,
        licenseModel: row["License Model"] || null,
        licenseUse: row["License Use"] || null,
        licenseMetric: row["License Metric"] || null,
        totalLicenses: Number(row["Total Licenses"] || 0),
        licensesAssigned: Number(row["Licenses Assigned"] || 0),
        licenseStartDate: row["License Start Date"] ? new Date(row["License Start Date"]) : null,
        licenseExpiry: row["License Expiry"] ? new Date(row["License Expiry"]) : null,
        renewalCycle: row["Renewal Cycle"] || null,
        purchaseDate: row["Purchase Date"] ? new Date(row["Purchase Date"]) : null,
        costPerUnit: Number(row["Cost Per Unit"] || 0),
        currency: row["Currency"] || "INR",
        purchaseOrder: row["Purchase Order"] || null,
        complianceStatus: statusId,
        assignedTo: row["Assigned To"]
          ? row["Assigned To"].split(",").map(s => s.trim())
          : [],
        installLocation: row["Install Location"] || null,
      });
    }

    const inserted = await SoftwareAsset.insertMany(formatted, { ordered: false });

    return res.status(201).json({
      success: true,
      inserted: inserted.length,
      skipped: assets.length - inserted.length,
      mode,
    });

  } catch (err) {
    console.error("Software bulk upload error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});





module.exports = router;
