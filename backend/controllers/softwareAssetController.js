const SoftwareAsset = require("../models/SoftwareAsset");
const Category = require("../models/Category");
const Status = require("../models/Status");
const Unit = require("../models/Unit");
const AssetAssignment = require("../models/AssetAssignment");
const Location = require("../models/Location");
const sendNotification = require("../utils/notify");
const { convertToBase, BASE_CURRENCY } = require("../utils/currency");

/* ======================================================
   GENERATE SOFTWARE CODE (ORG-SCOPED)
====================================================== */
const generateSoftwareCode = async (organizationId) => {
  const lastAsset = await SoftwareAsset.findOne({
    organizationId,
    assetCode: { $regex: /^SW-\d+$/ }
  })
    .sort({ createdAt: -1 })
    .select("assetCode")
    .lean();

  let nextNumber = 1;

  if (lastAsset?.assetCode) {
    nextNumber = parseInt(lastAsset.assetCode.split("-")[1], 10) + 1;
  }

  return `SW-${String(nextNumber).padStart(3, "0")}`;
};

/* ======================================================
   BULK UPLOAD SOFTWARE
====================================================== */
const bulkUploadSoftware = async (req, res) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { assets, mode = "strict" } = req.body;
    const parsedAssets = Array.isArray(assets) ? assets : JSON.parse(assets);

    const [categories, units, locations, statuses] = await Promise.all([
      Category.find({ organizationId }),
      Unit.find({ organizationId }),
      Location.find({ organizationId }),
      Status.find({ organizationId })
    ]);

    const normalize = v => v?.toString().trim().toLowerCase();

    const categoryMap = new Map(categories.map(c => [normalize(c.name), c._id]));
    const unitMap = new Map(units.map(u => [normalize(u.name), u._id]));
    const locationMap = new Map(locations.map(l => [normalize(l.name), l._id]));
    const statusMap = new Map(statuses.map(s => [normalize(s.name), s._id]));

    let validAssets = [];
    let invalidRows = [];

    for (const [index, asset] of parsedAssets.entries()) {
      try {
        const catKey = normalize(asset.assetCategory);
        const unitKey = normalize(asset.associateUnit);
        const locKey = normalize(asset.locationName);
        const statusKey = normalize(asset.assetStatus);

        let categoryId = categoryMap.get(catKey);
        let unitId = unitMap.get(unitKey);
        let locationId = locationMap.get(locKey);
        let statusId = statusMap.get(statusKey);

        if (mode === "strict" && (!categoryId || !unitId || !locationId || !statusId)) {
          invalidRows.push({ row: index + 2, reason: "Missing reference data", asset });
          continue;
        }

        const upsertRef = async (Model, name, map) => {
          if (!name) return null;
          const doc = await Model.findOneAndUpdate(
            { name: new RegExp(`^${name}$`, "i"), organizationId },
            { name, organizationId, isActive: true },
            { upsert: true, new: true }
          );
          map.set(normalize(name), doc._id);
          return doc._id;
        };

        if (!categoryId) categoryId = await upsertRef(Category, asset.assetCategory, categoryMap);
        if (!unitId) unitId = await upsertRef(Unit, asset.associateUnit, unitMap);
        if (!locationId) locationId = await upsertRef(Location, asset.locationName, locationMap);
        if (!statusId) statusId = await upsertRef(Status, asset.assetStatus, statusMap);

        const quantity = Number(asset.assetQuantity || 1);
        if (quantity <= 0) throw new Error("Invalid license quantity");

        const amount = Number(asset.assetCost || 0);
        const currency = (asset.assetCurrency || BASE_CURRENCY).toUpperCase();

        validAssets.push({
          organizationId,
          assetCode: await generateSoftwareCode(organizationId),

          assetName: asset.assetName,
          assetCategory: categoryId,
          associateUnit: unitId,
          locationName: locationId,
          assetStatus: statusId,

          assetSpecification: asset.assetSpecification,
          purchaseFrom: asset.purchaseFrom,

          licenseKey: asset.licenseKey,
          licenseType: asset.licenseType,
          licenseModel: asset.licenseModel,
          licenseMetric: asset.licenseMetric,
          licenseUse: asset.licenseUse,

          DOP: asset.DOP,
          DOE: asset.DOE,
          assetLifetime: asset.assetLifetime,

          assetQuantity: quantity,
          inUse: 0,
          licensesAssigned: 0,

          assetCost: {
            amount,
            currency,
            baseAmount: convertToBase(amount, currency)
          },

          auditHistory: [
            { date: new Date(), notes: `Bulk uploaded by user ${userId}` }
          ],

          createdBy: userId
        });
      } catch (err) {
        invalidRows.push({ row: index + 2, reason: err.message, asset });
      }
    }

    if (validAssets.length) {
      await SoftwareAsset.insertMany(validAssets, { ordered: false });
    }

    await sendNotification({
      req,
      userId,
      title: "Software Assets Uploaded",
      message: `${validAssets.length} software assets uploaded successfully.`,
      type: "success",
      redirectUrl: "/inventory"
    });

    res.json({
      success: true,
      inserted: validAssets.length,
      skipped: invalidRows.length,
      invalidRows
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   CREATE SOFTWARE ASSET
====================================================== */
const createSoftwareAsset = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user;

    if (!req.body.assetCost?.amount || !req.body.assetCost?.currency) {
      return res.status(400).json({
        success: false,
        message: "Asset cost amount and currency are required"
      });
    }

    const { amount, currency } = req.body.assetCost;

    const asset = await SoftwareAsset.create({
      ...req.body,
      organizationId,
      assetCode: await generateSoftwareCode(organizationId),
      assetCost: {
        amount: Number(amount),
        currency: currency.toUpperCase(),
        baseAmount: convertToBase(Number(amount), currency)
      },
      licensesAssigned: 0,
      auditHistory: [{ date: new Date(), notes: `Created by user ${userId}` }]
    });

    await sendNotification({
      req,
      userId,
      title: "Software Asset Added",
      message: `Software "${asset.assetName}" was added successfully.`,
      type: "success",
      redirectUrl: "/inventory"
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    console.error("Create Software Asset Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   GET SOFTWARE ASSETS (ORG-SCOPED)
====================================================== */
const getSoftwareAssets = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const assets = await SoftwareAsset.find({ organizationId })
      .sort({ createdAt: -1 })
      .lean();

    const assignments = await AssetAssignment.find({
      organizationId,
      assetType: "software",
      status: "active"
    })
      .populate("assignedTo", "name")
      .lean();

    const assignmentMap = {};

    for (const a of assignments) {
      const id = String(a.assetId);
      assignmentMap[id] ??= { inUse: 0, assignedDepartments: [] };
      assignmentMap[id].inUse += a.quantity;
      assignmentMap[id].assignedDepartments.push({
        department: a.assignedTo,
        quantity: a.quantity
      });
    }

    res.json({
      success: true,
      data: assets.map(asset => ({
        ...asset,
        inUse: assignmentMap[asset._id]?.inUse || 0,
        assignedDepartments: assignmentMap[asset._id]?.assignedDepartments || []
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   UPDATE / DELETE (ORG-SAFE)
====================================================== */
const updateSoftwareAsset = async (req, res) => {
  try {
    const { organizationId, id: userId } = req.user;

    const asset = await SoftwareAsset.findOne({
      _id: req.params.id,
      organizationId
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (req.body.assetCost) {
      const { amount, currency } = req.body.assetCost;
      asset.assetCost = {
        amount: Number(amount),
        currency: currency.toUpperCase(),
        baseAmount: convertToBase(Number(amount), currency)
      };
    }

    Object.assign(asset, req.body);

    asset.auditHistory.push({
      date: new Date(),
      notes: `Updated by user ${userId}`
    });

    await asset.save();

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSoftwareAsset = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const asset = await SoftwareAsset.findOneAndDelete({
      _id: req.params.id,
      organizationId
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

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
  deleteSoftwareAsset
};
