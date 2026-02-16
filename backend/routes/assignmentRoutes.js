const express = require("express");
const {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  returnAsset,
  getUsersByDepartment
} = require("../controllers/assignmentController");
const authenticateToken = require("../Middleware/Authentication-token");
const router = express.Router();

// ---- IN-STOCK ASSIGNMENT FLOW ----
router.get("/instock/category-summary",authenticateToken(["admin","user"]), getInStockCategorySummary);
router.get("/instock/assets/:category",authenticateToken(["admin","user"]), getInStockAssetsByCategory);
router.post("/instock/assign", authenticateToken(["admin","user"]), assignAssetsFromStock);
router.get("/department/:departmentId", authenticateToken(["admin","user"]), getUsersByDepartment);

// ---- RETURN ASSIGNED ASSET ----
router.put("/return/:assignmentId", returnAsset);

module.exports = router;
