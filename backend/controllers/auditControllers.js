const AssetInstance = require("../models/AssetInstance");

const getAuditDashboard = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const instances = await AssetInstance.find({
      organizationId
    }).lean();

    const now = new Date();

    const stats = {
      totalAssets: 0,

      auditedAssets: 0,
      failedAssets: 0,

      missingAssets: 0,
      brokenAssets: 0,

      warrantyExpired: 0,
      insuranceExpired: 0,
      maintenanceDue: 0,

      assignedAssets: 0,
      unassignedAssets: 0,

      totalPurchaseCost: 0,
      totalMaintenanceCost: 0,
      totalInsuranceCost: 0,
      totalRenewalCost: 0,
      totalUpgradeCost: 0
    };

    stats.totalAssets = instances.length;

    for (const inst of instances) {

      /* =========================
         CONDITION
      ========================= */

      if (
        inst.condition === "stolen"
      ) {
        stats.missingAssets++;
      }

      if (
        inst.condition === "broken"
      ) {
        stats.brokenAssets++;
      }

      /* =========================
         ASSIGNMENT
      ========================= */

      if (
        inst.assignedTo?.employeeId
      ) {
        stats.assignedAssets++;
      } else {
        stats.unassignedAssets++;
      }

      /* =========================
         HARDWARE
      ========================= */

      if (inst.hardware) {

        if (
          inst.hardware.warrantyExpiry &&
          new Date(
            inst.hardware.warrantyExpiry
          ) < now
        ) {
          stats.warrantyExpired++;
        }

        if (
          inst.hardware.insuranceExpiry &&
          new Date(
            inst.hardware.insuranceExpiry
          ) < now
        ) {
          stats.insuranceExpired++;
        }

        if (
          inst.hardware.nextMaintenanceDate &&
          new Date(
            inst.hardware.nextMaintenanceDate
          ) <= now
        ) {
          stats.maintenanceDue++;
        }

        stats.totalPurchaseCost +=
          Number(
            inst.hardware?.purchaseCost?.amount
          ) || 0;

        stats.totalMaintenanceCost +=
          Number(
            inst.hardware?.costs?.maintenanceCost?.amount
          ) || 0;

        stats.totalInsuranceCost +=
          Number(
            inst.hardware?.costs?.insuranceCost?.amount
          ) || 0;
      }

      /* =========================
         SOFTWARE
      ========================= */

      if (inst.software) {

        stats.totalPurchaseCost +=
          Number(
            inst.software?.purchaseCost?.amount
          ) || 0;

        stats.totalRenewalCost +=
          Number(
            inst.software?.costs?.renewalCost?.amount
          ) || 0;
      }

      /* =========================
         UPGRADE COST
      ========================= */

      if (
        Array.isArray(inst.upgrades)
      ) {
        for (const up of inst.upgrades) {

          stats.totalUpgradeCost +=
            Number(
              up?.cost?.amount
            ) || 0;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getFinancialAudit = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const instances = await AssetInstance.find({
      organizationId
    }).lean();

    const financial = {
      summary: {
        purchaseCost: 0,
        maintenanceCost: 0,
        insuranceCost: 0,
        renewalCost: 0,
        warrantyCost: 0,
        upgradeCost: 0,
        totalOwnershipCost: 0
      },

      breakdown: {
        hardware: {
          purchaseCost: 0,
          maintenanceCost: 0,
          insuranceCost: 0,
          warrantyCost: 0,
          upgradeCost: 0
        },

        software: {
          purchaseCost: 0,
          renewalCost: 0,
          upgradeCost: 0
        }
      },

      topExpensiveAssets: []
    };

    const assetCosts = [];

    for (const inst of instances) {

      let totalAssetCost = 0;

      /* =====================
         HARDWARE
      ===================== */

      if (inst.hardware) {

        const purchase =
          Number(
            inst.hardware?.purchaseCost?.amount
          ) || 0;

        const maintenance =
          Number(
            inst.hardware?.costs?.maintenanceCost?.amount
          ) || 0;

        const insurance =
          Number(
            inst.hardware?.costs?.insuranceCost?.amount
          ) || 0;

        const warranty =
          Number(
            inst.hardware?.costs?.warrantyRenewalCost?.amount
          ) || 0;

        financial.summary.purchaseCost += purchase;
        financial.summary.maintenanceCost += maintenance;
        financial.summary.insuranceCost += insurance;
        financial.summary.warrantyCost += warranty;

        financial.breakdown.hardware.purchaseCost += purchase;
        financial.breakdown.hardware.maintenanceCost += maintenance;
        financial.breakdown.hardware.insuranceCost += insurance;
        financial.breakdown.hardware.warrantyCost += warranty;

        totalAssetCost +=
          purchase +
          maintenance +
          insurance +
          warranty;
      }

      /* =====================
         SOFTWARE
      ===================== */

      if (inst.software) {

        const purchase =
          Number(
            inst.software?.purchaseCost?.amount
          ) || 0;

        const renewal =
          Number(
            inst.software?.costs?.renewalCost?.amount
          ) || 0;

        financial.summary.purchaseCost += purchase;
        financial.summary.renewalCost += renewal;

        financial.breakdown.software.purchaseCost += purchase;
        financial.breakdown.software.renewalCost += renewal;

        totalAssetCost +=
          purchase +
          renewal;
      }

      /* =====================
         UPGRADES
      ===================== */

      let upgradeTotal = 0;

      if (Array.isArray(inst.upgrades)) {

        for (const up of inst.upgrades) {

          const amount =
            Number(
              up?.cost?.amount
            ) || 0;

          upgradeTotal += amount;

          financial.summary.upgradeCost += amount;

          if (inst.assetType === "hardware") {
            financial.breakdown.hardware.upgradeCost += amount;
          }

          if (inst.assetType === "software") {
            financial.breakdown.software.upgradeCost += amount;
          }
        }
      }

      totalAssetCost += upgradeTotal;

      assetCosts.push({
        instanceId: inst._id,
        instanceCode: inst.instanceCode,
        deviceName: inst.deviceName || "",
        assetType: inst.assetType,
        totalCost: totalAssetCost
      });
    }

    financial.summary.totalOwnershipCost =
      financial.summary.purchaseCost +
      financial.summary.maintenanceCost +
      financial.summary.insuranceCost +
      financial.summary.renewalCost +
      financial.summary.warrantyCost +
      financial.summary.upgradeCost;

    financial.topExpensiveAssets =
      assetCosts
        .sort(
          (a, b) =>
            b.totalCost - a.totalCost
        )
        .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: financial
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getAuditAssets = async (req, res) => {
  try {
    const {
      type,
      condition,
      status,
      location,
      search,
    } = req.query;

    const query = {
      organizationId: req.user.organizationId,
    };

    if (type) query.assetType = type;
    if (condition) query.condition = condition;
    if (status) query.status = status;

    const instances = await AssetInstance.find(query)
      .populate("assetId", "assetCode assetName")
      .lean();

    const now = new Date();

    const getWarrantyStatus = (expiry) => {
      if (!expiry) return "Not Available";

      const days =
        (new Date(expiry) - now) / (1000 * 60 * 60 * 24);

      if (days < 0) return "Expired";
      if (days <= 30) return "Expiring Soon";

      return "Active";
    };

    const getInsuranceStatus = (expiry, hasInsurance) => {
      if (!hasInsurance) return "Not Insured";
      if (!expiry) return "Not Available";

      const days =
        (new Date(expiry) - now) / (1000 * 60 * 60 * 24);

      if (days < 0) return "Expired";
      if (days <= 30) return "Expiring Soon";

      return "Active";
    };

    const getMaintenanceStatus = (date) => {
      if (!date) return "Not Scheduled";

      const days =
        (new Date(date) - now) / (1000 * 60 * 60 * 24);

      if (days < 0) return "Overdue";
      if (days <= 30) return "Due Soon";

      return "Upcoming";
    };

    const getRenewalStatus = (date) => {
      if (!date) return "Not Available";

      const days =
        (new Date(date) - now) / (1000 * 60 * 60 * 24);

      if (days < 0) return "Expired";
      if (days <= 30) return "Due Soon";

      return "Active";
    };

    let results = instances.map((inst) => {
      const hardware = inst.hardware || {};
      const software = inst.software || {};

      const upgradeCost =
        inst.upgrades?.reduce(
          (sum, up) =>
            sum + (Number(up?.cost?.amount) || 0),
          0
        ) || 0;

      const maintenanceCost =
        Number(
          hardware?.costs?.maintenanceCost?.amount
        ) || 0;

      const insuranceCost =
        Number(
          hardware?.costs?.insuranceCost?.amount
        ) || 0;

      const warrantyCost =
        Number(
          hardware?.costs?.warrantyRenewalCost?.amount
        ) || 0;

      const renewalCost =
        Number(
          software?.costs?.renewalCost?.amount
        ) || 0;

      const purchaseCost =
        Number(
          hardware?.purchaseCost?.amount ||
            software?.purchaseCost?.amount
        ) || 0;

      const totalCost =
        purchaseCost +
        maintenanceCost +
        insuranceCost +
        warrantyCost +
        renewalCost +
        upgradeCost;

      return {
        instanceId: inst._id,

        assetId: inst.assetId?._id,

        assetCode:
          inst.assetId?.assetCode || "-",

        assetName:
          inst.assetId?.assetName ||
          inst.deviceName ||
          "-",

        instanceCode: inst.instanceCode,

        assetType: inst.assetType,

        deviceName: inst.deviceName || "-",

        location: inst.location,

        condition: inst.condition,

        status: inst.status,

        assignedTo:
          inst.assignedTo?.employeeName || null,

        purchaseDate:
          hardware.purchaseDate ||
          software.purchaseDate ||
          null,

        warrantyStatus: getWarrantyStatus(
          hardware.warrantyExpiry
        ),

        insuranceStatus: getInsuranceStatus(
          hardware.insuranceExpiry,
          hardware.hasInsurance
        ),

        maintenanceStatus:
          getMaintenanceStatus(
            hardware.nextMaintenanceDate
          ),

        renewalStatus:
          getRenewalStatus(
            software.renewalDate
          ),

        lastUpgradeDate:
          inst.upgrades?.length > 0
            ? inst.upgrades[
                inst.upgrades.length - 1
              ]?.date
            : null,

        totalCost,
      };
    });

    // Location filter
    if (location) {
      results = results.filter(
        (r) =>
          r.location &&
          r.location
            .toLowerCase()
            .includes(location.toLowerCase())
      );
    }

    // Search filter
    if (search) {
      const term = search.toLowerCase();

      results = results.filter(
        (r) =>
          r.assetCode?.toLowerCase().includes(term) ||
          r.assetName?.toLowerCase().includes(term) ||
          r.instanceCode?.toLowerCase().includes(term) ||
          r.deviceName?.toLowerCase().includes(term)
      );
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getLifecycleAudit = async (req, res) => {
  try {
    const {
      eventType,
      startDate,
      endDate,
      assetType,
      search
    } = req.query;

    const query = {
      organizationId: req.user.organizationId
    };

    if (assetType) {
      query.assetType = assetType;
    }

    const instances = await AssetInstance.find(query)
      .populate("assetId", "assetCode assetName")
      .populate("lifecycle.performedBy", "name email")
      .lean();

    let records = [];

    instances.forEach((instance) => {
      (instance.lifecycle || []).forEach((event) => {
        records.push({
          instanceId: instance._id,

          instanceCode: instance.instanceCode,

          assetCode:
            instance.assetId?.assetCode || "-",

          assetName:
            instance.assetId?.assetName ||
            instance.deviceName ||
            "-",

          assetType: instance.assetType,

          eventType: event.eventType,

          title: event.title,

          description: event.description,

          performedBy:
            event.performedBy?.name ||
            event.performedBy ||
            "System",

          date: event.date,

          before:
            event.metadata?.from || null,

          after:
            event.metadata?.to || null,

          metadata:
            event.metadata || {}
        });
      });
    });

    if (eventType) {
      records = records.filter(
        (r) => r.eventType === eventType
      );
    }

    if (startDate) {
      records = records.filter(
        (r) =>
          new Date(r.date) >=
          new Date(startDate)
      );
    }

    if (endDate) {
      records = records.filter(
        (r) =>
          new Date(r.date) <=
          new Date(endDate)
      );
    }

    if (search) {
      const term = search.toLowerCase();

      records = records.filter(
        (r) =>
          r.assetName
            ?.toLowerCase()
            .includes(term) ||
          r.assetCode
            ?.toLowerCase()
            .includes(term) ||
          r.instanceCode
            ?.toLowerCase()
            .includes(term)
      );
    }

    records.sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
module.exports = {
    getAuditDashboard , 
    getFinancialAudit,
    getAuditAssets,
    getLifecycleAudit
};