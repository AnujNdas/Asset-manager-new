const SoftwareAsset = require("../models/SoftwareAsset");
const Category = require("../models/Category");
const Status = require("../models/Status");
const Unit = require("../models/Unit");
const AssetAssignment = require("../models/AssetAssignment");
const Location = require("../models/Location");
const sendNotification = require("../utils/notify");
const { convertToBase, BASE_CURRENCY } = require("../utils/currency");
const pricingTiers = require("../config/pricingTiers");
const Subscription = require("../models/Subscription");
const generateInstances = require("../utils/generateInstances");
const AssetInstance = require("../models/AssetInstance");
const Counter = require("../models/Counter");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const parseDate = (value) => {
  if (!value) return null;

  // Excel serial
  if (!isNaN(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + Number(value) * 86400000);
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};
const calculateCycles = (type, startDate, endDate) => {
  if (type === "one_time") return 1;

  const start = new Date(startDate);
  const end = new Date(endDate);

if (!startDate || !endDate) {
  throw new Error("DOP and DOE required");
}

if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
  throw new Error("Invalid DOP / DOE");
}

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (type === "monthly") return months || 1;
  if (type === "yearly") return Math.floor(months / 12) || 1;

  return 1;
};

/* ======================================================
   GENERATE SOFTWARE CODE (ORG-SCOPED)
====================================================== */
// utils/generateSoftwareCode.js



