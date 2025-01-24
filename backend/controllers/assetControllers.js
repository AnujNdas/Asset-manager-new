const Asset = require("../models/Asset")
const LastAssetCode = require('../models/LastAssetCode');
const crypto = require('crypto');

// Add a new Asset
const addAsset = async (req, res) => {
  try {
      console.log("Incoming data:", req.body); // Log the incoming request body
      console.log("Uploaded file:", req.file);  // Log the uploaded file

      if (!req.file) {
          return res.status(400).json({ message: "Image is required" });
      }

      // Create the asset object with the data from req.body and image path
      const newAsset = new Asset({
          ...req.body,
          image: `/uploads/${req.file.filename}`,  // Save the image path
      });

      // Save the asset to the database
      const savedAsset = await newAsset.save();

      // Return the saved asset
      res.status(201).json(savedAsset);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding asset", error: error.message });
  }
};

// Delete an asset by ID
const deleteAsset = async (req,res) => {
    try {
        const { id } = req.params;
        const deletedAsset = await Asset.findByIdAndDelete(id);
        if (!deletedAsset) {
            return res.status(404).json({ message : "Asset not found"});
        }
        res.status(200).json({ message : "Asset succesfully deleted", deletedAsset});
    } catch (error) {
        res.status(500).json({ message : "Error deleting asset", error : error.message});
    }
};

// Get all Assets
const getAllAssets = async (req,res)=>{
    try {
        const Assets = await Asset.find();
        res.status(200).json(Assets);
    } catch (error) {
        res.status(500).json({ message : "Error feteching assets", error : error.message});
    }
};

const generateAssetCode = async (req, res) => {
    try {
      const lastCodeData = await LastAssetCode.findOne();
  
      let newCodeNumber;
      if (!lastCodeData) {
        newCodeNumber = 1;
        await LastAssetCode.create({ lastCode: newCodeNumber });
      } else {
        newCodeNumber = lastCodeData.lastCode + 1;
        await LastAssetCode.updateOne({}, { lastCode: newCodeNumber });
      }
  
      const assetCode = `ASSET-${newCodeNumber.toString().padStart(3, '0')}`;
      res.json({ assetCode });
    } catch (error) {
      console.error('Error generating asset code:', error);
      res.status(500).json({ message: 'Internal server error while generating asset code' });
    }
  };
  
  // Function to generate unique barcode
  const generateBarcode = async (req, res) => {
    try {
      const generateBarcode = () => crypto.randomBytes(6).toString('hex').toUpperCase(); // Random 12-character barcode
  
      let barcode = generateBarcode();
  
      // Ensure the barcode is unique
      while (await Asset.findOne({ barcodeNumber: barcode })) {
        barcode = generateBarcode();
      }
  
      res.json({ barcodeNumber: barcode });
    } catch (error) {
      console.error('Error generating barcode:', error);
      res.status(500).json({ message: 'Internal server error while generating barcode' });
    }
  };
  

module.exports = {
    addAsset,
    deleteAsset,
    getAllAssets,
    generateAssetCode,
    generateBarcode
};
