// GET /instances/tracking
const mongoose = require("mongoose")

const getTrackedInstances = async (req, res) => {
  try {
    const { type, status, search } = req.query;

    const query = {
      organizationId: req.user.organizationId
    };

    if (type && type !== "all") {
      query.assetType = type;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { instanceCode: { $regex: search, $options: "i" } },
        { uniqueIdentifier: { $regex: search, $options: "i" } }
      ];
    }

    /* =============================
       FETCH INSTANCES
    ============================== */

    const instances = await mongoose
      .model("AssetInstance")
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    /* =============================
       FETCH ACTIVE ASSIGNMENTS
    ============================== */

    const instanceIds = instances.map(i => i._id);

    const assignments = await mongoose
      .model("AssetAssignment")
      .find({
        assetInstanceId: { $in: instanceIds },
        status: "active"
      })
      .populate("employeeId", "name employeeCode")
      .populate("departmentId", "name")
      .lean();

    /* =============================
       MAP ASSIGNMENTS → INSTANCES
    ============================== */

    const assignmentMap = {};

    assignments.forEach((a) => {
      assignmentMap[a.assetInstanceId.toString()] = a;
    });

    const enrichedInstances = instances.map((inst) => {
      const assignment = assignmentMap[inst._id.toString()];

      return {
        ...inst,

        assignedTo: assignment
          ? {
              employeeName: assignment.employeeId?.name,
              employeeCode: assignment.employeeId?.employeeCode,
              departmentName: assignment.departmentId?.name,
              assignedAt: assignment.assignedAt
            }
          : null
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedInstances.length,
      data: enrichedInstances
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Calculate Service Days Helper Function

const calculateServiceDays = (createdAt) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + " Days";
};

// GET /instances/:id/history

const getInstanceHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await mongoose.model("AssetInstance")
      .findOne({
        _id: id,
        organizationId: req.user.organizationId
      })
      .populate("assignedTo.employeeId", "name employeeCode")
      .lean();

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Instance not found"
      });
    }

    const history = (instance.lifecycle || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((item) => {

        const warrantyDate = instance.warranty?.expiryDate || null;

        return {
          action: item.action,

          warrantyDate,

          maintenanceDate: null, // 🔥 you don’t store yet

          location: instance.location,

          assignedPerson:
            instance.assignedTo?.employeeId?.name || "N/A",

          activeService: calculateServiceDays(instance.createdAt),

          score: "N/A", // 🔥 optional feature later

          componentEvolution: item.notes || "No Update",

          recordDate: item.date
        };
      });

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// PUT /instances/:id/upgrade

const upgradeInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const {
      maintenanceCost,
      warrantyRenewalCost,
      insuranceCost,
      newWarrantyExpiry,
      newInsuranceExpiry,
      condition
    } = req.body;

    const instance = await mongoose.model("AssetInstance")
      .findOne({
        _id: id,
        organizationId: req.user.organizationId
      })
      .session(session);

    if (!instance) throw new Error("Instance not found");

    /* =============================
       COST UPDATES
    ============================== */

    if (maintenanceCost) {
      instance.costTracking.maintenanceCost =
        (instance.costTracking.maintenanceCost || 0) + maintenanceCost;
    }

    if (warrantyRenewalCost) {
      instance.costTracking.warrantyRenewalCost =
        (instance.costTracking.warrantyRenewalCost || 0) + warrantyRenewalCost;
    }

    if (insuranceCost) {
      instance.costTracking.insuranceCost =
        (instance.costTracking.insuranceCost || 0) + insuranceCost;
    }

    /* =============================
       WARRANTY / INSURANCE
    ============================== */

    if (newWarrantyExpiry) {
      instance.warranty.expiryDate = newWarrantyExpiry;
      instance.warranty.status = "active";
    }

    if (newInsuranceExpiry) {
      instance.insurance.expiryDate = newInsuranceExpiry;
    }

    /* =============================
       CONDITION
    ============================== */

    if (condition) {
      instance.condition = condition;
    }

    /* =============================
       LIFECYCLE LOG
    ============================== */

    instance.lifecycle.push({
      action: "UPGRADE",
      from: null,
      to: {
        employeeName: instance.assignedTo?.employeeName || null,
        departmentName: instance.assignedTo?.departmentName || null
      },
      date: new Date(),
      notes: "Upgrade applied"
    });

    await instance.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Instance upgraded successfully",
      data: instance
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
    getInstanceHistory,
    upgradeInstance,
    getTrackedInstances
}