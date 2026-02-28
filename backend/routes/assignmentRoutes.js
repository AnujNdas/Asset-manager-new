const express = require("express");
const {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  returnAsset,
  getEmployeesByDepartment
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

// ---- IN-STOCK ASSIGNMENT FLOW ----
router.get("/instock/category-summary", getInStockCategorySummary);

router.get("/instock/assets/:category", getInStockAssetsByCategory);

router.post("/instock/assign", assignAssetsFromStock);

router.get("/department/:departmentId", getEmployeesByDepartment);

// ---- RETURN ASSIGNED ASSET ----
router.put("/return/:assignmentId", returnAsset);

module.exports = router;