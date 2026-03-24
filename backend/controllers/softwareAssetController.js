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
    /* --------------------------------------------------
   FETCH SUBSCRIPTION LIMIT
-------------------------------------------------- */

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

const softwareLimit = tier.assets; // or tier.softwareAssets if you separate them
    if (!userId || !organizationId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { assets, mode = "strict" } = req.body;
    const parsedAssets = Array.isArray(assets)
      ? assets
      : JSON.parse(assets || "[]");

    if (!parsedAssets.length) {
      return res.status(400).json({
        success: false,
        message: "No assets provided"
      });
    }

    /* --------------------------------------------------
       Utilities
    -------------------------------------------------- */

    const normalize = (v) =>
      v?.toString().trim().toLowerCase();

const validateSoftwareType = (type) => {
  const t = type?.toString().trim().toLowerCase();

  if (!["monthly", "yearly", "one_time"].includes(t)) {
    throw new Error(
      "Invalid or missing software type (monthly | yearly | one_time)"
    );
  }

  return t;
};

    /* --------------------------------------------------
       Preload Reference Data (Single DB Hit)
    -------------------------------------------------- */

    const [categories, units, locations, statuses] =
      await Promise.all([
        Category.find({ organizationId }).lean(),
        Unit.find({ organizationId }).lean(),
        Location.find({ organizationId }).lean(),
        Status.find({ organizationId }).lean()
      ]);

    const categoryMap = new Map(
      categories.map((c) => [normalize(c.name), c._id])
    );

    const unitMap = new Map(
      units.map((u) => [normalize(u.name), u._id])
    );

    const locationMap = new Map(
      locations.map((l) => [normalize(l.name), l._id])
    );

    const statusMap = new Map(
      statuses.map((s) => [normalize(s.name), s._id])
    );

    /* --------------------------------------------------
       Safe Reference Upsert (No Duplicate Crash)
    -------------------------------------------------- */

    const upsertReference = async (Model, name, map) => {
      if (!name) return null;

      const key = normalize(name);
      if (map.has(key)) return map.get(key);

      const doc = await Model.findOneAndUpdate(
        { name: new RegExp(`^${name}$`, "i"), organizationId },
        {
          $setOnInsert: {
            name,
            organizationId,
            isActive: true
          }
        },
        { upsert: true, new: true }
      );

      map.set(key, doc._id);
      return doc._id;
    };

    /* --------------------------------------------------
       Processing Loop
    -------------------------------------------------- */
    /* --------------------------------------------------
   Generate Starting Asset Code (Bulk Safe)
-------------------------------------------------- */

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
    let validAssets = [];
    let invalidRows = [];

    for (const [index, asset] of parsedAssets.entries()) {
      try {
        /* ----------------------------
           1. Field Mapping (Excel → DB)
        ---------------------------- */

        const softwareType = validateSoftwareType(asset.type);

        const categoryName = asset.Category;
        const unitName = asset.Unit;
        const locationName = asset.locationName;
        const statusName = asset.Status;

        let categoryId = categoryMap.get(normalize(categoryName));
        let unitId = unitMap.get(normalize(unitName));
        let locationId = locationMap.get(normalize(locationName));
        let statusId = statusMap.get(normalize(statusName));

        if (mode === "strict" &&
          (!categoryId || !unitId || !locationId || !statusId)
        ) {
          throw new Error("Missing reference data");
        }

        if (!categoryId)
          categoryId = await upsertReference(
            Category,
            categoryName,
            categoryMap
          );

        if (!unitId)
          unitId = await upsertReference(
            Unit,
            unitName,
            unitMap
          );

        if (!locationId)
          locationId = await upsertReference(
            Location,
            locationName,
            locationMap
          );

        if (!statusId)
          statusId = await upsertReference(
            Status,
            statusName,
            statusMap
          );

        /* ----------------------------
           2. Quantity & Cost Validation
        ---------------------------- */

        const quantity = Number(asset.assetQuantity || 1);
        if (quantity <= 0)
          throw new Error("Invalid license quantity");

        const totalAmount = Number(asset.assetCost || 0);
        if (totalAmount < 0)
          throw new Error("Invalid total cost");

        const currency =
          (asset.assetCurrency || BASE_CURRENCY).toUpperCase();

        const unitAmount = totalAmount / quantity;

        /* ----------------------------
           3. Date Handling
        ---------------------------- */

        const purchaseDate = parseDate(asset.DateOfPurchase);
        const expiryDate = parseDate(asset.DateOfExpiry);

        const cycles = calculateCycles(softwareType, purchaseDate, expiryDate);

        const overallTotal = totalAmount * cycles;
        const overallUnitAmount = overallTotal / quantity;

        const baseTotalAmount = convertToBase(
          totalAmount,
          currency
        );

        const baseOverallTotal = convertToBase(
          overallTotal,
          currency
        );

        /* ----------------------------
           4. Build Asset
        ---------------------------- */

        validAssets.push({
          organizationId,
          assetCode: `SW-${nextNumber++}`,

          type: softwareType,
          assetName: asset.SoftwareName,

          assetCategory: categoryId,
          associateUnit: unitId,
          locationName: locationId,
          assetStatus: statusId,

          tracking: {
  licenseTrackingId: asset.licenseKey
},
          licenseType: asset.licenseType,
          licenseModel: asset.licenseModel,
          licenseMetric: asset.licenseMetric,
          licenseUse: asset.licenseUse,
          locationAddress: asset.locationAddress?.trim(),
purchaseDetails: {
  purchaseDate,
  vendor: {
    name: asset.vendorName || "",
    contact: asset.vendorContact || "",
    supportEmail: asset.vendorEmail || ""
  }
},

renewal: {
  expiryDate,
  renewalTerm: asset.renewalTerm,
  nextRenewalDate: expiryDate,
  renewalCost: {
    totalAmount,
    unitAmount,
    baseTotalAmount,
    currency
  }
},
          assetLifetime: purchaseDate && expiryDate
  ? `${Math.ceil((expiryDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365))} years`
  : null,

          assetQuantity: quantity,
          inUse: 0,
          licensesAssigned: 0,

          assetCost: {
            totalAmount,
            unitAmount,
            baseTotalAmount,
            currency
          },

financialTracking: {
  monthlyCost: type === "monthly" ? totalAmount : 0,
  yearlyCost: type === "yearly" ? totalAmount : 0,
  totalCost: overallTotal,
},

          auditHistory: [
            {
              date: new Date(),
              notes: `Bulk uploaded by user ${userId}`
            }
          ],

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

    /* --------------------------------------------------
       Bulk Insert (Ordered False = Continue On Error)
    -------------------------------------------------- */

/* --------------------------------------------------
   PLAN LIMIT CHECK
-------------------------------------------------- */

const currentSoftwareCount = await SoftwareAsset.countDocuments({
  organizationId
});

if (softwareLimit !== "unlimited") {

  const availableSlots = softwareLimit - currentSoftwareCount;

  if (availableSlots <= 0) {
    return res.status(403).json({
      success: false,
      code: "SOFTWARE_LIMIT_REACHED",
      message: "Software asset limit reached for your subscription plan",
      limit: softwareLimit,
      current: currentSoftwareCount
    });
  }

  if (validAssets.length > availableSlots) {
    validAssets = validAssets.slice(0, availableSlots);
  }
}

/* --------------------------------------------------
   BULK INSERT
-------------------------------------------------- */

let insertedCount = 0;

if (validAssets.length) {
  const result = await SoftwareAsset.insertMany(validAssets, {
    ordered: true,
    runValidators: true
  });
await Promise.all(
  result.map(asset =>
    generateInstances({
      asset,
      quantity: asset.assetQuantity,
      assetType: "software",
      userId
    })
  )
);

  insertedCount = result.length;
}

    /* --------------------------------------------------
       Response
    -------------------------------------------------- */

    return res.json({
      success: true,
      inserted: insertedCount,
      skipped: invalidRows.length,
      invalidRows
    });

  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ======================================================
   CREATE SOFTWARE ASSET
====================================================== */
const createSoftwareAsset = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user;
    // 🔒 SUBSCRIPTION LIMIT CHECK
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

const currentSoftwareCount = await SoftwareAsset.countDocuments({
  organizationId
});

const softwareLimit = tier.assets; // or tier.softwareAssets if you split them

if (softwareLimit !== "unlimited" && currentSoftwareCount >= softwareLimit) {
  return res.status(403).json({
    success: false,
    code: "SOFTWARE_LIMIT_REACHED",
    message: "Software asset limit reached for your subscription plan",
    limit: softwareLimit,
    current: currentSoftwareCount
  });
}
    if (!req.body.assetCost?.amount || !req.body.assetCost?.currency) {
      return res.status(400).json({
        success: false,
        message: "Asset cost amount and currency are required"
      });
    }

const quantity = Number(req.body.assetQuantity || 1);
if (quantity <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid license quantity"
  });
}

const totalAmount = Number(req.body.assetCost.amount);
const currency = req.body.assetCost.currency.toUpperCase();

if (totalAmount < 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid total cost"
  });
}

const { type} = req.body;

if (!["monthly", "yearly", "one_time"].includes(type)) {
  return res.status(400).json({
    success: false,
    message: "Invalid software type"
  });
}

const purchaseDate = parseDate(req.body.purchaseDate);
const expiryDate = parseDate(req.body.expiryDate);

if (type !== "one_time" && (!purchaseDate || !expiryDate)) {
  return res.status(400).json({
    success: false,
    message: "Purchase date and expiry date required for recurring software"
  });
}

const cycles = calculateCycles(type, purchaseDate, expiryDate);

const overallTotal = totalAmount * cycles;
const overallUnitAmount = overallTotal / quantity;

const baseTotalAmount = convertToBase(totalAmount, currency);
const baseOverallTotal = convertToBase(overallTotal, currency);


    const asset = await SoftwareAsset.create({
      ...req.body,
purchaseDetails: {
  purchaseDate,
  vendor: {
    name: req.body.vendorName || "",
    contact: req.body.vendorContact || "",
    supportEmail: req.body.vendorEmail || ""
  }
},
renewal: {
  expiryDate,
  renewalTerm: req.body.renewalTerm,
  nextRenewalDate: expiryDate,
},
      organizationId,
      type,
      assetCode: await generateSoftwareCode(organizationId),
assetCost: {
  totalAmount,
  unitAmount: totalAmount / quantity,
  baseTotalAmount,
  currency
},
financialTracking: {
  monthlyCost: type === "monthly" ? totalAmount : 0,
  yearlyCost: type === "yearly" ? totalAmount : 0,
  totalCost: overallTotal,
},

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

    if (!organizationId) {
      return res.status(403).json({
        success: false,
        message: "Organization context missing"
      });
    }

    // 1️⃣ Fetch software assets
    const assets = await SoftwareAsset.find({ organizationId })
      .sort({ createdAt: -1 })
      .lean();

    if (!assets.length) {
      return res.json({ success: true, data: [] });
    }

    const assetIds = assets.map(a => a._id);

    // 2️⃣ Fetch active software assignments
    const assignments = await AssetAssignment.find({
      organizationId,
      assetType: "software",
      status: "active",
      assetId: { $in: assetIds }
    })
      .populate("departmentId", "name")
      .populate("employeeId", "name employeeCode email") // ✅ FIXED
      .lean();

    const assignmentMap = {};

    for (const assign of assignments) {
      const assetId = String(assign.assetId);

      if (!assignmentMap[assetId]) {
        assignmentMap[assetId] = {
          inUse: 0,
          departmentMap: {},
          assignmentRecords: []
        };
      }

      // 🔹 Total in use
      assignmentMap[assetId].inUse += assign.quantity;

      // 🔹 Department aggregation
      if (assign.departmentId) {
        const deptId = String(assign.departmentId._id);

        if (!assignmentMap[assetId].departmentMap[deptId]) {
          assignmentMap[assetId].departmentMap[deptId] = {
            department: assign.departmentId,
            quantity: 0
          };
        }

        assignmentMap[assetId].departmentMap[deptId].quantity += assign.quantity;
      }

      // 🔥 Full assignment record (for modal)
      assignmentMap[assetId].assignmentRecords.push({
        _id: assign._id,
        employee: assign.employeeId, // ✅ FIXED
        department: assign.departmentId,
        assignLocation: assign.assignLocation,
        quantity: assign.quantity,
        assignedAt: assign.assignedAt
      });
    }

    // Convert departmentMap → assignedDepartments
    Object.keys(assignmentMap).forEach(assetId => {
      assignmentMap[assetId].assignedDepartments = Object.values(
        assignmentMap[assetId].departmentMap
      );
      delete assignmentMap[assetId].departmentMap;
    });

    // 3️⃣ Merge assignment data into assets
    const enrichedAssets = assets.map(asset => {
      const assignmentData = assignmentMap[String(asset._id)];

      return {
        ...asset,
        inUse: assignmentData?.inUse || 0,
        assignedDepartments: assignmentData?.assignedDepartments || [],
        assignmentRecords: assignmentData?.assignmentRecords || []
      };
    });

    res.json({
      success: true,
      data: enrichedAssets
    });

  } catch (error) {
    console.error("GET SOFTWARE ASSETS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    // ✅ Extract assetCost safely
    const costInput = req.body.assetCost;
    delete req.body.assetCost;

    // ✅ Validate type if provided
    if (req.body.type) {
      if (!["monthly", "yearly", "one_time"].includes(req.body.type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid software type. Allowed: monthly, yearly, one_time"
        });
      }
    }
if (req.body.purchaseDate) {
  asset.purchaseDetails.purchaseDate = parseDate(req.body.purchaseDate);
}

if (req.body.expiryDate) {
  asset.renewal.expiryDate = parseDate(req.body.expiryDate);
}
    // ✅ Assign normal fields FIRST (safe fields only)
    Object.assign(asset, req.body);
    const oldQty = asset.assetQuantity;
const newQty = req.body.assetQuantity ?? oldQty;

if (newQty > oldQty) {
  await generateInstances({
    asset,
    quantity: newQty - oldQty,
    assetType: "software",
    userId
  });
}

if (newQty < oldQty) {
  await AssetInstance.deleteMany({
    assetId: asset._id,
    status: "in_stock"
  }).limit(oldQty - newQty);
}
    // ✅ Handle asset cost AFTER assign (so it can't be overwritten)
    if (costInput) {
      const quantity = Number(
        req.body.assetQuantity ?? asset.assetQuantity ?? 1
      );

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid license quantity"
        });
      }
      
      const totalAmount = Number(costInput.totalAmount);
      const currency = costInput.currency.toUpperCase();

      if (totalAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid total cost"
        });
      }

      asset.assetCost = {
        totalAmount,
        unitAmount: totalAmount / quantity,
        baseTotalAmount: convertToBase(totalAmount, currency),
        currency
      };
    }
let cycles = 1;

if (asset.type !== "one_time") {
  const purchaseDate = asset.purchaseDetails?.purchaseDate;
  const expiryDate = asset.renewal?.expiryDate;

  if (!purchaseDate || !expiryDate) {
    throw new Error("Purchase date and expiry date required");
  }

  cycles = calculateCycles(asset.type, purchaseDate, expiryDate);
}

const overallTotal = asset.assetCost.totalAmount * cycles;
const overallUnitAmount = overallTotal / asset.assetQuantity;

asset.financialTracking.totalCost =
  asset.assetCost.totalAmount * cycles;

    // ✅ Audit history safe guard
    if (!Array.isArray(asset.auditHistory)) {
      asset.auditHistory = [];
    }

    asset.auditHistory.push({
      userId,
      action: "UPDATE",
      notes: "Asset updated"
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
const toDelete = await AssetInstance.find({
  assetId: asset._id,
  status: "in_stock"
}).limit(oldQty - newQty);

const ids = toDelete.map(i => i._id);

await AssetInstance.deleteMany({ _id: { $in: ids } });
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
