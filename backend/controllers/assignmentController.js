const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const sendNotification = require("../utils/notify");
const User = require("../models/User");
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
      const {
        assetType,
        assetId,
        departmentId,
        userId,
        assignLocation,
        quantity
      } = item;

      /* =============================
         STEP 1: BASIC VALIDATION
      ============================== */

      if (!assetType || !assetId || !departmentId || !userId || !quantity) {
        throw new Error("Missing required assignment fields");
      }

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      if (!assignLocation || assignLocation.trim() === "") {
        throw new Error("Assign location is required");
      }

      /* =============================
         STEP 2: VALIDATE DEPARTMENT
      ============================== */

      const Department = mongoose.model("Department");

      const department = await Department.findOne({
        _id: departmentId,
        organizationId: orgId
      }).session(session);

      if (!department) {
        throw new Error("Department not found in organization");
      }

      /* =============================
         STEP 3: VALIDATE USER BELONGS TO DEPARTMENT
      ============================== */

      const User = mongoose.model("User");

      const user = await User.findOne({
        _id: userId,
        departmentId,
        organizationId: orgId
      }).session(session);

      if (!user) {
        throw new Error("User does not belong to selected department");
      }

      /* =============================
         STEP 4: FETCH ASSET & CHECK STOCK
      ============================== */

      const Model = assetType === "hardware"
        ? Asset
        : SoftwareAsset;

const asset = await Model.findOneAndUpdate(
  {
    _id: assetId,
    organizationId: orgId,
    $expr: {
      $gte: [
        { $subtract: ["$assetQuantity", "$inUse"] },
        quantity
      ]
    }
  },
  { $inc: { inUse: quantity } },
  { new: true, session }
);

if (!asset) {
  throw new Error("Insufficient stock available");
}


      /* =============================
         STEP 6: MERGE OR CREATE ASSIGNMENT
      ============================== */

      const existingAssignment = await AssetAssignment.findOne({
        organizationId: orgId,
        assetId,
        userId,
        status: "active"
      }).session(session);

      let assignment;


      if (existingAssignment) {
        existingAssignment.quantity += quantity;
        existingAssignment.assignLocation = assignLocation;
        await existingAssignment.save({ session });
        assignment = existingAssignment;
      } else {
[assignment] = await AssetAssignment.create(
  [{
    organizationId: orgId,
    assetType,
    assetId,
    assetModel: Model.modelName,
 // ✅ ADD THIS
    departmentId,
    userId,
    assignLocation,
    quantity,
    status: "active",
    assignedBy: req.user.id
  }],
  { session }
);

      }

      createdAssignments.push(assignment);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Assets assigned successfully",
      data: createdAssignments
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message
    });
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
    const { assignmentId } = req.params;

    /* =============================
       FETCH ACTIVE ASSIGNMENT ONLY
    ============================== */

    const assignment = await AssetAssignment.findOne({
      _id: assignmentId,
      organizationId: orgId,
      status: "active"
    }).session(session);

    if (!assignment) {
      throw new Error("Invalid or already returned assignment");
    }

    /* =============================
       FETCH ASSET
    ============================== */

    const Model =
      assignment.assetType === "hardware"
        ? Asset
        : SoftwareAsset;

    const asset = await Model.findOne({
      _id: assignment.assetId,
      organizationId: orgId
    }).session(session);

    if (!asset) {
      throw new Error("Asset not found");
    }

    if (asset.inUse < assignment.quantity) {
      throw new Error("Stock integrity violation");
    }

    /* =============================
       UPDATE STOCK
    ============================== */

    asset.inUse -= assignment.quantity;
    await asset.save({ session });

    /* =============================
       UPDATE ASSIGNMENT
    ============================== */

    assignment.status = "returned";
    assignment.returnedAt = new Date();
    assignment.returnedBy = req.user.id; // optional but recommended
    await assignment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Asset returned successfully"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message
    });
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
    const category = new mongoose.Types.ObjectId(req.params.category);

    const hardwareAssets = await Asset.find({
      organizationId: orgId,
      assetCategory: category
    })
      .select("assetName assetQuantity inUse")
      .lean();

    const softwareAssets = await SoftwareAsset.find({
      organizationId: orgId,
      assetCategory: category
    })
      .select("assetName assetQuantity inUse")
      .lean();

    const data = [
      ...hardwareAssets
        .filter(a => a.assetQuantity > a.inUse)
        .map(a => ({
          _id: a._id,
          name: a.assetName,
          assetType: "hardware",
          assetModel: "Asset",
          available: a.assetQuantity - a.inUse
        })),

      ...softwareAssets
        .filter(s => s.assetQuantity > s.inUse)
        .map(s => ({
          _id: s._id,
          name: s.assetName,
          assetType: "software",
          assetModel: "SoftwareAsset",
          available: s.assetQuantity - s.inUse
        }))
    ];

    res.json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getUsersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const users = await User.find({
    departmentId: departmentId,
  })

      .select("_id name email employeeId")
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (error) {
    console.error("Get users by department error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};
module.exports = {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetsFromStock,
  returnAsset,
  getUsersByDepartment
};
