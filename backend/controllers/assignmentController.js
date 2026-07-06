const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const Employee = require("../models/Employee");
const AssetInstance = require("../models/AssetInstance");
const Department = require("../models/Department");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
/* ============================
   GET IN-STOCK CATEGORY SUMMARY
============================ */

const getInStockCategorySummary = asyncHandler(async (req, res, next) => {

  const { organizationId } = req.user;

  if (!organizationId) {
    throw new AppError(
      "Organization context missing",
      403,
      "ORG_CONTEXT_MISSING"
    );
  }

  const orgId = new mongoose.Types.ObjectId(organizationId);

  /* ================= HARDWARE ================= */
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

  /* ================= SOFTWARE ================= */
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

  /* ================= MERGE ================= */
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

  /* ================= RESPONSE ================= */
  res.status(200).json({
    success: true,
    message: "In-stock category summary fetched successfully",
    data: result
  });

});

/* ============================
   GET ASSETS BY CATEGORY
============================ */

const getInStockAssetsByCategory = asyncHandler(async (req, res, next) => {

  const { organizationId } = req.user;
  const { category } = req.params;

  /* ================= VALIDATION ================= */
  if (!organizationId) {
    throw new AppError(
      "Organization context missing",
      403,
      "ORG_CONTEXT_MISSING"
    );
  }

  if (!category || !mongoose.Types.ObjectId.isValid(category)) {
    throw new AppError(
      "Invalid category id",
      400,
      "INVALID_CATEGORY_ID"
    );
  }

  const categoryId = new mongoose.Types.ObjectId(category);

  /* ================= HARDWARE ================= */
  const hardware = await Asset.find({
    organizationId,
    assetCategory: categoryId,
  })
    .populate("assetCategory", "name categoryName")
    .select(
      "assetName inUse assetQuantity assetCategory"
    );

  /* ================= SOFTWARE ================= */
  const software = await SoftwareAsset.find({
    organizationId,
    assetCategory: categoryId,
  })
    .populate("assetCategory", "name categoryName")
    .select(
      "assetName inUse assetQuantity assetCategory"
    );

  /* ================= MERGE ================= */
 const data = [
    ...hardware.map((a) => ({
      _id: a._id,
      name: a.assetName,

      assetCategory: {
        _id: a.assetCategory?._id,
        name:
          a.assetCategory?.name ||
          a.assetCategory?.categoryName,
      },

      assetType: "hardware",

      available: Math.max(
        0,
        a.assetQuantity - a.inUse
      ),
    })),

    ...software.map((s) => ({
      _id: s._id,
      name: s.assetName,

      assetCategory: {
        _id: s.assetCategory?._id,
        name:
          s.assetCategory?.name ||
          s.assetCategory?.categoryName,
      },

      assetType: "software",

      available: Math.max(
        0,
        s.assetQuantity - s.inUse
      ),
    })),
  ];

  /* ================= RESPONSE ================= */
  res.status(200).json({
    success: true,
    message: "In-stock assets fetched successfully",
    data
  });

});

/* ============================
   GET INSTANCES BY ASSET
============================ */
const getInstancesByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    const instances = await mongoose.model("AssetInstance")
      .find({
        assetId,
        status: "in_stock"
      })
