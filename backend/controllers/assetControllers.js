  const Asset = require("../models/Asset");
  const LastAssetCode = require("../models/LastAssetCode");
  const AssetAssignment = require("../models/AssetAssignment");
  // const unzipper = require("unzipper");
  const sendNotification = require("../utils/notify");
  const asyncHandler = require("../utils/asyncHandler");
  const AppError = require("../utils/AppError");
  const pricingTiers = require("../config/pricingTiers");
  const Subscription = require("../models/Subscription");
  const Category = require("../models/Category");
  const Unit = require("../models/Unit");
  const Location = require("../models/Location");
  const Organization = require("../models/Organization");
  const Status = require("../models/Status");
  const SoftwareAsset = require("../models/SoftwareAsset");
  const AssetInstance = require("../models/AssetInstance");
  const convertToBase = require("../utils/convertToBase");
  const buildVendor = require("../utils/buildVendor");
const QRCode = require("qrcode");
const cloudinary = require("../config/cloudinary"); 

  const parseDate = (value) => {
    if (!value) return null;

    // Excel number
    if (!isNaN(value)) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(excelEpoch.getTime() + Number(value) * 86400000);
    }

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const buildMaintenance = (incoming = {}) => {
    if (!incoming) return {};

    return {
      lastMaintenanceDate: incoming.lastMaintenanceDate
        ? new Date(incoming.lastMaintenanceDate)
        : null,
      nextMaintenanceDate: incoming.nextMaintenanceDate
        ? new Date(incoming.nextMaintenanceDate)
        : null,
      maintenanceTerm: incoming.maintenanceTerm || null,
      maintenanceCost: Number(incoming.maintenanceCost || 0),
    };
  };
  const buildTracking = (incoming = {}) => ({
    qrCode: incoming.qrCode || null,
    assetTag: incoming.assetTag || null,
  });
const buildFinancialTracking = (type, assetCost, maintenance, warranty, insurance) => {
  const yearlyCost = assetCost?.totalAmount || 0;

  return {
    monthlyCost: type === "maintenance"
      ? (maintenance?.maintenanceCost || 0) / 12
      : 0,
    yearlyCost,
    maintenanceTotalCost: maintenance?.maintenanceCost || 0,
    warrantyTotalCost: warranty?.renewalCost || 0,
    insuranceTotalCost: insurance?.renewalCost || 0,
  };
};
  const buildInsurance = (incoming = {}, existing = {}) => ({
    insuranceId: incoming.insuranceId ?? existing.insuranceId,
    insuranceName: incoming.insuranceName ?? existing.insuranceName,
    purchaseDate: incoming.purchaseDate ? new Date(incoming.purchaseDate) : existing.purchaseDate,
    expiryDate: incoming.expiryDate ? new Date(incoming.expiryDate) : existing.expiryDate,
    renewalCost: Number(incoming.renewalCost ?? existing.renewalCost ?? 0),
    renewalTerm: incoming.renewalTerm ?? existing.renewalTerm,
    nextRenewalDate: incoming.nextRenewalDate
      ? new Date(incoming.nextRenewalDate)
      : existing.nextRenewalDate
  });
  const buildWarranty = (incoming, existing = {}, dop) => {
    if (!incoming) return existing;

    const warranty = {
      warrantyId: incoming.warrantyId ?? existing.warrantyId,
      expiryDate: incoming.expiryDate
        ? new Date(incoming.expiryDate)
        : existing.expiryDate,
    };

    if (dop && warranty.expiryDate) {
      const dopDate = new Date(dop);
      if (warranty.expiryDate < dopDate) {
        throw new Error("Warranty expiry cannot be before purchase date (DOP)");
      }
    }

    return warranty;
  };

  const calculateAssetLifetime = (dop, doe) => {
    if (!dop || !doe) return { value: 0, unit: "years" };

    const diff = new Date(doe) - new Date(dop);
    const years = Math.ceil(diff / (1000 * 60 * 60 * 24 * 365));

    return { value: years, unit: "years" };
  };

  // =======================================================================
  // BULK UPLOAD
  // =======================================================================
  // ================= BULK UPLOAD =================


