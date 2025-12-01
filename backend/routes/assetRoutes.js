const express = require("express");
const path = require("path");
const authenticateToken = require("../Middleware/Authentication-token");

const {
  addAsset,
  deleteAsset,
  getAllAssets,
  generateAssetCode,
  updateAsset,
  bulkUpload,
} = require("../controllers/assetControllers");

const Assets = require("../models/Asset"); 
const Category = require("../models/Category");
const Unit = require("../models/Unit");
const Location = require("../models/Location");
const Status = require("../models/Status");

const router = express.Router();

// ❌ REMOVE image multer storage
// const storage = require("../Middleware/cloudinaryStorage");
// const upload = multer({ storage });

// ❌ KEEP only bulk excel upload
const multer = require("multer");
const uploadBulk = multer({ dest: "uploads/bulk/" });

// Routes
router.get("/asset-code", generateAssetCode);

// ➤ ADD ASSET (NO IMAGE NOW)
router.post(
  "/",
  authenticateToken(),
  addAsset
);

// ➤ UPDATE ASSET (NO IMAGE NOW)
router.put(
  "/:id",
  authenticateToken(),
  updateAsset
);

router.get("/", authenticateToken(), getAllAssets);

router.delete("/:id", authenticateToken(), deleteAsset);

// ➤ BULK UPLOAD (ONLY EXCEL NOW)
router.post(
  "/bulk-upload",
  uploadBulk.fields([{ name: "excel" }]),
  bulkUpload
);

module.exports = router;
