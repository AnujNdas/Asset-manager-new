const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const Employee = require("../models/Employee");

/* ============================
   GET IN-STOCK CATEGORY SUMMARY
============================ */
const getInStockCategorySummary = async (req, res) => {
  try {
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
          categoryName: { $ifNull: ["$category.name", "Unknown"] },
          available: { $subtract: ["$assetQuantity", "$inUse"] }
        }
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$categoryName" },
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
          categoryName: { $ifNull: ["$category.name", "Unknown"] },
          available: { $subtract: ["$assetQuantity", "$inUse"] }
        }
      },
      { $match: { available: { $gt: 0 } } },
      {
        $group: {
          _id: "$categoryId",
          categoryName: { $first: "$categoryName" },
          softwareCount: { $sum: "$available" }
        }
      }
    ]);

    const map = {};

    hardware.forEach(h => {
      map[h._id] = {
        category: h._id,
        categoryName: h.categoryName,
        hardwareCount: h.hardwareCount,
        softwareCount: 0
      };
    });

    software.forEach(s => {
      if (!map[s._id]) {
        map[s._id] = {
          category: s._id,
          categoryName: s.categoryName,
          hardwareCount: 0,
          softwareCount: s.softwareCount
        };
      } else {
        map[s._id].softwareCount = s.softwareCount;
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
   GET ASSETS BY CATEGORY
============================ */
const getInStockAssetsByCategory = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const category = req.params.category;

    const hardware = await Asset.find({
      organizationId: orgId,
      assetCategory: category
    }).select("assetName inUse assetQuantity");

    const software = await SoftwareAsset.find({
      organizationId: orgId,
      assetCategory: category
    }).select("assetName inUse assetQuantity");

    const data = [
      ...hardware.map(a => ({
        _id: a._id,
        name: a.assetName,
        assetType: "hardware",
        available: a.assetQuantity - a.inUse
      })),
      ...software.map(s => ({
        _id: s._id,
        name: s.assetName,
        assetType: "software",
        available: s.assetQuantity - s.inUse
      }))
    ];

    res.json({ success: true, data });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================
   GET INSTANCES BY ASSET
============================ */
const getInstancesByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    const instances = await mongoose.model("AssetInstance").find({
      assetId,
      status: "in_stock"
    })
      .select("instanceCode uniqueIdentifier status")
      .lean();

    res.json({ success: true, data: instances });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================
   ASSIGN INSTANCES (BULK)
============================ */
const assignAssetInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignments } = req.body;

    if (!assignments?.length) {
      throw new Error("No assignments provided");
    }

    const results = [];

    for (const item of assignments) {
      const {
        assetType,
        assetId,
        assetInstanceId,
        departmentId,
        employeeId,
        location,
        deviceInfo = {}
      } = item;

      /* =============================
         VALIDATION
      ============================== */

      const instance = await mongoose.model("AssetInstance").findOne({
        _id: assetInstanceId,
        assetId,
        status: "in_stock"
      }).session(session);

      if (!instance) throw new Error("Instance not available");

      const exists = await AssetAssignment.findOne({
        assetInstanceId,
        status: "active"
      }).session(session);

      if (exists) throw new Error("Instance already assigned");
      if (!location || !location.trim()) {
          throw new Error("Location is required");
        }
      /* =============================
         UPDATE INSTANCE
      ============================== */

      instance.status = "assigned";
      const employee = await mongoose.model("Employee").findById(employeeId).session(session);
      const department = await mongoose.model("Department").findById(departmentId).session(session);

      instance.assignedTo = {
        employeeId: employee._id,
        employeeName: employee.name,         // ✅ important for UI
        departmentId: department._id,
        departmentName: department.name,     // ✅ important for UI
        assignedAt: new Date()
      };

      instance.status = "assigned";
      instance.location = location; // plain string

instance.lifecycle.push({
  action: "ASSIGNED",

  from: null,

  to: {
    employeeName: employee.name,
    departmentName: department.name
  },

  snapshot: {
    location: location,

    assignedTo: {
      employeeName: employee.name,
      departmentName: department.name
    },

    warrantyExpiry: instance.warranty?.expiryDate || null,
    insuranceExpiry: instance.insurance?.expiryDate || null,

    condition: instance.condition,

    costTracking: {
      maintenanceCost: instance.costTracking?.maintenanceCost || 0,
      warrantyRenewalCost: instance.costTracking?.warrantyRenewalCost || 0,
      insuranceCost: instance.costTracking?.insuranceCost || 0
    }
  },

  date: new Date(),

  notes: `Assigned to ${employee.name}`
});
      await instance.save({ session });

      /* =============================
         CREATE ASSIGNMENT
      ============================== */

      const [assignment] = await AssetAssignment.create([{
        organizationId: req.user.organizationId,
        assetId,
        assetInstanceId,
        assetType,
        assetModel: assetType === "hardware" ? "Asset" : "SoftwareAsset",
        departmentId,
        employeeId,
        location,
        deviceInfo,
        quantity: 1,
        status: "active",
        assignedBy: req.user.id
      }], { session });

      /* =============================
         UPDATE ASSET STOCK
      ============================== */

      const Model =
        assetType === "hardware" ? Asset : SoftwareAsset;

      await Model.findByIdAndUpdate(
        assetId,
        { $inc: { inUse: 1 } },
        { session }
      );

      results.push(assignment);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Instances assigned successfully",
      data: results
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
   RETURN INSTANCE
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

    const instance = await mongoose.model("AssetInstance").findById(
      assignment.assetInstanceId
    ).session(session);

    instance.status = "in_stock";
    instance.assignedTo = null;

    instance.lifecycle.push({
      action: "RETURNED",
      date: new Date()
    });

    await instance.save({ session });

    const Model =
      assignment.assetType === "hardware" ? Asset : SoftwareAsset;

    await Model.findByIdAndUpdate(
      assignment.assetId,
      { $inc: { inUse: -1 } },
      { session }
    );

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
   GET EMPLOYEES BY DEPARTMENT
============================ */
const getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const employees = await Employee.find({
      departmentId,
      organizationId: req.user.organizationId
    }).select("_id name employeeCode");

    res.json({ success: true, data: employees });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const reassignAssetInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignmentId } = req.params;
    const { newEmployeeId, newDepartmentId, newLocationId } = req.body;

    /* =============================
       FETCH CURRENT ASSIGNMENT
    ============================== */

    const oldAssignment = await AssetAssignment.findById(assignmentId).session(session);

    if (!oldAssignment || oldAssignment.status !== "active") {
      throw new Error("Invalid or inactive assignment");
    }

    /* =============================
       VALIDATE NEW EMPLOYEE
    ============================== */

    const Department = mongoose.model("Department");

    const department = await Department.findOne({
      _id: newDepartmentId,
      organizationId: oldAssignment.organizationId
    }).session(session);

    if (!department) throw new Error("Department not found");

    const employee = await mongoose.model("Employee").findOne({
      _id: newEmployeeId,
      departmentId: newDepartmentId,
      organizationId: oldAssignment.organizationId
    }).session(session);

    if (!employee) throw new Error("Invalid employee for department");

    /* =============================
       FETCH INSTANCE
    ============================== */

    const instance = await mongoose.model("AssetInstance").findById(
      oldAssignment.assetInstanceId
    ).session(session);

    if (!instance) throw new Error("Instance not found");

    /* =============================
       CLOSE OLD ASSIGNMENT
    ============================== */

    oldAssignment.status = "transferred";
    oldAssignment.returnedAt = new Date();
    oldAssignment.returnedBy = req.user.id;

    await oldAssignment.save({ session });

    /* =============================
       UPDATE INSTANCE OWNER
    ============================== */

const newEmployee = await mongoose.model("Employee").findById(newEmployeeId).session(session);
const newDepartment = await mongoose.model("Department").findById(newDepartmentId).session(session);

const oldAssignmentData = instance.assignedTo || {};

instance.assignedTo = {
  employeeId: newEmployee._id,
  employeeName: newEmployee.name,
  departmentId: newDepartment._id,
  departmentName: newDepartment.name,
  assignedAt: new Date()
};

instance.location = newLocationId;
instance.status = "assigned";

instance.lifecycle.push({
  action: "REASSIGNED",

  from: {
    employeeName: oldAssignmentData.employeeName || null,
    departmentName: oldAssignmentData.departmentName || null
  },

  to: {
    employeeName: newEmployee.name,
    departmentName: newDepartment.name
  },

  snapshot: {
    location: newLocationId,

    assignedTo: {
      employeeName: newEmployee.name,
      departmentName: newDepartment.name
    },

    warrantyExpiry: instance.warranty?.expiryDate || null,
    insuranceExpiry: instance.insurance?.expiryDate || null,

    condition: instance.condition,

    costTracking: {
      maintenanceCost: instance.costTracking?.maintenanceCost || 0,
      warrantyRenewalCost: instance.costTracking?.warrantyRenewalCost || 0,
      insuranceCost: instance.costTracking?.insuranceCost || 0
    }
  },

  date: new Date(),

  notes: `Reassigned to ${newEmployee.name}`
});
    await instance.save({ session });

    /* =============================
       CREATE NEW ASSIGNMENT
    ============================== */

    const [newAssignment] = await AssetAssignment.create([{
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
      message: "Asset reassigned successfully",
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
  getInstancesByAsset,
  assignAssetInstance,
  returnAssetInstance,
  getEmployeesByDepartment,
  reassignAssetInstance
};