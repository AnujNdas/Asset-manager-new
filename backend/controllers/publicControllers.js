const mongoose = require("mongoose");
const getPublicTrackedInstance = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 Basic validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Instance ID is required"
      });
    }

    /* =============================
       FETCH INSTANCE
    ============================== */

    const instance = await mongoose
      .model("AssetInstance")
      .findById(id)
      .lean();

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Instance not found"
      });
    }

    /* =============================
       FETCH ACTIVE ASSIGNMENT
    ============================== */

    const assignment = await mongoose
      .model("AssetAssignment")
      .findOne({
        assetInstanceId: instance._id,
        status: "active"
      })
      .populate("employeeId", "name")
      .populate("departmentId", "name")
      .lean();

    /* =============================
       SAFE DATA EXTRACTION
    ============================== */

    const isHardware = instance.assetType === "hardware";

const responseData = {
  instanceCode: instance.instanceCode,
  status: instance.status,
  condition: instance.condition,
  location: instance.location,
  assetType: instance.assetType,

  // 🔹 HARDWARE / SOFTWARE SPLIT
  hardware: isHardware
    ? {
        modelNo: instance.hardware?.modelNo || null,
        serialNumber: instance.serialNumber || null,
        specifications: instance.hardware?.specifications || null,

        installationDate: instance.hardware?.installationDate || null,
        purchaseDate: instance.hardware?.purchaseDate || null,

        warrantyExpiry: instance.hardware?.warrantyExpiry || null,

        insuranceExpiry: instance.hardware?.insuranceExpiry || null,
        insuranceId: instance.hardware?.insuranceId || null,

        coverageType: instance.hardware?.coverageType || [],

        nextMaintenanceDate:
          instance.hardware?.nextMaintenanceDate || null
      }
    : null,

  software: !isHardware
    ? {
        licenseNumber: instance.software?.licenseNumber || null,
        purchaseDate: instance.software?.purchaseDate || null,
        renewalDate: instance.software?.renewalDate || null,
        lastUsedDate: instance.software?.lastUsedDate || null
      }
    : null,

  // 🔹 ASSIGNMENT
  assignment: assignment
    ? {
        employeeName: assignment.employeeId?.name || null,
        department: assignment.departmentId?.name || null,
        assignedAt: assignment.assignedAt || null,

        deviceInfo: {
          deviceName: assignment.deviceInfo?.deviceName || null,
          assetTag: assignment.deviceInfo?.assetTag || null
        }
      }
    : null
};

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Tracking Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
module.exports = {
  getPublicTrackedInstance
};