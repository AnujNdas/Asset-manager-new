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
    const employeeMap = {};
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

  assetCode: inst.assetId?.assetCode,
  assetName: inst.assetId?.assetName,
  assetType: inst.assetType,

  instanceCode: inst.instanceCode,

  deviceName: inst.deviceName,

  serialNumber: hardware.serialNumber,
  modelNo: hardware.modelNo,

  location: inst.location,

  status: inst.status,
  condition: inst.condition,

  purchaseDate: hardware.purchaseDate,
  installationDate: hardware.installationDate,

  expiryDate: hardware.warrantyExpiry,

  warrantyCost,

  createdAt: inst.createdAt
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

  assetId: inst.assetId?._id,

  assetCode: inst.assetId?.assetCode,

  assetName: inst.assetId?.assetName,

  deviceName: inst.deviceName,

  instanceCode: inst.instanceCode,

  assetType: inst.assetType,

  location: inst.location,

  status: inst.status,

  condition: inst.condition,

  serialNumber: hardware.serialNumber,

  modelNo: hardware.modelNo,

  specifications: hardware.specifications,

  purchaseDate: hardware.purchaseDate,

  installationDate: hardware.installationDate,

  nextMaintenanceDate:
    hardware.nextMaintenanceDate,

  maintenanceCost,

  purchaseCost,

  insuranceCost,

  warrantyCost,

  renewalCost,

  upgradeCost,

  totalCost,

  createdBy:
    inst.createdBy?.name,

  createdAt:
    inst.createdAt,

  updatedAt:
    inst.updatedAt,

  assignedTo:
    inst.assignedTo?.employeeName || null,

  assignedEmployeeId:
    inst.assignedTo?.employeeId || null,

  upgrades:
    inst.upgrades || []
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
        assign.departmentId?.departmentName ||
        "Unknown";

    const empId =
        assign.employeeId?._id?.toString();

    const asset =
        assetLookup[
            assign.assetInstanceId?.toString()
        ];

    //---------------------------------------------------
    // Assignment Report
    //---------------------------------------------------

    response.assignments.push({

        assignmentId: assign._id,

        assetInstanceId: asset?.instanceId,

        assetCode: asset?.assetCode,
        assetName: asset?.assetName,
        instanceCode: asset?.instanceCode,
        assetType: asset?.assetType,
        deviceName: asset?.deviceName,

        employee: assign.employeeId?.name,
        employeeCode:
            assign.employeeId?.employeeCode,
        email:
            assign.employeeId?.email,

        department: dept,

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
            assign.returnedBy?.name,

        totalCost:
            asset?.totalCost || 0
    });

    //---------------------------------------------------
    // Department
    //---------------------------------------------------

    if (!departmentMap[dept]) {

        departmentMap[dept] = {

            name: dept,

            totalAssets: 0,

            totalValue: 0,

            activeAssignments: 0,

            returnedAssignments: 0,

            employees: {},

            assets: []

        };

    }

    const department =
        departmentMap[dept];

    department.totalAssets++;

    if (assign.status === "assigned") {

        department.activeAssignments++;

    } else {

        department.returnedAssignments++;

    }

    if (asset) {

        department.totalValue +=
            asset.totalCost;

        department.assets.push({

            ...asset,

            assignedAt:
                assign.assignedAt,

            returnedAt:
                assign.returnedAt,

            assignmentStatus:
                assign.status,

            employee:
                assign.employeeId?.name

        });

    }

    //---------------------------------------------------
    // Employee
    //---------------------------------------------------

    if (!department.employees[empId]) {

        department.employees[empId] = {

            employeeId: empId,

            employeeName:
                assign.employeeId?.name,

            employeeCode:
                assign.employeeId?.employeeCode,

            email:
                assign.employeeId?.email,

            totalAssets: 0,

            activeAssets: 0,

            returnedAssets: 0,

            totalValue: 0,

            assignedAssets: []

        };

    }

    const employee =
        department.employees[empId];

    employee.totalAssets++;

    if (assign.status === "assigned") {

        employee.activeAssets++;

    } else {

        employee.returnedAssets++;

    }

    employee.totalValue +=
        asset?.totalCost || 0;

    employee.assignedAssets.push({

        assignmentId: assign._id,

        assetCode:
            asset?.assetCode,

        assetName:
            asset?.assetName,

        instanceCode:
            asset?.instanceCode,

        assetType:
            asset?.assetType,

        deviceName:
            asset?.deviceName,

        totalCost:
            asset?.totalCost || 0,

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
Object.values(departmentMap).forEach(dept => {

    dept.employees =
        Object.values(dept.employees);

});

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
    Object.values(departmentMap);

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