const SoftwareAsset = require("../models/SoftwareAsset");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Status = require("../models/Status");
const Unit = require("../models/Unit");
const AssetAssignment = require("../models/AssetAssignment");
const Location = require("../models/Location");
// Helper to update compliance based on license usage & expiry
const checkCompliance = (asset) => {
  if (asset.licenseExpiry && new Date(asset.licenseExpiry) < new Date()) {
    return "Expired";
  }
  if (asset.licensesAssigned > asset.totalLicenses) {
    return "Non-Compliant";
  }
  return "Compliant";
};

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

      // ---------- FINAL PUSH ----------
      validAssets.push({
        assetCode: asset.assetCode,
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

        assetCost: Number(asset.assetCost || 0),

        assignedUsers: [], // 🔒 empty on creation
        linkedDevices: [],
      });
    }

    if (validAssets.length) {
      await SoftwareAsset.insertMany(validAssets, { ordered: false });
    }

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

    const payload = {
      ...req.body,
      licensesAssigned: 0, // 🔒 enforced
    };

    // Auto calculations
    if (payload.totalLicenses && payload.costPerUnit) {
      payload.totalCost = payload.totalLicenses * payload.costPerUnit;
    }

    payload.complianceStatus = checkCompliance(payload);

    payload.auditHistory = [
      { date: new Date(), notes: `Created by user ${userId}` },
    ];

    const asset = await SoftwareAsset.create(payload);

    // Expiry reminder
    if (
      asset.licenseExpiry &&
      asset.licenseExpiry - new Date() < 30 * 24 * 60 * 60 * 1000
    ) {
      await Notification.create({
        title: "License Expiry Soon",
        message: `License for '${asset.name}' will expire soon.`,
        userId,
      });
    }

    const notification = await Notification.create({
      title: "Software Asset Added",
      message: `Software '${asset.name}' has been added.`,
      userId,
    });

    req.app.get("io").to(userId.toString()).emit("newNotification", notification);

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

    // Merge state
    const updatedState = {
      ...existing.toObject(),
      ...req.body,
    };

    // Auto calculations
    if (updatedState.totalLicenses && updatedState.costPerUnit) {
      updatedState.totalCost =
        updatedState.totalLicenses * updatedState.costPerUnit;
    }

    updatedState.complianceStatus = checkCompliance(updatedState);

    updatedState.auditHistory = [
      ...(existing.auditHistory || []),
      { date: new Date(), notes: `Updated by user ${userId}` },
    ];

    const asset = await SoftwareAsset.findByIdAndUpdate(
      req.params.id,
      updatedState,
      { new: true, runValidators: true }
    );

    const notification = await Notification.create({
      title: "Software Asset Updated",
      message: `Software '${asset.name}' has been updated.`,
      userId,
    });

    req.app.get("io").to(userId.toString()).emit("newNotification", notification);

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

    const notification = await Notification.create({
      title: "Software Asset Deleted",
      message: `Software '${asset.name}' has been deleted.`,
      userId,
    });

    req.app.get("io").to(userId.toString()).emit("newNotification", notification);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  bulkUploadSoftware,
  createSoftwareAsset,
  getSoftwareAssets,
  updateSoftwareAsset,
  deleteSoftwareAsset,
};
