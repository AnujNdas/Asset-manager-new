const express = require("express");
const multer = require("multer");
const path = require("path");
const { addAsset, deleteAsset, getAllAssets, generateAssetCode, generateBarcode, updateAsset } = require("../controllers/assetControllers");

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
router.post("/", upload.single("image"), addAsset);  // Add an asset with image upload
router.get("/", getAllAssets); // Fetch all assets
router.delete("/:id", deleteAsset); // Delete an asset using its ID

// Route to generate asset code
router.get('/asset-code', generateAssetCode);

// Route to generate barcode
router.get('/generate-barcode', generateBarcode);

router.put("/:id", upload.single("image"), updateAsset);  // Update asset with ID and image upload

module.exports = router;
