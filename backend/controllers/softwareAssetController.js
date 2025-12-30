const SoftwareAsset = require("../models/SoftwareAsset");
const Category = require("../models/Category");
const Status = require("../models/Status");
const Unit = require("../models/Unit");
const AssetAssignment = require("../models/AssetAssignment");
const Location = require("../models/Location");
const sendNotification = require("../utils/notify");
const { convertToBase, BASE_CURRENCY } = require("../utils/currency");


const bulkUploadSoftware = async (req, res) => {
  try {
    console.log("🔥 Software Bulk upload request received.");

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
    const normalize = (v) => v?.trim().toLowerCase();
    
    for (const [index, asset] of parsedAssets.entries()) {
      const catKey = normalize(asset.assetCategory);
      const unitKey = normalize(asset.associateUnit);
      const locKey = normalize(asset.locationName);
      const statusKey = normalize(asset.assetStatus);

      let categoryId = categoryMap.get(catKey);
      let unitId = unitMap.get(unitKey);
      let locationId = locationMap.get(locKey);
      let statusId = statusMap.get(statusKey);

      // ---------- STRICT MODE ----------
      if (mode === "strict" && (!categoryId || !unitId || !locationId || !statusId)) {
        invalidRows.push({
          row: index + 2,
          reason: "Missing reference data",
          asset
        });
        continue;
      }

      // ---------- CATEGORY ----------
      if (!categoryId && catKey) {
        const category = await Category.findOneAndUpdate(
          { name: new RegExp(`^${asset.assetCategory}$`, "i") },
          { name: asset.assetCategory },
          { upsert: true, new: true }
        );
        categoryId = category._id;
        categoryMap.set(catKey, categoryId);
      }

      // ---------- UNIT ----------
      if (!unitId && unitKey) {
        const unit = await Unit.findOneAndUpdate(
          { name: new RegExp(`^${asset.associateUnit}$`, "i") },
          { name: asset.associateUnit },
          { upsert: true, new: true }
        );
        unitId = unit._id;
        unitMap.set(unitKey, unitId);
      }

      // ---------- LOCATION ----------
      if (!locationId && locKey) {
        const location = await Location.findOneAndUpdate(
          { name: new RegExp(`^${asset.locationName}$`, "i") },
          { name: asset.locationName },
          { upsert: true, new: true }
        );
        locationId = location._id;
        locationMap.set(locKey, locationId);
      }

      // ---------- STATUS ----------
      if (!statusId && statusKey) {
        const status = await Status.findOneAndUpdate(
          { name: new RegExp(`^${asset.assetStatus}$`, "i") },
          { name: asset.assetStatus },
          { upsert: true, new: true }
        );
        statusId = status._id;
        statusMap.set(statusKey, statusId);
      }

      // ---------- LICENSE RULES ----------
      const totalLicenses = Number(asset.assetQuantity || 1);

      if (totalLicenses < 0) {
        invalidRows.push({
          row: index + 2,
          reason: "Invalid license quantity",
          asset
        });
        continue;
      }
const assetCode = await generateSoftwareCode(); // backend util
      const amount = Number(asset.assetCost || 0);
      const currency = (asset.assetCurrency || BASE_CURRENCY).toUpperCase();

      const baseAmount = convertToBase(amount, currency);
      // ---------- FINAL PUSH ----------
      validAssets.push({
        assetCode,
        assetName: asset.assetName,
        assetCategory: categoryId,
        assetSpecification: asset.assetSpecification,
        purchaseFrom: asset.purchaseFrom,
        associateUnit: unitId,

        locationName: locationId,
        locationAddress: asset.locationAddress,

        licenseKey: asset.licenseKey,
        licenseType: asset.licenseType,
        licenseModel: asset.licenseModel,
        licenseMetric: asset.licenseMetric,
        licenseUse: asset.licenseUse,

        DOP: asset.DOP,
        DOE: asset.DOE,
        assetLifetime: asset.assetLifetime,

        assetStatus: statusId,

        assetQuantity: totalLicenses,
        inUse: 0, // 🔒 enforced

         assetCost: {
            amount,
            currency,
            baseAmount,
          },

        assignedUsers: [], // 🔒 empty on creation
        linkedDevices: [],
      });
    }

    if (validAssets.length) {
      await SoftwareAsset.insertMany(validAssets, { ordered: false });
    }
      await sendNotification({
    req,
    userId: req.user.id,
    title: "Software Assets Uploaded",
    message: `${validAssets.length} software assets uploaded successfully.`,
    type: "success",
    redirectUrl: "/inventory",
  });
    return res.status(200).json({
      success: true,
      inserted: validAssets.length,
      skipped: invalidRows.length,
      invalidRows,
    });

  } catch (err) {
    console.error("❌ Software Bulk Upload Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Create a new software asset
const createSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Generate asset code
    const assetCode = await generateSoftwareCode();

    // ✅ Validate asset cost
    if (!req.body.assetCost?.amount || !req.body.assetCost?.currency) {
      return res.status(400).json({
        success: false,
        message: "Asset cost amount and currency are required",
      });
    }

    const { amount, currency } = req.body.assetCost;

    const assetCost = {
      amount: Number(amount),
      currency: currency.toUpperCase(),
      baseAmount: convertToBase(
        Number(amount),
        currency.toUpperCase()
      ),
    };

    const payload = {
      ...req.body,
      assetCode,               // 🔥 FIX
      assetCost,
      licensesAssigned: 0,
      auditHistory: [
        { date: new Date(), notes: `Created by user ${userId}` },
      ],
    };

    const asset = await SoftwareAsset.create(payload);

    await sendNotification({
      req,
      userId,
      title: "Software Asset Added",
      message: `Software "${asset.assetName}" was added successfully.`,
      type: "success",
      redirectUrl: "/inventory",
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    console.error("Create Software Asset Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all software assets
const getSoftwareAssets = async (req, res) => {
  try {
    // 1️⃣ Fetch all software assets
    const assets = await SoftwareAsset.find()
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ Fetch active assignments for software assets
    const assignments = await AssetAssignment.find({
      assetType: "software",
      status: "active",
    })
      .populate("assignedTo", "name")
      .lean();

    // 3️⃣ Group assignments by assetId
    const assignmentMap = {};

    for (const assign of assignments) {
      const assetId = String(assign.assetId);

      if (!assignmentMap[assetId]) {
        assignmentMap[assetId] = {
          inUse: 0,
          assignedDepartments: [],
        };
      }

      assignmentMap[assetId].inUse += assign.quantity;

      assignmentMap[assetId].assignedDepartments.push({
        department: assign.assignedTo,
        quantity: assign.quantity,
      });
    }

    // 4️⃣ Merge assignment data into assets
    const enrichedAssets = assets.map((asset) => {
      const assignmentData = assignmentMap[String(asset._id)];

      return {
        ...asset,
        inUse: assignmentData?.inUse || 0,
        assignedDepartments: assignmentData?.assignedDepartments || [],
      };
    });

    return res.json({
      success: true,
      data: enrichedAssets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Update software asset
const updateSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user.id;

    const existing = await SoftwareAsset.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    let updatedCost = existing.assetCost;

    if (req.body.assetCost) {
      const { amount, currency } = req.body.assetCost;

      updatedCost = {
        amount: Number(amount),
        currency: currency.toUpperCase(),
        baseAmount: convertToBase(
          Number(amount),
          currency.toUpperCase()
        ),
      };
    }

    const updatedState = {
      ...existing.toObject(),
      ...req.body,
      assetCost: updatedCost,
      auditHistory: [
        ...(existing.auditHistory || []),
        { date: new Date(), notes: `Updated by user ${userId}` },
      ],
    };

    const asset = await SoftwareAsset.findByIdAndUpdate(
      req.params.id,
      updatedState,
      { new: true, runValidators: true }
    );

    await sendNotification({
      req,
      userId,
      title: "Software Asset Updated",
      message: `Software "${asset.assetName}" was updated.`,
      type: "info",
      redirectUrl: "/inventory",
    });

    res.json({ success: true, data: asset });
  } catch (error) {
    console.error("Update Software Asset Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Delete software asset
const deleteSoftwareAsset = async (req, res) => {
  try {
    const userId = req.user.id;

    const asset = await SoftwareAsset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

await sendNotification({
  req,
  userId,
  title: "Software Asset Deleted",
  message: `Software "${asset.assetName}" was deleted.`,
  type: "warning",
  redirectUrl: "/inventory",
});

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const generateSoftwareCode = async () => {
  const lastAsset = await SoftwareAsset
    .findOne({ assetCode: { $regex: /^SW-\d+$/ } })
    .sort({ createdAt: -1 })
    .select("assetCode")
    .lean();

  let nextNumber = 1;

  if (lastAsset?.assetCode) {
    const lastNumber = parseInt(lastAsset.assetCode.split("-")[1], 10);
    nextNumber = lastNumber + 1;
  }

  return `SW-${String(nextNumber).padStart(3, "0")}`;
};


module.exports = {
  bulkUploadSoftware,
  createSoftwareAsset,
  getSoftwareAssets,
  updateSoftwareAsset,
  deleteSoftwareAsset,
};
