const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");


const getInStockCategorySummary = async (req, res) => {
  try {
    /* ================= HARDWARE ================= */
    const hardware = await Asset.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "assetCategory",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryId: "$assetCategory",
          categoryName: { $ifNull: ["$category.name", "Unknown Category"] },
          isActive: { $ifNull: ["$category.isActive", false] },
          available: { $subtract: ["$assetQuantity", "$inUse"] },
        },
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$categoryName" },
          isActive: { $first: "$isActive" },
          hardwareCount: { $sum: "$available" },
        },
      },
    ]);

    /* ================= SOFTWARE ================= */
    const software = await SoftwareAsset.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "assetCategory",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryId: "$assetCategory",
          categoryName: { $ifNull: ["$category.name", "Unknown Category"] },
          isActive: { $ifNull: ["$category.isActive", false] },
          available: { $subtract: ["$assetQuantity", "$inUse"] },
        },
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$categoryName" },
          isActive: { $first: "$isActive" },
          softwareCount: { $sum: "$available" },
        },
      },
    ]);

    /* ================= MERGE ================= */
    const map = {};

    hardware.forEach((h) => {
      map[h._id.toString()] = {
        category: h._id,
        categoryName: h.categoryName,
        isActive: h.isActive,
        hardwareCount: h.hardwareCount,
        softwareCount: 0,
      };
    });

    software.forEach((s) => {
      const key = s._id.toString();
      if (!map[key]) {
        map[key] = {
          category: s._id,
          categoryName: s.categoryName,
          isActive: s.isActive,
          hardwareCount: 0,
          softwareCount: s.softwareCount,
        };
      } else {
        map[key].softwareCount = s.softwareCount;
        map[key].isActive = map[key].isActive && s.isActive;
      }
    });

    const result = Object.values(map).map((i) => ({
      ...i,
      totalInStock: i.hardwareCount + i.softwareCount,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignAssetsFromStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignments } = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new Error("No assignments provided");
    }

    const createdAssignments = [];

    for (const item of assignments) {
      const {
        assetType,
        assetId,
        assetModel,
        assignedTo,
        assignedToType,
        quantity,
      } = item;

      /* ================= VALIDATIONS ================= */

      if (!mongoose.Types.ObjectId.isValid(assetId)) {
        throw new Error("Invalid assetId");
      }

      if (
        assignedToType === "Department" &&
        !mongoose.Types.ObjectId.isValid(assignedTo)
      ) {
        throw new Error("Invalid departmentId");
      }

      if (!quantity || quantity <= 0) {
        throw new Error("Invalid quantity");
      }

      let asset;

      /* ================= HARDWARE ================= */
      if (assetType === "hardware") {
        asset = await Asset.findById(assetId).session(session);
        if (!asset) throw new Error("Hardware asset not found");

        const inStock = asset.assetQuantity - asset.inUse;
        if (inStock < quantity) {
          throw new Error(`Insufficient stock for ${asset.assetName}`);
        }

        asset.inUse += quantity;
        await asset.save({ session });
      }

      /* ================= SOFTWARE ================= */
if (assetType === "software") {
  asset = await SoftwareAsset.findById(assetId).session(session);
  if (!asset) throw new Error("Software asset not found");

  const available = asset.assetQuantity - asset.inUse;
  if (available < quantity) {
    throw new Error(`Insufficient licenses for ${asset.assetName}`);
  }

  asset.inUse += quantity;
  await asset.save({ session });
}


      /* ================= CREATE ASSIGNMENT ================= */
      const [assignment] = await AssetAssignment.create(
        [
          {
            assetType,
            assetId,
            assetModel,
            assignedToType,
            assignedTo, // ✅ FIXED
            quantity,
            status: "active",
          },
        ],
        { session }
      );

      createdAssignments.push(assignment);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Assets assigned successfully",
      data: createdAssignments,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const returnAsset = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignmentId } = req.params;

    const assignment = await AssetAssignment.findById(assignmentId).session(session);

    if (!assignment || assignment.status === "returned") {
      throw new Error("Invalid or already returned assignment");
    }

    if (assignment.assetType === "hardware") {
      const asset = await Asset.findById(assignment.assetId).session(session);
      if (!asset || asset.inUse < assignment.quantity) {
        throw new Error("Invalid hardware stock state");
      }

      asset.inUse -= assignment.quantity;
      await asset.save({ session });
    }

    if (assignment.assetType === "software") {
      const asset = await SoftwareAsset.findById(assignment.assetId).session(session);
      if (!asset || asset.licensesAssigned < assignment.quantity) {
        throw new Error("Invalid license state");
      }

      asset.licensesAssigned -= assignment.quantity;
      await asset.save({ session });
    }

    assignment.status = "returned";
    assignment.returnedAt = new Date();
    await assignment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Asset returned successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getInStockAssetsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const hardwareAssets = await Asset.find({
      assetCategory: category,
      $expr: { $gt: ["$assetQuantity", "$inUse"] },
    }).select("assetName assetQuantity inUse");

    const softwareAssets = await SoftwareAsset.find({
      assetCategory: category,
      $expr: { $gt: ["$assetQuantity", "$inUse"] },
    }).select("assetName assetQuantity inUse");

    const response = [
      ...hardwareAssets.map((a) => ({
        _id: a._id,
        name: a.assetName,
        assetType: "hardware",
        assetModel: "Asset",
        available: a.assetQuantity - a.inUse,
      })),
      ...softwareAssets.map((s) => ({
        _id: s._id,
        name: s.assetName,
        assetType: "software",
        assetModel: "SoftwareAsset",
        available: s.assetQuantity - s.inUse,
      })),
    ];

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  returnAsset
};