const bulkUploadAssets = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const organizationId = req.user?.organizationId;

  if (!userId || !organizationId) {
    throw new AppError(
      "Unauthorized",
      401,
      "UNAUTHORIZED"
    );
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
      "Invalid subscription tier configuration",
      500,
      "INVALID_TIER_CONFIG"
    );
  }

  const assetLimit = tier.assets;

  /* ================= INPUT ================= */
  const { assets, mode = "strict" } = req.body;

  if (!Array.isArray(assets) || assets.length === 0) {
    throw new AppError(
      "Assets must be a non-empty array",
      400,
      "INVALID_INPUT"
    );
  }

  const normalize = (v) => v?.toString().trim().toLowerCase();

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

  let tempAssets = [];
  let invalidRows = [];

  /* ================= PROCESS ================= */
  for (const [index, asset] of assets.entries()) {
    try {
      const row = index + 2;

      let categoryId = categoryMap.get(normalize(asset.assetCategory));
      let unitId = unitMap.get(normalize(asset.associateUnit));
      let locationId = locationMap.get(normalize(asset.locationName));

      if (mode === "strict" && (!categoryId || !unitId || !locationId)) {
        throw new Error("Missing reference data");
      }

      if (!categoryId)
        categoryId = await upsert(Category, asset.assetCategory, categoryMap);

      if (!unitId)
        unitId = await upsert(Unit, asset.associateUnit, unitMap);

      if (!locationId)
        locationId = await upsert(Location, asset.locationName, locationMap);

      const dop = parseDate(asset.DateOfPurchase);
      const doe = parseDate(asset.DateOfExpiry);

      if (!dop) throw new Error("Invalid purchase date");

      const quantity = Number(asset.assetQuantity || 1);
      if (quantity <= 0) throw new Error("Invalid quantity");

      const assetType = asset.type?.toLowerCase();
      if (!["one_time", "maintenance"].includes(assetType)) {
        throw new Error("Invalid asset type");
      }

      const vendor = {
        name: asset.vendorName || "",
        contact: asset.vendorContact || "",
        supportEmail: asset.vendorEmail || ""
      };

      tempAssets.push({
        organizationId,
        assetName: asset.assetName,
        type: assetType,
        assetCategory: categoryId,
        associateUnit: unitId,
        locationName: locationId,
        purchaseDetails: {
          purchaseDate: dop,
          vendor
        },
        DOE: doe || null,
        assetQuantity: quantity,
        inUse: 0,
        financialTracking: {
          totalAssetCost: 0,
          monthlyCost: 0,
          yearlyCost: 0,
          maintenanceTotalCost: 0
        },
        createdBy: userId
      });

    } catch (err) {
      invalidRows.push({
        row: index + 2,
        reason: err.message,
        asset
      });
    }
  }

  /* ================= LIMIT CHECK ================= */
  const currentCount = await Asset.countDocuments({ organizationId });

  let allowedAssets = tempAssets;

  if (assetLimit !== "unlimited") {
    const available = assetLimit - currentCount;

    if (available <= 0) {
      throw new AppError(
        "Asset limit reached",
        403,
        "ASSET_LIMIT_REACHED",
        null,
        { limit: assetLimit, current: currentCount }
      );
    }

    if (tempAssets.length > available) {
      allowedAssets = tempAssets.slice(0, available);

      invalidRows.push({
        row: "LIMIT",
        reason: `Only ${available} assets allowed by plan`,
      });
    }
  }

  /* ================= CODE GENERATION ================= */
  const org = await Organization.findById(organizationId);
  const codes = await generateBulkAssetCodes(
    organizationId,
    allowedAssets.length,
    org?.orgCode || "ORG"
  );

  const finalAssets = allowedAssets.map((asset, i) => ({
    ...asset,
    assetCode: codes[i]
  }));

  /* ================= INSERT ================= */
  let inserted = 0;

  if (finalAssets.length > 0) {
    const result = await Asset.insertMany(finalAssets);
    inserted = result.length;
  }

  /* ================= NOTIFICATION ================= */
  await sendNotification({
    req,
    userId,
    title: "Bulk Upload Completed",
    message: `${inserted} assets uploaded successfully.`,
    redirectUrl: "/inventory",
    type: "success"
  });

  /* ================= RESPONSE ================= */
  res.status(200).json({
    success: true,
    message: "Bulk upload completed",
    data: {
      inserted,
      skipped: invalidRows.length,
      invalidRows
    }
  });
});




  // =======================================================================
  // ADD ASSET
  // =======================================================================
  // ================= ADD ASSET =================

const addAsset = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const organizationId = req.user.organizationId;

  // 🔴 ORG CHECK
  if (!organizationId) {
    throw new AppError(
      "Organization context missing",
      403,
      "ORG_CONTEXT_MISSING" 
    );
  }

  // 🔴 SUBSCRIPTION CHECK
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
      "Invalid subscription tier configuration",
      500,
      "INVALID_TIER_CONFIG"
    );
  }



  // 🔴 VALIDATION
  const errors = {};

  const { type } = req.body;

  if (!["one_time", "maintenance"].includes(type)) {
    errors.type = "Invalid asset type";
  }

  const assetQuantity = Number(req.body.assetQuantity || 1);
  if (assetQuantity <= 0) {
    errors.assetQuantity = "Quantity must be greater than 0";
  }

  const parsedDOP = req.body.purchaseDetails?.purchaseDate
    ? new Date(req.body.purchaseDetails.purchaseDate)
    : null;

  if (!parsedDOP || isNaN(parsedDOP.getTime())) {
    errors.purchaseDate = "Valid purchase date is required";
  }

  const category = await Category.findOne({
    _id: req.body.assetCategory,
    organizationId,
    isActive: true
  });

  if (!category) {
    errors.assetCategory = "Invalid category";
  } else if (category.categoryType !== "hardware") {
    errors.assetCategory = "Category must be hardware";
  }

  // 🔴 RETURN VALIDATION ERRORS
  if (Object.keys(errors).length > 0) {
    throw new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      errors
    );
  }

  // 🔴 CREATE ASSET
  const org = await Organization.findById(organizationId);

  const assetCode = await generateHardwareCode(
    organizationId,
    org.orgCode
  );

  const vendor = buildVendor(req.body.purchaseDetails?.vendor);

  const { assetStatus, ...cleanBody } = req.body;

  const newAsset = new Asset({
    ...cleanBody,
    purchaseDetails: {
      purchaseDate: parsedDOP,
      vendor
    },
    organizationId,
    createdBy: userId,
    type,
    assetCode,
    assetQuantity,
    inUse: 0,
financialTracking: {
  totalAssetCost: 0,
  monthlyCost: 0,
  yearlyCost: 0,
  maintenanceTotalCost: 0,
} 
  });

  const savedAsset = await newAsset.save();

  await sendNotification({
    req,
    userId,
    title: "Asset Added",
    message: `Asset "${savedAsset.assetName}" was added successfully.`,
    redirectUrl: "/inventory?tab=hardware",
    type: "success"
  });

  // ✅ SUCCESS RESPONSE
  res.status(201).json({
    success: true,
    message: "Asset created successfully",
    data: savedAsset
  });
});





  // =======================================================================
  // UPDATE ASSET
  // =======================================================================
  // ================= UPDATE ASSET =================

const updateAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const organizationId = req.user.organizationId;

  // 🔴 FIND EXISTING ASSET
  const existingAsset = await Asset.findOne({
    _id: id,
    organizationId,
  });

  if (!existingAsset) {
    throw new AppError(
      "Asset not found",
      404,
      "ASSET_NOT_FOUND"
    );
  }

  const errors = {};

  /* ================= CATEGORY VALIDATION ================= */
  let category = null;

  if (req.body.assetCategory) {
    category = await Category.findOne({
      _id: req.body.assetCategory,
      organizationId,
      isActive: true,
    });

    if (!category) {
      errors.assetCategory = "Invalid category";
    } else if (category.categoryType !== "hardware") {
      errors.assetCategory = "Category must belong to hardware";
    }
  }

  /* ================= QUANTITY VALIDATION ================= */
  const assetQuantity =
    req.body.assetQuantity ?? existingAsset.assetQuantity;

  if (existingAsset.inUse > assetQuantity) {
    errors.assetQuantity =
      "In-use quantity cannot exceed total quantity";
  }

  /* ================= TYPE VALIDATION ================= */
  if (req.body.type) {
    if (!["one_time", "maintenance"].includes(req.body.type)) {
      errors.type = "Invalid asset type";
    }
  }

  /* ================= PURCHASE DETAILS ================= */
  const purchaseDetails = {
    ...existingAsset.purchaseDetails,

    purchaseDate: req.body.purchaseDetails?.purchaseDate
      ? parseDate(req.body.purchaseDetails.purchaseDate)
      : existingAsset.purchaseDetails?.purchaseDate,

    vendor: buildVendor(
      req.body.purchaseDetails?.vendor,
      existingAsset.purchaseDetails?.vendor
    ),
  };

  if (!purchaseDetails.purchaseDate || isNaN(new Date(purchaseDetails.purchaseDate).getTime())) {
    errors.purchaseDate = "Valid purchase date is required";
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

  /* ================= LIFETIME ================= */
  const DOE = req.body.DOE
    ? parseDate(req.body.DOE)
    : existingAsset.DOE;

  const updatedLifetime = calculateAssetLifetime(
    purchaseDetails.purchaseDate,
    DOE
  );

  /* ================= CLEAN UPDATE PAYLOAD ================= */
  const updatePayload = {
    assetName: req.body.assetName ?? existingAsset.assetName,
    assetCode: req.body.assetCode ?? existingAsset.assetCode,
    assetCategory: req.body.assetCategory ?? existingAsset.assetCategory,
    associateUnit: req.body.associateUnit ?? existingAsset.associateUnit,
    assetQuantity,
    type: req.body.type ?? existingAsset.type,
    purchaseDetails,
    DOE,
    lifetime: updatedLifetime,
  };

  const updatedAsset = await Asset.findByIdAndUpdate(
    id,
    updatePayload,
    { new: true }
  );

  /* ================= NOTIFICATION ================= */
  await sendNotification({
    req,
    userId,
    title: "Asset Updated",
    message: `Asset "${updatedAsset.assetName}" was updated.`,
    redirectUrl: "/inventory?tab=hardware",
    type: "info",
  });

  // ✅ SUCCESS RESPONSE
  res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    data: updatedAsset,
  });
});

  // =======================================================================
  // DELETE ASSET
  // =======================================================================


const deleteAsset = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const organizationId = req.user.organizationId;

  // 🔴 FIND ASSET WITH ORG CHECK (IMPORTANT)
  const asset = await Asset.findOne({
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

  // 🔴 BUSINESS RULE: PREVENT DELETE IF IN USE
  if (asset.inUse > 0) {
    throw new AppError(
      "Cannot delete asset that is currently in use",
      400,
      "ASSET_IN_USE",
      {
        inUse: asset.inUse,
        total: asset.assetQuantity
      }
    );
  }

  // 🔴 DELETE ASSET
  await Asset.deleteOne({ _id: id });

  // 🔴 DELETE RELATED INSTANCES (SAFE)
  await AssetInstance.deleteMany({
    assetId: id,
    organizationId
  });

  // 🔴 NOTIFICATION
  await sendNotification({
    req,
    userId,
    title: "Asset Deleted",
    message: `Asset "${asset.assetName}" was deleted.`,
    redirectUrl: "/inventory?tab=hardware",
    type: "alert",
  });

  // ✅ SUCCESS RESPONSE
  res.status(200).json({
    success: true,
    message: "Asset deleted successfully",
    data: {
      id: asset._id,
      assetName: asset.assetName
    }
  });
});



  // =======================================================================
  // GET ALL ASSETS
  // =======================================================================

