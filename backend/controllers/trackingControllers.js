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

    // ✅ Extract QR
    const qrCode =
      inst.assetType === "hardware"
        ? inst.hardware?.qrCode || null
        : null;

    // ✅ Add tracking URL
    const trackingUrl = `${process.env.FRONTEND_URL}/track/${inst._id}`;

    return {
      ...inst,

      // 🔥 NEW FIELDS
      qrCode,
      trackingUrl,

assignment: assignment
  ? {
      _id: assignment._id,

      employee: {
        name: assignment.employeeId?.name,
        code: assignment.employeeId?.employeeCode,
        _id: assignment.employeeId?._id
      },

      department: {
        _id: assignment.departmentId?._id,
        name: assignment.departmentId?.name
      },

      location: assignment.location,

      assignedAt: assignment.assignedAt,

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
       HELPERS
    ============================== */

    const formatDate = (date) => {
      if (!date) return "-";

      const d = new Date(date);

      return isNaN(d)
        ? "-"
        : d.toLocaleDateString("en-GB");
    };

    const getServiceDays = (startDate) => {
      if (!startDate) return "-";

      const diff =
        Date.now() - new Date(startDate).getTime();

      return (
        Math.floor(
          diff / (1000 * 60 * 60 * 24)
        ) + " Days"
      );
    };

    const getActiveScore = (instance) => {
      let score = 100;

      const created = new Date(instance.createdAt);

      const ageDays =
        (Date.now() - created.getTime()) /
        (1000 * 60 * 60 * 24);

      if (ageDays > 365) score -= 20;
      else if (ageDays > 180) score -= 10;

      if (instance.condition === "used")
        score -= 10;

      if (instance.condition === "damaged")
        score -= 30;

      const next =
        instance.hardware?.nextMaintenanceDate;

      if (next) {
        const today = new Date();
        const due = new Date(next);

        if (due < today) score -= 25;

        else if (
          (due - today) /
            (1000 * 60 * 60 * 24) <=
          30
        ) {
          score -= 10;
        }
      }

      const warranty =
        instance.hardware?.warrantyExpiry;

      if (
        warranty &&
        new Date(warranty) < new Date()
      ) {
        score -= 15;
      }

      return Math.max(score, 0);
    };

    /* =============================
       MAINTENANCE STATUS
    ============================== */

    const next =
      instance.hardware?.nextMaintenanceDate;

    let maintenanceStatus = "-";

    if (next) {
      const today = new Date();
      const due = new Date(next);

      if (due < today)
        maintenanceStatus = "overdue";

      else if (
        (due - today) /
          (1000 * 60 * 60 * 24) <=
        30
      ) {
        maintenanceStatus = "due_soon";
      } else {
        maintenanceStatus = "scheduled";
      }
    }

    /* =============================
       MAP LIFECYCLE
    ============================== */

/* =============================
   MAP LIFECYCLE
============================== */

const history = (instance.lifecycle || [])
  .map((item) => {
    const isoDate = item.date
      ? new Date(item.date)
      : null;

    const meta = item.metadata || {};
    const snapshot = meta.snapshot || {};
    /* =============================
   HISTORICAL SNAPSHOT
============================= */

const snapshotDates =
  meta.to?.dates ||
  meta.from?.dates ||
  meta.dates ||
  {};

const snapshotCosts =
  meta.to?.costs ||
  meta.from?.costs ||
  meta.costs ||
  {};
    return {  
      /* =============================
         CORE
      ============================== */

      action:
        item.eventType?.toUpperCase() || "-",

      category: item.category || "-",

      title: item.title || "-",

      description:
        item.description || "-",

      recordDate: formatDate(item.date),

      recordDateISO: isoDate,

      /* =============================
         INSTANCE
      ============================== */

      instanceCode:
        meta.instanceCode ||
        instance.instanceCode,

      assetType:
        meta.assetType ||
        instance.assetType,

      deviceName:
        meta.deviceName ||
        instance.deviceName ||
        "-",

      location:
        meta.to?.location ||       // reassigned/assigned location
        meta.location ||           // direct location snapshot
        instance.location ||       // fallback
        "-",

      status:
        meta.status ||
        instance.status ||
        "-",

condition:
  item.eventType === "upgraded"
    ? meta.upgrade?.newCondition
    : meta.to?.condition ||
      meta.condition ||
      instance.condition ||
      "-",
      /* =============================
         HARDWARE
      ============================== */
hardware: instance.hardware
  ? {
      serialNumber:
        snapshot.hardware?.serialNumber ||
        meta.serialNumber ||
        instance.hardware?.serialNumber ||
        "-",

      modelNo:
        snapshot.hardware?.modelNo ||
        meta.modelNo ||
        instance.hardware?.modelNo ||
        "-",

      warrantyExpiry: formatDate(
        snapshot.hardware?.warrantyExpiry ||
        snapshotDates.warrantyExpiry ||
        instance.hardware?.warrantyExpiry
      ),

      nextMaintenanceDate: formatDate(
        snapshot.hardware?.nextMaintenanceDate ||
        snapshotDates.maintenanceDate ||
        instance.hardware?.nextMaintenanceDate
      ),

      maintenanceStatus,

      maintenanceCost:
        snapshot.hardware?.costs?.maintenanceCost?.amount ??
        snapshotCosts.maintenanceCost ??
        instance.hardware?.costs?.maintenanceCost?.amount ??
        null
    }
  : null,

      /* =============================
         SOFTWARE
      ============================== */

software: instance.software
  ? {
      licenseNumber:
        snapshot.software?.licenseNumber ||
        meta.licenseNumber ||
        instance.software?.licenseNumber ||
        "-",

      renewalDate: formatDate(
        snapshot.software?.renewalDate ||
        snapshotDates.renewalDate ||
        instance.software?.renewalDate
      ),

      renewalCost:
        snapshot.software?.costs?.renewalCost?.amount ??
        snapshotCosts.renewalCost ??
        instance.software?.costs?.renewalCost?.amount ??
        null
    }
  : null,
/* =============================
   ASSIGNMENT
============================== */

/* =============================
   ASSIGNMENT
============================== */

from: meta.from || null,

to: meta.to || null,

assignedTo:
  meta.to?.assignedTo ||
  meta.to ||                  // ✅ IMPORTANT
  meta.assignedTo ||
  null,

reassignedFrom:
  meta.from ||                // ✅ IMPORTANT
  meta.reassignedFrom ||
  null,

deviceInfo:
  meta.deviceInfo || null,

      /* =============================
         UPGRADE
      ============================== */

upgrade: {
  description: meta.upgradeDescription || null,
  previousCondition:
    meta.upgrade?.previousCondition || null,
  newCondition:
    meta.upgrade?.newCondition || null
},

      /* =============================
         HEALTH
      ============================== */

      activeScore:
        getActiveScore(instance),

      activeService: getServiceDays(
        instance.assetType === "hardware"
          ? instance.hardware?.installationDate
          : instance.software?.installationDate
      )
    };
  })

  .sort((a, b) => {
    if (!a.recordDateISO) return 1;
    if (!b.recordDateISO) return -1;

    return b.recordDateISO - a.recordDateISO;
  })

  .map(({ recordDateISO, ...rest }) => rest);

    /* =============================
       FINAL RESPONSE
    ============================== */

    res.status(200).json({
      success: true,

      count: history.length,

      summary: {
        instanceCode: instance.instanceCode,
        purchaseDate:
    instance.assetType === "hardware"
      ? formatDate(instance.hardware?.purchaseDate)
      : formatDate(instance.software?.purchaseDate),

  installationDate:
    instance.assetType === "hardware"
      ? formatDate(instance.hardware?.installationDate)
      : formatDate(instance.software?.installationDate),

        assetType: instance.assetType,

        status: instance.status,

        condition: instance.condition,

        activeScore:
          getActiveScore(instance),

        activeService:
          getServiceDays(
            instance.assetType === "hardware"
              ? instance.hardware?.installationDate
              : instance.software?.installationDate
          )
      },

      data: history
    });

  } catch (error) {
    console.error(
      "History Error:",
      error.message
    );

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

      // 🔹 Hardware Costs
      maintenanceCost,
      warrantyRenewalCost,
      insuranceCost,
      // 🔹 Software Cost
      renewalCost,
      upgradeDate,   // ✅ NEW
      // 🔹 Hardware Dates
      hasInsurance,
      insuranceTerm,
      newWarrantyExpiry,
      newInsuranceExpiry,
      newMaintenanceDate,
      newInstallationDate,
      newWarrantyPurchaseDate,     // ✅ ADDED
      newInsurancePurchaseDate,    // ✅ ADDED

      // 🔹 Software Dates
      newRenewalDate,
      newLastUsedDate,
      upgradeDescription,
      upgradeNotes, 
      // 🔹 Common
      condition
    } = req.body;

    const instance = await mongoose.model("AssetInstance")
      .findOne({
        _id: id,
        organizationId: req.user.organizationId
      })
      .session(session);

    if (!instance) throw new Error("Instance not found");

    const isHardware = !!instance.hardware;
    const isSoftware = !!instance.software;

    /* =============================
       🟡 HELPER (Normalize old data)
    ============================== */
const normalizeCost = (val) => {
  if (!val) return 0;

  if (typeof val === "object") {
    return Number(val.amount) || 0;
  }

  return Number(val) || 0;
};
    /* =============================
       🟡 BEFORE SNAPSHOT
    ============================== */
    const beforeSnapshot = {
      condition: instance.condition,

      dates: {
        warrantyPurchaseDate: instance.hardware?.warrantyPurchaseDate || null,
        warrantyExpiry: instance.hardware?.warrantyExpiry || null,
        insurancePurchaseDate: instance.hardware?.insurancePurchaseDate || null,
        insuranceExpiry: instance.hardware?.insuranceExpiry || null,
        maintenanceDate: instance.hardware?.nextMaintenanceDate || null,
        installationDate:
          instance.hardware?.installationDate ||
          instance.software?.installationDate ||
          null,

        renewalDate: instance.software?.renewalDate || null,
        lastUsedDate: instance.software?.lastUsedDate || null
      },

      costs: {
        maintenanceCost: normalizeCost(instance.hardware?.costs?.maintenanceCost),
        warrantyRenewalCost: normalizeCost(instance.hardware?.costs?.warrantyRenewalCost),
        insuranceCost: normalizeCost(instance.hardware?.costs?.insuranceCost),
        renewalCost: normalizeCost(instance.software?.costs?.renewalCost)
      }
    };

    /* =============================
       🟢 APPLY UPDATES
    ============================== */

    // ✅ CONDITION
    if (condition) instance.condition = condition;

    /* ---------- HARDWARE ---------- */
    if (isHardware) {
      instance.hardware = instance.hardware || {};
      instance.hardware.costs = instance.hardware.costs || {};

      // 💰 Costs (NUMBERS ONLY)
      if (maintenanceCost !== undefined) {
        instance.hardware.costs.maintenanceCost = {
  amount: Number(maintenanceCost) || 0,
  currency: "USD"
};
      }

      if (warrantyRenewalCost !== undefined) {
        instance.hardware.costs.warrantyRenewalCost = {
  amount: Number(warrantyRenewalCost) || 0,
  currency: "USD"
};
}
      // 📅 Dates
      if (newWarrantyPurchaseDate) {
        instance.hardware.warrantyPurchaseDate = newWarrantyPurchaseDate;
      }

      if (newWarrantyExpiry) {
        instance.hardware.warrantyExpiry = newWarrantyExpiry;
      }

      /* ---------- INSURANCE LOGIC ---------- */

// ✅ Toggle insurance
if (hasInsurance !== undefined) {
  instance.hardware.hasInsurance = hasInsurance;
}

// ❌ If insurance is turned OFF → wipe data
if (hasInsurance === false) {
  instance.hardware.insuranceTerm = undefined;
  instance.hardware.insurancePurchaseDate = undefined;
  instance.hardware.insuranceExpiry = undefined;
  instance.hardware.costs.insuranceCost = {
  amount: 0,
  currency: "USD"
};
}

// ✅ If insurance is ON → apply logic
if (hasInsurance === true) {
  if (insuranceTerm) {
    instance.hardware.insuranceTerm = insuranceTerm;
  }

  if (newInsurancePurchaseDate) {
    instance.hardware.insurancePurchaseDate = newInsurancePurchaseDate;

    // 🔥 AUTO CALCULATE EXPIRY
    const purchaseDate = new Date(newInsurancePurchaseDate);
    let expiry = new Date(purchaseDate);

    switch (insuranceTerm || instance.hardware.insuranceTerm) {
      case "6_months":
        expiry.setMonth(expiry.getMonth() + 6);
        break;
      case "1_year":
        expiry.setFullYear(expiry.getFullYear() + 1);
        break;
      case "3_years":
        expiry.setFullYear(expiry.getFullYear() + 3);
        break;
      default:
        break;
    }

    instance.hardware.insuranceExpiry = expiry;
  }

  // Optional manual override (if provided)
  if (newInsuranceExpiry) {
    instance.hardware.insuranceExpiry = newInsuranceExpiry;
  }
  if (insuranceCost !== undefined) {
  instance.hardware.costs.insuranceCost = {
    amount: Number(insuranceCost) || 0,
    currency: "USD"
  };
}
}
      if (newMaintenanceDate) {
        instance.hardware.nextMaintenanceDate = newMaintenanceDate;
      }

      if (newInstallationDate) {
        instance.hardware.installationDate = newInstallationDate;
      }
    }

    /* ---------- SOFTWARE ---------- */
    if (isSoftware) {
      instance.software = instance.software || {};
      instance.software.costs = instance.software.costs || {};

      // 💰 Cost
      if (renewalCost !== undefined) {
        instance.software.costs.renewalCost = {
  amount: Number(renewalCost) || 0,
  currency: "USD"
};
      }
      // 📅 Dates
      if (newRenewalDate) {
        instance.software.renewalDate = newRenewalDate;
      }

      if (newLastUsedDate) {
        instance.software.lastUsedDate = newLastUsedDate;
      }

      if (newInstallationDate) {
        instance.software.installationDate = newInstallationDate;
      }
    }

    /* =============================
       🔵 AFTER SNAPSHOT
    ============================== */
    const afterSnapshot = {
      condition: instance.condition,

      dates: {
        warrantyPurchaseDate: instance.hardware?.warrantyPurchaseDate || null,
        warrantyExpiry: instance.hardware?.warrantyExpiry || null,
        insurancePurchaseDate: instance.hardware?.insurancePurchaseDate || null,
        insuranceExpiry: instance.hardware?.insuranceExpiry || null,
        maintenanceDate: instance.hardware?.nextMaintenanceDate || null,
        installationDate:
          instance.hardware?.installationDate ||
          instance.software?.installationDate ||
          null,

        renewalDate: instance.software?.renewalDate || null,
        lastUsedDate: instance.software?.lastUsedDate || null
      },

      costs: {
        maintenanceCost: normalizeCost(instance.hardware?.costs?.maintenanceCost),
        warrantyRenewalCost: normalizeCost(instance.hardware?.costs?.warrantyRenewalCost),
        insuranceCost: normalizeCost(instance.hardware?.costs?.insuranceCost),
        renewalCost: normalizeCost(instance.software?.costs?.renewalCost)
      }
    };
    const effectiveUpgradeDate =
upgradeDate && !isNaN(new Date(upgradeDate))
  ? new Date(upgradeDate)
  : new Date();
    if (upgradeDescription && upgradeDescription.trim()) {
      instance.upgrades = instance.upgrades || [];
instance.upgrades.push({
  description: upgradeDescription.trim(),
  performedBy: req.user.id,
  date: effectiveUpgradeDate,
  notes: upgradeNotes || ""
});
const upgradeCost = {
  maintenanceCost: Number(maintenanceCost) || 0,
  warrantyRenewalCost: Number(warrantyRenewalCost) || 0,
  insuranceCost: Number(insuranceCost) || 0,
  renewalCost: Number(renewalCost) || 0
};

upgradeCost.total =
  upgradeCost.maintenanceCost +
  upgradeCost.warrantyRenewalCost +
  upgradeCost.insuranceCost +
  upgradeCost.renewalCost;
    }
    /* ===========  ==================
       🟣 LIFECYCLE ENTRY
    ============================== */
/* ==============================
   🟣 LIFECYCLE ENTRY
============================== */

instance.lifecycle.push({
  eventType: "upgraded",
  category: "instance",

  title: "Instance Upgraded",

  description:
    upgradeDescription ||
    "Instance upgrade performed",

  performedBy: req.user.id,

  action: "UPGRADE",


  from: beforeSnapshot,

  to: {
    condition: afterSnapshot.condition,

    location: instance.location,

    assignedTo: {
      employeeId: instance.assignedTo?.employeeId || null,
      employeeName: instance.assignedTo?.employeeName || "-"
    },

    hardware: isHardware
      ? {
          warrantyPurchaseDate:
            instance.hardware?.warrantyPurchaseDate || null,

          warrantyExpiry:
            instance.hardware?.warrantyExpiry || null,

          insurancePurchaseDate:
            instance.hardware?.insurancePurchaseDate || null,

          insuranceExpiry:
            instance.hardware?.insuranceExpiry || null,

          nextMaintenanceDate:
            instance.hardware?.nextMaintenanceDate || null,

          installationDate:
            instance.hardware?.installationDate || null,

          hasInsurance:
            instance.hardware?.hasInsurance || false,

          insuranceTerm:
            instance.hardware?.insuranceTerm || null,

          costs: {
            maintenanceCost:
              instance.hardware?.costs?.maintenanceCost || null,

            warrantyRenewalCost:
              instance.hardware?.costs?.warrantyRenewalCost || null,

            insuranceCost:
              instance.hardware?.costs?.insuranceCost || null
          }
        }
      : undefined,

    software: isSoftware
      ? {
          renewalDate:
            instance.software?.renewalDate || null,

          lastUsedDate:
            instance.software?.lastUsedDate || null,

          installationDate:
            instance.software?.installationDate || null,

          costs: {
            renewalCost:
              instance.software?.costs?.renewalCost || null
          }
        }
      : undefined
  },

 date: effectiveUpgradeDate,
  notes: upgradeNotes || "Asset upgraded",

metadata: {
  upgradedBy: req.user.id,

  upgradeDescription:
    upgradeDescription || "General upgrade",

  upgradeDate: effectiveUpgradeDate,
  upgradeCost,
  from: beforeSnapshot,

  to: afterSnapshot,

  upgrade: {
    previousCondition: beforeSnapshot.condition,
    newCondition: afterSnapshot.condition
  }
}
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
    getTrackedInstances,
    getInstanceHistory
}