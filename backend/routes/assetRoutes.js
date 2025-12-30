const express = require("express");
const path = require("path");
const authenticateToken = require("../Middleware/Authentication-token");

const {
  addAsset,
  deleteAsset,
  getAllAssets,
  updateAsset,
  bulkUpload,
} = require("../controllers/assetControllers");



const router = express.Router();

const multer = require("multer");
const uploadBulk = multer({ dest: "uploads/bulk/" });


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
  uploadBulk.fields([{ name: "excel" }]), authenticateToken(),
  bulkUpload
);

module.exports = router;
