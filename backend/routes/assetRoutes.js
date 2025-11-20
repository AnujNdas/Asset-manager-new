const express = require("express");
const multer = require("multer");
const path = require("path");
const authenticateToken = require("../Middleware/Authentication-token");
const {
  addAsset,
  deleteAsset,
  getAllAssets,
  generateAssetCode,
  updateAsset,
} = require("../controllers/assetControllers");

const Assets = require("../models/Asset"); 
const Category = require("../models/Category");
const Unit = require("../models/Unit");
const Location = require("../models/Location");
const Status = require("../models/Status");

const router = express.Router();

// Multer storage
const storage = require("../Middleware/cloudinaryStorage");
const upload = multer({ storage });



// Routes
router.post(
  "/",
  authenticateToken(),
  upload.single("image"),
  addAsset
);

router.put(
  "/:id",
  authenticateToken(),
  upload.single("image"),
  updateAsset
);
router.get("/", authenticateToken(), getAllAssets);


// ✅ Bulk Upload Route
router.post("/bulk-upload", async (req, res) => {
  console.log("Bulk upload route hit");
  console.log("req.body:", req.body);

  try {
    // Extract assets and mode
    const { assets, mode } = req.body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: "No assets provided" });
    }

    // Fetch reference data from DB
    const categories = await Category.find({});
    const units = await Unit.find({});
    const locations = await Location.find({});
    const statuses = await Status.find({});

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c._id]));
    const unitMap = new Map(units.map(u => [u.name.toLowerCase(), u._id]));
    const locationMap = new Map(locations.map(l => [l.name.toLowerCase(), l._id]));
    const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

    let validAssets = [];
    let invalidRows = [];

    for (const [index, asset] of assets.entries()) {
      let categoryId = categoryMap.get(asset.assetCategory?.toLowerCase() || "");
      let unitId = unitMap.get(asset.associateUnit?.toLowerCase() || "");
      let locationId = locationMap.get(asset.locationName?.toLowerCase() || "");
      let statusId = statusMap.get(asset.assetStatus?.toLowerCase() || "");

      if (mode === "strict") {
        // Strict mode: skip rows missing references
        if (!categoryId || !unitId || !locationId || !statusId) {
          invalidRows.push({ row: index + 2, asset });
          continue;
        }
      } else {
        // Auto mode: create missing references for super-admin
        if (!categoryId && asset.assetCategory) {
          let existingCategory = categoryMap.get(asset.assetCategory.toLowerCase());
          if (!existingCategory) {
            try {
              const newCategory = await Category.create({ name: asset.assetCategory });
              categoryId = newCategory._id;
              categoryMap.set(asset.assetCategory.toLowerCase(), categoryId);
            } catch (err) {
              // Handle duplicate key race
              const existing = await Category.findOne({ name: asset.assetCategory });
              categoryId = existing._id;
              categoryMap.set(asset.assetCategory.toLowerCase(), categoryId);
            }
          } else categoryId = existingCategory;
        }

        if (!unitId && asset.associateUnit) {
          let existingUnit = unitMap.get(asset.associateUnit.toLowerCase());
          if (!existingUnit) {
            try {
              const newUnit = await Unit.create({ name: asset.associateUnit });
              unitId = newUnit._id;
              unitMap.set(asset.associateUnit.toLowerCase(), unitId);
            } catch (err) {
              const existing = await Unit.findOne({ name: asset.associateUnit });
              unitId = existing._id;
              unitMap.set(asset.associateUnit.toLowerCase(), unitId);
            }
          } else unitId = existingUnit;
        }

        if (!locationId && asset.locationName) {
          let existingLocation = locationMap.get(asset.locationName.toLowerCase());
          if (!existingLocation) {
            try {
              const newLocation = await Location.create({ name: asset.locationName });
              locationId = newLocation._id;
              locationMap.set(asset.locationName.toLowerCase(), locationId);
            } catch (err) {
              const existing = await Location.findOne({ name: asset.locationName });
              locationId = existing._id;
              locationMap.set(asset.locationName.toLowerCase(), locationId);
            }
          } else locationId = existingLocation;
        }

        if (!statusId && asset.assetStatus) {
          let existingStatus = statusMap.get(asset.assetStatus.toLowerCase());
          if (!existingStatus) {
            try {
              const newStatus = await Status.create({ name: asset.assetStatus });
              statusId = newStatus._id;
              statusMap.set(asset.assetStatus.toLowerCase(), statusId);
            } catch (err) {
              const existing = await Status.findOne({ name: asset.assetStatus });
              statusId = existing._id;
              statusMap.set(asset.assetStatus.toLowerCase(), statusId);
            }
          } else statusId = existingStatus;
        }
      }

      validAssets.push({
        assetCode: asset.assetCode || "AUTO-GENERATED",
        assetCategory: categoryId,
        barcodeNumber: asset.barcodeNumber || "N/A",
        assetName: asset.assetName || "N/A",
        associateUnit: unitId,
        image: asset.image || "N/A",
        locationName: locationId,
        assetSpecification: asset.assetSpecification || "N/A",
        assetStatus: statusId,
        DOP: asset.DOP || null,
        DOE: asset.DOE || null,
        assetLifetime: asset.assetLifetime || "N/A",
        purchaseFrom: asset.purchaseFrom || "N/A",
      });
    }

    if (validAssets.length > 0) {
      await Assets.insertMany(validAssets, { ordered: false });
    }

    res.status(201).json({
      success: true,
      insertedCount: validAssets.length,
      skippedCount: invalidRows.length,
      invalidRows,
      mode,
    });

  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});





// ✅ Correct
module.exports = router;
