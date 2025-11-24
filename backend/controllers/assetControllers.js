const Asset = require("../models/Asset");
const LastAssetCode = require("../models/LastAssetCode");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");

const unzipper = require("unzipper");
const path = require("path");
const fs = require("fs");

const Category = require("../models/Category");
const Unit = require("../models/Unit");
const Location = require("../models/Location");
const Status = require("../models/Status");

const bulkUpload = async (req, res) => {
  try {
    console.log("🔥 Bulk upload request received.");

    const { assets, mode } = req.body;
    const parsedAssets = JSON.parse(assets);

    let extractedImagesDir = null;

    // ------------------------------
    // 1) Extract ZIP Images (if exists)
    // ------------------------------
    if (req.files.imagesZip) {
      const zipPath = req.files.imagesZip[0].path;

      extractedImagesDir = path.join(
        "uploads",
        "unzipped",
        Date.now().toString()
      );

      fs.mkdirSync(extractedImagesDir, { recursive: true });

      await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractedImagesDir }))
        .promise();

      console.log("📦 ZIP extracted at:", extractedImagesDir);
    }

    // ------------------------------
    // 2) Load DB Reference Lists
    // ------------------------------
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

    // ------------------------------
    // 3) Process Asset Rows
    // ------------------------------
    for (const [index, asset] of parsedAssets.entries()) {
      let categoryId = categoryMap.get(asset.assetCategory?.toLowerCase() || "");
      let unitId = unitMap.get(asset.associateUnit?.toLowerCase() || "");
      let locationId = locationMap.get(asset.locationName?.toLowerCase() || "");
      let statusId = statusMap.get(asset.assetStatus?.toLowerCase() || "");

      // Strict mode → skip missing
      if (mode === "strict" && (!categoryId || !unitId || !locationId || !statusId)) {
        invalidRows.push({ row: index + 2, asset });
        continue;
      }

      // Auto-create (non-strict)
      if (!categoryId && asset.assetCategory) {
        const newCategory = await Category.create({ name: asset.assetCategory });
        categoryId = newCategory._id;
      }

      if (!unitId && asset.associateUnit) {
        const newUnit = await Unit.create({ name: asset.associateUnit });
        unitId = newUnit._id;
      }

      if (!locationId && asset.locationName) {
        const newLocation = await Location.create({ name: asset.locationName });
        locationId = newLocation._id;
      }

      if (!statusId && asset.assetStatus) {
        const newStatus = await Status.create({ name: asset.assetStatus });
        statusId = newStatus._id;
      }

      // ------------------------------
      // 4) Upload Image (if included)
      // ------------------------------
      let imageUrl = null;
      let imagePublicId = null;

      if (asset.imageFile && extractedImagesDir) {
        const localImagePath = path.join(extractedImagesDir, asset.imageFile);

        if (fs.existsSync(localImagePath)) {
          const uploaded = await cloudinary.uploader.upload(localImagePath, {
            folder: "assets",
            public_id: `${Date.now()}-${asset.imageFile.split(".")[0]}`,
          });

          imageUrl = uploaded.secure_url;
          imagePublicId = uploaded.public_id;
        }
      }

      validAssets.push({
        assetCode: asset.assetCode,
        assetCategory: categoryId,
        barcodeNumber: asset.barcodeNumber,
        assetName: asset.assetName,
        associateUnit: unitId,
        image: imageUrl,
        imagePublicId,
        locationName: locationId,
        assetSpecification: asset.assetSpecification,
        assetStatus: statusId,
        DOP: asset.DOP,
        DOE: asset.DOE,
        assetLifetime: asset.assetLifetime,
        purchaseFrom: asset.purchaseFrom,
      });
    }

    // Insert into DB
    if (validAssets.length > 0) {
      await Asset.insertMany(validAssets, { ordered: false });
    }

    return res.status(201).json({
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
    console.log("⚡ UPDATE ASSET DEBUG START ⚡");
    console.log("➡ Route Params:", req.params);
    console.log("➡ Raw Body:", req.body);

    // Multer file debug
    console.log("➡ Multer req.file:", req.file);
    console.log("➡ Multer req.files:", req.files);

    const { id } = req.params;
    const userId = req.user.id;

    const existingAsset = await Asset.findById(id);
    if (!existingAsset) {
      console.log("❌ Asset not found in DB");
      return res.status(404).json({ message: "Asset not found" });
    }

    let updatedAssetData = { ...req.body };

    // Keep generated fields unchanged
    updatedAssetData.assetCode = existingAsset.assetCode;
    updatedAssetData.barcodeNumber = existingAsset.barcodeNumber;

    // Check for new uploaded file
    if (req.file) {
      console.log("📸 New image uploaded:", {
        url: req.file.path,
        public_id: req.file.public_id,
        fieldname: req.file.fieldname,
        originalname: req.file.originalname
      });

      // Delete old image from Cloudinary
      if (existingAsset.imagePublicId) {
        console.log("🧹 Deleting old Cloudinary image:", existingAsset.imagePublicId);
        await cloudinary.uploader.destroy(existingAsset.imagePublicId);
      }

      // Save new Cloudinary data
      updatedAssetData.image = req.file.path; // URL
      updatedAssetData.imagePublicId = req.file.public_id; // public_id
    } else {
      console.log("⚠ No new image uploaded — multer did not receive file!");
    }

    const updatedAsset = await Asset.findByIdAndUpdate(id, updatedAssetData, {
      new: true
    });

    console.log("✅ Asset updated successfully:", updatedAsset._id);

    // Notification
    const newNotification = await Notification.create({
      title: "Asset Updated",
      message: "Asset updated successfully.",
      userId,
    });

    const io = req.app.get("io");
    io.to(userId.toString()).emit("newNotification", newNotification);

    console.log("📨 Notification sent to user:", userId);

    console.log("⚡ UPDATE ASSET DEBUG END ⚡");

    return res.status(200).json(updatedAsset);

  } catch (error) {
    console.error("🔥 UPDATE ASSET ERROR:", error);
    return res.status(500).json({
      message: "Error updating asset",
      error: error.message
    });
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
  bulkUpload,
};
