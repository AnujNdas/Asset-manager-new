const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");

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

// ➤ ADD ASSET
router.post(
  "/",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  addAsset
);

// ➤ UPDATE ASSET
router.put(
  "/:id",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  updateAsset
);

// ➤ GET ASSETS
router.get(
  "/",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  getAllAssets
);

// ➤ DELETE ASSET
router.delete(
  "/:id",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  deleteAsset
);

// ➤ BULK UPLOAD
router.post(
  "/bulk-upload",
  authenticateToken(["admin"]),
  tenantMiddleware,
  uploadBulk.fields([{ name: "excel" }]),
  bulkUpload
);

module.exports = router;
