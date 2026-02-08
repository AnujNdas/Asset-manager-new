const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const sendNotification = require("../utils/notify");

/* ============================
   In-Stock Category Summary
============================ */
const getInStockCategorySummary = async (req, res) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orgId = new mongoose.Types.ObjectId(req.user.organizationId);

    const hardware = await Asset.aggregate([
      { $match: { organizationId: orgId } },
      {
        $lookup: {
          from: "categories",
          localField: "assetCategory",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryId: "$assetCategory",
          categoryName: { $ifNull: ["$category.name", "Unknown Category"] },
          isActive: { $ifNull: ["$category.isActive", false] },
          available: { $subtract: ["$assetQuantity", "$inUse"] }
        }
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$categoryName" },
          isActive: { $first: "$isActive" },
          hardwareCount: { $sum: "$available" }
        }
      }
    ]);

    const software = await SoftwareAsset.aggregate([
      { $match: { organizationId: orgId } },
      {
        $lookup: {
          from: "categories",
          localField: "assetCategory",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryId: "$assetCategory",
          categoryName: { $ifNull: ["$category.name", "Unknown Category"] },
          isActive: { $ifNull: ["$category.isActive", false] },
          available: { $subtract: ["$assetQuantity", "$inUse"] }
        }
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$categoryName" },
          isActive: { $first: "$isActive" },
          softwareCount: { $sum: "$available" }
        }
      }
    ]);

    const map = {};

    hardware.forEach(h => {
      map[h._id.toString()] = {
        category: h._id,
        categoryName: h.categoryName,
        isActive: h.isActive,
        hardwareCount: h.hardwareCount,
        softwareCount: 0
      };
    });

    software.forEach(s => {
      const key = s._id.toString();
      if (!map[key]) {
        map[key] = {
          category: s._id,
          categoryName: s.categoryName,
          isActive: s.isActive,
          hardwareCount: 0,
          softwareCount: s.softwareCount
        };
      } else {
        map[key].softwareCount = s.softwareCount;
      }
    });

    const result = Object.values(map).map(i => ({
      ...i,
      totalInStock: i.hardwareCount + i.softwareCount
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================
   Assign Assets From Stock
============================ */
const assignAssetsFromStock = async (req, res) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orgId = req.user.organizationId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignments } = req.body;
    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new Error("No assignments provided");
    }

    const createdAssignments = [];

    for (const item of assignments) {
      const { assetType, assetId, assetModel, assignedTo, assignedToType, quantity } = item;

      let asset;

      if (assetType === "hardware") {
        asset = await Asset.findOne({
          _id: assetId,
          organizationId: orgId
        }).session(session);

        if (!asset || asset.assetQuantity - asset.inUse < quantity) {
          throw new Error("Insufficient hardware stock");
        }

        asset.inUse += quantity;
        await asset.save({ session });
      }

      if (assetType === "software") {
        asset = await SoftwareAsset.findOne({
          _id: assetId,
          organizationId: orgId
        }).session(session);

        if (!asset || asset.assetQuantity - asset.inUse < quantity) {
          throw new Error("Insufficient software licenses");
        }

        asset.inUse += quantity;
        await asset.save({ session });
      }

const existingAssignment = await AssetAssignment.findOne({
  organizationId: orgId,
  assetId,
  assetType,
  assignedTo,
  assignedToType,
  status: "active"
}).session(session);

let assignment;

if (existingAssignment) {
  // 🔹 Same department → increase quantity
  existingAssignment.quantity += quantity;
  await existingAssignment.save({ session });

  assignment = existingAssignment;
} else {
  // 🔹 First time assignment
  [assignment] = await AssetAssignment.create(
    [{
      organizationId: orgId,
      assetType,
      assetId,
      assetModel,
      assignedToType,
      assignedTo,
      quantity,
      status: "active"
    }],
    { session }
  );
}


      createdAssignments.push(assignment);
    }

    await session.commitTransaction();
    session.endSession();

    await sendNotification({
      req,
      userId: req.user.id,
      title: "Assets Assigned",
      message: `${createdAssignments.length} asset(s) assigned successfully.`,
      redirectUrl: "/assignments",
      type: "info"
    });

    res.status(201).json({ success: true, data: createdAssignments });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ============================
   Return Asset
============================ */
const returnAsset = async (req, res) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orgId = req.user.organizationId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const assignment = await AssetAssignment.findOne({
      _id: req.params.assignmentId,
      organizationId: orgId
    }).session(session);

    if (!assignment || assignment.status === "returned") {
      throw new Error("Invalid or already returned assignment");
    }

    const Model = assignment.assetType === "hardware" ? Asset : SoftwareAsset;

    const asset = await Model.findOne({
      _id: assignment.assetId,
      organizationId: orgId
    }).session(session);

    if (!asset || asset.inUse < assignment.quantity) {
      throw new Error("Invalid stock state");
    }

    asset.inUse -= assignment.quantity;
    await asset.save({ session });

    assignment.status = "returned";
    assignment.returnedAt = new Date();
    await assignment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Asset returned successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ============================
   In-Stock Assets By Category
============================ */
const getInStockAssetsByCategory = async (req, res) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orgId = req.user.organizationId;
    const category = req.params.category;

    const hardwareAssets = await Asset.find({
      organizationId: orgId,
      assetCategory: category,
      $expr: { $gt: ["$assetQuantity", "$inUse"] }
    });

    const softwareAssets = await SoftwareAsset.find({
      organizationId: orgId,
      assetCategory: category,
      $expr: { $gt: ["$assetQuantity", "$inUse"] }
    });

    res.json({
      success: true,
      data: [
        ...hardwareAssets.map(a => ({
          _id: a._id,
          name: a.assetName,
          assetType: "hardware",
          assetModel: "Asset",
          available: a.assetQuantity - a.inUse
        })),
        ...softwareAssets.map(s => ({
          _id: s._id,
          name: s.assetName,
          assetType: "software",
          assetModel: "SoftwareAsset",
          available: s.assetQuantity - s.inUse
        }))
      ]
    });
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
