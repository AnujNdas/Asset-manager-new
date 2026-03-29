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
      .lean();

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Instance not found"
      });
    }

    /* =============================
       HELPERS
    ============================== */

    const formatDate = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d)) return "-";
      return d.toLocaleDateString("en-GB"); // 11/05/2026
    };

    const getServiceDays = (startDate) => {
      if (!startDate) return "-";
      const diff = Date.now() - new Date(startDate).getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + " Days";
    };

    /* =============================
       BUILD SNAPSHOT-BASED HISTORY
    ============================== */

const history = (instance.lifecycle || [])
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map((item) => {
    const snap = item.snapshot || {};

    return {
      action: item.action,

      warrantyDate: formatDate(
        snap.warrantyExpiry
      ),

      maintenanceDate:
        item.action === "MAINTENANCE"
          ? formatDate(item.date)
          : "-",

      location:
        typeof snap.location === "object"
          ? snap.location?.name
          : snap.location || "-",

      assignedPerson:
        snap.assignedTo?.employee?.name ||   // future-safe
        snap.assignedTo?.employeeName ||     // current DB
        "-",

      activeService: getServiceDays(instance.createdAt),

      score: "N/A",

      componentEvolution: item.notes || "-",

      recordDate: formatDate(item.date)
    };
  });

    res.status(200).json({
      success: true,
      count: history.length,
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
  to: null,

  snapshot: {
    location: instance.location,

    assignedTo: {
      employeeName: instance.assignedTo?.employeeName,
      departmentName: instance.assignedTo?.departmentName
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

  notes: "Asset upgraded"
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