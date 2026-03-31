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
  const bulkUpload = async (req, res, next) => {

    try {
      console.log("🔥 Bulk upload request received.");

      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;
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
      if (!userId || !organizationId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { assets, mode = "strict" } = req.body;

      if (!assets) {
        return res.status(400).json({
          success: false,
          message: "No asset data provided",
        });
      }

      let parsedAssets;
      try {
        parsedAssets = JSON.parse(assets);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format",
        });
      }

      // ---------- FETCH REFERENCES (ORG-SAFE) ----------
      const [categories, units, locations, statuses] = await Promise.all([
        Category.find({ organizationId }),
        Unit.find({ organizationId }),
        Location.find({ organizationId }),
        Status.find({ organizationId }),
      ]);

      const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c._id]));
      const unitMap = new Map(units.map(u => [u.name.toLowerCase(), u._id]));
      const locationMap = new Map(locations.map(l => [l.name.toLowerCase(), l._id]));
      const statusMap = new Map(statuses.map(s => [s.name.toLowerCase(), s._id]));

      const normalize = v => v?.toString().trim().toLowerCase();

      let tempAssets = [];
      let invalidRows = [];

      // ---------- PROCESS ROWS ----------
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

          // ---------- STRICT MODE ----------
          if (
            mode === "strict" &&
            (!categoryId || !unitId || !locationId || !statusId)
          ) {
            invalidRows.push({
              row: index + 2,
              reason: "Missing reference data",
              asset,
            });
            continue;
          }

          // ---------- UPSERT REFERENCES ----------
          if (!categoryId && catKey) {
            const category = await Category.findOneAndUpdate(
              { name: new RegExp(`^${asset.assetCategory}$`, "i"), organizationId },
              { name: asset.assetCategory, organizationId },
              { upsert: true, new: true }
            );
            categoryId = category._id;
            categoryMap.set(catKey, categoryId);
          }

          if (!unitId && unitKey) {
            const unit = await Unit.findOneAndUpdate(
              { name: new RegExp(`^${asset.associateUnit}$`, "i"), organizationId },
              { name: asset.associateUnit, organizationId },
              { upsert: true, new: true }
            );
            unitId = unit._id;
            unitMap.set(unitKey, unitId);
          }

          if (!locationId && locKey) {
            const location = await Location.findOneAndUpdate(
              { name: new RegExp(`^${asset.locationName}$`, "i"), organizationId },
              { name: asset.locationName, organizationId },
              { upsert: true, new: true }
            );
            locationId = location._id;
            locationMap.set(locKey, locationId);
          }

          if (!statusId && statusKey) {
            const status = await Status.findOneAndUpdate(
              { name: new RegExp(`^${asset.assetStatus}$`, "i"), organizationId },
              { name: asset.assetStatus, organizationId },
              { upsert: true, new: true }
            );
            statusId = status._id;
            statusMap.set(statusKey, statusId);
          }
          const dop = parseDate(asset.DateOfPurchase);
          const doe = parseDate(asset.DateOfExpiry);

          // ---------- VALIDATIONS ----------
          const totalQty = Number(asset.assetQuantity || 1);
          if (totalQty <= 0) {
            invalidRows.push({
              row: index + 2,
              reason: "Invalid asset quantity",
              asset,
            });
            continue;
          }

          const totalAmount = Number(asset.assetCost || 0);

          if (!dop) {
    invalidRows.push({
      row: index + 2,
      reason: "Invalid or missing purchase date",
      asset
    });
    continue;
  }
  if (totalAmount < 0) {
    invalidRows.push({
      row: index + 2,
      reason: "Invalid total cost",
      asset,
    });
    continue;
  }
  if (!asset.assetSpecification) {
    invalidRows.push({
      row: index + 2,
      reason: "Missing asset specification",
      asset
    });
    continue;
  }
  if (totalQty <= 0) {
    invalidRows.push({
      row: index + 2,
      reason: "Invalid asset quantity",
      asset,
    });
    continue;
  }

  const currency = (asset.assetCurrency || BASE_CURRENCY).toUpperCase();
  const unitAmount = totalAmount / totalQty;
  const baseTotalAmount = convertToBase(totalAmount, currency);


          // ---------- TYPE VALIDATION ----------
          const assetType = asset.type?.toLowerCase();

          if (!["one_time", "maintenance"].includes(assetType)) {
            invalidRows.push({
              row: index + 2,
              reason: "Invalid or missing asset type (one_time | maintenance)",
              asset,
            });
            continue;
          }

          // ---------- WARRANTY BUILD ----------
  let warrantyData = undefined;

  if (asset.warrantyId || asset.warrantyExpiryDate) {
  warrantyData = buildWarranty(
    {
      warrantyId: asset.warrantyId,
      expiryDate: parseDate(asset.warrantyExpiryDate),
    },
    {},
    dop
  );
  }
  const vendor = buildVendor({
    name: asset.vendorName,
    contact: asset.vendorContact,
    supportEmail: asset.vendorEmail
  });
  const normalizeTerm = (term) => {
    if (!term) return null;

    const t = term.toLowerCase();

    if (t.includes("6")) return "6_month";
    if (t.includes("1 year") || t === "1") return "1_year";
    if (t.includes("2")) return "2_year";

    return null;
  };
  const maintenance = buildMaintenance({
    maintenanceTerm: normalizeTerm(asset.maintenanceTerm),
    maintenanceCost: asset.maintenanceCost
  });
  const financialTracking = buildFinancialTracking(
    { totalAmount },
    maintenance,
    warrantyData,
    {}
  );


  // ---------- FINAL ASSET ----------
