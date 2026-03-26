const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const sendNotification = require("../utils/notify");
const AssetInstance = require("../models/AssetInstance");
const Employee = require("../models/Employee");

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

const getInstancesByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    const instances = await AssetInstance.find({
      assetId,
      status: "available", // only free instances
    })
      .select("instanceCode uniqueIdentifier status")
      .lean();

    res.json({
      success: true,
      data: instances,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ============================
   Assign Assets From Stock
============================ */
const assignAssetInstance = async (req, res) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      assetType,
      assetId,
      assetInstanceId, // 🔥 REQUIRED NOW
      departmentId,
      employeeId,
      locationId
    } = req.body;

    if (!assetInstanceId) {
      throw new Error("Instance ID is required");
    }

    /* =============================
       VALIDATE EMPLOYEE + DEPT
    ============================== */

    const Department = mongoose.model("Department");

    const department = await Department.findOne({
      _id: departmentId,
      organizationId: req.user.organizationId
    }).session(session);

    if (!department) throw new Error("Department not found");

    const employee = await Employee.findOne({
      _id: employeeId,
      departmentId,
      organizationId: req.user.organizationId
    }).session(session);

    if (!employee) throw new Error("Invalid employee");

    /* =============================
       CHECK INSTANCE AVAILABILITY
    ============================== */

    const instance = await mongoose.model("AssetInstance").findOne({
      _id: assetInstanceId,
      assetId,
      status: "available"
    }).session(session);

    if (!instance) {
      throw new Error("Instance not available");
    }

    /* =============================
       MARK INSTANCE ASSIGNED
    ============================== */

    instance.status = "assigned";
    instance.assignedTo = employeeId;
    instance.departmentId = departmentId;
    await instance.save({ session });

    /* =============================
       CREATE ASSIGNMENT
    ============================== */

    const assignment = await AssetAssignment.create([{
      organizationId: req.user.organizationId,
      assetId,
      assetInstanceId, // 🔥 KEY CHANGE
      assetType,
      assetModel: assetType === "hardware" ? "Asset" : "SoftwareAsset",
      departmentId,
      employeeId,
      locationId,
      quantity: 1, // still required for compatibility
      status: "active",
      assignedBy: req.user.id
    }], { session });

    /* =============================
       UPDATE inUse (OPTIONAL)
    ============================== */

    const Model =
      assetType === "hardware" ? Asset : SoftwareAsset;

    await Model.findByIdAndUpdate(
      assetId,
      { $inc: { inUse: 1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Instance assigned successfully",
      data: assignment
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
const returnAssetInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignmentId } = req.params;

    const assignment = await AssetAssignment.findById(assignmentId).session(session);

    if (!assignment || assignment.status !== "active") {
      throw new Error("Invalid assignment");
    }

    /* =============================
       UPDATE INSTANCE
    ============================== */

    const instance = await mongoose.model("AssetInstance").findById(
      assignment.assetInstanceId
    ).session(session);

    if (!instance) throw new Error("Instance not found");

    instance.status = "available";
    instance.assignedTo = null;
    await instance.save({ session });

    /* =============================
       UPDATE ASSET inUse
    ============================== */

    const Model =
      assignment.assetType === "hardware"
        ? Asset
        : SoftwareAsset;

    await Model.findByIdAndUpdate(
      assignment.assetId,
      { $inc: { inUse: -1 } },
      { session }
    );

    /* =============================
       CLOSE ASSIGNMENT
    ============================== */

    assignment.status = "returned";
    assignment.returnedAt = new Date();
    assignment.returnedBy = req.user.id;

    await assignment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Instance returned successfully"
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
const getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    const employees = await Employee.find({
      departmentId,
      organizationId: req.user.organizationId
    })
      .select("_id name employeeCode")
      .lean();

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });

  } catch (error) {
    console.error("Get employees by department error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching employees",
    });
  }
};
const reassignAssetInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignmentId } = req.params;
    const { newEmployeeId, newDepartmentId, newLocationId } = req.body;

    const oldAssignment = await AssetAssignment.findById(assignmentId).session(session);

    if (!oldAssignment || oldAssignment.status !== "active") {
      throw new Error("Invalid assignment");
    }

    /* =============================
       UPDATE INSTANCE OWNER
    ============================== */

    const instance = await mongoose.model("AssetInstance").findById(
      oldAssignment.assetInstanceId
    ).session(session);

    instance.assignedTo = newEmployeeId;
    instance.departmentId = newDepartmentId;
    await instance.save({ session });

    /* =============================
       CLOSE OLD ASSIGNMENT
    ============================== */

    oldAssignment.status = "transferred";
    await oldAssignment.save({ session });

    /* =============================
       CREATE NEW ASSIGNMENT
    ============================== */

    const newAssignment = await AssetAssignment.create([{
      organizationId: oldAssignment.organizationId,
      assetId: oldAssignment.assetId,
      assetInstanceId: oldAssignment.assetInstanceId,
      assetType: oldAssignment.assetType,
      assetModel: oldAssignment.assetModel,
      departmentId: newDepartmentId,
      employeeId: newEmployeeId,
      locationId: newLocationId,
      quantity: 1,
      status: "active",
      assignedBy: req.user.id,
      reassignedFrom: {
        employeeId: oldAssignment.employeeId,
        departmentId: oldAssignment.departmentId,
        date: new Date()
      }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Instance reassigned successfully",
      data: newAssignment
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
module.exports = {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  assignAssetInstance,
  returnAssetInstance,
  getEmployeesByDepartment,
  reassignAssetInstance,
  getInstancesByAsset
};