const getAllAssets = asyncHandler(async (req, res, next) => {
  const organizationId = req.user.organizationId;

  if (!organizationId) {
    throw new AppError(
      "Organization context missing",
      403,
      "ORG_CONTEXT_MISSING"
    );
  }

  const { type, search, instanceStatus } = req.query;

  /* ================= FILTER ================= */
  let filter = { organizationId };

  if (type) filter.type = type;

  if (search) {
    filter.$or = [
      { assetName: { $regex: search, $options: "i" } },
      { assetCode: { $regex: search, $options: "i" } }
    ];
  }

  /* ================= ASSETS ================= */
  const assets = await Asset.find(filter)
    .populate("assetCategory", "name")
    .populate("associateUnit", "name")
    .populate("locationName", "name")
    .lean();

  if (!assets.length) {
    return res.status(200).json({
      success: true,
      message: "No assets found",
      data: []
    });
  }

  const assetIds = assets.map(a => a._id);

  /* ================= ASSIGNMENTS ================= */
  const assignments = await AssetAssignment.find({
    organizationId,
    assetId: { $in: assetIds },
    status: "active",
  })
    .populate("departmentId", "name")
    .populate("employeeId", "name employeeCode")
    .lean();

  /* ================= INSTANCES ================= */
  const instances = await AssetInstance.find({
    organizationId,
    assetId: { $in: assetIds }
  }).lean();

  /* ================= MAP BUILD ================= */
  const assignmentMap = {};
  const instanceMap = {};

  // 🔹 Assignment Map
  assignments.forEach(assign => {
    const key = String(assign.assetId);

    if (!assignmentMap[key]) {
      assignmentMap[key] = {
        inUse: 0,
        assignedDepartments: {},
        assignmentRecords: []
      };
    }

    assignmentMap[key].inUse += 1;

    const deptId = String(assign.departmentId?._id || "unknown");

    if (!assignmentMap[key].assignedDepartments[deptId]) {
      assignmentMap[key].assignedDepartments[deptId] = {
        department: assign.departmentId,
        quantity: 0
      };
    }

    assignmentMap[key].assignedDepartments[deptId].quantity += 1;

    assignmentMap[key].assignmentRecords.push({
      _id: assign._id,
      assetInstanceId: assign.assetInstanceId,
      employee: assign.employeeId,
      department: assign.departmentId,
      location: assign.location,
      deviceInfo: assign.deviceInfo,
      assignedAt: assign.assignedAt
    });
  });

  // 🔹 Instance Map
  instances.forEach(inst => {
    const key = String(inst.assetId);
    if (!instanceMap[key]) instanceMap[key] = [];
    instanceMap[key].push(inst);
  });

  /* ================= HELPERS ================= */
  const deriveAssetStatus = ({ assetQuantity, instanceCount, inUse }) => {
    if (instanceCount === 0) return "not_created";
    if (instanceCount < assetQuantity) return "partially_created";
    if (inUse === 0) return "in_stock";
    if (inUse === assetQuantity) return "fully_in_use";
    return "partially_in_use";
  };

const calculateFinancials = (instances = []) => {
  let totalCost = 0;
  let yearlyCost = 0;

  instances.forEach(inst => {
    const hw = inst.hardware || {};
    const sw = inst.software || {};

    // 🔹 HARDWARE COSTS
    const hwPurchase =
      hw.purchaseCost?.amount || 0;

    const hwMaintenance =
      hw.costs?.maintenanceCost?.amount || 0;

    const hwInsurance =
      hw.costs?.insuranceCost?.amount || 0;

    const hwWarranty =
      hw.costs?.warrantyRenewalCost?.amount || 0;

    // 🔹 SOFTWARE COSTS
    const swPurchase =
      sw.purchaseCost?.amount || 0;

    const swRenewal =
      sw.costs?.renewalCost?.amount || 0;

    // 🔹 TOTAL COST
    const instanceTotal =
      hwPurchase +
      hwMaintenance +
      hwInsurance +
      hwWarranty +
      swPurchase +
      swRenewal;

    totalCost += instanceTotal;

    // 🔹 YEARLY COST
    yearlyCost += instanceTotal;
  });

  return {
    totalCost,
    yearlyCost,
    monthlyCost: yearlyCost / 12
  };
};

  /* ================= MERGE ================= */
  let enrichedAssets = assets.map(asset => {
    const key = String(asset._id);

    const assignmentData = assignmentMap[key] || {};
    const assetInstances = instanceMap[key] || [];

    const financials = calculateFinancials(assetInstances);

    return {
      ...asset,
      inUse: assignmentData.inUse || 0,
      assignedDepartments: Object.values(
        assignmentData.assignedDepartments || {}
      ),
      assignmentRecords: assignmentData.assignmentRecords || [],
      instances: assetInstances,
      instanceCount: assetInstances.length,
      status: deriveAssetStatus({
        assetQuantity: asset.assetQuantity,
        instanceCount: assetInstances.length,
        inUse: assignmentData.inUse || 0
      }),
      financialTracking: {
        totalCost: financials.totalCost,
        yearlyCost: financials.yearlyCost,
        monthlyCost: financials.monthlyCost
      }
    };
  });

  /* ================= INSTANCE FILTER ================= */
  if (instanceStatus === "missing") {
    enrichedAssets = enrichedAssets.filter(
      a => a.instanceCount < a.assetQuantity
    );
  }

  if (instanceStatus === "complete") {
    enrichedAssets = enrichedAssets.filter(
      a => a.instanceCount >= a.assetQuantity
    );
  }

  // ✅ FINAL RESPONSE
  res.status(200).json({
    success: true,
    message: "Assets fetched successfully",
    data: enrichedAssets
  });
});
const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        message: "Organization context missing",
      });
    }

    const asset = await Asset.findOne({
      _id: id,
      organizationId
    })
      .populate("assetCategory", "name")
      .populate("locationName", "name")
      .lean();

    if (!asset) {
      return res.status(404).json({
        message: "Asset not found",
      });
    }

    // 🔥 Instance count
    const instanceCount = await AssetInstance.countDocuments({
      assetId: id,
      organizationId
    });

    const pendingInstances =
      asset.assetQuantity - instanceCount;

    return res.status(200).json({
      ...asset,
      instanceCount,
      pendingInstances
    });

  } catch (error) {
    console.error("🔥 GET ASSET BY ID ERROR:", error);
    return next(error);
  }
};



  // =======================================================================
  // GENERATE ASSET CODE
  // =======================================================================
