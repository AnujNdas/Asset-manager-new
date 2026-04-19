  const Asset = require("../models/Asset");
  const LastAssetCode = require("../models/LastAssetCode");
  const AssetAssignment = require("../models/AssetAssignment");
  // const unzipper = require("unzipper");
  const sendNotification = require("../utils/notify");
  const { convertToBase, BASE_CURRENCY } = require("../utils/currency");
  const pricingTiers = require("../config/pricingTiers");
  const Subscription = require("../models/Subscription");
  const Category = require("../models/Category");
  const Unit = require("../models/Unit");
  const Location = require("../models/Location");
  const Organization = require("../models/Organization");
  const Status = require("../models/Status");
  const SoftwareAsset = require("../models/SoftwareAsset");
  const AssetInstance = require("../models/AssetInstance");
const QRCode = require("qrcode");

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
  const buildVendor = (incoming = {}) => ({
    name: incoming.name?.trim() || null,
    contact: incoming.contact?.trim() || null,
    supportEmail: incoming.supportEmail?.trim() || null,
  });
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
const bulkUploadAssets = async (req, res, next) => {
  try {
    console.log("🔥 Bulk asset upload started");

    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    /* =============================
       🔐 SUBSCRIPTION CHECK
    ============================== */
    const subscription = await Subscription.findOne({ organizationId });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found"
      });
    }

    const tier = pricingTiers.find(t => t.key === subscription.tier);

    if (!tier) {
      return res.status(500).json({
        success: false,
        message: "Invalid subscription tier configuration"
      });
    }

    const assetLimit = tier.assets;

    /* =============================
       📦 INPUT VALIDATION (JSON ONLY)
    ============================== */
    const { assets, mode = "strict" } = req.body;

    if (!Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Assets must be a non-empty array"
      });
    }

    const normalize = (v) => v?.toString().trim().toLowerCase();

    /* =============================
       🔎 FETCH REFERENCES
    ============================== */
    const [categories, units, locations, statuses] = await Promise.all([
      Category.find({ organizationId }).lean(),
      Unit.find({ organizationId }).lean(),
      Location.find({ organizationId }).lean(),
    ]);

    const categoryMap = new Map(categories.map(c => [normalize(c.name), c._id]));
    const unitMap = new Map(units.map(u => [normalize(u.name), u._id]));
    const locationMap = new Map(locations.map(l => [normalize(l.name), l._id]));

    /* =============================
       🔧 UPSERT HELPER (DRY)
    ============================== */
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

    /* =============================
       🔁 PROCESS LOOP
    ============================== */
    for (const [index, asset] of assets.entries()) {
      try {
        const row = index + 2;

        /* ---------- REFERENCES ---------- */
        let categoryId = categoryMap.get(normalize(asset.assetCategory));
        let unitId = unitMap.get(normalize(asset.associateUnit));
        let locationId = locationMap.get(normalize(asset.locationName));

        if (
          mode === "strict" &&
          (!categoryId || !unitId || !locationId)
        ) {
          throw new Error("Missing reference data");
        }

        if (!categoryId)
          categoryId = await upsert(Category, asset.assetCategory, categoryMap);

        if (!unitId)
          unitId = await upsert(Unit, asset.associateUnit, unitMap);

        if (!locationId)
          locationId = await upsert(Location, asset.locationName, locationMap);

        /* ---------- DATES ---------- */
        const dop = parseDate(asset.DateOfPurchase);
        const doe = parseDate(asset.DateOfExpiry);

        if (!dop) throw new Error("Invalid purchase date");

        /* ---------- VALIDATION ---------- */
        const quantity = Number(asset.assetQuantity || 1);
        if (quantity <= 0) throw new Error("Invalid quantity");

        const assetType = asset.type?.toLowerCase();
        if (!["one_time", "maintenance"].includes(assetType)) {
          throw new Error("Invalid asset type");
        }

        /* ---------- VENDOR ---------- */
        const vendor = {
          name: asset.vendorName || "",
          contact: asset.vendorContact || "",
          supportEmail: asset.vendorEmail || ""
        };

        /* ---------- FINAL OBJECT ---------- */
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

    /* =============================
       🆔 GENERATE ASSET CODES
    ============================== */
    const org = await Organization.findById(organizationId);
    const orgCode = org?.orgCode || "ORG";

    const codes = await generateBulkAssetCodes(
      organizationId,
      tempAssets.length,
      orgCode
    );

    let validAssets = tempAssets.map((asset, i) => ({
      ...asset,
      assetCode: codes[i]
    }));

    /* =============================
       🚫 PLAN LIMIT CHECK
    ============================== */
    const currentCount = await Asset.countDocuments({ organizationId });

    if (assetLimit !== "unlimited") {
      const available = assetLimit - currentCount;

      if (available <= 0) {
        return res.status(403).json({
          success: false,
          message: "Asset limit reached"
        });
      }

      if (validAssets.length > available) {
        validAssets = validAssets.slice(0, available);
      }
    }

    /* =============================
       💾 INSERT
    ============================== */
    let insertedCount = 0;

    if (validAssets.length > 0) {
      const result = await Asset.insertMany(validAssets);
      insertedCount = result.length;
    }

    /* =============================
       🔔 NOTIFICATION
    ============================== */
    await sendNotification({
      req,
      userId,
      title: "Bulk Upload Completed",
      message: `${insertedCount} assets uploaded successfully.`,
      redirectUrl: "/inventory",
      type: "success"
    });

    /* =============================
       ✅ RESPONSE
    ============================== */
    return res.status(200).json({
      success: true,
      inserted: insertedCount,
      skipped: invalidRows.length,
      invalidRows
    });

  } catch (err) {
    console.error("❌ Bulk Upload Error:", err);
    return next(err);
  }
};




  // =======================================================================
  // ADD ASSET
  // =======================================================================
  // ================= ADD ASSET =================
  const addAsset = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      if (!organizationId) {
        return res.status(403).json({
          message: "Organization context missing",
        });
      }
      // 🔒 SUBSCRIPTION LIMIT CHECK
  const subscription = await Subscription.findOne({
    organizationId
  });

  if (!subscription) {
    return res.status(403).json({
      message: "No active subscription found"
    });
  }

  const tier = pricingTiers.find(t => t.key === subscription.tier);

  if (!tier) {
    return res.status(500).json({
      message: "Invalid subscription tier configuration"
    });
  }

  const currentAssetCount = await Asset.countDocuments({
    organizationId
  });

  const assetLimit = tier.assets;

  if (assetLimit !== "unlimited" && currentAssetCount >= assetLimit) {
    return res.status(403).json({
      code: "ASSET_LIMIT_REACHED",
      message: "Asset limit reached for your subscription plan",
      limit: assetLimit,
      current: currentAssetCount
    });
  }
      const { type } = req.body;

      if (!["one_time", "maintenance"].includes(type)) {
        return res.status(400).json({
          message: "Invalid asset type. Allowed: one_time, maintenance",
        });
      }

      const assetQuantity = Number(req.body.assetQuantity || 1);

  if (assetQuantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const category = await Category.findOne({
  _id: req.body.assetCategory,
  organizationId,
  isActive: true,
});

if (!category) {
  return res.status(400).json({
    message: "Invalid category",
  });
}

if (category.categoryType !== "hardware") {
  return res.status(400).json({
    message: "Category must belong to hardware",
  });
}
const org = await Organization.findById(organizationId);

const assetCode = await generateHardwareCode(
  organizationId,
  org.orgCode
);

const parsedDOP = req.body.purchaseDetails?.purchaseDate
  ? new Date(req.body.purchaseDetails.purchaseDate)
  : null;

if (!parsedDOP || isNaN(parsedDOP.getTime())) {
  return res.status(400).json({
    message: "Valid purchase date is required"
  });
}
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

  // 🔥 ONLY AGGREGATED VALUES
  financialTracking: {
    totalAssetCost: 0,
    monthlyCost: 0,
    yearlyCost: 0,
    maintenanceTotalCost: 0
  }
});


      const savedAsset = await newAsset.save();

      await sendNotification({
        req,
        userId,
        title: "Asset Added",
        message: `Asset "${savedAsset.assetName}" was added successfully.`,
        redirectUrl: "/inventory?tab=hardware",
        type: "success",
      });

      return res.status(201).json(savedAsset);
    } catch (error) {
      console.error("🔥 ADD ASSET ERROR:", error);
      return next(error);
    }
  };






  // =======================================================================
  // UPDATE ASSET
  // =======================================================================
  // ================= UPDATE ASSET =================
