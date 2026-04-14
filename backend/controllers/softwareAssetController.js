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
const bulkUploadSoftware = async (req, res) => {
  try {
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
        message: "Invalid subscription tier"
      });
    }

    const softwareLimit = tier.assets;

    /* =============================
       📦 INPUT PARSE
    ============================== */
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

    /* =============================
       🔧 HELPERS
    ============================== */
    const normalize = v => v?.toString().trim().toLowerCase();

    const validateType = (type) => {
      const t = normalize(type);
      if (!["monthly", "yearly", "one_time"].includes(t)) {
        throw new Error("Invalid software type");
      }
      return t;
    };

    /* =============================
       🔎 FETCH REFERENCES
    ============================== */
    const [categories, units, locations, statuses] = await Promise.all([
      Category.find({ organizationId }).lean(),
      Unit.find({ organizationId }).lean(),
      Location.find({ organizationId }).lean(),
      Status.find({ organizationId }).lean()
    ]);

    const categoryMap = new Map(categories.map(c => [normalize(c.name), c._id]));
    const unitMap = new Map(units.map(u => [normalize(u.name), u._id]));
    const locationMap = new Map(locations.map(l => [normalize(l.name), l._id]));
    const statusMap = new Map(statuses.map(s => [normalize(s.name), s._id]));

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

    /* =============================
       🆔 CODE GENERATION
    ============================== */
    const last = await SoftwareAsset.findOne({
      organizationId,
      assetCode: { $regex: /^SW-\d+$/ }
    }).sort({ createdAt: -1 });

    let nextCode = last
      ? parseInt(last.assetCode.split("-")[1]) + 1
      : 1;

    let validAssets = [];
    let invalidRows = [];

    /* =============================
       🔁 PROCESS LOOP
    ============================== */
    for (const [index, asset] of parsedAssets.entries()) {
      try {
        const row = index + 2;

        const type = validateType(asset.type);

        let categoryId = categoryMap.get(normalize(asset.Category));
        let unitId = unitMap.get(normalize(asset.Unit));
        let locationId = locationMap.get(normalize(asset.locationName));
        let statusId = statusMap.get(normalize(asset.Status));

        if (
          mode === "strict" &&
          (!categoryId || !unitId || !locationId || !statusId)
        ) {
          throw new Error("Missing reference data");
        }

        if (!categoryId) categoryId = await upsert(Category, asset.Category, categoryMap);
        if (!unitId) unitId = await upsert(Unit, asset.Unit, unitMap);
        if (!locationId) locationId = await upsert(Location, asset.locationName, locationMap);
        if (!statusId) statusId = await upsert(Status, asset.Status, statusMap);

        /* ---------- VALIDATION ---------- */
        const quantity = Number(asset.assetQuantity || 1);
        if (quantity <= 0) throw new Error("Invalid quantity");

        const purchaseDate = parseDate(asset.DateOfPurchase);
        const expiryDate = parseDate(asset.DateOfExpiry);

        if (!purchaseDate) throw new Error("Invalid purchase date");

        /* ---------- VENDOR ---------- */
        const vendor = {
          name: asset.vendorName || "",
          contact: asset.vendorContact || "",
          supportEmail: asset.vendorEmail || ""
        };

        /* =============================
           🧱 FINAL ASSET (CLEAN)
        ============================== */
        validAssets.push({
          organizationId,
          assetCode: `SW-${nextCode++}`,

          assetName: asset.SoftwareName,
          type,

          assetCategory: categoryId,
          associateUnit: unitId,
          locationName: locationId,
          assetStatus: statusId,

          purchaseDetails: {
            purchaseDate,
            vendor
          },

          DOE: expiryDate || null,

          assetQuantity: quantity,
          inUse: 0,

          // 🔥 IMPORTANT: NO INSTANCE DATA HERE
          financialTracking: {
            totalAssetCost: 0,
            monthlyCost: type === "monthly" ? 0 : 0,
            yearlyCost: type === "yearly" ? 0 : 0
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
       🚫 PLAN LIMIT CHECK
    ============================== */
    const currentCount = await SoftwareAsset.countDocuments({ organizationId });

    if (softwareLimit !== "unlimited") {
      const available = softwareLimit - currentCount;

      if (available <= 0) {
        return res.status(403).json({
          success: false,
          message: "Software asset limit reached"
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

    if (validAssets.length) {
      const result = await SoftwareAsset.insertMany(validAssets);
      insertedCount = result.length;
    }

    /* =============================
       ✅ RESPONSE
    ============================== */
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

    // 🔒 Subscription check (keep as is)

    const quantity = Number(req.body.assetQuantity || 1);

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid license quantity"
      });
    }

    const { type } = req.body;

    if (!["monthly", "yearly", "one_time"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid software type"
      });
    }

const purchaseDate = parseDate(req.body.purchaseDetails?.purchaseDate);
const expiryDate = parseDate(req.body.DOE);

    const category = await Category.findOne({
      _id: req.body.assetCategory,
      organizationId,
      isActive: true,
    });

    if (!category || category.categoryType !== "software") {
      return res.status(400).json({
        message: "Invalid software category",
      });
    }
const { assetStatus, ...cleanBody } = req.body;

const asset = await SoftwareAsset.create({
  ...cleanBody,

  purchaseDetails: {
    purchaseDate,
    vendor: {
      name: req.body.purchaseDetails?.vendor?.name || "",
      contact: req.body.purchaseDetails?.vendor?.contact || "",
      supportEmail: req.body.purchaseDetails?.vendor?.supportEmail || ""
    }
  },

  renewal: {
    renewalTerm: req.body.renewalTerm,
    nextRenewalDate: expiryDate,
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
    { date: new Date(), notes: `Created by user ${userId}` }
  ]
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

    /* ================= 1️⃣ FETCH SOFTWARE ASSETS ================= */
    const assets = await SoftwareAsset.find({ organizationId })
      .sort({ createdAt: -1 })
      .lean();

    if (!assets.length) {
      return res.json({ success: true, data: [] });
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

      // ✅ FIXED: instance-based counting
      assignmentMap[id].inUse += 1;

      if (assign.departmentId) {
        const deptId = String(assign.departmentId._id);

        if (!assignmentMap[id].departmentMap[deptId]) {
          assignmentMap[id].departmentMap[deptId] = {
            department: assign.departmentId,
            quantity: 0
          };
        }

        // ✅ FIXED
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

    // convert departmentMap → array
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

      // ✅ OPTIONAL NORMALIZATION (VERY USEFUL)
      instanceMap[id].push({
        ...inst,
        licenseKey: inst.software?.licenseKey || "",
        licenseNumber: inst.software?.licenseNumber || "",
        purchaseCost: inst.software?.purchaseCost?.amount || 0
      });
    });

    /* ================= 4️⃣ MERGE ================= */
    const enrichedAssets = assets.map(asset => {
      const id = String(asset._id);

      const assignmentData = assignmentMap[id] || {};
      const assetInstances = instanceMap[id] || [];

      return {
        ...asset,

        // usage
        inUse: assignmentData.inUse || 0,

        // department summary
        assignedDepartments:
          assignmentData.assignedDepartments || [],

        // detailed records
        assignmentRecords:
          assignmentData.assignmentRecords || [],

        // instances
        instances: assetInstances,
        instanceCount: assetInstances.length
      };
    });

    /* ================= 5️⃣ RESPONSE ================= */
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
    const { id } = req.params;

    const asset = await SoftwareAsset.findOne({
      _id: id,
      organizationId,
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    /* ================= CATEGORY VALIDATION ================= */
    if (req.body.assetCategory) {
      const category = await Category.findOne({
        _id: req.body.assetCategory,
        organizationId,
        isActive: true,
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }

      if (category.categoryType !== "software") {
        return res.status(400).json({
          success: false,
          message: "Category must belong to software",
        });
      }
    }

    /* ================= TYPE VALIDATION ================= */
    if (req.body.type) {
      if (!["monthly", "yearly", "one_time"].includes(req.body.type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid software type",
        });
      }
    }

    /* ================= QUANTITY HANDLING ================= */
    const oldQty = asset.assetQuantity;
    const newQty = req.body.assetQuantity ?? oldQty;

    if (newQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
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
        status: "in_stock",
      }).limit(oldQty - newQty);

      const ids = removable.map((i) => i._id);

      await AssetInstance.deleteMany({ _id: { $in: ids } });
    }

    asset.assetQuantity = newQty;

    /* ================= PURCHASE DETAILS ================= */
    if (req.body.purchaseDetails?.purchaseDate) {
      asset.purchaseDetails.purchaseDate = parseDate(
        req.body.purchaseDetails.purchaseDate
      );
    }

    if (req.body.purchaseDetails?.vendor) {
      asset.purchaseDetails.vendor = buildVendor(
        req.body.purchaseDetails.vendor
      );
    }

    /* ================= RENEWAL METADATA ================= */
    if (req.body.renewal?.expiryDate) {
      asset.renewal.expiryDate = parseDate(
        req.body.renewal.expiryDate
      );
    }

    if (req.body.renewal?.renewalTerm) {
      asset.renewal.renewalTerm = req.body.renewal.renewalTerm;
    }

    /* ================= SAFE FIELD UPDATE ================= */
    const allowedFields = [
      "assetName",
      "assetCategory",
      "associateUnit",
      "locationName",
      "assetStatus",
      "type",
      "DOE",
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

    return res.json({
      success: true,
      data: asset,
    });

  } catch (error) {
    console.error("🔥 UPDATE SOFTWARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
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