const generateHardwareCode = async (organizationId, orgCode = "ORG") => {
  const counter = await LastAssetCode.findOneAndUpdate(
    { organizationId, key: "hardwareAsset" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter.sequence;

  return `${orgCode}-AST-${String(seq).padStart(3, "0")}`;
};

const generateBulkAssetCodes = async (organizationId, count, orgCode = "ORG") => {
  const counter = await LastAssetCode.findOneAndUpdate(
    { organizationId, key: "hardwareAsset" },
    { $inc: { sequence: count } },
    { new: true, upsert: true }
  );

  const end = counter.sequence;
  const start = end - count + 1;

  const codes = [];

  for (let i = start; i <= end; i++) {
    codes.push(`${orgCode}-AST-${String(i).padStart(3, "0")}`);
  } 
  return codes;
};
const calculateInsuranceExpiry = (purchaseDate, term) => {
  if (!purchaseDate || !term) return null;

  const date = new Date(purchaseDate);

  switch (term) {
    case "6_months":
      date.setMonth(date.getMonth() + 6);
      break;
    case "1_year":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "3_years":
      date.setFullYear(date.getFullYear() + 3);
      break;
    default:
      return null;
  }

  return date;
};

const createAssetInstance = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const organizationId = req.user.organizationId;

  const { assetId, instances } = req.body;

  if (!instances || instances.length === 0) {
    throw new AppError(
      "No instances provided",
      400,
      "NO_INSTANCES"
    );
  }

  /* ================= DETECT ASSET (ORG SAFE) ================= */
  let asset = await Asset.findOne({ _id: assetId, organizationId });
  let assetTypeRef = "Asset";

  if (!asset) {
    asset = await SoftwareAsset.findOne({ _id: assetId, organizationId });
    assetTypeRef = "SoftwareAsset";
  }

  if (!asset) {
    throw new AppError(
      "Asset not found",
      404,
      "ASSET_NOT_FOUND"
    );
  }

  const assetType =
    assetTypeRef === "SoftwareAsset" ? "software" : "hardware";

    /* ================= SUBSCRIPTION LIMIT CHECK ================= */

const subscription = await Subscription.findOne({ organizationId });

if (!subscription) {
  throw new AppError(
    "No active subscription",
    403,
    "NO_SUBSCRIPTION"
  );
}

const tier = pricingTiers.find(t => t.key === subscription.tier);

if (!tier) {
  throw new AppError(
    "Invalid tier config",
    500,
    "INVALID_TIER"
  );
}

/* ---------------- COUNT CURRENT INSTANCES ---------------- */

let currentCount;

if (assetType === "hardware") {
  currentCount = await AssetInstance.countDocuments({
    organizationId,
    assetType: "hardware"
  });
} else {
  currentCount = await AssetInstance.countDocuments({
    organizationId,
    assetType: "software"
  });
}

/* ---------------- GET LIMIT ---------------- */

const limit =
  assetType === "hardware"
    ? tier.hardwareAssets
    : tier.softwareAssets;

/* ---------------- VALIDATE LIMIT ---------------- */

if (
  limit !== "unlimited" &&
  currentCount + instances.length > limit
) {
  throw new AppError(
    `${assetType} instance limit exceeded`,
    403,
    "INSTANCE_LIMIT_EXCEEDED",
    null,
    {
      limit,
      current: currentCount,
      requested: instances.length
    }
  );
}

  /* ================= VALIDATION ================= */
  const errors = {};

  // Quantity check
  const existingCount = await AssetInstance.countDocuments({
    assetId,
    organizationId
  });

  if (existingCount + instances.length > asset.assetQuantity) {
    errors.quantity = "Exceeds asset quantity";
  }

  // Serial validation
  const serials = instances
    .filter(i => i.hardware?.serialNumber)
    .map(i => i.hardware.serialNumber);

  if (new Set(serials).size !== serials.length) {
    errors.serialNumber = "Duplicate serials in request";
  }

  const existingSerials = await AssetInstance.find({
    organizationId,
    "hardware.serialNumber": { $in: serials }
  });

  if (existingSerials.length > 0) {
    errors.serialNumber = "Serial already exists";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      errors
    );
  }

  const generateSerial = (asset, index) => {
    const prefix = asset.assetCode || "AST";
    const unique = Date.now().toString().slice(-5);
    return `${prefix}-SN-${unique}-${index}`;
  };

  /* ================= CREATE INSTANCES ================= */
const newInstances = [];

for (let index = 0; index < instances.length; index++) {
  const inst = instances[index];

  const instanceCode = `${asset.assetCode}-${Date.now()}-${index}`;
  const hasInsurance = inst.hardware?.hasInsurance ?? false;

const purchaseCost =
  assetType === "hardware"
    ? {
        amount: Number(
          inst.hardware?.purchaseCost?.amount || 0
        ),
        currency: "USD"
      }
    : {
        amount: Number(
          inst.software?.purchaseCost?.amount || 0
        ),
        currency: "USD"
      };
  
/* ================= INSURANCE ================= */

const insuranceCost = {
  amount: Number(
    inst.hardware?.costs?.insuranceCost?.amount || 0
  ),
  currency: "USD"
};
const insuranceTerm =
  inst.hardware?.insuranceTerm || null;

const insurancePurchaseDate =
  inst.hardware?.insurancePurchaseDate || null;

const coverageType =
  inst.hardware?.coverageType || [];

let insuranceExpiry = null;
const upgrades = inst.upgrades || [];
/* AUTO CALCULATE EXPIRY */
if (hasInsurance && insurancePurchaseDate) {
  const expiry = new Date(insurancePurchaseDate);

  switch (insuranceTerm) {
    case "6_months":
      expiry.setMonth(expiry.getMonth() + 6);
      break;

    case "1_year":
      expiry.setFullYear(
        expiry.getFullYear() + 1
      );
      break;

    case "3_years":
      expiry.setFullYear(
        expiry.getFullYear() + 3
      );
      break;

    default:
      break;
  }

  insuranceExpiry = expiry;
}
const lifecycle = [
  {
    eventType: "created",

    category: "instance",

    title: "Instance Created",

    description:
      instances.length > 1
        ? "Bulk instance upload"
        : "Single instance created",

    performedBy: userId,

    date: new Date(),

    metadata: {
      assetId: asset._id,

      assetName: asset.assetName,

      assetType,

      instanceCode,

      deviceName: inst.deviceName || "-",

      location: inst.location || "-",

      status: "in_stock",

      condition: inst.condition || "new",

      purchaseCost:
        purchaseCost?.amount || 0,

      currency: "USD",

      ...(assetType === "hardware"
        ? {
            serialNumber:
              inst.hardware?.serialNumber || "-",

            modelNo:
              inst.hardware?.modelNo || "-",

            hasInsurance,

            insuranceTerm:
              hasInsurance
                ? insuranceTerm
                : null,

            insuranceExpiry:
              hasInsurance
                ? insuranceExpiry
                : null,

            coverageType:
              hasInsurance
                ? coverageType
                : [],
          }
        : {
            licenseNumber:
              inst.software?.licenseNumber || "-"
          })
    }
  }
];
upgrades.forEach((upgrade) => {
  lifecycle.push({
    eventType: "upgraded",

    category: "upgrade",

    title:
      upgrade.upgradeType
        ? `${upgrade.upgradeType} Upgrade`
        : "Historical Upgrade",

    description:
      upgrade.description ||

      `${upgrade.oldValue || ""} → ${upgrade.newValue || ""}`,

    performedBy:
      upgrade.performedBy || userId,

    date:
      upgrade.date || new Date(),

    metadata: {
      upgrade: {
        upgradeType:
          upgrade.upgradeType || "other",

        description:
          upgrade.description || "",
        newCondition:
          upgrade.newCondition || null,
        oldValue:
          upgrade.oldValue || "",

        newValue:
          upgrade.newValue || "",

        cost:
          upgrade.cost || null,

        notes:
          upgrade.notes || ""
      }
    }
  });
});
  const basePayload = {
    organizationId,
    assetId,
    assetTypeRef,
    assetType,
    instanceCode,
    deviceName: inst.deviceName || "",
    location: inst.location,
    status: "in_stock",
    condition: inst.condition || "new",
    lifecycle,
    createdBy: userId
  };

  if (assetType === "hardware") {
const maintenanceCost = {
  amount: Number(
    inst.hardware?.costs?.maintenanceCost?.amount || 0
  ),
  currency: "USD"
};

const warrantyRenewalCost = {
  amount: Number(
    inst.hardware?.costs?.warrantyRenewalCost?.amount || 0
  ),
  currency: "USD"
};


newInstances.push({
  ...basePayload,
  upgrades,
  hardware: {
    serialNumber:
      inst.hardware?.serialNumber ||
      generateSerial(asset, index),

    modelNo:
      inst.hardware?.modelNo || "",

    specifications:
      inst.hardware?.specifications || "",

    purchaseDate:
      inst.hardware?.purchaseDate || null,

    installationDate:
      inst.hardware?.installationDate || null,

    warrantyPurchaseDate:
      inst.hardware?.warrantyPurchaseDate || null,

    warrantyExpiry:
      inst.hardware?.warrantyExpiry || null,

    nextMaintenanceDate:
      inst.hardware?.nextMaintenanceDate || null,

    hasInsurance,

    insuranceTerm:
      hasInsurance
        ? insuranceTerm
        : null,

    insurancePurchaseDate:
      hasInsurance
        ? insurancePurchaseDate
        : null,

    insuranceExpiry:
      hasInsurance
        ? insuranceExpiry
        : null,

coverageType:
  hasInsurance
    ? coverageType
    : [],

    purchaseCost,

    costs: {
      maintenanceCost,
      warrantyRenewalCost,
      insuranceCost
    }
  }
});
  } else {
    newInstances.push({
      ...basePayload,
      upgrades,
      software: {
  licenseKey: inst.software?.licenseKey || "",
  licenseNumber: inst.software?.licenseNumber || "",
  purchaseDate: inst.software?.purchaseDate || null,
  installationDate: inst.software?.installationDate || null,
  renewalDate: inst.software?.renewalDate || null,
  lastUsedDate: inst.software?.lastUsedDate || null,

  purchaseCost,

  costs: {
renewalCost: {
  amount: Number(
    inst.software?.costs?.renewalCost?.amount || 0
  ),
  currency: "USD"
}
  }
}
    });
  }
}

  const saved = await AssetInstance.insertMany(newInstances);

  /* ================= QR GENERATION ================= */
  const updatedInstances = await Promise.all(
    saved.map(async (instance) => {
      if (instance.assetType !== "hardware") return instance;

      try {
        const trackingUrl = `${process.env.FRONTEND_URL}/track/${instance._id}`;
        const qrImage = await QRCode.toDataURL(trackingUrl);

        const uploadRes = await cloudinary.uploader.upload(qrImage, {
          folder: "asset_qr_codes",
          public_id: `qr-${instance._id}`,
        });

        instance.hardware.qrCode = {
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
        };

        await instance.save();
      } catch (err) {
        console.error("QR upload failed:", err.message);
      }

      return instance;
    })
  );

  /* ================= UPDATE PARENT COST ================= */
const aggregation = await AssetInstance.aggregate([
  {
    $match: { assetId: asset._id, organizationId }
  },
  {
    $group: {
      _id: null,

      // 🔹 TOTAL COST (ALL COSTS COMBINED)
      totalCost: {
        $sum: {
          $add: [
            { $ifNull: ["$hardware.purchaseCost.amount", 0] },
            { $ifNull: ["$hardware.costs.maintenanceCost.amount", 0] },
            { $ifNull: ["$hardware.costs.insuranceCost.amount", 0] },
            { $ifNull: ["$hardware.costs.warrantyRenewalCost.amount", 0] },

            { $ifNull: ["$software.purchaseCost.amount", 0] },
            { $ifNull: ["$software.costs.renewalCost.amount", 0] }
          ]
        }
      },

      // 🔹 YEARLY COST ONLY (recurring)
      yearlyCost: {
        $sum: {
          $add: [
            { $ifNull: ["$hardware.purchaseCost.amount", 0] },
            { $ifNull: ["$hardware.costs.maintenanceCost.amount", 0] },
            { $ifNull: ["$hardware.costs.insuranceCost.amount", 0] },
            { $ifNull: ["$hardware.costs.warrantyRenewalCost.amount", 0] },

            { $ifNull: ["$software.purchaseCost.amount", 0] }, // since yearly license
            { $ifNull: ["$software.costs.renewalCost.amount", 0] }
          ]
        }
      }
    }
  }
]);


const totalCost = aggregation[0]?.totalCost || 0;
const yearlyCost = aggregation[0]?.yearlyCost || 0;
const monthlyCost = yearlyCost / 12;

await (assetType === "hardware" ? Asset : SoftwareAsset)
  .findByIdAndUpdate(asset._id, {
    "financialTracking.totalCost": totalCost,
    "financialTracking.yearlyCost": yearlyCost,
    "financialTracking.monthlyCost": monthlyCost
  });

  // ✅ FINAL RESPONSE
  res.status(201).json({
    success: true,
    message: "Asset instances created successfully",
    data: updatedInstances
  });
});

