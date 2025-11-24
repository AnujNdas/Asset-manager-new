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
  bulkupload,
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
const uploadBulk = multer({ dest: "uploads/bulk/" });


// Routes
router.get("/asset-code", generateAssetCode);
router.post(
  "/",
  authenticateToken(),
  (req, res, next) => {
    console.log("🔥 A - Before Multer");
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    console.log("🔥 B - After Multer - req.file =", req.file);
    next();
  },
  addAsset
);


router.put(
  "/:id",
  authenticateToken(),
  upload.single("image"),
  (req, res, next) => {
    console.log("📌 Incoming BODY:", req.body);
    console.log("📌 Incoming FILES:", req.files);
    next();
  },
  updateAsset
);


router.get("/", authenticateToken(), getAllAssets);
router.delete("/:id", authenticateToken(), deleteAsset); 
router.post(
  "/bulk-upload",
  uploadBulk.fields([
    { name: "excel" },
    { name: "imagesZip" }
  ]),
  bulkUpload
);


// ✅ Correct
module.exports = router;
