const Employee = require("../models/Employee");
const AssetAssignment = require("../models/AssetAssignment");
const mongoose = require("mongoose");
/**
 * Create Employee
 */
const createEmployee = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const employee = await Employee.create({
      ...req.body,
      organizationId
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const employee = await Employee.findOneAndUpdate(
      { _id: id, organizationId }, // prevent cross-org access
      { ...req.body },
      {
        new: true,
        runValidators: true
      }
    ).populate("departmentId", "name");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.json({
      success: true,
      data: employee
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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

      // 🔹 JOIN EMPLOYEE
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },

      // 🔹 JOIN DEPARTMENT
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      { $unwind: "$department" },

      // 🔥 JOIN INSTANCE (CRITICAL)
      {
        $lookup: {
          from: "assetinstances",
          localField: "assetInstanceId",
          foreignField: "_id",
          as: "instance"
        }
      },
      { $unwind: "$instance" },

      // 🔹 JOIN ASSET (for name only)
      {
        $lookup: {
          from: "assets",
          localField: "instance.assetId",
          foreignField: "_id",
          as: "asset"
        }
      },
      { $unwind: "$asset" },

      // 🔥 EXTRACT COST (BASE AMOUNT)
      {
        $addFields: {
          instanceCost: {
            $cond: [
              { $eq: ["$assetType", "hardware"] },
              "$instance.hardware.purchaseCost.baseAmount",
              "$instance.software.purchaseCost.baseAmount"
            ]
          }
        }
      },

      // 🔹 GROUP BY EMPLOYEE
      {
        $group: {
          _id: "$employee._id",

          employeeName: { $first: "$employee.name" },
          employeeCode: { $first: "$employee.employeeCode" },
          department: { $first: "$department.name" },

          // 🔹 INSTANCE COUNTS
          hardwareInstanceCount: {
            $sum: {
              $cond: [{ $eq: ["$assetType", "hardware"] }, 1, 0]
            }
          },
          softwareInstanceCount: {
            $sum: {
              $cond: [{ $eq: ["$assetType", "software"] }, 1, 0]
            }
          },

          // 🔹 UNIQUE ASSET COUNTS
          hardwareAssetsSet: {
            $addToSet: {
              $cond: [
                { $eq: ["$assetType", "hardware"] },
                "$asset._id",
                "$$REMOVE"
              ]
            }
          },
          softwareAssetsSet: {
            $addToSet: {
              $cond: [
                { $eq: ["$assetType", "software"] },
                "$asset._id",
                "$$REMOVE"
              ]
            }
          },

          // 🔹 COST
          hardwareCost: {
            $sum: {
              $cond: [
                { $eq: ["$assetType", "hardware"] },
                "$instanceCost",
                0
              ]
            }
          },
          softwareCost: {
            $sum: {
              $cond: [
                { $eq: ["$assetType", "software"] },
                "$instanceCost",
                0
              ]
            }
          }
        }
      },

      // 🔹 FINAL SHAPE
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
