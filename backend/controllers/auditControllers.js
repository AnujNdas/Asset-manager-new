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
        .populate("createdBy","name email")
        .populate("lifecycle.performedBy","name email")
        .lean(),

    AssetAssignment.find({ organizationId })
        .populate("departmentId", "name")
        .populate("employeeId","name employeeCode email")
        .populate("assignedBy","name")
        .populate("returnedBy","name")
        .lean()
]);

const response = {

    summary:{},

    departments:[],

    assignments:[],

    warranty:[],

    insurance:[],

    maintenance:[],

    lifecycle:[],

    financial:{},

    charts:{}
};

const now = new Date();

const assetLookup = {};
const warranty = [];
const insurance = [];
const maintenance = [];
const lifecycle = [];
const financial = [];
const stats = {
  totalAssets: 0,
  hardwareAssets: 0,
  softwareAssets: 0,

  assignedAssets: 0,
  availableAssets: 0,

  brokenAssets: 0,
  missingAssets: 0,

  warrantyExpired: 0,
  insuranceExpired: 0,
  maintenanceDue: 0,

  purchaseCost: 0,
  maintenanceCost: 0,
  insuranceCost: 0,
  warrantyCost: 0,
  renewalCost: 0,
  upgradeCost: 0,
  totalOwnershipCost: 0
};
for (const inst of assetInstances) {

    const hardware = inst.hardware || {};
    const software = inst.software || {};

    const yearlyMap = {};

    const addCost = (date, field, amount) => {

        if (!date || !amount) return;

        const year = new Date(date).getFullYear();

        if (!yearlyMap[year]) {

            yearlyMap[year] = {
                year,
                purchaseCost: 0,
                maintenanceCost: 0,
                warrantyCost: 0,
                insuranceCost: 0,
                renewalCost: 0,
                upgradeCost: 0,
                totalCost: 0
            };

        }

        amount = Number(amount);

        yearlyMap[year][field] += amount;
        yearlyMap[year].totalCost += amount;

    };
 // Purchase
if (inst.assetType === "hardware") {

    addCost(
        hardware.purchaseDate,
        "purchaseCost",
        hardware.purchaseCost?.amount
    );

} else {

    addCost(
        software.purchaseDate,
        "purchaseCost",
        software.purchaseCost?.amount
    );

}

// Lifecycle events
(inst.lifecycle || []).forEach(event => {

    switch (event.eventType) {

        case "maintenance":
            addCost(
                event.date,
                "maintenanceCost",
                event.metadata?.cost?.amount ??
                event.metadata?.to?.costs?.maintenanceCost ??
                0
            );
            break;

        case "warranty_renewal":
            addCost(
                event.date,
                "warrantyCost",
                event.metadata?.cost?.amount ??
                event.metadata?.to?.costs?.warrantyRenewalCost ??
                0
            );
            break;

        case "insurance_renewal":
            addCost(
                event.date,
                "insuranceCost",
                event.metadata?.cost?.amount ??
                event.metadata?.to?.costs?.insuranceCost ??
                0
            );
            break;

        case "software_renewal":
            addCost(
                event.date,
                "renewalCost",
                event.metadata?.cost?.amount ??
                event.metadata?.to?.costs?.renewalCost ??
                0
            );
            break;

case "upgrade":
case "upgraded":
    addCost(
        event.date,
        "upgradeCost",
        event.metadata?.upgradeCost?.amount ??
        event.metadata?.cost?.amount ??
        0
    );
    break;

    }

});

    const purchaseCost =
        Number(
            hardware.purchaseCost?.amount ??
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
            (sum, upgrade) =>
                sum + (Number(upgrade.cost?.amount) || 0),
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

if (inst.assetType === "hardware")
    stats.hardwareAssets++;

if (inst.assetType === "software")
    stats.softwareAssets++;

if (
    inst.condition === "broken"
)
    stats.brokenAssets++;

if (
    inst.condition === "missing" ||
    inst.condition === "stolen"
)
    stats.missingAssets++;

stats.purchaseCost += purchaseCost;
stats.maintenanceCost += maintenanceCost;
stats.insuranceCost += insuranceCost;
stats.warrantyCost += warrantyCost;
stats.renewalCost += renewalCost;
stats.upgradeCost += upgradeCost;
if (
    hardware.warrantyExpiry &&
    new Date(hardware.warrantyExpiry) < now
) {
    stats.warrantyExpired++;
}

if (
    hardware.insuranceExpiry &&
    new Date(hardware.insuranceExpiry) < now
) {
    stats.insuranceExpired++;
}

if (
    hardware.nextMaintenanceDate &&
    new Date(hardware.nextMaintenanceDate) <= now
) {
    stats.maintenanceDue++;
}
const asset = {
    instanceId: inst._id,
    assetId: inst.assetId?._id,
    assetCode: inst.assetId?.assetCode,
    assetName: inst.assetId?.assetName,
    assetType: inst.assetType,
    instanceCode: inst.instanceCode,
    deviceName: inst.deviceName || null,
    serialNumber: hardware.serialNumber || null,
    modelNo: hardware.modelNo || null,
    specifications: hardware.specifications || null,
    licenseKey: software.licenseKey || null,
    licenseNumber: software.licenseNumber || null,
    location: inst.location,
    status: inst.status,
    condition: inst.condition,
    coverageType : inst.hardware?.coverageType || [],
    purchaseDate:
        hardware.purchaseDate ||
        software.purchaseDate,
    installationDate:
        hardware.installationDate ||
        software.installationDate,
    warrantyExpiry:
        hardware.warrantyExpiry || null,
    warrantyPurchaseDate:
        hardware.warrantyPurchaseDate || null,
    insurancePurchaseDate:
        hardware.insurancePurchaseDate || null,
    insuranceExpiry:
        hardware.insuranceExpiry || null,
    renewalDate:
        software.renewalDate || null,
    nextMaintenanceDate:
        hardware.nextMaintenanceDate || null,
    purchaseCost,
    maintenanceCost,
    insuranceCost,
    warrantyCost,
    renewalCost,
    upgradeCost,
    totalCost,
    lifecycle: inst.lifecycle || [],
    upgrades: inst.upgrades || [],
    createdBy: inst.createdBy?.name,
    createdAt: inst.createdAt,
    updatedAt: inst.updatedAt
};

assetLookup[inst._id.toString()] = asset;


const warrantyMap = {};

// Purchase
if (asset.purchaseDate) {
    const year = new Date(asset.purchaseDate).getFullYear();

const initialWarrantyCost =
    asset.warrantyCost ||
    asset.hardware?.costs?.warrantyRenewalCost?.amount ||
    0;

warrantyMap[year] = {
    year,
    purchaseCost: asset.purchaseCost || 0,
    warrantyCost: initialWarrantyCost,
    totalCost:
        (asset.purchaseCost || 0) +
        initialWarrantyCost
};
}

// Warranty renewals
(asset.lifecycle || [])
    .filter(item => item.eventType === "warranty_renewal")
    .forEach(item => {

        const year = new Date(item.date).getFullYear();

        if (!warrantyMap[year]) {
            warrantyMap[year] = {
                year,
                purchaseCost: 0,
                warrantyCost: 0,
                totalCost: 0
            };
        }

        const amount =
            item.metadata?.cost?.amount ??
            item.metadata?.to?.costs?.warrantyRenewalCost ??
            0;

        warrantyMap[year].warrantyCost += amount;
        warrantyMap[year].totalCost += amount;
    });

const yearlyWarranty = Object.values(warrantyMap)
    .sort((a, b) => a.year - b.year);
if (asset.warrantyExpiry) {
    
    warranty.push({
        
        instanceId: asset.instanceId,
        warrantyPurchaseDate : asset.warrantyPurchaseDate,

        assetId: asset.assetId,

        assetCode: asset.assetCode,

        assetName: asset.assetName,

        instanceCode: asset.instanceCode,

        assetType: asset.assetType,

        deviceName: asset.deviceName,

        serialNumber: asset.serialNumber,

        modelNo: asset.modelNo,

        location: asset.location,

        status: asset.status,

        condition: asset.condition,

        purchaseDate: asset.purchaseDate,
        warrantyPurchaseDate: asset.warrantyPurchaseDate,

        installationDate: asset.installationDate,

        expiryDate: asset.warrantyExpiry,

        warrantyCost: asset.warrantyCost,

        totalCost: asset.totalCost,
        yearlyWarranty

    });

}
const insuranceMap = {};

// Purchase
if (asset.purchaseDate) {
    const year = new Date(asset.purchaseDate).getFullYear();

 const initialInsuranceCost =
        asset.insuranceCost ||
        asset.hardware?.costs?.insuranceCost?.amount ||
        0;

    insuranceMap[year] = {
        year,
        purchaseCost: asset.purchaseCost || 0,
        insuranceCost: initialInsuranceCost,
        totalCost:
            (asset.purchaseCost || 0) +
            initialInsuranceCost
    };
}

// Insurance renewals
(asset.lifecycle || [])
    .filter(item => item.eventType === "insurance_renewal")
    .forEach(item => {

        const year = new Date(item.date).getFullYear();

        if (!insuranceMap[year]) {
            insuranceMap[year] = {
                year,
                purchaseCost: 0,
                insuranceCost: 0,
                totalCost: 0
            };
        }

        const amount =
            item.metadata?.cost?.amount ??
            item.metadata?.to?.costs?.insuranceCost ??
            0;

        insuranceMap[year].insuranceCost += amount;
        insuranceMap[year].totalCost += amount;
    });

const yearlyInsurance = Object.values(insuranceMap)
    .sort((a, b) => a.year - b.year);
if (asset.insuranceExpiry) {

    insurance.push({

        instanceId: asset.instanceId,
        assetId: asset.assetId,

        assetCode: asset.assetCode,
        assetName: asset.assetName,
        instanceCode: asset.instanceCode,

        assetType: asset.assetType,

        deviceName: asset.deviceName,
        serialNumber: asset.serialNumber,
        modelNo: asset.modelNo,

        location: asset.location,
        status: asset.status,
        condition: asset.condition,

        purchaseDate: asset.purchaseDate,
        insurancePurchaseDate: asset.insurancePurchaseDate,
        insuranceExpiry: asset.insuranceExpiry,

        purchaseCost: asset.purchaseCost,
        insuranceCost: asset.insuranceCost,
        coverageType: asset.coverageType,

        totalCost: asset.totalCost,

        yearlyInsurance

    });

}
console.log("Yearly Insurance ->", yearlyInsurance);
// Hardware
if (
  asset.assetType === "hardware" &&
  asset.nextMaintenanceDate
) { 
    const yearlyMaintenance = [];


// Purchase entry
if (asset.purchaseDate) {
    yearlyMaintenance.push({
        year: new Date(asset.purchaseDate).getFullYear(),
        purchaseCost: asset.purchaseCost || 0,
        maintenanceCost: 0,
        warrantyCost: 0,
        insuranceCost: 0,
        upgradeCost: 0,
        totalCost: asset.purchaseCost || 0,
        purchaseDate: asset.purchaseDate
    });
}

// Maintenance history
(asset.lifecycle || [])
    .filter(item => item.eventType === "maintenance")
    .forEach(item => {

        yearlyMaintenance.push({
            year: new Date(item.date).getFullYear(),

            purchaseCost: 0,

            maintenanceCost:
                item.metadata?.cost?.amount ||
                item.metadata?.to?.costs?.maintenanceCost ||
                0,

            warrantyCost: 0,
            insuranceCost: 0,
            upgradeCost: 0,

            totalCost:
                item.metadata?.cost?.amount ||
                item.metadata?.to?.costs?.maintenanceCost ||
                0
        });

    });

// asset.upgrades?.forEach(upgrade => {

//   if (!upgrade.date) return;

//   yearlyMaintenance.push({

//     year: new Date(upgrade.date).getFullYear(),

//     purchaseCost: 0,

//     maintenanceCost: 0,

//     warrantyCost: 0,

//     insuranceCost: 0,

//     upgradeCost: upgrade.cost || 0,

//     totalCost: upgrade.cost || 0

//   });

// });
  maintenance.push({
    type: "maintenance",
    assetType: "hardware",

    instanceId: asset.instanceId,
    assetCode: asset.assetCode,
    assetName: asset.assetName,
    instanceCode: asset.instanceCode,

    deviceName: asset.deviceName,
    serialNumber: asset.serialNumber,
    modelNo: asset.modelNo,
    specifications: asset.specifications,

    location: asset.location,
    status: asset.status,
    condition: asset.condition,

    purchaseDate: asset.purchaseDate,
    installationDate: asset.installationDate,

    eventDate: asset.nextMaintenanceDate, // unified field
    nextMaintenanceDate: asset.nextMaintenanceDate,

    purchaseCost: asset.purchaseCost,
    maintenanceCost: asset.maintenanceCost,
    insuranceCost: asset.insuranceCost,
    warrantyCost: asset.warrantyCost,
    upgradeCost: asset.upgradeCost,
    totalCost: asset.totalCost,

    upgrades: asset.upgrades,
    yearlyMaintenance
  });
}

// Software
if (
  asset.assetType === "software" &&
  asset.renewalDate
) {
    const yearlyRenewal = [];

if (asset.purchaseDate) {

  yearlyRenewal.push({

    year: new Date(asset.purchaseDate).getFullYear(),

    purchaseCost: asset.purchaseCost || 0,

    renewalCost: 0,

    totalCost: asset.purchaseCost || 0,
    purchaseDate : asset.purchaseDate
  });


}

if (asset.renewalDate && asset.renewalCost > 0) {

  yearlyRenewal.push({

    year: new Date(asset.renewalDate).getFullYear(),

    purchaseCost: 0,

    renewalCost: asset.renewalCost || 0,

    totalCost: asset.renewalCost || 0

  });

}
  maintenance.push({
    type: "renewal",
    assetType: "software",

    instanceId: asset.instanceId,
    assetCode: asset.assetCode,
    assetName: asset.assetName,
    instanceCode: asset.instanceCode,

    deviceName: asset.deviceName,
    licenseKey: asset.licenseKey,
    licenseNumber: asset.licenseNumber,

    location: asset.location,
    status: asset.status,

    purchaseDate: asset.purchaseDate,
    installationDate: asset.installationDate,

    eventDate: asset.renewalDate, // same field used for sorting/filtering
    renewalDate: asset.renewalDate,

    purchaseCost: asset.purchaseCost,
    renewalCost: asset.renewalCost,
    totalCost: asset.totalCost,

    upgrades: asset.upgrades,
    yearlyRenewal
  });
}

asset.lifecycle.forEach(event => {

    lifecycle.push({

        instanceId: asset.instanceId,

        assetCode: asset.assetCode,

        assetName: asset.assetName,

        instanceCode: asset.instanceCode,

        assetType: asset.assetType,

        deviceName: asset.deviceName,

        eventType: event.eventType,

        category: event.category,

        title: event.title,

        description: event.description,
        purchaseDate : asset.purchaseDate,
        status : asset.status,
        performedBy:
            event.performedBy?.name ||

            "System",

        date: event.date,

        metadata: event.metadata

    });

});
const yearlyCosts = Object.values(yearlyMap).sort(
    (a, b) => a.year - b.year
);
console.log(yearlyCosts)
financial.push({

    ...asset,

    purchaseCost: asset.purchaseCost,

    maintenanceCost: asset.maintenanceCost,

    insuranceCost: asset.insuranceCost,

    warrantyCost: asset.warrantyCost,

    renewalCost: asset.renewalCost,

    upgradeCost: asset.upgradeCost,

    totalCost: asset.totalCost,
    yearlyCosts
});
}
stats.totalOwnershipCost =
    stats.purchaseCost +
    stats.maintenanceCost +
    stats.insuranceCost +
    stats.warrantyCost +
    stats.renewalCost +
    stats.upgradeCost;

    const activeAssignments = {
    assigned: 0,
    returned: 0
};
stats.assignedAssets =
    activeAssignments.assigned;

stats.availableAssets =
    stats.totalAssets -
    activeAssignments.assigned;
const departmentMap = {};
    for (const assign of assignments) {

const asset =
    assetLookup[
        assign.assetInstanceId?.toString()
    ];

if (!asset) continue;
const departmentName =
    assign.departmentId?.name ||
    "Unknown";
const departmentId =
    assign.departmentId?._id?.toString() ||
    "unknown";

const employeeId =
    assign.employeeId?._id?.toString();
    if (!departmentMap[departmentId]) {

    departmentMap[departmentId] = {

        departmentId,

        departmentName,

        totalEmployees: 0,

        totalAssignments: 0,

        activeAssignments: 0,

        returnedAssignments: 0,

        totalAssets: 0,

        totalValue: 0,

        employees: {},

        assets: {},

        assignmentHistory: []

    };

}
const department =
    departmentMap[departmentId];

department.totalAssignments++;

if (
    assign.status === "active" ||
    assign.status === "assigned"
) {

    department.activeAssignments++;

} else {

    department.returnedAssignments++;

}
if (
    !department.assets[
        asset.instanceId
    ]
) {

    department.assets[
        asset.instanceId
    ] = {

        instanceId:
            asset.instanceId,

        assetCode:
            asset.assetCode,

        assetName:
            asset.assetName,

        instanceCode:
            asset.instanceCode,

        assetType:
            asset.assetType,

        deviceName:
            asset.deviceName,

        location:
            asset.location,

        condition:
            asset.condition,

        status:
            asset.status,

        totalCost:
            asset.totalCost

    };

    department.totalAssets++;

    department.totalValue +=
        asset.totalCost;

}
if (
    !department.employees[
        employeeId
    ]
) {

    department.employees[
        employeeId
    ] = {

        employeeId,

        employeeName:
            assign.employeeId?.name,

        employeeCode:
            assign.employeeId?.employeeCode,

        email:
            assign.employeeId?.email,

        activeAssets: 0,

        returnedAssets: 0,

        totalAssignments: 0,

        currentAssets: []

    };

    department.totalEmployees++;

}
const employee =
    department.employees[
        employeeId
    ];

employee.totalAssignments++;

if (
    assign.status === "active" ||
    assign.status === "assigned"
) {

    employee.activeAssets++;

    employee.currentAssets.push({

        instanceId:
            asset.instanceId,

        assetName:
            asset.assetName,

        instanceCode:
            asset.instanceCode,

        assetCode:
            asset.assetCode

    });

} else {

    employee.returnedAssets++;

}
department.assignmentHistory.push({

    assignmentId:
        assign._id,

    employeeName:
        assign.employeeId?.name,

    employeeCode:
        assign.employeeId?.employeeCode,

    assetName:
        asset.assetName,

    instanceCode:
        asset.instanceCode,

    assignedAt:
        assign.assignedAt,

    returnedAt:
        assign.returnedAt,

    assignedBy:
        assign.assignedBy?.name,

    returnedBy:
        assign.returnedBy?.name,

    location:
        assign.location,

    status:
        assign.status

});
    response.assignments.push({

        //-----------------------------------
        // Assignment
        //-----------------------------------

        assignmentId: assign._id,

        assignmentStatus: assign.status,

        assignedAt: assign.assignedAt,

        returnedAt: assign.returnedAt,

        assignedBy:
            assign.assignedBy?.name || null,

        returnedBy:
            assign.returnedBy?.name || null,

        assignmentLocation:
            assign.location,

        //-----------------------------------
        // Employee
        //-----------------------------------

        employeeId:
            assign.employeeId?._id,

        employeeName:
            assign.employeeId?.name,

        employeeCode:
            assign.employeeId?.employeeCode,

        employeeEmail:
            assign.employeeId?.email,

        department:
                assign.departmentId?.name ||
                "Unknown",

        //-----------------------------------
        // Instance
        //-----------------------------------

        instanceId:
            asset?.instanceId,

        instanceCode:
            asset?.instanceCode,

        assetId:
            asset?.assetId,

        assetCode:
            asset?.assetCode,

        assetName:
            asset?.assetName,

        assetType:
            asset?.assetType,

        deviceName:
            asset?.deviceName,

        serialNumber:
            asset?.serialNumber,

        modelNo:
            asset?.modelNo,

        condition:
            asset?.condition,

        status:
            asset?.status,

        //-----------------------------------
        // Dates
        //-----------------------------------

        purchaseDate:
            asset?.purchaseDate,

        installationDate:
            asset?.installationDate,

        warrantyExpiry:
            asset?.warrantyExpiry,

        insuranceExpiry:
            asset?.insuranceExpiry,

        renewalDate:
            asset?.renewalDate,

        nextMaintenanceDate:
            asset?.nextMaintenanceDate,

        //-----------------------------------
        // Costs
        //-----------------------------------

        purchaseCost:
            asset?.purchaseCost || 0,

        maintenanceCost:
            asset?.maintenanceCost || 0,

        insuranceCost:
            asset?.insuranceCost || 0,

        warrantyCost:
            asset?.warrantyCost || 0,

        renewalCost:
            asset?.renewalCost || 0,

        upgradeCost:
            asset?.upgradeCost || 0,

        totalCost:
            asset?.totalCost || 0
    });
    if (
    assign.status === "active" ||
    assign.status === "assigned"
) {
    activeAssignments.assigned++;
} else {
    activeAssignments.returned++;
}
}
response.departments =
    Object.values(departmentMap).map(
        department => ({

            ...department,

            employees:
                Object.values(
                    department.employees
                ),

            assets:
                Object.values(
                    department.assets
                )

        })
    );

response.warranty = warranty;

response.insurance = insurance;

response.maintenance = maintenance;

response.lifecycle = lifecycle;

response.financial = {

    summary: stats,

    instances: financial

};

response.summary = {

    ...stats,

    assets: Object.values(assetLookup)

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