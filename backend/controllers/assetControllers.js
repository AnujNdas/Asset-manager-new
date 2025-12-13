const Asset = require("../models/Asset");
const LastAssetCode = require("../models/LastAssetCode");
const Notification = require("../models/Notification");

const unzipper = require("unzipper");
const path = require("path");
const fs = require("fs");

const Category = require("../models/Category");
const Unit = require("../models/Unit");
const Location = require("../models/Location");
const Status = require("../models/Status");


// =======================================================================
// BULK UPLOAD
// =======================================================================
// ================= BULK UPLOAD =================
const bulkUpload = async (req, res) => {
  try {
    console.log("🔥 Bulk upload request received.");

    const { assets, mode } = req.body;
    const parsedAssets = JSON.parse(assets);

    const categories = await Category.find({});
    const units = await Unit.find({});
    const locations = await Location.find({});
    const statuses = await Status.find({});

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c._id]));
    const unitMap = new Map(units.map(u => [u.name.toLowerCase(), u._id]));
    const locationMap = new Map(locations.map(l => [l.name.toLowerCase(), l._id]));
    const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

    let validAssets = [];
    let invalidRows = [];

    for (const [index, asset] of parsedAssets.entries()) {
      let categoryId = categoryMap.get(asset.assetCategory?.toLowerCase());
      let unitId = unitMap.get(asset.associateUnit?.toLowerCase());
      let locationId = locationMap.get(asset.locationName?.toLowerCase());
      let statusId = statusMap.get(asset.assetStatus?.toLowerCase());

      if (mode === "strict" && (!categoryId || !unitId || !locationId || !statusId)) {
        invalidRows.push({ row: index + 2, asset });
        continue;
      }

      if (!categoryId && asset.assetCategory)
        categoryId = (await Category.create({ name: asset.assetCategory }))._id;
      if (!unitId && asset.associateUnit)
        unitId = (await Unit.create({ name: asset.associateUnit }))._id;
      if (!locationId && asset.locationName)
        locationId = (await Location.create({ name: asset.locationName }))._id;
      if (!statusId && asset.assetStatus)
        statusId = (await Status.create({ name: asset.assetStatus }))._id;

      const totalQty = Number(asset.assetQuantity || 1);
      const inUse = Number(asset.inUse || 0);

      if (inUse > totalQty) {
        invalidRows.push({ row: index + 2, reason: "InUse > Quantity", asset });
        continue;
      }

      validAssets.push({
        assetCode: asset.assetCode,
        assetCategory: categoryId,
        barcodeNumber: asset.barcodeNumber,
        assetName: asset.assetName,
        associateUnit: unitId,
        locationName: locationId,
        assetSpecification: asset.assetSpecification,
        assetStatus: statusId,
        DOP: asset.DOP,
        DOE: asset.DOE,
        assetLifetime: asset.assetLifetime,
        purchaseFrom: asset.purchaseFrom,

        assetCost: Number(asset.assetCost || 0),
        assetQuantity: totalQty,
        inUse,
      });
    }

    if (validAssets.length) {
      await Asset.insertMany(validAssets, { ordered: false });
    }

    return res.status(200).json({
      success: true,
      inserted: validAssets.length,
      skipped: invalidRows.length,
      invalidRows,
    });
  } catch (err) {
    console.error("❌ Bulk Upload Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};



// =======================================================================
// ADD ASSET
// =======================================================================
// ================= ADD ASSET =================
const addAsset = async (req, res) => {
  try {
    const userId = req.user.id;

    const assetQuantity = Number(req.body.assetQuantity || 1);
    const inUse = Number(req.body.inUse || 0);

    if (inUse > assetQuantity) {
      return res.status(400).json({
        message: "In-use quantity cannot exceed total quantity",
      });
    }

    const newAsset = new Asset({
      ...req.body,
      assetCost: req.body.assetCost || 0,
      assetQuantity,
      inUse,
    });

    const savedAsset = await newAsset.save();

    const notification = await Notification.create({
      title: "Asset Added",
      message: "Asset added successfully.",
      userId,
    });

    req.app.get("io").to(userId.toString()).emit("newNotification", notification);

    return res.status(201).json(savedAsset);
  } catch (error) {
    console.error("🔥 ADD ASSET ERROR:", error);
    return res.status(500).json({ message: "Error adding asset", error: error.message });
  }
};




// =======================================================================
// UPDATE ASSET
// =======================================================================
// ================= UPDATE ASSET =================
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log("REQ BODY:", req.body);
console.log("REQ HEADERS:", req.headers["content-type"]);


    const existingAsset = await Asset.findById(id);
    if (!existingAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const assetQuantity =
      req.body.assetQuantity ?? existingAsset.assetQuantity;
    const inUse =
      req.body.inUse ?? existingAsset.inUse;

    if (inUse > assetQuantity) {
      return res.status(400).json({
        message: "In-use quantity cannot exceed total quantity",
      });
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      id,
      {
        ...req.body,
        assetCode: existingAsset.assetCode,
        barcodeNumber: existingAsset.barcodeNumber,
        assetCost: req.body.assetCost ?? existingAsset.assetCost,
        assetQuantity,
        inUse,
      },
      { new: true }
    );

    const notification = await Notification.create({
      title: "Asset Updated",
      message: "Asset updated successfully.",
      userId,
    });

    req.app.get("io").to(userId.toString()).emit("newNotification", notification);

    return res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("🔥 UPDATE ASSET ERROR:", error);
    return res.status(500).json({ message: "Error updating asset", error: error.message });
  }
};




// =======================================================================
// DELETE ASSET
// =======================================================================
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedAsset = await Asset.findByIdAndDelete(id);
    if (!deletedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

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




// =======================================================================
// GET ALL ASSETS
// =======================================================================
const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching assets", error: error.message });
  }
};




// =======================================================================
// GENERATE ASSET CODE
// =======================================================================
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
  bulkUpload,
};