const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const existingAsset = await Asset.findOne({
      _id: id,
      organizationId,
    });

    if (!existingAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    /* ================= CATEGORY VALIDATION ================= */
    if (req.body.assetCategory) {
      const category = await Category.findOne({
        _id: req.body.assetCategory,
        organizationId,
        isActive: true,
      });

      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }

      if (category.categoryType !== "hardware") {
        return res.status(400).json({
          message: "Category must belong to hardware",
        });
      }
    }

    /* ================= QUANTITY VALIDATION ================= */
    const assetQuantity =
      req.body.assetQuantity ?? existingAsset.assetQuantity;

    if (existingAsset.inUse > assetQuantity) {
      return res.status(400).json({
        message: "In-use quantity cannot exceed total quantity",
      });
    }

    /* ================= TYPE VALIDATION ================= */
    if (req.body.type) {
      if (!["one_time", "maintenance"].includes(req.body.type)) {
        return res.status(400).json({
          message: "Invalid asset type",
        });
      }
    }

    /* ================= PURCHASE DETAILS ================= */
    const purchaseDetails = {
      purchaseDate: req.body.purchaseDetails?.purchaseDate
        ? parseDate(req.body.purchaseDetails.purchaseDate)
        : existingAsset.purchaseDetails?.purchaseDate,

      vendor: req.body.purchaseDetails?.vendor
        ? buildVendor(req.body.purchaseDetails.vendor)
        : existingAsset.purchaseDetails?.vendor,
    };

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
      assetQuantity,
      type: req.body.type ?? existingAsset.type,
      purchaseDetails,
      DOE,
      assetLifetime: updatedLifetime,
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

    return res.status(200).json(updatedAsset);

  } catch (error) {
    console.error("🔥 UPDATE ASSET ERROR:", error);
    return next(error);
  }
};

  // =======================================================================
  // DELETE ASSET
  // =======================================================================
  const deleteAsset = async (req, res , next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const deletedAsset = await Asset.findByIdAndDelete(id);
      if (!deletedAsset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      // delete all instances
      await AssetInstance.deleteMany({
        assetId: deletedAsset._id,
        organizationId
      });
  await sendNotification({
    req,
    userId,
    title: "Asset Deleted",
    message: `Asset "${deletedAsset.assetName}" was deleted.`,
    redirectUrl: "/inventory?tab=hardware",
    type: "alert",
  });


      return res.status(200).json({ message: "Asset successfully deleted", deletedAsset });

    } catch (error) {
      return next(error);
    }
  };




  // =======================================================================
  // GET ALL ASSETS
  // =======================================================================
