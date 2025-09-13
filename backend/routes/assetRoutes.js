const express = require("express");
const multer = require("multer");
const path = require("path");
const authenticateToken = require("../Middleware/Authentication-token");
const {
  addAsset,
  deleteAsset,
  getAllAssets,
  generateAssetCode,
  generateBarcode,
  updateAsset,
} = require("../controllers/assetControllers");

const Assets = require("../models/Asset"); // ✅ Import correct model

const router = express.Router();

// Set up multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files to the "uploads/" folder
  },
  filename: (req, file, cb) => {
    // Ensure unique filenames using timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes for asset operations
router.post("/", authenticateToken(), upload.single("image"), addAsset); // Add an asset with image upload
router.get("/", getAllAssets); // Fetch all assets
router.delete("/:id", authenticateToken(), deleteAsset); // Delete an asset using its ID

// Route to generate asset code
router.get("/asset-code", generateAssetCode);

// Route to generate barcode
router.get("/generate-barcode", generateBarcode);

// Update asset with ID and image upload
router.put("/:id", authenticateToken(), upload.single("image"), updateAsset);

// ✅ Fixed Bulk Upload Route
router.post("/bulk-upload", async (req, res) => {
  try {
    const assets = Array.isArray(req.body) ? req.body : req.body.assets;

    if (!assets || assets.length === 0) {
      return res.status(400).json({ success: false, message: "No assets provided" });
    }

    // Clean missing fields (avoid validation errors)
    const cleanedAssets = assets.map((asset) => ({
      assetCode: asset.assetCode || "N/A",
      assetCategory: asset.assetCategory || "N/A",
      barcodeNumber: asset.barcodeNumber || "N/A",
      assetName: asset.assetName || "N/A",
      associateUnit: asset.associateUnit || "N/A",
      image: asset.image || "N/A",
      locationName: asset.locationName || "N/A",
      assetSpecification: asset.assetSpecification || "N/A",
      assetStatus: asset.assetStatus || "N/A",
      DOP: asset.DOP || "N/A",
      DOE: asset.DOE || "N/A",
      assetLifetime: asset.assetLifetime || "N/A",
      purchaseFrom: asset.purchaseFrom || "N/A",
    }));

    const inserted = await Assets.insertMany(cleanedAssets, { ordered: false });

    res.status(201).json({
      success: true,
      insertedCount: inserted.length,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
