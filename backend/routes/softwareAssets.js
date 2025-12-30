const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createSoftwareAsset,
  getSoftwareAssets,
  updateSoftwareAsset,
  deleteSoftwareAsset,
  bulkUploadSoftware // ✅ ADD THIS
} = require("../controllers/softwareAssetController");

const authenticateToken = require("../Middleware/Authentication-token");

const upload = multer(); // for bulk upload (excel / csv)
const uploadBulk = multer({ dest: "uploads/bulk/" });
/* -------------------- CRUD -------------------- */

router.post("/", authenticateToken(), createSoftwareAsset);
router.get("/", authenticateToken(), getSoftwareAssets);
router.put("/:id", authenticateToken(), updateSoftwareAsset);
router.delete("/:id", authenticateToken(), deleteSoftwareAsset);
/* -------------------- BULK UPLOAD -------------------- */

router.post(
  "/bulk-upload",
  authenticateToken(),
 uploadBulk.fields([{ name: "excel" }]),
  bulkUploadSoftware
);

module.exports = router;
