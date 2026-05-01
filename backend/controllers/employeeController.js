const Employee = require("../models/Employee");
const AssetAssignment = require("../models/AssetAssignment");
const mongoose = require("mongoose");
/**
 * Create Employee
 */
const createEmployee = async (req, res, next) => {
  try {
    const { organizationId, id: userId } = req.user;

    if (!organizationId || !userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    /* ================= VALIDATION ================= */

    const { name, employeeCode, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Employee name is required"
      });
    }

    if (!employeeCode || !employeeCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Employee code is required"
      });
    }

    /* ================= DUPLICATE CHECK ================= */

    const existing = await Employee.findOne({
      organizationId,
      $or: [
        { employeeCode: employeeCode.trim() },
        ...(email ? [{ email: email.trim().toLowerCase() }] : [])
      ]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Employee with same code or email already exists"
      });
    }

    /* ================= CREATE ================= */

    const employee = await Employee.create({
      ...req.body,
      name: name.trim(),
      employeeCode: employeeCode.trim(),
      email: email?.trim().toLowerCase() || "",
      organizationId,
      createdBy: userId
    });

    return res.status(201).json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    return next(error);
  }
};
/**
 * Get Employees (with department filter optional)
 */
const getEmployees = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { departmentId } = req.query;

    const filter = { organizationId };

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const employees = await Employee.find(filter)
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * Update Employee
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { organizationId, id: userId } = req.user;

    if (!organizationId || !userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    /* ================= FETCH EXISTING ================= */

    const employee = await Employee.findOne({
      _id: id,
      organizationId
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    /* ================= SAFE INPUT ================= */

    let { name, employeeCode, email, departmentId } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Employee name cannot be empty"
        });
      }
      name = name.trim().replace(/\s+/g, " ");
    }

    if (employeeCode !== undefined) {
      if (!employeeCode.trim()) {
        return res.status(400).json({
          success: false,
          message: "Employee code cannot be empty"
        });
      }
      employeeCode = employeeCode.trim();
    }

    if (email !== undefined) {
      email = email.trim().toLowerCase();
    }

    /* ================= DUPLICATE CHECK ================= */

    if (employeeCode || email) {
      const exists = await Employee.findOne({
        organizationId,
        _id: { $ne: id },
        $or: [
          ...(employeeCode ? [{ employeeCode }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Employee with same code or email already exists"
        });
      }
    }

    /* ================= APPLY UPDATES ================= */

    if (name !== undefined) employee.name = name;
    if (employeeCode !== undefined) employee.employeeCode = employeeCode;
    if (email !== undefined) employee.email = email;
    if (departmentId !== undefined) employee.departmentId = departmentId;

    employee.updatedBy = userId;

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate("departmentId", "name");

    return res.json({
      success: true,
      data: updatedEmployee
    });

  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);
    return next(error);
  }
};
/**
 * Delete Employee
 */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const employee = await Employee.findOneAndDelete({
      _id: id,
      organizationId
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getEmployeeAssetSummary = async (req, res) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

    const data = await AssetAssignment.aggregate([
      {
        $match: {
          organizationId,
          status: "active"
        }
      },

      /* ================= EMPLOYEE ================= */
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },

      /* ================= DEPARTMENT ================= */
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      { $unwind: "$department" },

      /* ================= INSTANCE ================= */
      {
        $lookup: {
          from: "assetinstances",
          localField: "assetInstanceId",
          foreignField: "_id",
          as: "instance"
        }
      },
      { $unwind: "$instance" },

      /* ================= 🔥 FIX: JOIN BOTH ASSET TYPES ================= */

      // hardware assets
      {
        $lookup: {
          from: "assets",
          localField: "instance.assetId",
          foreignField: "_id",
          as: "hardwareAsset"
        }
      },

      // software assets
      {
        $lookup: {
          from: "softwareassets",
          localField: "instance.assetId",
          foreignField: "_id",
          as: "softwareAsset"
        }
      },

      // pick correct asset dynamically
      {
        $addFields: {
          asset: {
            $cond: [
              { $eq: ["$instance.assetType", "hardware"] },
              { $arrayElemAt: ["$hardwareAsset", 0] },
              { $arrayElemAt: ["$softwareAsset", 0] }
            ]
          }
        }
      },

      // ⚠️ keep only valid (prevents null crash but does NOT drop software anymore)
      {
        $match: {
          asset: { $ne: null }
        }
      },

      /* ================= COST ================= */
      {
        $addFields: {
          instanceCost: {
            $cond: [
              { $eq: ["$instance.assetType", "hardware"] },
              { $ifNull: ["$instance.hardware.purchaseCost.baseAmount", 0] },
              { $ifNull: ["$instance.software.purchaseCost.baseAmount", 0] }
            ]
          }
        }
      },

      /* ================= GROUP ================= */
      {
        $group: {
          _id: "$employee._id",

          employeeName: { $first: "$employee.name" },
          employeeCode: { $first: "$employee.employeeCode" },
          department: { $first: "$department.name" },

          /* INSTANCE COUNTS */
          hardwareInstanceCount: {
            $sum: {
              $cond: [{ $eq: ["$instance.assetType", "hardware"] }, 1, 0]
            }
          },
          softwareInstanceCount: {
            $sum: {
              $cond: [{ $eq: ["$instance.assetType", "software"] }, 1, 0]
            }
          },

          /* UNIQUE ASSETS */
          hardwareAssetsSet: {
            $addToSet: {
              $cond: [
                { $eq: ["$instance.assetType", "hardware"] },
                "$asset._id",
                "$$REMOVE"
              ]
            }
          },
          softwareAssetsSet: {
            $addToSet: {
              $cond: [
                { $eq: ["$instance.assetType", "software"] },
                "$asset._id",
                "$$REMOVE"
              ]
            }
          },

          /* COST */
          hardwareCost: {
            $sum: {
              $cond: [
                { $eq: ["$instance.assetType", "hardware"] },
                "$instanceCost",
                0
              ]
            }
          },
          softwareCost: {
            $sum: {
              $cond: [
                { $eq: ["$instance.assetType", "software"] },
                "$instanceCost",
                0
              ]
            }
          }
        }
      },

      /* ================= FINAL ================= */
      {
        $project: {
          _id: 1,
          employeeName: 1,
          employeeCode: 1,
          department: 1,

          hardware: {
            assetCount: { $size: "$hardwareAssetsSet" },
            instanceCount: "$hardwareInstanceCount",
            totalCost: "$hardwareCost"
          },

          software: {
            assetCount: { $size: "$softwareAssetsSet" },
            instanceCount: "$softwareInstanceCount",
            totalCost: "$softwareCost"
          },

          totalCost: {
            $add: ["$hardwareCost", "$softwareCost"]
          }
        }
      },

      { $sort: { employeeName: 1 } }
    ]);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Employee Summary Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createEmployee,
  getEmployeeAssetSummary,
  getEmployees,
  updateEmployee,
  deleteEmployee
};