const generateSoftwareCode = async (organizationId) => {
  const counter = await Counter.findOneAndUpdate(
    {
      name: "softwareAsset",
      organizationId,
    },
    {
      $inc: { seq: 1 },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return `SW-${String(counter.seq).padStart(3, "0")}`;
};

module.exports = generateSoftwareCode;

/* ======================================================
   BULK UPLOAD SOFTWARE
====================================================== */


  const bulkUploadSoftware = asyncHandler(async (req, res, next) => {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    /* ================= SUBSCRIPTION ================= */
    const subscription = await Subscription.findOne({ organizationId });

    if (!subscription) {
      throw new AppError(
        "No active subscription found",
        403,
        "NO_SUBSCRIPTION"
      );
    }

    const tier = pricingTiers.find(t => t.key === subscription.tier);

    if (!tier) {
      throw new AppError(
        "Invalid subscription tier",
        500,
        "INVALID_TIER_CONFIG"
      );
    }

    const softwareLimit = tier.assets;

    /* ================= INPUT ================= */
    const { assets, mode = "strict" } = req.body;

    if (!Array.isArray(assets) || assets.length === 0) {
      throw new AppError(
        "Assets must be a non-empty array",
        400,
        "INVALID_INPUT"
      );
    }

    const normalize = (v) =>
  v
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const VALID_TYPES = ["monthly", "yearly", "one_time"];

  const validateType = (type) => {
    const t = normalize(type);

    if (!VALID_TYPES.includes(t)) {
      throw new Error(
        `Invalid asset type "${type}". Allowed: ${VALID_TYPES.join(", ")}`
      );
    }

    return t;
  };

    /* ================= REFERENCES ================= */
    const [categories, units, locations] = await Promise.all([
      Category.find({ organizationId }).lean(),
      Unit.find({ organizationId }).lean(),
      Location.find({ organizationId }).lean(),
    ]);

    const categoryMap = new Map(categories.map(c => [normalize(c.name), c._id]));
    const unitMap = new Map(units.map(u => [normalize(u.name), u._id]));
    const locationMap = new Map(locations.map(l => [normalize(l.name), l._id]));

    const upsert = async (Model, name, map) => {
      if (!name) return null;

      const key = normalize(name);
      if (map.has(key)) return map.get(key);

      const doc = await Model.findOneAndUpdate(
        { name: new RegExp(`^${name}$`, "i"), organizationId },
        { name, organizationId },
        { upsert: true, new: true }
      );

      map.set(key, doc._id);
      return doc._id;
    };

    /* ================= CODE GENERATION ================= */
    const last = await SoftwareAsset.findOne({
      organizationId,
      assetCode: { $regex: /^SW-\d+$/ }
    }).sort({ createdAt: -1 });

    let nextCode = last
      ? parseInt(last.assetCode.split("-")[1]) + 1
      : 1;

    let tempAssets = [];
    let invalidRows = [];

    /* ================= PROCESS ================= */
    for (const [index, asset] of assets.entries()) {
      try {
        const row = index + 2;

        const type = validateType(asset.type);

        let categoryId = categoryMap.get(normalize(asset.assetCategory));
        let unitId = unitMap.get(normalize(asset.associateUnit));
        let locationId = locationMap.get(normalize(asset.locationName));

  if (mode === "strict") {

    const missing = [];

    if (!categoryId) {
      missing.push(
        `Category "${asset.assetCategory}" not found`
      );
    }

    if (!unitId) {
      missing.push(
        `Unit "${asset.associateUnit}" not found`
      );
    }

    if (!locationId) {
      missing.push(
        `Location "${asset.locationName}" not found`
      );
    }

    if (missing.length > 0) {
      throw new Error(missing.join(" | "));
    }
  }

        if (!categoryId)
          categoryId = await upsert(Category, asset.assetCategory, categoryMap);

        if (!unitId)
          unitId = await upsert(Unit, asset.associateUnit, unitMap);

        if (!locationId)
          locationId = await upsert(Location, asset.locationName, locationMap);

        const quantity = Number(asset.assetQuantity || 1);
  if (quantity <= 0) {
    throw new Error(
      `Invalid quantity "${asset.assetQuantity}". Must be greater than 0`
    );
  }

        const purchaseDate = parseDate(asset.DateOfPurchase);
        const expiryDate = parseDate(asset.DateOfExpiry);

  if (!purchaseDate) {
    throw new Error(
      `Invalid purchase date "${asset.DateOfPurchase}"`
    );
  }

        const vendor = {
          name: asset.vendorName || "",
          contact: asset.vendorContact || "",
          supportEmail: asset.vendorEmail || ""
        };

        tempAssets.push({
          organizationId,
          assetCode: `SW-${nextCode++}`,
          assetName: asset.assetName,
          type,

          assetCategory: categoryId,
          associateUnit: unitId,
          locationName: locationId,

          purchaseDetails: {
            purchaseDate,
            vendor
          },

          DOE: expiryDate || null,

          assetQuantity: quantity,
          inUse: 0,

   financialTracking: {
  totalCost: 0,
  monthlyCost: 0,
  yearlyCost: 0
},

          createdBy: userId
        });

      } catch (err) {
  invalidRows.push({
    row: index + 2,

    assetName: asset.assetName || "Unnamed Asset",

    reason: err.message,

    receivedData: {
      type: asset.type,
      category: asset.assetCategory,
      unit: asset.associateUnit,
      location: asset.locationName,
      quantity: asset.assetQuantity,
      purchaseDate: asset.DateOfPurchase
    },

    suggestion:
      err.message.includes("asset type")
        ? "Use monthly, yearly or one_time"
        : err.message.includes("Category")
        ? "Create category first or use existing category"
        : err.message.includes("Unit")
        ? "Create unit first or use existing unit"
        : err.message.includes("Location")
        ? "Create location first or use existing location"
        : err.message.includes("quantity")
        ? "Quantity must be greater than 0"
        : "Check the row data"
  });
      }
    }

    /* ================= LIMIT ================= */
    const currentCount = await SoftwareAsset.countDocuments({ organizationId });

    let allowedAssets = tempAssets;

    if (softwareLimit !== "unlimited") {
      const available = softwareLimit - currentCount;

      if (available <= 0) {
        throw new AppError(
          "Software asset limit reached",
          403,
          "ASSET_LIMIT_REACHED",
          null,
          { limit: softwareLimit, current: currentCount }
        );
      }

      if (tempAssets.length > available) {
        allowedAssets = tempAssets.slice(0, available);

        invalidRows.push({
          row: "LIMIT",
          reason: `Only ${available} assets allowed by plan`
        });
      }
    }

    /* ================= INSERT ================= */
    let inserted = 0;

    if (allowedAssets.length > 0) {
      const result = await SoftwareAsset.insertMany(allowedAssets);
      inserted = result.length;
    }

    /* ================= RESPONSE ================= */
    res.status(200).json({
      success: true,
      message: "Bulk software upload completed",
      data: {
        inserted,
        skipped: invalidRows.length,
        invalidRows
      }
    });
  });

/* ======================================================
   CREATE SOFTWARE ASSET
====================================================== */

const createSoftwareAsset = asyncHandler(async (req, res, next) => {
  const { id: userId, organizationId } = req.user;

  const errors = {};

  /* ================= QUANTITY ================= */
  const quantity = Number(req.body.assetQuantity || 1);

  if (quantity <= 0) {
    errors.assetQuantity = "Invalid license quantity";
  }

  /* ================= TYPE ================= */
  const { type } = req.body;

  if (!["monthly", "yearly", "one_time"].includes(type)) {
    errors.type = "Invalid software type";
  }

  /* ================= PURCHASE DATE ================= */
  const purchaseDate = parseDate(req.body.purchaseDetails?.purchaseDate);

  if (!purchaseDate) {
    errors.purchaseDate = "Valid purchase date is required";
  }

  const expiryDate = parseDate(req.body.DOE);

  /* ================= CATEGORY ================= */
  const category = await Category.findOne({
    _id: req.body.assetCategory,
    organizationId,
    isActive: true,
  });

  if (!category) {
    errors.assetCategory = "Invalid category";
  } else if (category.categoryType !== "software") {
    errors.assetCategory = "Category must belong to software";
  }

  /* ================= VALIDATION FAIL ================= */
  if (Object.keys(errors).length > 0) {
    throw new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      errors
    );
  }

  /* ================= CLEAN BODY ================= */
  const { assetStatus, ...cleanBody } = req.body;

  /* ================= CREATE ================= */
  const asset = await SoftwareAsset.create({
    ...cleanBody,

    purchaseDetails: {
      purchaseDate,
      vendor: {
        name: req.body.purchaseDetails?.vendor?.name || "",
        contact: req.body.purchaseDetails?.vendor?.contact || "",
        supportEmail:
          req.body.purchaseDetails?.vendor?.supportEmail || ""
      }
    },

    renewal: {
      renewalTerm: req.body.renewalTerm,
      nextRenewalDate: expiryDate || null,
    },

    organizationId,
    type,

    assetCode: await generateSoftwareCode(organizationId),

    assetQuantity: quantity,
    inUse: 0,

    financialTracking: {
      totalCost: 0,
      monthlyCost: 0,
      yearlyCost: 0
    },

    auditHistory: [
      {
        date: new Date(),
        notes: `Created by user ${userId}`
      }
    ]
  });

  /* ================= NOTIFICATION ================= */
  await sendNotification({
    req,
    userId,
    title: "Software Asset Added",
    message: `Software "${asset.assetName}" was added successfully.`,
    type: "success",
    redirectUrl: "/inventory"
  });

  /* ================= RESPONSE ================= */
  res.status(201).json({
    success: true,
    message: "Software asset created successfully",
    data: asset
  });
});
/* ======================================================
   GET SOFTWARE ASSETS (ORG-SCOPED)
====================================================== */

const getSoftwareAssets = asyncHandler(async (req, res, next) => {

  const organizationId = req.user.organizationId;

  if (!organizationId) {
    throw new AppError(
      "Organization context missing",
      403,
      "ORG_CONTEXT_MISSING"
    );
  }

  /* ================= HELPER ================= */
  const deriveAssetStatus = ({ assetQuantity, instanceCount, inUse }) => {
    if (instanceCount === 0) return "not_created";
    if (instanceCount < assetQuantity) return "partially_created";
    if (inUse === 0) return "in_stock";
    if (inUse === assetQuantity) return "fully_in_use";
    return "partially_in_use";
  };

  /* ================= 1️⃣ FETCH SOFTWARE ASSETS ================= */
const assets = await SoftwareAsset.find({ organizationId })
  .populate("assetCategory", "name")
  .populate("associateUnit", "name")
  .populate("locationName", "name")
  .sort({ createdAt: -1 })
  .lean();
  
  if (!assets.length) {
    return res.status(200).json({
      success: true,
      message: "No software assets found",
      data: []
    });
  }

  const assetIds = assets.map(a => a._id);

  /* ================= 2️⃣ FETCH ASSIGNMENTS ================= */
  const assignments = await AssetAssignment.find({
    organizationId,
    status: "active",
    assetId: { $in: assetIds }
  })
    .populate("departmentId", "name")
    .populate("employeeId", "name employeeCode email")
    .lean();

  const assignmentMap = {};

  assignments.forEach(assign => {
    const id = String(assign.assetId);

    if (!assignmentMap[id]) {
      assignmentMap[id] = {
        inUse: 0,
        departmentMap: {},
        assignmentRecords: []
      };
    }

    assignmentMap[id].inUse += 1;

    if (assign.departmentId) {
      const deptId = String(assign.departmentId._id);

      if (!assignmentMap[id].departmentMap[deptId]) {
        assignmentMap[id].departmentMap[deptId] = {
          department: assign.departmentId,
          quantity: 0
        };
      }

      assignmentMap[id].departmentMap[deptId].quantity += 1;
    }

    assignmentMap[id].assignmentRecords.push({
      _id: assign._id,
      assetInstanceId: assign.assetInstanceId,
      employee: assign.employeeId,
      department: assign.departmentId,
      location: assign.location,
      deviceInfo: assign.deviceInfo,
      assignedAt: assign.assignedAt
    });
  });

  Object.keys(assignmentMap).forEach(id => {
    assignmentMap[id].assignedDepartments = Object.values(
      assignmentMap[id].departmentMap
    );
    delete assignmentMap[id].departmentMap;
  });

  /* ================= 3️⃣ FETCH INSTANCES ================= */
  const instances = await AssetInstance.find({
    organizationId,
    assetId: { $in: assetIds }
  }).lean();

  const instanceMap = {};

  instances.forEach(inst => {
    const id = String(inst.assetId);

    if (!instanceMap[id]) instanceMap[id] = [];

    instanceMap[id].push({
      ...inst,
    });
  });

  /* ================= 4️⃣ MERGE ================= */
const enrichedAssets = assets.map(asset => {
  const id = String(asset._id);

  const assignmentData = assignmentMap[id] || {};
  const assetInstances = instanceMap[id] || [];

let totalCost = 0;
let yearlyCost = 0;

assetInstances.forEach(inst => {
  const purchase =
    inst.software?.purchaseCost?.baseAmount || 0;

  const renewal =
    inst.software?.costs?.renewalCost?.baseAmount || 0;

  // 🔹 Total = one-time purchase
  totalCost += purchase;

  // 🔹 Yearly = recurring
  yearlyCost += renewal;
});

const monthlyCost = yearlyCost / 12;

  return {
    ...asset,
    inUse: assignmentData.inUse || 0,
    assignedDepartments: assignmentData.assignedDepartments || [],
    assignmentRecords: assignmentData.assignmentRecords || [],
    instances: assetInstances,
    instanceCount: assetInstances.length,

    financialTracking: {
      totalCost,
      yearlyCost,
      monthlyCost
    },

    status: deriveAssetStatus({
      assetQuantity: asset.assetQuantity,
      instanceCount: assetInstances.length,
      inUse: assignmentData.inUse || 0
    })
  };
});

  /* ================= 5️⃣ RESPONSE ================= */
  res.status(200).json({
    success: true,
    message: "Software assets fetched successfully",
    data: enrichedAssets
  });

});

/* ======================================================
   UPDATE / DELETE (ORG-SAFE)
====================================================== */


const updateSoftwareAsset = asyncHandler(async (req, res, next) => {
  const { organizationId, id: userId } = req.user;
  const { id } = req.params;

  const asset = await SoftwareAsset.findOne({
    _id: id,
    organizationId,
  });

  if (!asset) {
    throw new AppError(
      "Asset not found",
      404,
      "ASSET_NOT_FOUND"
    );
  }

  const errors = {};

  /* ================= CATEGORY ================= */
  if (req.body.assetCategory) {
    const category = await Category.findOne({
      _id: req.body.assetCategory,
      organizationId,
      isActive: true,
    });

    if (!category) {
      errors.assetCategory = "Invalid category";
    } else if (category.categoryType !== "software") {
      errors.assetCategory = "Category must belong to software";
    }
  }

  /* ================= TYPE ================= */
  if (req.body.type) {
    if (!["monthly", "yearly", "one_time"].includes(req.body.type)) {
      errors.type = "Invalid software type";
    }
  }

  /* ================= QUANTITY ================= */
  const oldQty = asset.assetQuantity;
  const newQty = req.body.assetQuantity ?? oldQty;

  if (newQty <= 0) {
    errors.assetQuantity = "Invalid quantity";
  }

  /* ================= VALIDATION FAIL ================= */
  if (Object.keys(errors).length > 0) {
    throw new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      errors
    );
  }

  /* ================= INSTANCE MANAGEMENT ================= */
  if (newQty > oldQty) {
    await generateInstances({
      asset,
      quantity: newQty - oldQty,
      assetType: "software",
      userId,
    });
  }

  if (newQty < oldQty) {
    const removable = await AssetInstance.find({
      assetId: asset._id,
      organizationId,
      status: "in_stock",
    }).limit(oldQty - newQty);

    if (removable.length < oldQty - newQty) {
      throw new AppError(
        "Not enough removable instances",
        400,
        "INSUFFICIENT_REMOVABLE_INSTANCES"
      );
    }

    const ids = removable.map((i) => i._id);
    await AssetInstance.deleteMany({ _id: { $in: ids } });
  }

  asset.assetQuantity = newQty;

  /* ================= PURCHASE ================= */
  if (req.body.purchaseDetails?.purchaseDate) {
    const parsed = parseDate(req.body.purchaseDetails.purchaseDate);

    if (!parsed) {
      throw new AppError(
        "Invalid purchase date",
        400,
        "INVALID_DATE"
      );
    }

    asset.purchaseDetails.purchaseDate = parsed;
  }

  if (req.body.purchaseDetails?.vendor) {
    asset.purchaseDetails.vendor = buildVendor(
      req.body.purchaseDetails.vendor
    );
  }

  /* ================= RENEWAL ================= */
  if (req.body.renewal?.renewalTerm) {
    asset.renewal.renewalTerm = req.body.renewal.renewalTerm;
  }

  /* ================= SAFE UPDATE ================= */
  const allowedFields = [
    "assetName",
    "assetCategory",
    "associateUnit",
    "locationName",
    "type",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      asset[field] = req.body[field];
    }
  });

  /* ================= AUDIT ================= */
  asset.auditHistory.push({
    userId,
    action: "UPDATE",
    notes: "Software asset updated",
    date: new Date()
  });

  await asset.save();
  
  /* ================= RESPONSE ================= */
  res.status(200).json({
    success: true,
    message: "Software asset updated successfully",
    data: asset
  });
});


