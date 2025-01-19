const express = require("express");
const { addAsset , deleteAsset , getAllAssets } = require("../controllers/assetControllers");


const router = express.Router();

// Routes for asset operations
router.post("/", addAsset);  //Add an assets
router.get("/", getAllAssets); //Fetch assets
router.delete("/:id", deleteAsset); // Delete assets using id

module.exports = router;