const express = require("express");
const { addAsset , deleteAsset , getAllAssets , generateBarcode ,generateAssetCode } = require("../controllers/assetControllers");


const router = express.Router();

// Routes for asset operations
router.post("/", addAsset);  //Add an assets
router.get("/", getAllAssets); //Fetch assets
router.delete("/:id", deleteAsset); // Delete assets using id
// Route to generate asset code
router.get('/asset-code', generateAssetCode);

// Route to generate barcode
router.get('/generate-barcode', generateBarcode);

module.exports = router;