.select(`
  assetType
  instanceCode 
  location
  status 
  deviceName 
  hardware.serialNumber 
  hardware.purchaseCost 
  software.purchaseCost
`)
      .lean();

    res.json({
      success: true,
      data: instances
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/* ============================
   ASSIGN INSTANCES (BULK)
============================ */


const assignAssetInstance = asyncHandler(async (req, res, next) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { organizationId, id: userId } = req.user;
    const { assignments } = req.body;

    /* ================= VALIDATION ================= */
    if (!organizationId) {
      throw new AppError(
        "Organization context missing",
        403,
        "ORG_CONTEXT_MISSING"
      );
    }

    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new AppError(
        "No assignments provided",
        400,
        "NO_ASSIGNMENTS"
      );
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
        deviceInfo,
        assignmentDate
      } = item;

      /* ================= OBJECT ID VALIDATION ================= */
      const ids = [assetId, assetInstanceId, departmentId, employeeId];

      if (ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
        throw new AppError(
          "Invalid ID provided",
          400,
          "INVALID_ID"
        );
      }

      /* ================= TYPE VALIDATION ================= */
      if (!["hardware", "software"].includes(assetType)) {
        throw new AppError(
          "Invalid asset type",
          400,
          "INVALID_ASSET_TYPE"
        );
      }

      if (!location) {
        throw new AppError(
          "Location is required",
          400,
          "LOCATION_REQUIRED"
        );
      }
      if (assetType === "software") {
  if (!deviceInfo?.serialNumber && !deviceInfo?.deviceName) {
    throw new AppError(
      "Device info required for software assignment",
      400,
      "DEVICE_INFO_REQUIRED"
    );
  }
}
      /* ================= INSTANCE ================= */
      const instance = await AssetInstance.findOne({
        _id: assetInstanceId,
        assetId,
        organizationId,
        status: "in_stock"
      }).session(session);

      if (!instance) {
        throw new AppError(
          "Instance not available",
          404,
          "INSTANCE_NOT_AVAILABLE"
        );
      }

      /* ================= DUPLICATE CHECK ================= */
      const exists = await AssetAssignment.findOne({
        assetInstanceId,
        organizationId,
        status: "active"
      }).session(session);

      if (exists) {
        throw new AppError(
          "Instance already assigned",
          400,
          "INSTANCE_ALREADY_ASSIGNED"
        );
      }

      /* ================= EMPLOYEE ================= */
      const employee = await Employee.findOne({
        _id: employeeId,
        organizationId
      }).session(session);

      if (!employee) {
        throw new AppError(
          "Employee not found",
          404,
          "EMPLOYEE_NOT_FOUND"
        );
      }

      /* ================= DEPARTMENT ================= */
      const department = await Department.findOne({
        _id: departmentId,
        organizationId
      }).session(session);

      if (!department) {
        throw new AppError(
          "Department not found",
          404,
          "DEPARTMENT_NOT_FOUND"
        );
      }
      const effectiveAssignmentDate =
  assignmentDate &&
  !isNaN(new Date(assignmentDate))
    ? new Date(assignmentDate)
    : new Date();
      /* ================= UPDATE INSTANCE ================= */
      instance.status = "in_use";

      instance.assignedTo = {
        employeeId: employee._id,
        employeeName: employee.name
      };

instance.lifecycle.push({
  eventType: "assigned",

  category: "assignment",

  title: "Instance Assigned",

  description: `Assigned to ${employee.name}`,

  performedBy: userId,

  date: effectiveAssignmentDate,

 metadata: {
  assetType,

  assignmentType:
    assetType === "software"
      ? "software_license"
      : "hardware_asset",

  dates: {
    purchaseDate:
      instance.hardware?.purchaseDate ||
      instance.software?.purchaseDate ||
      null,

    installationDate:
      instance.hardware?.installationDate ||
      instance.software?.installationDate ||
      null,

    warrantyExpiry:
      instance.hardware?.warrantyExpiry ||
      null,

    nextMaintenanceDate:
      instance.hardware?.nextMaintenanceDate ||
      null,

    renewalDate:
      instance.software?.renewalDate ||
      null,

    lastUsedDate:
      instance.software?.lastUsedDate ||
      null
  },

  costs: {
    maintenanceCost:
      instance.hardware?.costs?.maintenanceCost?.amount || 0,

    warrantyRenewalCost:
      instance.hardware?.costs?.warrantyRenewalCost?.amount || 0,

    insuranceCost:
      instance.hardware?.costs?.insuranceCost?.amount || 0,

    renewalCost:
      instance.software?.costs?.renewalCost?.amount || 0
  },

  from: {
    status: "in_stock",
    assignedTo: null,
    location: instance.location,
    condition: instance.condition
  },

  to: {
    status: "in_use",

    assignedTo: {
      employeeId: employee._id,
      employeeName: employee.name,
      departmentId: department._id,
      departmentName: department.name
    },

    location,
    condition: instance.condition
  },

  deviceInfo:
    assetType === "software"
      ? {
          deviceName:
            deviceInfo?.deviceName || "-",

          serialNumber:
            deviceInfo?.serialNumber || "-",

          model:
            deviceInfo?.model || "-"
        }
      : null
}
});
      await instance.save({ session });

      /* ================= CREATE ASSIGNMENT ================= */
const [assignment] = await AssetAssignment.create(
  [{
    organizationId,
    assetId,
    assetInstanceId,
    assetType,
    assetModel:
      assetType === "hardware"
        ? "Asset"
        : "SoftwareAsset",

    employeeId,
    departmentId,
    location,

    assignedAt: effectiveAssignmentDate,
    assignedBy: userId,

    deviceInfo:
      assetType === "software"
        ? {
            deviceName: deviceInfo?.deviceName || "",
            serialNumber: deviceInfo?.serialNumber || "",
            model: deviceInfo?.model || ""
          }
        : undefined,

    status: "active"
  }],
  { session }
);

      /* ================= UPDATE STOCK ================= */
      const Model = assetType === "hardware" ? Asset : SoftwareAsset;

      const inUseCount = await AssetInstance.countDocuments({
        assetId,
        organizationId,
        status: "in_use"
      }).session(session);

      await Model.findByIdAndUpdate(
        assetId,
        { inUse: inUseCount },
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
    next(error); // ✅ GLOBAL HANDLER
  }
});
/* ============================
   RETURN INSTANCE
============================ */
const returnAssetInstance = asyncHandler(async (req, res, next) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { organizationId, id: userId } = req.user;
    const { assignmentId } = req.params;

    /* ================= VALIDATION ================= */
    if (!organizationId) {
      throw new AppError(
        "Organization context missing",
        403,
        "ORG_CONTEXT_MISSING"
      );
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new AppError(
        "Invalid assignment ID",
        400,
        "INVALID_ASSIGNMENT_ID"
      );
    }

    /* ================= FETCH ASSIGNMENT ================= */
    const assignment = await AssetAssignment.findOne({
      _id: assignmentId,
      organizationId
    }).session(session);

    if (!assignment) {
      throw new AppError(
        "Assignment not found",
        404,
        "ASSIGNMENT_NOT_FOUND"
      );
    }

    if (assignment.status !== "active") {
      throw new AppError(
        "Assignment already returned",
        400,
        "ASSIGNMENT_ALREADY_RETURNED"
      );
    }

    /* ================= FETCH INSTANCE ================= */
    const instance = await AssetInstance.findOne({
      _id: assignment.assetInstanceId,
      organizationId
    }).session(session);

    if (!instance) {
      throw new AppError(
        "Asset instance not found",
        404,
        "INSTANCE_NOT_FOUND"
      );
    }

    /* ================= SNAPSHOT ================= */
    const previousAssignedTo = instance.assignedTo;

    /* ================= UPDATE INSTANCE ================= */
    instance.status = "in_stock";
    instance.assignedTo = null;

    instance.lifecycle.push({
      action: "RETURNED",
      from: {
        employeeName: previousAssignedTo?.employeeName || null
      },
      to: null,
      snapshot: {
        location: instance.location,
        assignedTo: {
          employeeName: previousAssignedTo?.employeeName || null
        },
        condition: instance.condition
      },
      date: new Date(),
      notes: `Returned by ${userId}`
    });

    await instance.save({ session });

    /* ================= UPDATE STOCK (SAFE) ================= */
    const Model =
      assignment.assetType === "hardware" ? Asset : SoftwareAsset;

    const inUseCount = await AssetInstance.countDocuments({
      assetId: assignment.assetId,
      organizationId,
      status: "in_use"
    }).session(session);

    await Model.findByIdAndUpdate(
      assignment.assetId,
      { inUse: inUseCount },
      { session }
    );

    /* ================= UPDATE ASSIGNMENT ================= */
    assignment.status = "returned";
    assignment.returnedAt = new Date();
    assignment.returnedBy = userId;

    await assignment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Instance returned successfully"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error); // ✅ global handler
  }
});

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

