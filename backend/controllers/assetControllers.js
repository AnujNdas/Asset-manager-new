const Asset = require("../models/Asset");
const LastAssetCode = require("../models/LastAssetCode");
const AssetAssignment = require("../models/AssetAssignment");
// const unzipper = require("unzipper");
const sendNotification = require("../utils/notify");
const { convertToBase, BASE_CURRENCY } = require("../utils/currency");


const Category = require("../models/Category");
const Unit = require("../models/Unit");
const Location = require("../models/Location");
const Status = require("../models/Status");
const buildInsurance = (incoming, existing = {}) => {
  if (!incoming) return existing;

  const insurance = {
    insuranceId: incoming.insuranceId ?? existing.insuranceId,
    insuranceName: incoming.insuranceName ?? existing.insuranceName,
    purchaseDate: incoming.purchaseDate
      ? new Date(incoming.purchaseDate)
      : existing.purchaseDate,
    expiryDate: incoming.expiryDate
      ? new Date(incoming.expiryDate)
      : existing.expiryDate,
  };

  if (
    insurance.purchaseDate &&
    insurance.expiryDate &&
    insurance.expiryDate < insurance.purchaseDate
  ) {
    throw new Error("Insurance expiry cannot be before purchase date");
  }

  return insurance;
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

    let validAssets = [];
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

        // ---------- VALIDATIONS ----------
        const totalQty = Number(asset.assetQuantity || 1);
        if (totalQty < 0) {
          invalidRows.push({
            row: index + 2,
            reason: "Invalid asset quantity",
            asset,
          });
          continue;
        }

        const totalAmount = Number(asset.assetCost || 0);


if (totalAmount < 0) {
  invalidRows.push({
    row: index + 2,
    reason: "Invalid total cost",
    asset,
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

        // ---------- FINAL ASSET ----------
        validAssets.push({
          organizationId,
          assetCode: await generateHardwareCode(),
          type: assetType, // ✅ ADD THIS
          assetCategory: categoryId,
          barcodeNumber: asset.barcodeNumber,
          assetName: asset.assetName,
          associateUnit: unitId,

          locationName: locationId,
          locationAddress: asset.locationAddress,

          assetSpecification: asset.assetSpecification,
          assetStatus: statusId,

          DOP: asset.DOP,
          DOE: asset.DOE,
          assetLifetime: asset.assetLifetime,
          purchaseFrom: asset.purchaseFrom,

          assetCost: {
            totalAmount,
            unitAmount,
            baseTotalAmount,
            currency,
          },

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

    // ---------- INSERT ----------
    if (validAssets.length > 0) {
      await Asset.insertMany(validAssets, { ordered: false });
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
    const { type } = req.body;

    if (!["one_time", "maintenance"].includes(type)) {
      return res.status(400).json({
        message: "Invalid asset type. Allowed: one_time, maintenance",
      });
    }

    const assetQuantity = Number(req.body.assetQuantity || 1);
    const inUse = Number(req.body.inUse || 0);

    if (inUse > assetQuantity) {
      return res.status(400).json({
        message: "In-use quantity cannot exceed total quantity",
      });
    }

    // 🔒 Validate cost
    if (!req.body.assetCost?.amount || !req.body.assetCost?.currency) {
      return res.status(400).json({
        message: "Asset cost amount and currency are required",
      });
    }

const totalAmount = Number(req.body.assetCost.amount);
const currency = req.body.assetCost.currency.toUpperCase();

if (assetQuantity <= 0) {
  return res.status(400).json({ message: "Invalid quantity" });
}


    // 🔑 Backend controlled code
    const assetCode = req.body.assetCode || await generateHardwareCode();

if (totalAmount <= 0) {
  return res.status(400).json({ message: "Invalid total amount" });
}

const unitAmount = totalAmount / assetQuantity;
const baseTotalAmount = convertToBase(totalAmount, currency);

const newAsset = new Asset({
  ...req.body,

  organizationId,
  createdBy: userId,
  type,
  assetCode,
  assetQuantity,
  inUse,
  insurance: buildInsurance(req.body.insurance),

  assetCost: {
    totalAmount,
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

const updatedAsset = await Asset.findByIdAndUpdate(
  id,
  {
    ...req.body,
    assetCode: existingAsset.assetCode,
    barcodeNumber: existingAsset.barcodeNumber,
    assetCost: updatedCost,
    assetQuantity,
    inUse,
    insurance: updatedInsurance
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

    const deletedAsset = await Asset.findByIdAndDelete(id);
    if (!deletedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

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

    // 1️⃣ Fetch only this organization's assets
    const assets = await Asset.find({ organizationId }).lean();

    if (!assets.length) {
      return res.status(200).json([]);
    }

    const assetIds = assets.map(a => a._id);

    // 2️⃣ Fetch only assignments for this organization & these assets
    const assignments = await AssetAssignment.find({
      organizationId,
      assetType: "hardware",
      status: "active",
      assetId: { $in: assetIds },
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
    const enrichedAssets = assets.map(asset => {
      const assignmentData = assignmentMap[String(asset._id)];

      return {
        ...asset,
        inUse: assignmentData?.inUse || 0,
        assignedDepartments: assignmentData?.assignedDepartments || [],
      };
    });

    return res.status(200).json(enrichedAssets);
  } catch (error) {
    console.error("🔥 GET ASSETS ERROR:", error);
    return next(error);
  }
};






// =======================================================================
// GENERATE ASSET CODE
// =======================================================================
const generateHardwareCode = async () => {
  const lastAsset = await Asset
    .findOne({ assetCode: { $regex: /^AST-\d+$/ } })
    .sort({ createdAt: -1 })
    .select("assetCode")
    .lean();

  let next = 1;

  if (lastAsset?.assetCode) {
    next = parseInt(lastAsset.assetCode.split("-")[1], 10) + 1;
  }

  return `AST-${String(next).padStart(3, "0")}`;
};




module.exports = {
  addAsset,
  updateAsset,
  deleteAsset,
  getAllAssets,
  bulkUpload,
};
