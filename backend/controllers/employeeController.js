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

      // employee info
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },

      // department info
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department"
        }
      },
      { $unwind: "$department" },

      // hardware assets
      {
        $lookup: {
          from: "assets",
          localField: "assetId",
          foreignField: "_id",
          as: "hardwareAsset"
        }
      },

      // software assets
      {
        $lookup: {
          from: "softwareassets",
          localField: "assetId",
          foreignField: "_id",
          as: "softwareAsset"
        }
      },

      {
        $addFields: {
          asset: {
            $cond: [
              { $eq: ["$assetType", "hardware"] },
              { $arrayElemAt: ["$hardwareAsset", 0] },
              { $arrayElemAt: ["$softwareAsset", 0] }
            ]
          }
        }
      },

      {
        $project: {
          employeeId: "$employee._id",
          employeeName: "$employee.name",
          employeeCode: "$employee.employeeCode",
          department: "$department.name",

          assetName: "$asset.assetName",
          assetType: "$assetType",

          quantity: "$quantity",
          location: "$assignLocation",
          status: "$status",

          unitCost: "$asset.assetCost.unitAmount",
          totalCost: {
            $multiply: [
              "$quantity",
              "$asset.assetCost.unitAmount"
            ]
          }
        }
      },

      {
        $group: {
          _id: "$employeeId",

          employeeName: { $first: "$employeeName" },
          employeeCode: { $first: "$employeeCode" },
          department: { $first: "$department" },

          hardwareAssets: {
            $push: {
              $cond: [
                { $eq: ["$assetType", "hardware"] },
                {
                  name: "$assetName",
                  quantity: "$quantity",
                  cost: "$totalCost",
                  location: "$location"
                },
                "$$REMOVE"
              ]
            }
          },

          softwareAssets: {
            $push: {
              $cond: [
                { $eq: ["$assetType", "software"] },
                {
                  name: "$assetName",
                  quantity: "$quantity",
                  cost: "$totalCost",
                  location: "$location"
                },
                "$$REMOVE"
              ]
            }
          }
        }
      }
    ]);

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


module.exports = {
  createEmployee,
  getEmployeeAssetSummary,
  getEmployees,
  updateEmployee,
  deleteEmployee
};