const updateAssetInstance = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const organizationId = req.user.organizationId;

  const instance = await AssetInstance.findOne({
    _id: id,
    organizationId
  });

  if (!instance) {
    throw new AppError(
      "Instance not found",
      404,
      "INSTANCE_NOT_FOUND"
    );
  }

  const errors = {};

  /* ================= SERIAL VALIDATION ================= */
  if (req.body.serialNumber !== undefined) {
    const exists = await AssetInstance.findOne({
      organizationId,
      "hardware.serialNumber": req.body.serialNumber,
      _id: { $ne: id }
    });

    if (exists) {
      errors.serialNumber = "Serial already exists";
    }
  }

  /* ================= LOCATION VALIDATION ================= */
  if (req.body.location !== undefined) {
    if (!req.body.location.trim()) {
      errors.location = "Location cannot be empty";
    }
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

  /* ================= SNAPSHOT BEFORE ================= */
  const beforeSnapshot = {
    location: instance.location,
    condition: instance.condition,
    serialNumber: instance.hardware?.serialNumber || null
  };

  /* ================= APPLY UPDATES ================= */
  if (req.body.location !== undefined) {
    instance.location = req.body.location.trim();
  }

  if (req.body.condition) {
    instance.condition = req.body.condition;
  }

  if (req.body.serialNumber !== undefined) {
    if (!instance.hardware) instance.hardware = {};
    instance.hardware.serialNumber = req.body.serialNumber;
  }

  /* ================= SNAPSHOT AFTER ================= */
  const afterSnapshot = {
    location: instance.location,
    condition: instance.condition,
    serialNumber: instance.hardware?.serialNumber || null
  };

  /* ================= LIFECYCLE LOG ================= */
  instance.lifecycle.push({
    action: "UPDATE",
    from: beforeSnapshot,
    to: afterSnapshot,
    snapshot: {
      location: instance.location,
      assignedTo: {
        employeeName: instance.assignedTo?.employeeName || null
      }
    },
    date: new Date(),
    notes: "Basic instance details updated"
  });

  await instance.save();

  // ✅ STANDARD RESPONSE
  res.status(200).json({
    success: true,
    message: "Asset instance updated successfully",
    data: instance
  });
});

