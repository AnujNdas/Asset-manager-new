const express = require("express");
const {
  createSoftwareAsset,
  getSoftwareAssets,
  getSoftwareAssetById,
  updateSoftwareAsset,
  deleteSoftwareAsset
} = require("../controllers/softwareAssetController");

const router = express.Router();

router.post("/", createSoftwareAsset);
router.get("/", getSoftwareAssets);
router.get("/:id", getSoftwareAssetById);
router.put("/:id", updateSoftwareAsset);
router.delete("/:id", deleteSoftwareAsset);

module.exports = router;
