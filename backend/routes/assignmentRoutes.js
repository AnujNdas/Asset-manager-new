const express = require("express");
const {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetInstance,      // ✅ NEW
  returnAssetInstance,      // ✅ NEW
  reassignAssetInstance,    // ✅ NEW
  getEmployeesByDepartment,
  getInstancesByAsset
} = require("../controllers/assignmentController");

const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

const router = express.Router();

/* ----------------------------------
   GLOBAL PROTECTION FOR THIS ROUTER
----------------------------------- */
router.use(
  authenticateToken(["admin","user"]),
  tenantMiddleware,
  requireActiveSubscription
);

/* ==================================
   IN-STOCK FLOW (UNCHANGED)
================================== */

router.get("/instock/category-summary", getInStockCategorySummary);

router.get("/instock/assets/:category", getInStockAssetsByCategory);

router.get("/department/:departmentId", getEmployeesByDepartment);

router.get("/instances/:assetId", getInstancesByAsset);
/* ==================================
   INSTANCE-BASED ASSIGNMENT
================================== */

// 🔥 Assign SINGLE instance
router.post("/assign-instance", assignAssetInstance);

// 🔥 Return instance
router.put("/return/:assignmentId", returnAssetInstance);

// 🔥 Reassign instance
router.put("/reassign/:assignmentId", reassignAssetInstance);
module.exports = router;