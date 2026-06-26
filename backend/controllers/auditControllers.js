const AssetInstance = require("../models/AssetInstance");
const AssetAssignment = require("../models/AssetAssignment");

const getCompleteAuditDashboard = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const [
      assetInstances,
      assignments
    ] = await Promise.all([
      AssetInstance.find({ organizationId })
        .populate("assetId")
        .populate("createdBy", "name email")
        .populate("lifecycle.performedBy", "name email")
        .lean(),

      AssetAssignment.find({ organizationId })
        .populate("employeeId", "name employeeCode email")
        .populate("departmentId", "departmentName")
        .populate("assignedBy", "name")
        .populate("returnedBy", "name")
        .lean()
    ]);

    const now = new Date();

    const response = {
      summary: {},
      financial: {},
      assets: [],
      assignments: [],
      warranty: [],
      insurance: [],
      maintenance: [],
      lifecycle: [],
      departments: [],
      topExpensiveAssets: [],
      charts: {}
    };

    let stats = {
      totalAssets: 0,
      assignedAssets: 0,
      unassignedAssets: 0,
      maintenanceDue: 0,
      warrantyExpired: 0,
      insuranceExpired: 0,
      brokenAssets: 0,
      missingAssets: 0,
      purchaseCost: 0,
      maintenanceCost: 0,
      insuranceCost: 0,
      renewalCost: 0,
      warrantyCost: 0,
      upgradeCost: 0
    };

    let expensiveAssets = [];

    const departmentMap = {};
    const assetLookup = {};

    for (const inst of assetInstances) {

      const hardware = inst.hardware || {};
      const software = inst.software || {};

      const purchaseCost =
        Number(
          hardware.purchaseCost?.amount ||
          software.purchaseCost?.amount
        ) || 0;

      const maintenanceCost =
        Number(
          hardware.costs?.maintenanceCost?.amount
        ) || 0;

      const insuranceCost =
        Number(
          hardware.costs?.insuranceCost?.amount
        ) || 0;

      const warrantyCost =
        Number(
          hardware.costs?.warrantyRenewalCost?.amount
        ) || 0;

      const renewalCost =
        Number(
          software.costs?.renewalCost?.amount
        ) || 0;

      const upgradeCost =
        (inst.upgrades || []).reduce(
          (sum, up) =>
            sum +
            (Number(up.cost?.amount) || 0),
          0
        );

      const totalCost =
        purchaseCost +
        maintenanceCost +
        insuranceCost +
        warrantyCost +
        renewalCost +
        upgradeCost;

      stats.totalAssets++;

      stats.purchaseCost += purchaseCost;
      stats.maintenanceCost += maintenanceCost;
      stats.insuranceCost += insuranceCost;
      stats.renewalCost += renewalCost;
      stats.warrantyCost += warrantyCost;
      stats.upgradeCost += upgradeCost;

      if (inst.condition === "broken")
        stats.brokenAssets++;

      if (
        inst.condition === "missing" ||
        inst.condition === "stolen"
      )
        stats.missingAssets++;

      if (
        hardware.warrantyExpiry &&
        new Date(
          hardware.warrantyExpiry
        ) < now
      ) {
        stats.warrantyExpired++;

        response.warranty.push({
          instanceId: inst._id,
          instanceCode: inst.instanceCode,
          assetName:
            inst.assetId?.assetName,
          deviceName: inst.deviceName,
          expiryDate:
            hardware.warrantyExpiry,
          location: inst.location,
          condition: inst.condition,
          totalCost
        });
      }

      if (
        hardware.insuranceExpiry &&
        new Date(
          hardware.insuranceExpiry
        ) < now
      ) {
        stats.insuranceExpired++;

        response.insurance.push({
          instanceId: inst._id,
          instanceCode: inst.instanceCode,
          assetName:
            inst.assetId?.assetName,
          deviceName: inst.deviceName,
          insuranceExpiry:
            hardware.insuranceExpiry,
          coverageType:
            hardware.coverageType,
          location: inst.location,
          totalCost
        });
      }

      if (
        hardware.nextMaintenanceDate &&
        new Date(
          hardware.nextMaintenanceDate
        ) <= now
      ) {
        stats.maintenanceDue++;

        response.maintenance.push({
          instanceId: inst._id,
          assetName:
            inst.assetId?.assetName,
          instanceCode:
            inst.instanceCode,
          nextMaintenanceDate:
            hardware.nextMaintenanceDate,
          maintenanceCost,
          location: inst.location,
          condition: inst.condition
        });
      }
      assetLookup[inst._id.toString()] = {
    instanceId: inst._id,
    assetCode: inst.assetId?.assetCode,
    assetName: inst.assetId?.assetName,
    instanceCode: inst.instanceCode,
    assetType: inst.assetType,
    deviceName: inst.deviceName,
    location: inst.location,
    condition: inst.condition,
    status: inst.status,
    purchaseCost,
    maintenanceCost,
    insuranceCost,
    warrantyCost,
    renewalCost,
    upgradeCost,
    totalCost
};  
      response.assets.push({
        instanceId: inst._id,

        assetCode:
          inst.assetId?.assetCode,

        assetName:
          inst.assetId?.assetName,

        instanceCode:
          inst.instanceCode,

        assetType:
          inst.assetType,

        deviceName:
          inst.deviceName,

        location:
          inst.location,

        condition:
          inst.condition,

        status:
          inst.status,

        purchaseDate:
          hardware.purchaseDate ||
          software.purchaseDate,

        purchaseCost,

        maintenanceCost,

        insuranceCost,

        warrantyCost,

        renewalCost,

        upgradeCost,

        totalCost,

        serialNumber:
          hardware.serialNumber,

        modelNo:
          hardware.modelNo,

        specifications:
          hardware.specifications,

        licenseKey:
          software.licenseKey,

        licenseNumber:
          software.licenseNumber
      });

      expensiveAssets.push({
        instanceId: inst._id,
        assetName:
          inst.assetId?.assetName,
        instanceCode:
          inst.instanceCode,
        totalCost
      });

      (inst.lifecycle || []).forEach(
        (event) => {
          response.lifecycle.push({
            instanceId: inst._id,
            instanceCode:
              inst.instanceCode,
            assetName:
              inst.assetId?.assetName,
            assetType:
              inst.assetType,
            eventType:
              event.eventType,
            title:
              event.title,
            description:
              event.description,
            performedBy:
              event.performedBy?.name ||
              "System",
            date:
              event.date,
            metadata:
              event.metadata
          });
        }
      );
    }

    for (const assign of assignments) {

      stats.assignedAssets++;

      const dept =
        assign.departmentId
          ?.departmentName ||
        "Unknown";

      if (!departmentMap[dept]) {
        departmentMap[dept] = 0;
      }


if (!departmentMap[dept]) {

    departmentMap[dept] = {

        name: dept,

        totalAssets: 0,

        totalValue: 0,

        activeAssignments: 0,

        returnedAssignments: 0,

        employees: [],

        assets: []
    };

}

const asset =
    assetLookup[
        assign.assetInstanceId?.toString()
    ];

departmentMap[dept].totalAssets++;

if (assign.status === "assigned") {

    departmentMap[dept].activeAssignments++;

}

if (assign.status === "returned") {

    departmentMap[dept].returnedAssignments++;

}

if (asset) {

    departmentMap[dept].totalValue +=
        asset.totalCost;

    departmentMap[dept].assets.push({

        ...asset,

        assignedAt: assign.assignedAt,

        returnedAt: assign.returnedAt,

        assignmentStatus: assign.status

    });

}

departmentMap[dept].employees.push({

    employeeId: assign.employeeId?._id,

    employeeName: assign.employeeId?.name,

    employeeCode: assign.employeeId?.employeeCode,

    email: assign.employeeId?.email,

    assignedAsset: asset?.assetName,

    instanceCode: asset?.instanceCode,

    assetType: asset?.assetType,

    totalCost: asset?.totalCost || 0,

    assignedAt: assign.assignedAt,

    returnedAt: assign.returnedAt,

    status: assign.status

});

      response.assignments.push({
        assignmentId: assign._id,

        assetInstanceId:
          assign.assetInstanceId,

        employee:
          assign.employeeId?.name,

        employeeCode:
          assign.employeeId
            ?.employeeCode,

        email:
          assign.employeeId?.email,

        department:
          assign.departmentId
            ?.departmentName,

        location:
          assign.location,

        status:
          assign.status,

        assignedAt:
          assign.assignedAt,

        returnedAt:
          assign.returnedAt,

        assignedBy:
          assign.assignedBy?.name,

        returnedBy:
          assign.returnedBy?.name
      });
    }

    stats.unassignedAssets =
      stats.totalAssets -
      stats.assignedAssets;

    response.summary = stats;

    response.financial = {
      totalOwnershipCost:
        stats.purchaseCost +
        stats.maintenanceCost +
        stats.insuranceCost +
        stats.renewalCost +
        stats.warrantyCost +
        stats.upgradeCost,

      purchaseCost:
        stats.purchaseCost,

      maintenanceCost:
        stats.maintenanceCost,

      insuranceCost:
        stats.insuranceCost,

      renewalCost:
        stats.renewalCost,

      warrantyCost:
        stats.warrantyCost,

      upgradeCost:
        stats.upgradeCost
    };

    response.topExpensiveAssets =
      expensiveAssets
        .sort(
          (a, b) =>
            b.totalCost -
            a.totalCost
        )
        .slice(0, 10);

    response.departments =
Object.values(departmentMap);(([name, count]) => ({
        name,
        count
      }));

    response.charts = {
      assetTypes: {
        hardware:
          assetInstances.filter(
            a =>
              a.assetType ===
              "hardware"
          ).length,

        software:
          assetInstances.filter(
            a =>
              a.assetType ===
              "software"
          ).length
      },

      conditions: {
        broken:
          stats.brokenAssets,

        missing:
          stats.missingAssets,

        active:
          stats.totalAssets -
          stats.brokenAssets -
          stats.missingAssets
      }
    };

    return res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCompleteAuditDashboard
};