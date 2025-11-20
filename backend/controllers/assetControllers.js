const Asset = require("../models/Asset");
const LastAssetCode = require("../models/LastAssetCode");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");

// -----------------------------------------
// ADD ASSET
// -----------------------------------------
const addAsset = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "assets",
    });

    const newAsset = new Asset({
      ...req.body,
      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
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



// -----------------------------------------
// UPDATE ASSET
// -----------------------------------------
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingAsset = await Asset.findById(id);
    if (!existingAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    let updatedAssetData = { ...req.body };

    // Keep generated fields unchanged
    updatedAssetData.assetCode = existingAsset.assetCode;
    updatedAssetData.barcodeNumber = existingAsset.barcodeNumber;

    // If new image uploaded → replace old Cloudinary image
    if (req.file) {

      // Delete old file from Cloudinary
      if (existingAsset.imagePublicId) {
        await cloudinary.uploader.destroy(existingAsset.imagePublicId);
      }

      // Upload new one
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "assets",
      });

      updatedAssetData.image = uploadResult.secure_url;
      updatedAssetData.imagePublicId = uploadResult.public_id;
    }

    const updatedAsset = await Asset.findByIdAndUpdate(id, updatedAssetData, { new: true });

    // Notification
    const newNotification = await Notification.create({
      title: "Asset Updated",
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



// -----------------------------------------
// DELETE ASSET
// -----------------------------------------
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedAsset = await Asset.findByIdAndDelete(id);
    if (!deletedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Delete image from Cloudinary
    if (deletedAsset.imagePublicId) {
      await cloudinary.uploader.destroy(deletedAsset.imagePublicId);
    }

    // Notification
    const newNotification = await Notification.create({
      title: "Asset Deleted",
      message: "Asset deleted successfully.",
      userId,
    });

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    return res.status(200).json({ message: "Asset successfully deleted", deletedAsset });

  } catch (error) {
    return res.status(500).json({ message: "Error deleting asset", error: error.message });
  }
};




// -----------------------------------------
// GET ALL ASSETS
// -----------------------------------------
const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching assets", error: error.message });
  }
};



// -----------------------------------------
// GENERATE ASSET CODE
// -----------------------------------------
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

    const assetCode = `ASSET-${newCodeNumber.toString().padStart(3, "0")}`;

    res.json({ assetCode });
  } catch (error) {
    console.error("Error generating asset code:", error);
    res.status(500).json({ message: "Internal server error while generating asset code" });
  }
};



module.exports = {
  addAsset,
  updateAsset,
  deleteAsset,
  getAllAssets,
  generateAssetCode,
};