const getAllAssets = async (req, res, next) => {
  const deriveAssetStatus = ({ assetQuantity, instanceCount, inUse }) => {
  if (instanceCount === 0) return "not_created";

  if (instanceCount < assetQuantity) return "partially_created";

  if (inUse === 0) return "in_stock";

  if (inUse === assetQuantity) return "fully_in_use";

  return "partially_in_use";
};  
  try {
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        message: "Organization context missing",
      });
    }

    const { type, search, instanceStatus } = req.query;

    /* ================= FILTER ================= */
    let filter = { organizationId };

    if (type) {
      filter.type = type;
    }

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

    if (!assets.length) return res.status(200).json([]);

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
const calculateFinancials = (instances = []) => {
  let totalPurchase = 0;

  let totalMaintenance = 0; // total maintenance (lifetime or summed)
  let yearlyMaintenance = 0;
  let monthlyMaintenance = 0;

  let currency = null;

  instances.forEach(inst => {
    const hw = inst.hardware || {};
    const sw = inst.software || {};

    // ✅ detect currency (first valid one)
    const instCurrency =
      hw.purchaseCost?.currency ||
      sw.purchaseCost?.currency ||
      null;

    if (!currency && instCurrency) {
      currency = instCurrency;
    }

    // ✅ PURCHASE (CAPEX)
    const purchase =
      hw.purchaseCost?.amount ||
      sw.purchaseCost?.amount ||
      0;

    totalPurchase += purchase;

    // ✅ MAINTENANCE ONLY (OPEX)
    const maintenance =
      hw.costs?.maintenanceCost ||
      sw.costs?.maintenanceCost ||
      0;

    totalMaintenance += maintenance;

    // ✅ ASSUMPTION: maintenanceCost is yearly
    yearlyMaintenance += maintenance;
    monthlyMaintenance += maintenance / 12;
  });

  return {
    totalAssetCost: totalPurchase,              // CAPEX
    maintenanceTotalCost: totalMaintenance,     // total maintenance
    yearlyMaintenanceCost: yearlyMaintenance,   // yearly maintenance
    monthlyMaintenanceCost: monthlyMaintenance, // monthly maintenance
    currency: currency || "INR"
  };
};
    /* ================= ASSIGNMENT MAP ================= */
    const assignmentMap = {};

    assignments.forEach(assign => {
      const key = String(assign.assetId);

      if (!assignmentMap[key]) {
        assignmentMap[key] = {
          inUse: 0,
          assignedDepartments: {},
          assignmentRecords: []
        };
      }

      // ✅ each assignment = 1 instance
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

    /* ================= INSTANCES ================= */
    const instances = await AssetInstance.find({
      organizationId,
      assetId: { $in: assetIds }
    }).lean();

    const instanceMap = {};

    instances.forEach(inst => {
      const key = String(inst.assetId);

      if (!instanceMap[key]) {
        instanceMap[key] = [];
      }

      instanceMap[key].push(inst);
    });

    /* ================= MERGE ================= */
let enrichedAssets = assets.map(asset => {
  const key = String(asset._id);

  const assignmentData = assignmentMap[key] || {};
  const assetInstances = instanceMap[key] || [];

  // 🔥 NEW: calculate financials
  const financials = calculateFinancials(assetInstances);

  return {
    ...asset,

    // usage
    inUse: assignmentData.inUse || 0,

    // department grouping
    assignedDepartments: Object.values(
      assignmentData.assignedDepartments || {}
    ),

    // records
    assignmentRecords: assignmentData.assignmentRecords || [],

    // instances
    instances: assetInstances,
    instanceCount: assetInstances.length,

    // ✅ STATUS
    status: deriveAssetStatus({
      assetQuantity: asset.assetQuantity,
      instanceCount: assetInstances.length,
      inUse: assignmentData.inUse || 0
    }),

    // ✅ FINANCIALS (NEW)
    financialTracking: financials
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

    return res.status(200).json(enrichedAssets);

  } catch (error) {
    console.error("GET ASSETS ERROR:", error);
    next(error);
  }
};
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
const createAssetInstance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const { assetId, instances } = req.body;

    if (!instances || instances.length === 0) {
      return res.status(400).json({ message: "No instances provided" });
    }

    /* ================= DETECT ASSET ================= */
    let asset = await Asset.findById(assetId);
    let assetTypeRef = "Asset";

    if (!asset) {
      asset = await SoftwareAsset.findById(assetId);
      assetTypeRef = "SoftwareAsset";
    }

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const assetType =
      assetTypeRef === "SoftwareAsset" ? "software" : "hardware";

    /* ================= QUANTITY VALIDATION ================= */
    const existingCount = await AssetInstance.countDocuments({
      assetId,
      organizationId
    });

    if (existingCount + instances.length > asset.assetQuantity) {
      return res.status(400).json({
        message: "Exceeds asset quantity"
      });
    }

    /* ================= SERIAL VALIDATION ================= */
    const serials = instances.map(i => i.serialNumber).filter(Boolean);

    if (new Set(serials).size !== serials.length) {
      return res.status(400).json({
        message: "Duplicate serials in request"
      });
    }

    const existingSerials = await AssetInstance.find({
      organizationId,
      serialNumber: { $in: serials }
    });

    if (existingSerials.length > 0) {
      return res.status(400).json({
        message: "Serial already exists"
      });
    }

    /* ================= HELPER ================= */
    const formatCost = (cost) => {
      if (!cost) return null;

      if (typeof cost === "object") {
        return {
          amount: Number(cost.amount) || 0,
          currency: cost.currency || "INR",
          baseAmount: convertToBase(
            Number(cost.amount) || 0,
            cost.currency || "INR"
          )
        };
      }

      return {
        amount: Number(cost) || 0,
        currency: "INR",
        baseAmount: convertToBase(Number(cost) || 0, "INR")
      };
    };

    /* ================= CREATE INSTANCES ================= */
    const newInstances = instances.map((inst, index) => {
      const instanceCode = `${asset.assetCode}-${Date.now()}-${index}`;
      const hasInsurance = inst.hardware?.hasInsurance ?? false;

      /* ================= HARDWARE ================= */
      if (assetType === "hardware") {
        const purchaseCost = formatCost(inst.hardware?.purchaseCost);
        const currency = purchaseCost?.currency || "INR";

        return {
          organizationId,
          assetId,
          assetTypeRef,
          assetType,

          instanceCode,
          deviceName: inst.deviceName || "",
          serialNumber: inst.serialNumber || undefined,

          location: inst.location,
          status: "in_stock",
          condition: inst.condition || "new",

          hardware: {
            modelNo: inst.hardware?.modelNo || "",
            specifications: inst.hardware?.specifications || "",

            purchaseDate: inst.hardware?.purchaseDate || null,
            installationDate: inst.hardware?.installationDate || null,

            warrantyPurchaseDate:
              inst.hardware?.warrantyPurchaseDate ??
              inst.hardware?.purchaseDate ??
              null,

            warrantyExpiry: inst.hardware?.warrantyExpiry || null,

            hasInsurance,

            insuranceId: hasInsurance
              ? inst.hardware?.insuranceId || ""
              : null,

            coverageType: hasInsurance
              ? inst.hardware?.coverageType || ["comprehensive"]
              : [],

            insurancePurchaseDate: hasInsurance
              ? inst.hardware?.insurancePurchaseDate || null
              : null,

            insuranceTerm: hasInsurance
              ? inst.hardware?.insuranceTerm || "1_year"
              : null,

            insuranceExpiry: hasInsurance
              ? calculateInsuranceExpiry(
                  inst.hardware?.insurancePurchaseDate,
                  inst.hardware?.insuranceTerm
                )
              : null,

            nextMaintenanceDate:
              inst.hardware?.nextMaintenanceDate || null,

            purchaseCost,

            // ✅ currency propagated
            costs: {
              currency,
              maintenanceCost:
                Number(inst.hardware?.costs?.maintenanceCost) || 0,
              warrantyRenewalCost:
                Number(inst.hardware?.costs?.warrantyRenewalCost) || 0,
              insuranceCost: hasInsurance
                ? Number(inst.hardware?.costs?.insuranceCost) || 0
                : 0
            }
          },

          lifecycle: [
            {
              action: "CREATED",
              date: new Date(),
              notes: "Instance created"
            }
          ],

          createdBy: userId
        };
      }

      /* ================= SOFTWARE ================= */
      const purchaseCost = formatCost(inst.software?.purchaseCost);
      const currency = purchaseCost?.currency || "INR";

      return {
        organizationId,
        assetId,
        assetTypeRef,
        assetType,

        instanceCode,

        deviceName: inst.deviceName || "",
        location: inst.location,
        status: "in_stock",
        condition: inst.condition || "new",

        software: {
          licenseKey: inst.software?.licenseKey || "",
          licenseNumber: inst.software?.licenseNumber || "",

          purchaseDate: inst.software?.purchaseDate || null,
          installationDate: inst.software?.installationDate || null,
          renewalDate: inst.software?.renewalDate || null,
          lastUsedDate: inst.software?.lastUsedDate || null,

          purchaseCost,

          // ✅ currency propagated
          costs: {
            currency,
            renewalCost:
              Number(inst.software?.costs?.renewalCost) || 0
          }
        },

        lifecycle: [
          {
            action: "CREATED",
            date: new Date(),
            notes: "Instance created"
          }
        ],

        createdBy: userId
      };
    });

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
          return instance;

        } catch (err) {
          console.error("QR upload failed:", err.message);
          return instance;
        }
      })
    );

    /* ================= UPDATE PARENT COST ================= */
    const aggregation = await AssetInstance.aggregate([
      {
        $match: {
          assetId: asset._id,
          organizationId
        }
      },
      {
        $group: {
          _id: null,
          totalCost: {
            $sum: {
              $cond: [
                { $eq: ["$assetType", "hardware"] },
                { $ifNull: ["$hardware.purchaseCost.baseAmount", 0] },
                { $ifNull: ["$software.purchaseCost.baseAmount", 0] }
              ]
            }
          }
        }
      }
    ]);

    const totalCost = aggregation[0]?.totalCost || 0;

    await (assetType === "hardware" ? Asset : SoftwareAsset)
      .findByIdAndUpdate(asset._id, {
        "financialTracking.totalAssetCost": totalCost
      });

    return res.status(201).json(updatedInstances);

  } catch (err) {
    console.error("ERROR:", err.message);
    return next(err);
  }
};
const updateAssetInstance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const instance = await AssetInstance.findOne({
      _id: id,
      organizationId
    });

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Instance not found"
      });
    }

    /* ================= SERIAL VALIDATION ================= */
    if (req.body.serialNumber) {
      const exists = await AssetInstance.findOne({
        organizationId,
        uniqueIdentifier: req.body.serialNumber,
        _id: { $ne: id }
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Serial already exists"
        });
      }
    }

    /* ================= LOCATION VALIDATION ================= */
    if (req.body.location !== undefined) {
      if (!req.body.location.trim()) {
        return res.status(400).json({
          success: false,
          message: "Location cannot be empty"
        });
      }
    }

    /* ================= SNAPSHOT BEFORE ================= */
    const beforeSnapshot = {
      location: instance.location,
      condition: instance.condition,
      serialNumber: instance.uniqueIdentifier
    };

    /* ================= ALLOWED UPDATES ONLY ================= */

    if (req.body.location !== undefined) {
      instance.location = req.body.location.trim();
    }

    if (req.body.condition) {
      instance.condition = req.body.condition;
    }

    if (req.body.serialNumber !== undefined) {
      instance.uniqueIdentifier = req.body.serialNumber;
    }

    /* ================= SNAPSHOT AFTER ================= */
    const afterSnapshot = {
      location: instance.location,
      condition: instance.condition,
      serialNumber: instance.uniqueIdentifier
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

    return res.status(200).json({
      success: true,
      data: instance
    });

  } catch (error) {
    console.error("UPDATE INSTANCE ERROR:", error);
    return next(error);
  }
};
const bulkUploadInstances = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { assetId, instances } = req.body;

    if (!assetId || !instances) {
      return res.status(400).json({
        success: false,
        message: "Missing assetId or instances",
      });
    }

    let parsedInstances;
    try {
      parsedInstances = Array.isArray(instances)
        ? instances
        : JSON.parse(instances);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format",
      });
    }

    /* --------------------------------------------------
       🔍 FETCH PARENT ASSET
    -------------------------------------------------- */
    let asset = await Asset.findById(assetId);
    let assetTypeRef = "Asset";

    if (!asset) {
      asset = await SoftwareAsset.findById(assetId);
      assetTypeRef = "SoftwareAsset";
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Parent asset not found",
      });
    }

    const assetType =
      assetTypeRef === "SoftwareAsset" ? "software" : "hardware";

    /* --------------------------------------------------
       🔒 QUANTITY VALIDATION
    -------------------------------------------------- */
    const existingCount = await AssetInstance.countDocuments({
      assetId,
      organizationId,
    });

    if (existingCount + parsedInstances.length > asset.assetQuantity) {
      return res.status(400).json({
        success: false,
        message: "Exceeds asset quantity",
      });
    }

    /* --------------------------------------------------
       🔒 SERIAL VALIDATION (GLOBAL CHECK)
    -------------------------------------------------- */
    const serials = parsedInstances
      .map((i) => i.serialNumber)
      .filter(Boolean);

    if (new Set(serials).size !== serials.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate serials in upload",
      });
    }

    const existingSerials = await AssetInstance.find({
      organizationId,
      serialNumber: { $in: serials },
    });

    if (existingSerials.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Serial already exists",
      });
    }

    /* --------------------------------------------------
       🧠 HELPERS
    -------------------------------------------------- */
    const normalize = (v) => v?.toString().trim();

    const parseDateSafe = (d) => {
      if (!d) return null;
      const date = new Date(d);
      return isNaN(date.getTime()) ? null : date;
    };



    const calculateInsuranceExpiry = (date, term) => {
      if (!date) return null;

      const d = new Date(date);

      if (term === "6_months") d.setMonth(d.getMonth() + 6);
      if (term === "1_year") d.setFullYear(d.getFullYear() + 1);
      if (term === "3_years") d.setFullYear(d.getFullYear() + 3);

      return d;
    };

    /* --------------------------------------------------
       🚀 BUILD INSTANCES
    -------------------------------------------------- */
    let validInstances = [];
    let invalidRows = [];

    for (const [index, inst] of parsedInstances.entries()) {
      try {
        const row = index + 2;

        const instanceCode = `${asset.assetCode}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;

        /* ---------- BASIC VALIDATION ---------- */
        if (!inst.location) throw new Error("Location is required");

        const location = normalize(inst.location);

        if (assetType === "hardware" && !inst.serialNumber) {
          throw new Error("Serial number required");
        }

        /* ---------------- HARDWARE ---------------- */
        if (assetType === "hardware") {
          const purchaseDate = parseDateSafe(inst.hardware?.purchaseDate);
          const installationDate = parseDateSafe(inst.hardware?.installationDate);

          const warrantyPurchaseDate =
            parseDateSafe(inst.hardware?.warrantyPurchaseDate) ||
            purchaseDate;

          const warrantyExpiry = parseDateSafe(inst.hardware?.warrantyExpiry);

          const insurancePurchaseDate = parseDateSafe(
            inst.hardware?.insurancePurchaseDate
          );

          const insuranceTerm = inst.hardware?.insuranceTerm || "1_year";

          validInstances.push({
            organizationId,
            assetId,
            assetTypeRef,
            assetType,

            instanceCode,

            serialNumber: inst.serialNumber?.trim(),
            deviceName: normalize(inst.deviceName) || "",

            location,
            condition: inst.condition || "new",
            status: "in_stock",

            hardware: {
              modelNo: normalize(inst.hardware?.modelNo) || "",
              specifications: normalize(inst.hardware?.specifications) || "",

              purchaseDate,
              installationDate,

              warrantyPurchaseDate,
              warrantyExpiry,

              insuranceId: inst.hardware?.insuranceId || "",

              insurancePurchaseDate,
              insuranceTerm,

              coverageType: Array.isArray(inst.hardware?.coverageType)
                ? inst.hardware.coverageType
                : [inst.hardware?.coverageType || "comprehensive"],

              insuranceExpiry: calculateInsuranceExpiry(
                insurancePurchaseDate,
                insuranceTerm
              ),

              nextMaintenanceDate: parseDateSafe(
                inst.hardware?.nextMaintenanceDate
              ),

              purchaseCost: formatCost(inst.hardware?.purchaseCost),

              costs: {
                maintenanceCost:
                  Number(inst.hardware?.costs?.maintenanceCost) || 0,
                warrantyRenewalCost:
                  Number(inst.hardware?.costs?.warrantyRenewalCost) || 0,
                insuranceCost:
                  Number(inst.hardware?.costs?.insuranceCost) || 0,
              },
            },

            lifecycle: [
              {
                action: "CREATED",
                date: new Date(),
                notes: "Bulk instance upload",
              },
            ],

            createdBy: userId,
          });
        }

        /* ---------------- SOFTWARE ---------------- */
        else {
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
              licenseKey: normalize(inst.software?.licenseKey) || "",
              licenseNumber: normalize(inst.software?.licenseNumber) || "",

              purchaseDate: parseDateSafe(inst.software?.purchaseDate),
              installationDate: parseDateSafe(inst.software?.installationDate),
              renewalDate: parseDateSafe(inst.software?.renewalDate),
              lastUsedDate: parseDateSafe(inst.software?.lastUsedDate),

              purchaseCost: formatCost(inst.software?.purchaseCost),

              costs: {
                renewalCost:
                  Number(inst.software?.costs?.renewalCost) || 0,
              },
            },

            lifecycle: [
              {
                action: "CREATED",
                date: new Date(),
                notes: "Bulk instance upload",
              },
            ],

            createdBy: userId,
          });
        }
      } catch (err) {
        invalidRows.push({
          row: index + 2,
          reason: err.message,
          inst,
        });
      }
    }

    /* --------------------------------------------------
       💾 INSERT
    -------------------------------------------------- */
    let inserted = [];

    if (validInstances.length) {
      inserted = await AssetInstance.insertMany(validInstances, {
        ordered: false,
      });
    }

    /* --------------------------------------------------
       💰 UPDATE PARENT COST
    -------------------------------------------------- */
    const aggregation = await AssetInstance.aggregate([
      {
        $match: { assetId: asset._id, organizationId },
      },
      {
        $group: {
          _id: null,
          totalCost: {
            $sum: {
              $cond: [
                { $eq: ["$assetType", "hardware"] },
                { $ifNull: ["$hardware.purchaseCost.baseAmount", 0] },
                { $ifNull: ["$software.purchaseCost.baseAmount", 0] },
              ],
            },
          },
        },
      },
    ]);

    const totalCost = aggregation[0]?.totalCost || 0;

    await (assetType === "hardware" ? Asset : SoftwareAsset)
      .findByIdAndUpdate(asset._id, {
        "financialTracking.totalAssetCost": totalCost,
      });

    /* --------------------------------------------------
       ✅ RESPONSE
    -------------------------------------------------- */
    return res.status(200).json({
      success: true,
      inserted: inserted.length,
      skipped: invalidRows.length,
      invalidRows,
    });

  } catch (err) {
    console.error("❌ Bulk Instance Upload Error:", err);
    return next(err);
  }
};
const formatCost = (cost) => {
  if (!cost) return null;

  let amount, currency;

  if (typeof cost === "object") {
    amount = Number(cost.amount) || 0;
    currency = cost.currency || "INR";
  } else {
    amount = Number(cost) || 0;
    currency = "INR";
  }

  return {
    amount,
    currency,
    baseAmount: convertToBase(amount, currency),
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
    updateAssetInstance
  };