tempAssets.push({
  organizationId,
  type: assetType,
  assetCategory: categoryId,
  barcodeNumber: asset.barcodeNumber,
  assetName: asset.assetName,
  associateUnit: unitId,
  locationName: locationId,
  locationAddress: asset.locationAddress,
  modelNo: asset.modelNo,
  assetSpecification: asset.assetSpecification,
  assetStatus: statusId,
  purchaseDetails: {
    purchaseDate: dop,
    vendor
  },
  DOE: doe,
  assetLifetime: calculateAssetLifetime(dop, doe),
  warranty: warrantyData,
  assetCost: {
    totalAmount,
    unitAmount,
    baseTotalAmount,
    currency,
  },
  tracking: buildTracking({
    assetTag: asset.assetTag,
    qrCode: asset.qrCode
  }),
  maintenance,
  financialTracking,
  assetQuantity: totalQty,
  inUse: 0,
  createdBy: userId,
  auditHistory: [
    { date: new Date(), notes: `Bulk uploaded by user ${userId}` },
  ],
});

        } catch (rowError) {
          invalidRows.push({
            row: index + 2,
            reason: rowError.message,
            asset,
          });
        }
      }

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
      // ---------- INSERT ----------
  // ---------- PLAN LIMIT CHECK ----------
  const currentAssetCount = await Asset.countDocuments({ organizationId });

  if (assetLimit !== "unlimited") {

    const availableSlots = assetLimit - currentAssetCount;

    if (availableSlots <= 0) {
      return res.status(403).json({
        success: false,
        code: "ASSET_LIMIT_REACHED",
        message: "Asset limit reached for your subscription plan",
        limit: assetLimit,
        current: currentAssetCount
      });
    }

    if (validAssets.length > availableSlots) {
      // Trim upload to allowed size
      validAssets = validAssets.slice(0, availableSlots);
    }
  }

  // ---------- INSERT ----------
  if (validAssets.length > 0) {
    const insertedDocs = await Asset.insertMany(validAssets);
    console.log("Inserted docs count:", insertedDocs.length);

    const totalCount = await Asset.countDocuments({ organizationId });
    console.log("Total docs in org:", totalCount);
  }
      // ---------- NOTIFICATION ----------
      await sendNotification({
        req,
        userId,
        title: "Bulk Upload Completed",
        message: `${validAssets.length} assets uploaded successfully.`,
        redirectUrl: "/inventory",
        type: "success",
      });

      return res.status(200).json({
        success: true,
        inserted: validAssets.length,
        skipped: invalidRows.length,
        invalidRows,
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
      const inUse = 0;

      if (inUse > assetQuantity) {
        return res.status(400).json({
          message: "In-use quantity cannot exceed total quantity",
        });
      }

const amount = Number(req.body.assetCost?.amount);
const currency = req.body.assetCost?.currency?.toUpperCase();

if (!amount || amount <= 0 || !currency) {
  return res.status(400).json({
    message: "Valid asset cost (amount + currency) required",
  });
}

  const totalAmount = Number(req.body.assetCost.amount);

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

  if (totalAmount <= 0) {
    return res.status(400).json({ message: "Invalid total amount" });
  }
  const unitAmount = totalAmount / assetQuantity;
  const baseTotalAmount = convertToBase(totalAmount, currency);
const parsedDOP = req.body.purchaseDetails?.purchaseDate
  ? new Date(req.body.purchaseDetails.purchaseDate)
  : null;

if (!parsedDOP || isNaN(parsedDOP.getTime())) {
  return res.status(400).json({
    message: "Valid purchase date is required"
  });
}
  const parsedDOE = req.body.DOE ? parseDate(req.body.DOE) : null;
  const vendor = buildVendor(req.body.vendor);
  const maintenance = buildMaintenance(req.body.maintenance);
  const tracking = buildTracking(req.body.tracking);

  const insurance = buildInsurance(req.body.insurance);
  const warranty = buildWarranty(req.body.warranty, {}, parsedDOP);

  const financialTracking = buildFinancialTracking(
    type,
    { totalAmount: amount },
    maintenance,
    warranty,
    insurance
  );

  const newAsset = new Asset({
    ...req.body,

    purchaseDetails: {
    purchaseDate: parsedDOP,
    vendor
  },
    DOE: parsedDOE,
    modelNo: req.body.modelNo,
    organizationId,
    createdBy: userId,
    type,
    assetCode,
    assetQuantity,
    inUse,
    maintenance,
    tracking,
    insurance,
    warranty,
    financialTracking,
    assetLifetime: calculateAssetLifetime(parsedDOP, parsedDOE),
    assetCost: {
      totalAmount: amount,
      unitAmount,
      baseTotalAmount,
      currency
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
  const updateAsset = async (req, res ,next) => {
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
  let updatedCost = existingAsset.assetCost;
  if (req.body.assetCost) {
    const { totalAmount, currency } = req.body.assetCost;

    const parsedTotalAmount = Number(totalAmount);

    const finalCurrency = currency
      ? currency.toUpperCase()
      : existingAsset.assetCost.currency;

    const finalQuantity =
      req.body.assetQuantity ?? existingAsset.assetQuantity;

    if (parsedTotalAmount <= 0 || isNaN(parsedTotalAmount)) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    if (finalQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const unitAmount = parsedTotalAmount / finalQuantity;
    const baseTotalAmount = convertToBase(parsedTotalAmount, finalCurrency);

    updatedCost = {
      totalAmount: parsedTotalAmount,
      unitAmount,
      baseTotalAmount,
      currency: finalCurrency
    };
  }


      if (inUse > assetQuantity) {
        return res.status(400).json({
          message: "In-use quantity cannot exceed total quantity",
        });
      }
      if (req.body.type) {
        if (!["one_time", "maintenance"].includes(req.body.type)) {
          return res.status(400).json({
            message: "Invalid asset type. Allowed: one_time, maintenance",
          });
        }
      }
      let updatedInsurance = existingAsset.insurance;

  if (req.body.insurance) {
    updatedInsurance = buildInsurance(
      req.body.insurance,
      existingAsset.insurance
    );
  }
  let updatedWarranty = existingAsset.warranty;

  if (req.body.warranty) {
    updatedWarranty = buildWarranty(
      req.body.warranty,
      existingAsset.warranty,
      req.body.DOP ?? existingAsset.DOP
    );
  }
  if (req.body.DOP !== undefined) {
    req.body.DOP = parseDate(req.body.DOP);
  }

  if (req.body.DOE !== undefined) {
    req.body.DOE = parseDate(req.body.DOE);
  }
const purchaseDetails = {
  purchaseDate: req.body.purchaseDetails?.purchaseDate
    ? parseDate(req.body.purchaseDetails.purchaseDate)
    : existingAsset.purchaseDetails.purchaseDate,

  vendor: req.body.vendor
    ? buildVendor(req.body.vendor)
    : existingAsset.purchaseDetails.vendor
};
  const maintenance = req.body.maintenance
    ? buildMaintenance(req.body.maintenance)
    : existingAsset.maintenance;

  const tracking = req.body.tracking
    ? buildTracking(req.body.tracking)
    : existingAsset.tracking;

  const insurance = req.body.insurance
    ? buildInsurance(req.body.insurance, existingAsset.insurance)
    : existingAsset.insurance;

  const purchaseDate = purchaseDetails.purchaseDate;

  const warranty = req.body.warranty
  ? buildWarranty(req.body.warranty, existingAsset.warranty, purchaseDate)
  : existingAsset.warranty;
  const financialTracking = buildFinancialTracking(
    updatedCost,
    maintenance,
    warranty,
    insurance
  );
const updatedLifetime = calculateAssetLifetime(
  purchaseDate,
  req.body.DOE ?? existingAsset.DOE
);
  const updatedAsset = await Asset.findByIdAndUpdate(
    id,
    {
      ...req.body,
      assetCost: updatedCost,
      assetQuantity,
      inUse,

      purchaseDetails,
      maintenance,
      tracking,
      insurance,
      warranty,
      financialTracking,
      assetLifetime: updatedLifetime,
    },
    { new: true }
  );


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
  try {
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        message: "Organization context missing",
      });
    }

    const { type, search, instanceStatus } = req.query;

    // 🔍 Build base filter
    let filter = { organizationId };

    if (type) {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { assetName: { $regex: search, $options: "i" } },
        { assetCode: { $regex: search, $options: "i" } },
        { modelNo: { $regex: search, $options: "i" } }
      ];
    }

    // 1️⃣ Fetch assets
const assets = await Asset.find(filter)
  .populate("assetCategory", "name")
  .populate("assetStatus", "name")
  .populate("associateUnit", "name")
  .populate("locationName", "name")
  .lean();

    if (!assets.length) {
      return res.status(200).json([]);
    }

    const assetIds = assets.map(a => a._id);

    // 2️⃣ Fetch assignments
    const assignments = await AssetAssignment.find({
      organizationId,
      assetType: "hardware",
      status: "active",
      assetId: { $in: assetIds },
    })
      .populate("departmentId", "name")
      .populate("employeeId", "name employeeCode")
      .lean();

    // 3️⃣ Build assignment map
    const assignmentMap = {};

    for (const assign of assignments) {
      const assetId = String(assign.assetId);

      if (!assignmentMap[assetId]) {
        assignmentMap[assetId] = {
          inUse: 0,
          departmentMap: {},
          assignmentRecords: [],
        };
      }

      assignmentMap[assetId].inUse += assign.quantity;

      const deptId = String(assign.departmentId._id);

      if (!assignmentMap[assetId].departmentMap[deptId]) {
        assignmentMap[assetId].departmentMap[deptId] = {
          department: assign.departmentId,
          quantity: 0,
        };
      }

      assignmentMap[assetId].departmentMap[deptId].quantity += assign.quantity;

assignmentMap[assetId].assignmentRecords.push({
  _id: assign._id,

  assetInstanceId: assign.assetInstanceId,   // ✅ CRITICAL FIX

  employee: assign.employeeId,
  department: assign.departmentId,

  location: assign.location,                 // ✅ FIX NAME
  deviceInfo: assign.deviceInfo,             // ✅ ADD THIS

  quantity: assign.quantity,
  assignedAt: assign.assignedAt,
});
    }

    // Convert departmentMap → array
    Object.keys(assignmentMap).forEach(assetId => {
      assignmentMap[assetId].assignedDepartments = Object.values(
        assignmentMap[assetId].departmentMap
      );
      delete assignmentMap[assetId].departmentMap;
    });

    // 4️⃣ 🔥 Fetch INSTANCE COUNTS
// 4️⃣ 🔥 FETCH ALL INSTANCES (NOT COUNT)
const instances = await AssetInstance.find({
  organizationId,
  assetId: { $in: assetIds }
})
  .populate("location", "name")
  .lean();

// 5️⃣ GROUP INSTANCES BY ASSET
const instanceMap = {};

instances.forEach(inst => {
  const key = String(inst.assetId);

  if (!instanceMap[key]) {
    instanceMap[key] = [];
  }

  instanceMap[key].push(inst);
});
    // 5️⃣ Merge everything
let enrichedAssets = assets.map(asset => {
  const assignmentData = assignmentMap[String(asset._id)];
  const assetInstances = instanceMap[String(asset._id)] || [];

  return {
    ...asset,
    inUse: assignmentData?.inUse || 0,
    assignedDepartments: assignmentData?.assignedDepartments || [],
    assignmentRecords: assignmentData?.assignmentRecords || [],

    // 🔥 NEW
    instances: assetInstances,
    instanceCount: assetInstances.length
  };
});

    // 6️⃣ 🔥 INSTANCE FILTERING
    if (instanceStatus === "missing") {
      enrichedAssets = enrichedAssets.filter(asset =>
        asset.instanceCount < asset.assetQuantity
      );
    }

    if (instanceStatus === "complete") {
      enrichedAssets = enrichedAssets.filter(asset =>
        asset.instanceCount >= asset.assetQuantity
      );
    }

    return res.status(200).json(enrichedAssets);

  } catch (error) {
    console.error("🔥 GET ASSETS ERROR:", error);
    return next(error);
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
const createAssetInstance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const { assetId, instances } = req.body;

    if (!instances || instances.length === 0) {
      return res.status(400).json({ message: "No instances provided" });
    }

    let asset = await Asset.findById(assetId);

let assetTypeRef = "Asset";

if (!asset) {
  asset = await SoftwareAsset.findById(assetId);
  assetTypeRef = "SoftwareAsset";
}

if (!asset) {
  return res.status(404).json({ message: "Asset not found" });
}

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
    const serials = instances.map(i => i.serialNumber).filter(Boolean);

    const serialSet = new Set();
    for (const s of serials) {
      if (serialSet.has(s)) {
        return res.status(400).json({
          message: "Duplicate serials in request"
        });
      }
      serialSet.add(s);
    }

    const existingSerials = await AssetInstance.find({
      organizationId,
      uniqueIdentifier: { $in: serials }
    });

    if (existingSerials.length > 0) {
      return res.status(400).json({
        message: "Serial already exists"
      });
    }
    // 🔥 LOCATION VALIDATION (STRING)
for (const inst of instances) {
  if (!inst.location || !inst.location.trim()) {
    return res.status(400).json({
      message: "Location is required"
    });
  }
}
    // 🔥 CREATE INSTANCES
    const newInstances = instances.map((inst, index) => {
      const today = new Date().setHours(0,0,0,0);
      const expiry = inst.warranty?.expiryDate
        ? new Date(inst.warranty.expiryDate).setHours(0,0,0,0)
        : null;

      return {
        organizationId,
        assetId,

        assetTypeRef,

        assetType:
          assetTypeRef === "SoftwareAsset"
            ? "software"
            : "hardware",

        instanceCode: `${asset.assetCode}-${Date.now()}-${index}`,

        uniqueIdentifier: inst.serialNumber || undefined,
        status: "in_stock",
        condition: inst.condition || "new",
        location: inst.location,

hardwareDetails:
  assetTypeRef === "Asset"
    ? {
        modelNo: inst.hardwareDetails?.modelNo || "",
        specifications: inst.hardwareDetails?.specifications || ""
      }
    : undefined,

        warranty: inst.warranty?.expiryDate
          ? {
              expiryDate: inst.warranty.expiryDate,
              status: expiry < today ? "expired" : "active"
            }
          : undefined,

        insurance: inst.insurance
          ? {
              policyId: inst.insurance.policyId || "",
              expiryDate: inst.insurance.expiryDate || null
            }
          : undefined,

        costTracking: {
          maintenanceCost: Number(inst.costTracking?.maintenanceCost) || 0,
          warrantyRenewalCost: Number(inst.costTracking?.warrantyRenewalCost) || 0,
          insuranceCost: Number(inst.costTracking?.insuranceCost) || 0
        },

        installationDate: inst.installationDate || null,

softwareDetails:
  assetTypeRef === "SoftwareAsset"
    ? {
        licenseKey: inst.softwareDetails?.licenseKey || "",
        licenseNumber: inst.softwareDetails?.licenseNumber || "",
        vendor: inst.softwareDetails?.vendor || "",

        purchaseDate: inst.softwareDetails?.purchaseDate || null,
        renewalDate: inst.softwareDetails?.renewalDate || null,
        lastUsedDate: inst.softwareDetails?.lastUsedDate || null,

        assignedTo: {
          employeeId: inst.softwareDetails?.assignedTo?.employeeId || null,
          deviceName: inst.softwareDetails?.assignedTo?.deviceName || "",
          departmentId: inst.softwareDetails?.assignedTo?.departmentId || null
        }
      }
    : undefined,

       lifecycle: [
  {
    action: "CREATED",

    from: null,

    to: null,

    snapshot: {
      location: inst.location,

      assignedTo: null,

      warrantyExpiry: inst.warranty?.expiryDate || null,
      insuranceExpiry: inst.insurance?.expiryDate || null,

      condition: inst.condition || "new",

      costTracking: {
        maintenanceCost: Number(inst.costTracking?.maintenanceCost) || 0,
        warrantyRenewalCost:
          Number(inst.costTracking?.warrantyRenewalCost) || 0,
        insuranceCost:
          Number(inst.costTracking?.insuranceCost) || 0
      }
    },

    date: new Date(),

    notes: "Instance created"
  }
],
        createdBy: userId
      };
    });

    const saved = await AssetInstance.insertMany(newInstances);

    return res.status(201).json(saved);

  } catch (err) {
  console.error("ERROR:", err.response?.data || err.message);
    return next(err);
  }
};

  module.exports = {
    addAsset,
    updateAsset,
    deleteAsset,
    getAllAssets,
    bulkUpload,
    createAssetInstance,
    getAssetById
  };
