const Asset = require("../models/Asset")
const LastAssetCode = require('../models/LastAssetCode');
const crypto = require('crypto');

const Notification = require("../models/Notification");
// Add a new Asset
const addAsset = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Incoming data:", req.body);
    console.log("Uploaded file:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Convert uploaded file to Base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const newAsset = new Asset({
      ...req.body,
      image: base64Image,
    });

    const savedAsset = await newAsset.save();

    // Notification
    const newNotification = await Notification.create({
      title: "Asset Added",
      message: "Asset added successfully.",
      userId,
    });

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    return res.status(201).json(savedAsset);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error adding asset", error: error.message });
  }
};



const updateAsset = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existingAsset = await Asset.findById(id);
    if (!existingAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    let updatedAssetData = { ...req.body };

    updatedAssetData.assetCode = existingAsset.assetCode;
    updatedAssetData.barcodeNumber = existingAsset.barcodeNumber;

    if (req.file) {
      updatedAssetData.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const updatedAsset = await Asset.findByIdAndUpdate(id, updatedAssetData, { new: true });

    const newNotification = await Notification.create({
      title: "Asset updated",
      message: "Asset updated successfully.",
      userId,
    });

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    return res.status(200).json(updatedAsset);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating asset", error: error.message });
  }
};




// Delete an asset by ID
const deleteAsset = async (req,res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deletedAsset = await Asset.findByIdAndDelete(id);
        if (!deletedAsset) {
            return res.status(404).json({ message : "Asset not found"});
        }
        res.status(200).json({ message : "Asset succesfully deleted", deletedAsset});

             // Create notification
    const newNotification = await Notification.create({
      title: "Asset Deleted",
      message: "Asset Deleted  successfully.",
      userId,
    });
    // Emit to user's room
    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);
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


module.exports = {
    addAsset,
    deleteAsset,
    getAllAssets,
    generateAssetCode,
    updateAsset
};
