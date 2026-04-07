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

    const instanceIds = instances.map(i => i._id);

    /* =============================
       FETCH ACTIVE ASSIGNMENTS
    ============================== */

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
       MAP ASSIGNMENTS
    ============================== */

    const assignmentMap = {};

    assignments.forEach((a) => {
      assignmentMap[a.assetInstanceId.toString()] = a;
    });

    /* =============================
       ENRICH INSTANCES
    ============================== */

    const enrichedInstances = instances.map((inst) => {
      const assignment = assignmentMap[inst._id.toString()];

      return {
        ...inst,

        assignment: assignment
          ? {
              employee: {
                name: assignment.employeeId?.name,
                code: assignment.employeeId?.employeeCode
              },
              department: assignment.departmentId?.name,
              location: assignment.location,
              assignedAt: assignment.assignedAt,

              // ✅ NEW: DEVICE INFO FROM USER INPUT
              deviceInfo: {
                deviceName: assignment.deviceInfo?.deviceName || null,
                assetTag: assignment.deviceInfo?.assetTag || null,
                serialNumber: assignment.deviceInfo?.serialNumber || null
              }
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
       FETCH ASSIGNMENTS (NEW)
    ============================== */

    const assignments = await mongoose.model("AssetAssignment")
      .find({
        assetInstanceId: id
      })
      .populate("employeeId", "name")
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .lean();

    /* =============================
       HELPERS
    ============================== */

    const formatDate = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d)) return "-";
      return d.toLocaleDateString("en-GB");
    };

    const getServiceDays = (startDate) => {
      if (!startDate) return "-";
      const diff = Date.now() - new Date(startDate).getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + " Days";
    };

    /* =============================
       MAP LIFECYCLE
    ============================== */

    const lifecycleHistory = (instance.lifecycle || []).map((item) => {
      const snap = item.snapshot || {};

      return {
        type: "lifecycle",

        action: item.action,
        recordDate: formatDate(item.date),

        location:
          typeof snap.location === "object"
            ? snap.location?.name
            : snap.location || "-",

        condition: snap.condition || "-",

        notes: item.notes || "-",

        /* 🔧 HARDWARE SAFE */
        warrantyDate: formatDate(snap.warrantyExpiry),

        /* 🔧 SOFTWARE SAFE */
        licenseNumber: snap.licenseNumber || "-",

        /* ASSIGNED PERSON (fallback safe) */
        assignedPerson:
          snap.assignedTo?.employee?.name ||
          snap.assignedTo?.employeeName ||
          "-",

        activeService: getServiceDays(instance.createdAt)
      };
    });

    /* =============================
       MAP ASSIGNMENTS (NEW SOURCE)
    ============================== */

    const assignmentHistory = assignments.map((a) => ({
      type: "assignment",

      action: a.status.toUpperCase(), // active / returned / transferred

      recordDate: formatDate(a.assignedAt),

      location: a.location || "-",

      assignedPerson: a.employeeId?.name || "-",
      department: a.departmentId?.name || "-",

      /* 🔥 DEVICE INFO (NEW CORE FEATURE) */
      deviceName: a.deviceInfo?.deviceName || "-",
      deviceTag: a.deviceInfo?.assetTag || "-",

      status: a.status,

      returnedAt: formatDate(a.returnedAt)
    }));

    /* =============================
       MERGE + SORT
    ============================== */

    const history = [...lifecycleHistory, ...assignmentHistory]
      .sort((a, b) => {
        const d1 = new Date(a.recordDate.split("/").reverse().join("-"));
        const d2 = new Date(b.recordDate.split("/").reverse().join("-"));
        return d2 - d1;
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
      renewalCost, // ✅ software
      currency = "INR", // ✅ NEW

      newWarrantyExpiry,
      newInsuranceExpiry,
      newRenewalDate, // ✅ software

      condition
    } = req.body;

    const instance = await mongoose.model("AssetInstance")
      .findOne({
        _id: id,
        organizationId: req.user.organizationId
      })
      .session(session);

    if (!instance) {
      throw new Error("Instance not found");
    }

    const isHardware = !!instance.hardware;
    const isSoftware = !!instance.software;

    /* =============================
       🟡 BEFORE SNAPSHOT
    ============================== */

    const beforeSnapshot = {
      condition: instance.condition,

      warrantyExpiry:
        instance.hardware?.warrantyExpiry || null,

      insuranceExpiry:
        instance.hardware?.insuranceExpiry || null,

      renewalDate:
        instance.software?.renewalDate || null,

      costs: {
        maintenanceCost:
          instance.hardware?.costs?.maintenanceCost || 0,

        warrantyRenewalCost:
          instance.hardware?.costs?.warrantyRenewalCost || 0,

        insuranceCost:
          instance.hardware?.costs?.insuranceCost || 0,

        renewalCost:
          instance.software?.costs?.renewalCost || 0
      }
    };

    /* =============================
       🟢 COST UPDATES (WITH CURRENCY)
    ============================== */

    if (isHardware) {
      instance.hardware.costs = instance.hardware.costs || {};

      if (maintenanceCost !== undefined) {
        instance.hardware.costs.maintenanceCost = {
          amount: Number(maintenanceCost),
          currency
        };
      }

      if (warrantyRenewalCost !== undefined) {
        instance.hardware.costs.warrantyRenewalCost = {
          amount: Number(warrantyRenewalCost),
          currency
        };
      }

      if (insuranceCost !== undefined) {
        instance.hardware.costs.insuranceCost = {
          amount: Number(insuranceCost),
          currency
        };
      }
    }

    if (isSoftware) {
      instance.software.costs = instance.software.costs || {};

      if (renewalCost !== undefined) {
        instance.software.costs.renewalCost = {
          amount: Number(renewalCost),
          currency
        };
      }
    }

    /* =============================
       🟢 DATE UPDATES
    ============================== */

    if (isHardware) {
      if (newWarrantyExpiry) {
        instance.hardware.warrantyExpiry = newWarrantyExpiry;
      }

      if (newInsuranceExpiry) {
        instance.hardware.insuranceExpiry = newInsuranceExpiry;
      }
    }

    if (isSoftware) {
      if (newRenewalDate) {
        instance.software.renewalDate = newRenewalDate;
      }
    }

    /* =============================
       🟢 CONDITION
    ============================== */

    if (condition) {
      instance.condition = condition;
    }

    /* =============================
       🔵 AFTER SNAPSHOT
    ============================== */

    const afterSnapshot = {
      condition: instance.condition,

      warrantyExpiry:
        instance.hardware?.warrantyExpiry || null,

      insuranceExpiry:
        instance.hardware?.insuranceExpiry || null,

      renewalDate:
        instance.software?.renewalDate || null,

      costs: {
        maintenanceCost:
          instance.hardware?.costs?.maintenanceCost || 0,

        warrantyRenewalCost:
          instance.hardware?.costs?.warrantyRenewalCost || 0,

        insuranceCost:
          instance.hardware?.costs?.insuranceCost || 0,

        renewalCost:
          instance.software?.costs?.renewalCost || 0
      }
    };

    /* =============================
       🟣 LIFECYCLE ENTRY
    ============================== */

    instance.lifecycle.push({
      action: "UPGRADE",

      from: beforeSnapshot,
      to: afterSnapshot,

      snapshot: {
        location: instance.location,

        assignedTo: {
          employeeName: instance.assignedTo?.employeeName,
          departmentName: instance.assignedTo?.departmentName
        },

        /* 🔥 ADD COST SNAPSHOT */
        costs: afterSnapshot.costs
      },

      date: new Date(),
      notes: "Asset upgraded"
    });

    /* =============================
       💾 SAVE
    ============================== */

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