const bulkUploadInstances = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;
  const organizationId = req.user?.organizationId;

  if (!userId || !organizationId) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { assetId, instances } = req.body;

  if (!assetId || !instances) {
    throw new AppError(
      "Missing assetId or instances",
      400,
      "INVALID_INPUT"
    );
  }

  /* ================= PARSE ================= */
  let parsedInstances;
  try {
    parsedInstances = Array.isArray(instances)
      ? instances
      : JSON.parse(instances);
  } catch {
    throw new AppError(
      "Invalid JSON format",
      400,
      "INVALID_JSON"
    );
  }

  /* ================= FETCH ASSET (SAFE) ================= */
  let asset = await Asset.findOne({ _id: assetId, organizationId });
  let assetTypeRef = "Asset";
  /* ================= SUBSCRIPTION LIMIT CHECK ================= */

const subscription = await Subscription.findOne({ organizationId });

if (!subscription) {
  throw new AppError(
    "No active subscription",
    403,
    "NO_SUBSCRIPTION"
  );
}

const tier = pricingTiers.find(t => t.key === subscription.tier);

if (!tier) {
  throw new AppError(
    "Invalid subscription tier",
    500,
    "INVALID_TIER"
  );
}
  if (!asset) {
    asset = await SoftwareAsset.findOne({ _id: assetId, organizationId });
    assetTypeRef = "SoftwareAsset";
  }

  if (!asset) {
    throw new AppError(
      "Parent asset not found",
      404,
      "ASSET_NOT_FOUND"
    );
  }

  const assetType =
    assetTypeRef === "SoftwareAsset" ? "software" : "hardware";

  /* ================= QUANTITY ================= */
  const existingCount = await AssetInstance.countDocuments({
    assetId,
    organizationId,
  });

  if (existingCount + parsedInstances.length > asset.assetQuantity) {
    throw new AppError(
      "Exceeds asset quantity",
      400,
      "QUANTITY_EXCEEDED"
    );
  }

  /* ================= HELPERS ================= */
  const normalize = (v) => v?.toString().trim();

const parseDateSafe = (d) => {
  if (!d) return null;

  // Excel serial date
  if (typeof d === "number") {
    const excelEpoch = new Date(
      Date.UTC(1899, 11, 30)
    );

    excelEpoch.setUTCDate(
      excelEpoch.getUTCDate() + d
    );

    return excelEpoch;
  }

  const date = new Date(d);

  return isNaN(date.getTime())
    ? null
    : date;
};

  const calculateInsuranceExpiry = (date, term) => {
    if (!date) return null;
    const d = new Date(date);

    if (term === "6_months") d.setMonth(d.getMonth() + 6);
    if (term === "1_year") d.setFullYear(d.getFullYear() + 1);
    if (term === "3_years") d.setFullYear(d.getFullYear() + 3);

    return d;
  };

  const generateSerial = () =>
    `${asset.assetCode}-SN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  /* ================= PROCESS ================= */
  let validInstances = [];
  let invalidRows = [];
  const generatedSerials = new Set();

  for (const [index, inst] of parsedInstances.entries()) {
    try {
      const row = index + 2;

      let serialNumber = normalize(
  inst.hardware?.serialNumber
);

      if (assetType === "hardware" && !serialNumber) {
        serialNumber = generateSerial();
      }

      if (generatedSerials.has(serialNumber)) {
        throw new Error("Duplicate serial in request");
      }

      generatedSerials.add(serialNumber);

      if (!inst.location) {
        throw new Error("Location is required");
      }

      const location = normalize(inst.location);

      const instanceCode = `${asset.assetCode}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
        const purchaseDate = assetType === "hardware" ? parseDateSafe(inst.hardware?.purchaseDate) : parseDateSafe(inst.software?.purchaseDate);
const nextMaintenanceDate =
  assetType === "hardware"
    ? parseDateSafe(inst.hardware?.nextMaintenanceDate)
    : null;