const reassignAssetInstance = asyncHandler(async (req, res, next) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { organizationId, id: userId } = req.user;
    const { assignmentId } = req.params;
    const { newEmployeeId, newDepartmentId, newLocation , reassignmentDate } = req.body;

    /* ================= VALIDATION ================= */

    if (!organizationId) {
      throw new AppError(
        "Organization context missing",
        403,
        "ORG_CONTEXT_MISSING"
      );
    }

    const ids = [assignmentId, newEmployeeId, newDepartmentId];

    if (ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      throw new AppError(
        "Invalid ID provided",
        400,
        "INVALID_ID"
      );
    }

    if (!newLocation) {
      throw new AppError(
        "Location is required",
        400,
        "LOCATION_REQUIRED"
      );
    }

    /* ================= FETCH ASSIGNMENT ================= */

    const oldAssignment = await AssetAssignment.findOne({
      _id: assignmentId,
      organizationId
    }).session(session);

    if (!oldAssignment) {
      throw new AppError(
        "Assignment not found",
        404,
        "ASSIGNMENT_NOT_FOUND"
      );
    }

    if (oldAssignment.status !== "active") {
      throw new AppError(
        "Assignment is not active",
        400,
        "ASSIGNMENT_NOT_ACTIVE"
      );
    }

    /* ================= VALIDATE DEPARTMENT ================= */

    const department = await Department.findOne({
      _id: newDepartmentId,
      organizationId
    }).session(session);

    if (!department) {
      throw new AppError(
        "Department not found",
        404,
        "DEPARTMENT_NOT_FOUND"
      );
    }

    /* ================= VALIDATE EMPLOYEE ================= */

    const employee = await Employee.findOne({
      _id: newEmployeeId,
      departmentId: newDepartmentId,
      organizationId
    }).session(session);

    if (!employee) {
      throw new AppError(
        "Employee not found in department",
        404,
        "EMPLOYEE_INVALID_FOR_DEPARTMENT"
      );
    }

    /* ================= FETCH INSTANCE ================= */

    const instance = await AssetInstance.findOne({
      _id: oldAssignment.assetInstanceId,
      organizationId
    }).session(session);

    if (!instance) {
      throw new AppError(
        "Instance not found",
        404,
        "INSTANCE_NOT_FOUND"
      );
    }
    const effectiveReassignmentDate =
      reassignmentDate &&
      !isNaN(new Date(reassignmentDate))  
        ? new Date(reassignmentDate)
        : new Date();

/* ================= FETCH PREVIOUS EMPLOYEE ================= */

const previousEmployee = await Employee.findById(
  oldAssignment.employeeId
).session(session);

const previousDepartment = await Department.findById(
  oldAssignment.departmentId
).session(session);

/* ================= PREVIOUS ASSIGNMENT SNAPSHOT ================= */

const previousAssignmentData = {
  employeeId: oldAssignment.employeeId,

  employeeName:
    oldAssignment.employeeName ||
    previousEmployee?.name ||
    "Unknown",

  departmentId: oldAssignment.departmentId,

  departmentName:
    oldAssignment.departmentName ||
    previousDepartment?.name ||
    "-",

  location: oldAssignment.location || "-"
};

    /* ================= CLOSE OLD ASSIGNMENT ================= */

    oldAssignment.status = "transferred";
    oldAssignment.returnedAt = effectiveReassignmentDate;
    oldAssignment.returnedBy = userId;

    await oldAssignment.save({ session });

    /* ================= UPDATE INSTANCE ================= */

    instance.assignedTo = {
      employeeId: employee._id,
      employeeName: employee.name,
      departmentId: department._id,
      departmentName: department.name,
      assignedAt: effectiveReassignmentDate
    };

    instance.location = newLocation;
    instance.status = "in_use"; // ✅ consistent

instance.lifecycle.push({
  eventType: "reassigned",

  category: "assignment",

  title: "Asset Reassigned",

description: `Asset reassigned from ${
  previousAssignmentData.employeeName || "Unknown"
} to ${employee.name}`,

  performedBy: userId,

  date: effectiveReassignmentDate,

metadata: {
  from: {
    employeeId:
      previousAssignmentData.employeeId || null,

    employeeName:
  previousAssignmentData.employeeName || "Unknown",

    departmentId:
      previousAssignmentData.departmentId || null,

    departmentName:
      previousAssignmentData.departmentName || null,

    location:
      previousAssignmentData.location || "-"
  },

  to: {
    employeeId: employee._id,

    employeeName: employee.name,

    departmentId: department._id,

    departmentName: department.name,

    location: newLocation
  },

  assetType: instance.assetType,

  instanceCode: instance.instanceCode,

  deviceName: instance.deviceName,

  status: "in_use",

  condition: instance.condition,

  reassignmentType:
    instance.assetType === "software"
      ? "software_license"
      : "hardware_asset"
}
});

    await instance.save({ session });

    /* ================= CREATE NEW ASSIGNMENT ================= */

const [newAssignment] = await AssetAssignment.create([{
  organizationId,

  assetId: oldAssignment.assetId,

  assetInstanceId:
    oldAssignment.assetInstanceId,

  assetType: oldAssignment.assetType,

  assetModel: oldAssignment.assetModel,

  departmentId: newDepartmentId,
  departmentName: department.name,

  employeeId: newEmployeeId,
  employeeName: employee.name,

  location: newLocation,

  status: "active",
  assignedAt: effectiveReassignmentDate, // ✅ ADD THIS
  assignedBy: userId,

  reassignedFrom: {
    employeeId: oldAssignment.employeeId,
    employeeName: oldAssignment.employeeName,

    departmentId: oldAssignment.departmentId,
    departmentName: oldAssignment.departmentName,

    location: oldAssignment.location,

    date: effectiveReassignmentDate
  }
}], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Asset reassigned successfully",
      data: newAssignment
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

const unassignAssetInstance = asyncHandler(async (req, res, next) => {

  const session = await mongoose.startSession();

  session.startTransaction();

  try {

    const { organizationId, id: userId } = req.user;

    const { assignmentId } = req.params;

    /* ================= VALIDATION ================= */

    if (!organizationId) {
      throw new AppError(
        "Organization context missing",
        403,
        "ORG_CONTEXT_MISSING"
      );
    }

    if (
      !assignmentId ||
      !mongoose.Types.ObjectId.isValid(assignmentId)
    ) {
      throw new AppError(
        "Invalid assignment ID",
        400,
        "INVALID_ASSIGNMENT_ID"
      );
    }

    /* ================= FETCH ASSIGNMENT ================= */

    const assignment = await AssetAssignment.findOne({
      _id: assignmentId,
      organizationId,
      status: "active"
    }).session(session);

    if (!assignment) {
      throw new AppError(
        "Active assignment not found",
        404,
        "ASSIGNMENT_NOT_FOUND"
      );
    }

    /* ================= FETCH INSTANCE ================= */

    const instance = await AssetInstance.findOne({
      _id: assignment.assetInstanceId,
      organizationId
    }).session(session);

    if (!instance) {
      throw new AppError(
        "Instance not found",
        404,
        "INSTANCE_NOT_FOUND"
      );
    }

    if (instance.status !== "in_use") {
      throw new AppError(
        "Instance is not currently assigned",
        400,
        "INSTANCE_NOT_ASSIGNED"
      );
    }

    /* ================= UPDATE INSTANCE ================= */

    const previousAssignee =
      instance.assignedTo || {};

    instance.status = "in_stock";

    instance.assignedTo = null;

   instance.lifecycle.push({

  eventType: "returned",

  category: "assignment",

  title: "Asset Unassigned",

  description: `Asset unassigned from ${
    previousAssignee.employeeName || "Unknown"
  }`,

  performedBy: userId,

  date: new Date(),

  metadata: {

    previousAssignment: {
      employeeId:
        previousAssignee.employeeId || null,

      employeeName:
        previousAssignee.employeeName || null
    },

    newStatus: "in_stock",

    location:
      assignment.location || instance.location,

    condition: instance.condition,

    assignmentId: assignment._id
  }

});

    await instance.save({ session });

    /* ================= CLOSE ASSIGNMENT ================= */

    assignment.status = "returned";

    assignment.returnedAt = new Date();

    assignment.returnedBy = userId;

    await assignment.save({ session });

    /* ================= UPDATE STOCK ================= */

    const Model =
      instance.assetType === "hardware"
        ? Asset
        : SoftwareAsset;

    const inUseCount =
      await AssetInstance.countDocuments({
        assetId: instance.assetId,
        organizationId,
        status: "in_use"
      }).session(session);

    await Model.findByIdAndUpdate(
      instance.assetId,
      {
        inUse: inUseCount
      },
      {
        session
      }
    );

    /* ================= COMMIT ================= */

    await session.commitTransaction();

    session.endSession();

    res.status(200).json({
      success: true,
      message: "Asset unassigned successfully"
    });

  } catch (error) {

    await session.abortTransaction();

    session.endSession();

    next(error);
  }
});
module.exports = {
  getInStockCategorySummary,
  getInStockAssetsByCategory,
  getInstancesByAsset,
  assignAssetInstance,
  returnAssetInstance,
  getEmployeesByDepartment,
  reassignAssetInstance,
  unassignAssetInstance
};