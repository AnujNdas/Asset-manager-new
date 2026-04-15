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
       📦 INPUT PARSE
    ============================== */
    const { assets, mode = "strict" } = req.body;

    if (!assets) {
      return res.status(400).json({
        success: false,
        message: "No asset data provided"
      });
    }

    let parsedAssets;
    try {
      parsedAssets = JSON.parse(assets);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format"
      });
    }

    /* =============================
       🔎 FETCH REFERENCES
    ============================== */
    const [categories, units, locations, statuses] = await Promise.all([
      Category.find({ organizationId }),
      Unit.find({ organizationId }),
      Location.find({ organizationId }),
      Status.find({ organizationId })
    ]);

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c._id]));
    const unitMap = new Map(units.map(u => [u.name.toLowerCase(), u._id]));
    const locationMap = new Map(locations.map(l => [l.name.toLowerCase(), l._id]));
    const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

    const normalize = v => v?.toString().trim().toLowerCase();

    let tempAssets = [];
    let invalidRows = [];

    /* =============================
       🔁 PROCESS ROWS
    ============================== */
    for (const [index, asset] of parsedAssets.entries()) {
      try {
        const row = index + 2;

        const catKey = normalize(asset.assetCategory);
        const unitKey = normalize(asset.associateUnit);
        const locKey = normalize(asset.locationName);
        const statusKey = normalize(asset.assetStatus);

        let categoryId = categoryMap.get(catKey);
        let unitId = unitMap.get(unitKey);
        let locationId = locationMap.get(locKey);
        let statusId = statusMap.get(statusKey);

        /* ---------- STRICT MODE ---------- */
        if (
          mode === "strict" &&
          (!categoryId || !unitId || !locationId || !statusId)
        ) {
          invalidRows.push({
            row,
            reason: "Missing reference data",
            asset
          });
          continue;
        }

        /* ---------- UPSERT REFERENCES ---------- */
        if (!categoryId && catKey) {
          const doc = await Category.findOneAndUpdate(
            { name: new RegExp(`^${asset.assetCategory}$`, "i"), organizationId },
            { name: asset.assetCategory, organizationId },
            { upsert: true, new: true }
          );
          categoryId = doc._id;
          categoryMap.set(catKey, categoryId);
        }

        if (!unitId && unitKey) {
          const doc = await Unit.findOneAndUpdate(
            { name: new RegExp(`^${asset.associateUnit}$`, "i"), organizationId },
            { name: asset.associateUnit, organizationId },
            { upsert: true, new: true }
          );
          unitId = doc._id;
          unitMap.set(unitKey, unitId);
        }

        if (!locationId && locKey) {
          const doc = await Location.findOneAndUpdate(
            { name: new RegExp(`^${asset.locationName}$`, "i"), organizationId },
            { name: asset.locationName, organizationId },
            { upsert: true, new: true }
          );
          locationId = doc._id;
          locationMap.set(locKey, locationId);
        }

        if (!statusId && statusKey) {
          const doc = await Status.findOneAndUpdate(
            { name: new RegExp(`^${asset.assetStatus}$`, "i"), organizationId },
            { name: asset.assetStatus, organizationId },
            { upsert: true, new: true }
          );
          statusId = doc._id;
          statusMap.set(statusKey, statusId);
        }

        /* =============================
           📅 DATES
        ============================== */
        const dop = parseDate(asset.DateOfPurchase);
        const doe = parseDate(asset.DateOfExpiry);

        if (!dop) {
          invalidRows.push({
            row,
            reason: "Invalid or missing purchase date",
            asset
          });
          continue;
        }

        /* =============================
           🔢 VALIDATION
        ============================== */
        const totalQty = Number(asset.assetQuantity || 1);

        if (totalQty <= 0) {
          invalidRows.push({
            row,
            reason: "Invalid asset quantity",
            asset
          });
          continue;
        }

        const assetType = asset.type?.toLowerCase();

        if (!["one_time", "maintenance"].includes(assetType)) {
          invalidRows.push({
            row,
            reason: "Invalid asset type",
            asset
          });
          continue;
        }

        /* =============================
           🏢 VENDOR
        ============================== */
        const vendor = {
          name: asset.vendorName || "",
          contact: asset.vendorContact || "",
          supportEmail: asset.vendorEmail || ""
        };

        /* =============================
           🧱 FINAL ASSET (CLEAN)
        ============================== */
        tempAssets.push({
          organizationId,

          assetName: asset.assetName,
          type: assetType,

          assetCategory: categoryId,
          associateUnit: unitId,
          locationName: locationId,
          assetStatus: statusId,

          purchaseDetails: {
            purchaseDate: dop,
            vendor
          },

          DOE: doe || null,

          assetQuantity: totalQty,
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
    if (validAssets.length > 0) {
      await Asset.insertMany(validAssets);
    }

    /* =============================
       🔔 NOTIFICATION
    ============================== */
    await sendNotification({
      req,
      userId,
      title: "Bulk Upload Completed",
      message: `${validAssets.length} assets uploaded successfully.`,
      redirectUrl: "/inventory",
      type: "success"
    });

    /* =============================
       ✅ RESPONSE
    ============================== */
    return res.status(200).json({
      success: true,
      inserted: validAssets.length,
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
  let totalMaintenance = 0;
  let totalYearly = 0;

  instances.forEach(inst => {
    const hw = inst.hardware || {};
    const sw = inst.software || {};

    // ✅ PURCHASE COST
    const purchase =
      hw.purchaseCost?.amount ||
      sw.purchaseCost?.amount ||
      0;

    totalPurchase += purchase;

    // ✅ MAINTENANCE / RENEWAL / INSURANCE
    const maintenance =
      hw.costs?.maintenanceCost ||
      sw.costs?.maintenanceCost ||
      0;

    const warranty =
      hw.costs?.warrantyRenewalCost ||
      sw.costs?.renewalCost ||
      0;

    const insurance =
      hw.costs?.insuranceCost || 0;

    const yearly = maintenance + warranty + insurance;

    totalMaintenance += maintenance;
    totalYearly += yearly;
  });

  return {
    totalAssetCost: totalPurchase,
    maintenanceTotalCost: totalMaintenance,
    yearlyCost: totalYearly,
    monthlyCost: totalYearly / 12,
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

        // 🔍 Detect asset type
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

        // 🔥 Quantity validation
        const existingCount = await AssetInstance.countDocuments({
          assetId,
          organizationId
        });

        if (existingCount + instances.length > asset.assetQuantity) {
          return res.status(400).json({
            message: "Exceeds asset quantity"
          });
        }

        // 🔥 SERIAL VALIDATION
        const serials = instances
          .map((i) => i.serialNumber)
          .filter(Boolean);

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

        // 🔥 CREATE INSTANCES
      const newInstances = instances.map((inst, index) => {
    // 🔍 DEBUG LEVEL 1: entire instance
    console.log("-------- INSTANCE START --------");
    console.log("FULL INSTANCE:", JSON.stringify(inst, null, 2));

    // 🔍 DEBUG LEVEL 2: check hardware object
    console.log("HARDWARE OBJECT:", inst.hardware);

    // 🔍 DEBUG LEVEL 3: check specific field
    console.log(
      "warrantyPurchaseDate (nested):",
      inst.hardware?.warrantyPurchaseDate
    );

    console.log(
      "warrantyPurchaseDate (flat):",
      inst.warrantyPurchaseDate
    );

    console.log("-------- INSTANCE END --------");

    return {
      organizationId,
      assetId,
      assetTypeRef,
      assetType,

      instanceCode: `${asset.assetCode}-${Date.now()}-${index}`,

      deviceName: inst.deviceName || "",
      serialNumber: inst.serialNumber || undefined,

      location: inst.location,
      status: "in_stock",
      condition: inst.condition || "new",

      // 🔹 HARDWARE BLOCK
      hardware:
        assetType === "hardware"
          ? (() => {
              console.log("👉 ENTERING HARDWARE MAPPING");

              const purchaseDate =
                inst.hardware?.insurancePurchaseDate || null;

              const term =
                inst.hardware?.insuranceTerm || "1_year";

              console.log("👉 FINAL VALUE USED:", {
                warrantyPurchaseDate:
                  inst.hardware?.warrantyPurchaseDate,
                fallbackPurchaseDate: inst.hardware?.purchaseDate,
              });

              return {
                modelNo: inst.hardware?.modelNo || "",
                specifications: inst.hardware?.specifications || "",

                purchaseDate: inst.hardware?.purchaseDate || null,
                installationDate:
                  inst.hardware?.installationDate || null,

                warrantyPurchaseDate:
                  inst.hardware?.warrantyPurchaseDate ?? 
                  inst.hardware?.purchaseDate ?? 
                  null,

                warrantyExpiry:
                  inst.hardware?.warrantyExpiry || null,

                insuranceId: inst.hardware?.insuranceId || "",
                          coverageType:
              inst.hardware?.coverageType || "comprehensive",
                insurancePurchaseDate: purchaseDate,
                insuranceTerm: term,

                insuranceExpiry: calculateInsuranceExpiry(
                  purchaseDate,
                  term
                ),

                nextMaintenanceDate:
                  inst.hardware?.nextMaintenanceDate || null,

                purchaseCost: inst.hardware?.purchaseCost || null,
                currency: inst.hardware?.purchaseCost?.currency || "INR",
                costs: {
                  maintenanceCost:
                    Number(inst.hardware?.costs?.maintenanceCost) || 0,
                  warrantyRenewalCost:
                    Number(inst.hardware?.costs?.warrantyRenewalCost) || 0,
                  insuranceCost:
                    Number(inst.hardware?.costs?.insuranceCost) || 0
                }
              };
            })()
          : undefined,

      // 🔹 SOFTWARE BLOCK
      software:
        assetType === "software"
          ? {
              licenseKey: inst.software?.licenseKey || "",
              licenseNumber:
                inst.software?.licenseNumber || "",
              vendor: inst.software?.vendor || "",

              purchaseDate: inst.software?.purchaseDate || null,
              installationDate:
                inst.software?.installationDate || null,
              renewalDate: inst.software?.renewalDate || null,
              lastUsedDate:
                inst.software?.lastUsedDate || null,

              purchaseCost: inst.software?.purchaseCost || null,

              costs: {
                renewalCost:
                  Number(inst.software?.costs?.renewalCost) || 0
              }
            }
          : undefined,

      lifecycle: [
        {
          action: "CREATED",
          date: new Date(),
          notes: "Instance created",
          from: null,
          to: {
            location: inst.location,
            condition: inst.condition || "new"
          }
        }
      ],

      createdBy: userId
    };
  });

        const saved = await AssetInstance.insertMany(newInstances);

        // 🔥 AGGREGATE TOTAL COST FROM INSTANCES
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
                    {
                      $ifNull: [
                        "$hardware.purchaseCost.amount",
                        0
                      ]
                    },
                    {
                      $ifNull: [
                        "$software.purchaseCost.amount",
                        0
                      ]
                    }
                  ]
                }
              }
            }
          }
        ]);

        const totalCost = aggregation[0]?.totalCost || 0;

        // 🔥 UPDATE PARENT ASSET
        await (assetType === "hardware" ? Asset : SoftwareAsset)
          .findByIdAndUpdate(asset._id, {
            "financialTracking.totalAssetCost": totalCost
          });

        return res.status(201).json(saved);
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

    const { assetId, instances, mode = "strict" } = req.body;

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
       🔒 SERIAL VALIDATION (HARDWARE ONLY)
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
       🧠 UTIL: Insurance Expiry Calculator
    -------------------------------------------------- */

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

    parsedInstances.forEach((inst, index) => {
      try {
        const instanceCode = `${asset.assetCode}-${Date.now()}-${index}`;

        /* ---------------- HARDWARE ---------------- */
        if (assetType === "hardware") {
          const purchaseDate = inst.hardware?.purchaseDate || null;
          const warrantyPurchaseDate =
            inst.hardware?.warrantyPurchaseDate ||
            purchaseDate;

          const insurancePurchaseDate =
            inst.hardware?.insurancePurchaseDate || null;

          const insuranceTerm =
            inst.hardware?.insuranceTerm || "1_year";

          validInstances.push({
            organizationId,
            assetId,
            assetTypeRef,
            assetType,

            instanceCode,

            serialNumber: inst.serialNumber || undefined,
            deviceName: inst.deviceName || "",

            location: inst.location,
            condition: inst.condition || "new",
            status: "in_stock",

            hardware: {
              modelNo: inst.hardware?.modelNo || "",
              specifications: inst.hardware?.specifications || "",

              purchaseDate,
              installationDate:
                inst.hardware?.installationDate || null,

              warrantyPurchaseDate,
              warrantyExpiry:
                inst.hardware?.warrantyExpiry || null,

              insuranceId: inst.hardware?.insuranceId || "",

              insurancePurchaseDate,
              insuranceTerm,

              coverageType:
                inst.hardware?.coverageType || "comprehensive",

              insuranceExpiry: calculateInsuranceExpiry(
                insurancePurchaseDate,
                insuranceTerm
              ),

              nextMaintenanceDate:
                inst.hardware?.nextMaintenanceDate || null,

              purchaseCost:
                inst.hardware?.purchaseCost || null,

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

            location: inst.location,
            condition: inst.condition || "new",
            status: "in_stock",

            software: {
              licenseKey: inst.software?.licenseKey || "",
              licenseNumber:
                inst.software?.licenseNumber || "",

              purchaseDate:
                inst.software?.purchaseDate || null,
              installationDate:
                inst.software?.installationDate || null,
              renewalDate:
                inst.software?.renewalDate || null,
              lastUsedDate:
                inst.software?.lastUsedDate || null,

              purchaseCost:
                inst.software?.purchaseCost || null,

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
    });

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
                { $ifNull: ["$hardware.purchaseCost.amount", 0] },
                { $ifNull: ["$software.purchaseCost.amount", 0] },
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
