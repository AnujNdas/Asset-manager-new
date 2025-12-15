const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");

const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");

const getInStockCategorySummary = async (req, res) => {
  try {
    // HARDWARE
    const hardware = await Asset.aggregate([
      {
        $project: {
          category: "$assetCategory",
          available: { $subtract: ["$assetQuantity", "$inUse"] }
        }
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$category",
          hardwareCount: { $sum: "$available" }
        }
      }
    ]);

    // SOFTWARE
    const software = await SoftwareAsset.aggregate([
      {
        $project: {
          category: "$category",
          available: {
            $subtract: ["$totalLicenses", "$licensesAssigned"]
          }
        }
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$category",
          softwareCount: { $sum: "$available" }
        }
      }
    ]);

    // MERGE RESULTS
    const map = {};

    hardware.forEach(item => {
      map[item._id] = {
        category: item._id,
        hardwareCount: item.hardwareCount,
        softwareCount: 0
      };
    });

    software.forEach(item => {
      if (!map[item._id]) {
        map[item._id] = {
          category: item._id,
          hardwareCount: 0,
          softwareCount: item.softwareCount
        };
      } else {
        map[item._id].softwareCount = item.softwareCount;
      }
    });

    const result = Object.values(map).map(item => ({
      ...item,
      totalInStock: item.hardwareCount + item.softwareCount
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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
      const { assetType, assetId, departmentId, quantity } = item;

      if (!mongoose.Types.ObjectId.isValid(assetId)) {
        throw new Error("Invalid assetId");
      }

      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        throw new Error("Invalid departmentId");
      }

      if (!quantity || quantity <= 0) {
        throw new Error("Invalid quantity");
      }

      let asset;
      let assetModel;

      /* ================= HARDWARE ================= */
      if (assetType === "hardware") {
        assetModel = "Asset";
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
        assetModel = "SoftwareAsset";
        asset = await SoftwareAsset.findById(assetId).session(session);

        if (!asset) throw new Error("Software asset not found");

        const available =
          asset.totalLicenses - asset.licensesAssigned;

        if (available < quantity) {
          throw new Error(`Insufficient licenses for ${asset.name}`);
        }

        asset.licensesAssigned += quantity;
        await asset.save({ session });
      }

      /* ================= CREATE ASSIGNMENT ================= */
      const assignment = await AssetAssignment.create(
        [
          {
            assetType,
            assetId,
            assetModel,
            assignedToType: "Department",
            assignedTo: departmentId,
            quantity,
            status: "active",
          },
        ],
        { session }
      );

      createdAssignments.push(assignment[0]);
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

    /* ================= HARDWARE ================= */
    const hardwareAssets = await Asset.find({
      assetCategory: category,
      $expr: { $gt: ["$assetQuantity", "$inUse"] }
    }).select("assetName assetQuantity inUse");

    /* ================= SOFTWARE ================= */
    const softwareAssets = await SoftwareAsset.find({
      category,
      $expr: { $gt: ["$totalLicenses", "$licensesAssigned"] }
    }).select("name totalLicenses licensesAssigned");

    const response = [
      ...hardwareAssets.map(a => ({
        _id: a._id,
        name: a.assetName,
        assetType: "hardware",
        assetModel: "Asset",
        available: a.assetQuantity - a.inUse
      })),

      ...softwareAssets.map(s => ({
        _id: s._id,
        name: s.name,
        assetType: "software",
        assetModel: "SoftwareAsset",
        available: s.totalLicenses - s.licensesAssigned
      }))
    ];

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  returnAsset
};

