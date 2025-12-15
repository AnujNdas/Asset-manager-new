const express = require("express");
const {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  returnAsset,
} = require("../controllers/assignmentController");

const router = express.Router();

// ---- IN-STOCK ASSIGNMENT FLOW ----
router.get("/instock/category-summary", getInStockCategorySummary);
router.get("/instock/assets/:category", getInStockAssetsByCategory);
router.post("/instock/assign", assignAssetsFromStock);

// ---- RETURN ASSIGNED ASSET ----
router.put("/return/:assignmentId", returnAsset);

module.exports = router;