const deleteSoftwareAsset = asyncHandler(async (req, res, next) => {
  const { organizationId, id: userId } = req.user;
  const { id } = req.params;

  if (!organizationId) {
    throw new AppError(
      "Organization context missing",
      403,
      "ORG_CONTEXT_MISSING"
    );
  }

  /* ================= DELETE ASSET ================= */
  const asset = await SoftwareAsset.findOneAndDelete({
    _id: id,
    organizationId
  });

  if (!asset) {
    throw new AppError(
      "Software asset not found",
      404,
      "ASSET_NOT_FOUND"
    );
  }

  /* ================= DELETE ALL INSTANCES ================= */
  await AssetInstance.deleteMany({
    assetId: asset._id,
    organizationId
  });

  /* ================= NOTIFICATION ================= */
  await sendNotification({
    req,
    userId,
    title: "Software Asset Deleted",
    message: `Software "${asset.assetName}" was deleted.`,
    type: "alert",
    redirectUrl: "/inventory"
  });

  /* ================= RESPONSE ================= */
  res.status(200).json({
    success: true,
    message: "Software asset deleted successfully",
    data: {
      id: asset._id
    }
  });
});

module.exports = {
  bulkUploadSoftware,
  createSoftwareAsset,
  getSoftwareAssets,
  updateSoftwareAsset,
  deleteSoftwareAsset
};