const purchaseCost =
  assetType === "hardware"
    ? {
        amount: Number(
          inst.hardware?.purchaseCost?.amount || 0
        ),
        currency: "USD"
      }
    : {
        amount: Number(
          inst.software?.purchaseCost?.amount || 0
        ),
        currency: "USD"
      };
      /* ---------------- HARDWARE ---------------- */
      if (assetType === "hardware") {
const hasInsurance =
  inst.hardware?.hasInsurance === true ||
  inst.hardware?.hasInsurance === "true";

const insurancePurchaseDate = hasInsurance
  ? parseDateSafe(inst.hardware?.insurancePurchaseDate)
  : null;

const insuranceTerm = hasInsurance
  ? inst.hardware?.insuranceTerm || "1_year"
  : null;

const coverageType = hasInsurance
  ? inst.hardware?.coverageType || ["comprehensive"]
  : [];

const insuranceExpiry =
  hasInsurance && insurancePurchaseDate
    ? calculateInsuranceExpiry(
        insurancePurchaseDate,
        insuranceTerm
      )
    : null;

const insuranceId = hasInsurance
  ? normalize(inst.hardware?.insuranceId)
  : null;
const maintenanceCost = {
  amount: Number(
    inst.hardware?.costs?.maintenanceCost?.amount || 0
  ),
  currency: "USD"
};

const warrantyRenewalCost = {
  amount: Number(
    inst.hardware?.costs?.warrantyRenewalCost?.amount || 0
  ),
  currency: "USD"
};

const insuranceCost = {
  amount: Number(
    inst.hardware?.costs?.insuranceCost?.amount || 0
  ),
  currency: "USD"
};
        validInstances.push({
          organizationId,
          assetId,
          assetTypeRef,
          assetType,

          instanceCode,
          deviceName: normalize(inst.deviceName) || "",
          location,
          condition: inst.condition || "new",
          status: "in_stock",

          hardware: {
            serialNumber,
            modelNo: normalize(inst.hardware?.modelNo) || "",
            specifications: normalize(inst.hardware?.specifications) || "",

            purchaseDate,
            nextMaintenanceDate,
            installationDate: parseDateSafe(inst.hardware?.installationDate),

            warrantyExpiry: parseDateSafe(inst.hardware?.warrantyExpiry),
            purchaseCost,
            hasInsurance,
            insurancePurchaseDate,
            insuranceTerm,
            insuranceExpiry,
            insuranceId,
            coverageType,
            costs: {
              maintenanceCost,
              warrantyRenewalCost,
              insuranceCost: hasInsurance
                ? insuranceCost
                : null
            }
          },

lifecycle: [
  {
    eventType: "created",

    category: "instance",

    title: "Instance Created",

    description: "Bulk instance upload",

    performedBy: userId,

    date: new Date(),

    metadata: {
      source: "bulk_upload",
      assetId: asset._id,
      assetType
    }
  }
],

          createdBy: userId
        });
      }

      /* ---------------- SOFTWARE ---------------- */
      else {
const renewalCost = {
  amount: Number(
    inst.software?.costs?.renewalCost?.amount || 0
  ),
  currency: "USD"
};
          const renewalDate = parseDateSafe(inst.software?.renewalDate);
          const installationDate = parseDateSafe(inst.software?.installationDate);
        validInstances.push({
          organizationId,
          assetId,
          assetTypeRef,
          assetType,

          instanceCode,
          location,
          condition: inst.condition || "new",
          status: "in_stock",

          software: {
            purchaseDate,
            licenseKey: normalize(inst.software?.licenseKey) || "",
            purchaseDate: parseDateSafe(inst.software?.purchaseDate),
            licenseNumber:
              normalize(inst.software?.licenseNumber) || "",
            installationDate,
            renewalDate,
            costs : {
              renewalCost
            },
            purchaseCost
          },

lifecycle: [
  {
    eventType: "created",

    category: "instance",

    title: "Instance Created",

    description: "Bulk instance upload",

    performedBy: userId,

    date: new Date(),

    metadata: {
      source: "bulk_upload",
      assetId: asset._id,
      assetType
    }
  }
],

          createdBy: userId
        });
      }

    } catch (err) {
      invalidRows.push({
        row: index + 2,
        reason: err.message,
        inst
      });
    }
  }
  /* ================= INSTANCE LIMIT VALIDATION ================= */

let currentCount;

if (assetType === "hardware") {
  currentCount = await AssetInstance.countDocuments({
    organizationId,
    assetType: "hardware"
  });
} else {
  currentCount = await AssetInstance.countDocuments({
    organizationId,
    assetType: "software"
  });
}

const limit =
  assetType === "hardware"
    ? tier.hardwareAssets
    : tier.softwareAssets;

if (
  limit !== "unlimited" &&
  currentCount + validInstances.length > limit
) {
  throw new AppError(
    `${assetType} instance limit exceeded`,
    403,
    "INSTANCE_LIMIT_EXCEEDED",
    null,
    {
      limit,
      current: currentCount,
      attempted: validInstances.length
    }
  );
}
  /* ================= SERIAL DB CHECK ================= */
  const existingSerials = await AssetInstance.find({
    organizationId,
    "hardware.serialNumber": { $in: [...generatedSerials] }
  });

  if (existingSerials.length > 0) {
    throw new AppError(
      "Serial already exists in system",
      400,
      "DUPLICATE_SERIAL"
    );
  }

  /* ================= INSERT ================= */
  let inserted = [];

  if (validInstances.length) {
    inserted = await AssetInstance.insertMany(validInstances, {
      ordered: false
    });
  }
  console.log("VALID INSTANCES:", validInstances.length);
console.log(validInstances);
  /* ================= RESPONSE ================= */
  res.status(200).json({
    success: true,
    message: "Bulk instance upload completed",
    data: {
      inserted: inserted.length,
      skipped: invalidRows.length,
      invalidRows
    }
  });
});

const deleteInstance = async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await AssetInstance.findOne({
      _id: id,
      organizationId: req.user.organizationId,
    });

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Instance not found",
      });
    }

    // Optional safety check
    if (instance.assignedTo) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete an assigned instance. Unassign first.",
      });
    }

    await AssetInstance.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Instance deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const formatCost = async (cost) => {
  if (!cost) return null;

  let amount, currency;

  if (typeof cost === "object") {
    amount = Number(cost.amount) || 0;
    currency = cost.currency || "INR";
  } else {
    amount = Number(cost) || 0;
    currency = "INR";
  }

  const { baseAmount, conversionRate } =
    await convertToBase(amount, currency);

  return {
    amount,
    currency,
    baseAmount,
    conversionRate,
    convertedAt: new Date()
  };
};
  module.exports = {
    addAsset,
    updateAsset,
    deleteAsset,
    getAllAssets,
    bulkUploadInstances,
    bulkUploadAssets,
    createAssetInstance,
    getAssetById,
    updateAssetInstance,
    deleteInstance
  };
