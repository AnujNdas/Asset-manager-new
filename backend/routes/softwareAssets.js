const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createSoftwareAsset,
  getSoftwareAssets,
  updateSoftwareAsset,
  deleteSoftwareAsset,
  bulkUploadSoftware
} = require("../controllers/softwareAssetController");

const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

const uploadBulk = multer({ dest: "uploads/bulk/" });

/* ----------------------------------
   GLOBAL PROTECTION FOR THIS ROUTER
----------------------------------- */
router.use(
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription
);

/* -------------------- CRUD -------------------- */

router.post("/", createSoftwareAsset);
router.get("/", getSoftwareAssets);
router.put("/:id", updateSoftwareAsset);
router.delete("/:id", deleteSoftwareAsset);

/* -------------------- BULK UPLOAD -------------------- */

router.post(
  "/bulk-upload",
  uploadBulk.fields([{ name: "excel" }]),
  bulkUploadSoftware
);

module.exports = router;