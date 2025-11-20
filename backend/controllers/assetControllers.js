const Asset = require("../models/Asset");
const LastAssetCode = require("../models/LastAssetCode");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");


// -----------------------------------------
// ADD ASSET
// -----------------------------------------
const addAsset = async (req, res) => {
  try {
    console.log("FILE RECEIVED →", req.file);
    console.log("BODY RECEIVED →", req.body);

    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // CloudinaryStorage already uploads and gives this:
    const imageUrl = req.file.path; // secure url
    const publicId = req.file.filename; // public id

    const newAsset = new Asset({
      ...req.body,
      image: imageUrl,
      imagePublicId: publicId,
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
  console.log("🔥 REAL ADD ASSET ERROR →", error);

  return res.status(500).json({
    message: "Error adding asset",
    error: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
  });
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
  await cloudinary.uploader.destroy(existingAsset.imagePublicId);

  updatedAssetData.image = req.file.path;
  updatedAssetData.imagePublicId = req.file.filename;
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
