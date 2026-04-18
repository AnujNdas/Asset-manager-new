const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

const {
  addAsset,
  deleteAsset,
  getAllAssets,
  updateAsset,
  bulkUploadAssets,
  bulkUploadInstances,
  createAssetInstance,
  getAssetById,
  updateAssetInstance
} = require("../controllers/assetControllers");

const router = express.Router();

const multer = require("multer");
const uploadBulk = multer({ dest: "uploads/bulk/" });

// ➤ ADD ASSET
router.post(
  "/",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription,
  addAsset
);

// ➤ UPDATE ASSET
router.put(
  "/:id",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription,
  updateAsset
);

// ➤ GET ASSETS
router.get(
  "/",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription,
  getAllAssets
);
router.get(
  "/:id",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription,
  getAssetById
);
// ➤ DELETE ASSET
router.delete(
  "/:id",
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription,
  deleteAsset
);

// ➤ BULK UPLOAD
router.post(
  "/bulk-upload",
  authenticateToken(["admin"]),
  tenantMiddleware,
  requireActiveSubscription,
  uploadBulk.single("file"), // ✅ single field
  bulkUploadAssets
);
router.post(
  "/bulk-Instances",
  authenticateToken(["admin"]),
  tenantMiddleware,
  requireActiveSubscription,
  uploadBulk.fields([{ name: "excel" }]),
  bulkUploadInstances
);
router.post(
  "/create-instances",
  authenticateToken(["admin"]),
  tenantMiddleware,
  requireActiveSubscription,
  createAssetInstance
);
router.put(
  "/update-instances/:id",
  authenticateToken(["admin"]),
  tenantMiddleware,
  requireActiveSubscription,
  updateAssetInstance
);

module.exports = router;