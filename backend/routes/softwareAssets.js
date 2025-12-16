const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createSoftwareAsset,
  getSoftwareAssets,
  getSoftwareAssetById,
  updateSoftwareAsset,
  deleteSoftwareAsset,
  bulkUploadSoftwareAssets // ✅ ADD THIS
} = require("../controllers/softwareAssetController");

const authenticateToken = require("../Middleware/Authentication-token");

const upload = multer(); // for bulk upload (excel / csv)

/* -------------------- CRUD -------------------- */

router.post("/", authenticateToken(), createSoftwareAsset);
router.get("/", authenticateToken(), getSoftwareAssets);
router.get("/:id", authenticateToken(), getSoftwareAssetById);
router.put("/:id", authenticateToken(), updateSoftwareAsset);
router.delete("/:id", authenticateToken(), deleteSoftwareAsset);

/* -------------------- BULK UPLOAD -------------------- */

router.post(
  "/bulk-upload",
  authenticateToken(),
  upload.none(),
  bulkUploadSoftwareAssets
);

module.exports = router;
