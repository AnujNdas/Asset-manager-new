import React, { useEffect, useState } from "react";

import {
  getAuditDashboard,
} from "../Services/ApiServices";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../Page_styles/AuditPage.css";
import { exportAuditPDF } from "../utils/exportPdfFile";
import { exportAuditExcel } from "../utils/exportExcelFile";
const AuditPage = () => {
  const [auditData, setAuditData] = useState({
  summary: {},
  financial: {},
  assets: [],
  assignments: [],
  warranty: [],
  insurance: [],
  maintenance: [],
  lifecycle: [],
  departments: [],
  topExpensiveAssets: []
}); 
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [expandedLifecycle, setExpandedLifecycle] =
useState(null);
const [expandedSummary, setExpandedSummary] = useState(null);
const [expandedWarranty, setExpandedWarranty] = useState(null);
const [expandedMaintenance, setExpandedMaintenance] = useState(null);
const [expandedAssignment, setExpandedAssignment] = useState(null);
const [selectedAssetType, setSelectedAssetType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("All");
  const [assetType, setAssetType] = useState("hardware");
  const [activeTab, setActiveTab] = useState("summary");
  const showYearFilter = [
  "financial",
  "warranty",
  "insurance",
  "maintenance",
  "lifecycle"
].includes(activeTab);

  const loadAuditData = async () => {
    try {
const res = await getAuditDashboard();

setAuditData(res?.data || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);
  useEffect(() => {
  console.log(auditData);
}, [auditData]);

// PDf and Excel Download Functions 
const handleDownloadPDF = () => {

  switch (activeTab) {

    case "summary":

      exportAuditPDF({
        title: "Summary Audit",
        filters: {
          Year: selectedYear
        },
        columns: [
          "Asset",
          "Instance",
          "Type",
          "Location",
          "Status",
          "Condition",
          "Purchase Date",
          "Purchase Cost",
          "Upgrade Cost",
          "Total Cost"
        ],
        data: assets.map(asset => [
          asset.assetName,
          asset.instanceCode,
          asset.assetType,
          asset.location,
          asset.status,
          asset.condition,
          asset.purchaseDate
            ? new Date(asset.purchaseDate).toLocaleDateString()
            : "-",
            asset.purchaseCost,
            asset.upgradeCost,
          asset.totalCost
        ])
      });

      break;

    case "financial":

      exportAuditPDF({
        title: "Financial Audit",
        filters: {
          Year: selectedYear
        },
        columns: [
          "Asset",
          "Type",
          "Purchase",
          "Maintenance",
          "Warranty",
          "Insurance",
          "Renewal",
          "Upgrade",
          "Total"

        ],
        data: filteredFinancial.map(asset => [
          asset.assetName,
          asset.assetType,
          asset.purchaseCost,
          asset.maintenanceCost,
          asset.warrantyCost,
          asset.insuranceCost,
          asset.renewalCost,
          asset.upgradeCost,
          asset.totalCost
        ])
      });

      break;

    case "warranty":

      exportAuditPDF({
        title: "Warranty Audit",
        filters: {
          Year: selectedYear
        },
        columns: [
          "Asset",
          "Instance",
          "Location",
          "Warranty Dates",
          "Cost",
          "Status"
        ],
        data: filteredWarranty.map(item => [
          item.assetName,
          item.instanceCode,
          item.location,
          item.warrantyPurchaseDate,
          item.warrantyCost,
          item.status
        ])
      });

      break;
      case "maintenance" :

      exportAuditPDF({
        title: "Maintanence Audit",
        filters: {
          Year: selectedYear
        },
        columns: [
          "Asset",
          "Instance",
          "Location",
          "Maintanence Dates",
          "Cost",
          "Upgrades"
        ],
        data: filteredMaintenance.map(item => [
          item.assetName,
          item.instanceCode,
          item.location,
          item.nextMaintanenceDate,
          item.maintenanceCost,
          item.upgrades
        ])
      })

      case "assignment" : 

      exportAuditPDF({
        title: "Assignment Audit",
        columns: [
          "Employee",
          "Asset",
          "Department",
          "Assignment",
          "Dates",
          "Asset Status",
          "Total Value"
        ],
        data: assignments.map(item => [
          item.employeeName,
          item.deviceName,
          item.department,
          item.assignedBy,
          item.status,
          item.totalCost
        ])
      })

      case "department" : 

      exportAuditPDF({
        title: "Department Audit",
        columns: [
          "Department",
          "Employees",
          "Assets",
          "Assigned",
          "Total Value",
          "Asset Preview"
        ],
        data: departments.map(item => [
          item.departmentName,
          item.totalEmployees,
          item.totalAssets,
          item.activeAssignments,
          item.totalValue,
          item.deviceName,
        ])
      });

         case "lifecycle" : 

      exportAuditPDF({
        title: "Lifecycle Audit",
        filters: {
          Year: selectedYear
        },
        columns: [
          "Asset",
          "Event",
          "Description",
          "Performed By",
          "Date",
        ],
        data: filteredLifecycle.map(item => [
          item.deviceName,
          item.eventType,
          item.description,
          item.performedBy,
          item.date
        ])
      })
    // Remaining tabs...

  }

};

const handleDownloadExcel = () => {

  switch (activeTab) {

    case "summary":

      exportAuditExcel({
        title: "Summary Audit",
        data: assets
      });

      break;

    case "financial":

      exportAuditExcel({
        title: "Financial Audit",
        data: filteredFinancial
      });

      break;

    case "warranty":

      exportAuditExcel({
        title: "Warranty Audit",
        data: filteredWarranty
      });

      break;

    case "maintenance":

      exportAuditExcel({
        title: "Maintenance Audit",
        data: filteredMaintenance
      });

      break;

    case "insurance":

      exportAuditExcel({
        title: "Insurance Audit",
        data: filteredInsurance
      });

      break;

    case "lifecycle":

      exportAuditExcel({
        title: "Lifecycle Audit",
        data: filteredLifecycle
      });

      break;

    case "assignment":

      exportAuditExcel({
        title: "Assignment Audit",
        data: assignments
      });

      break;

    case "department":

      exportAuditExcel({
        title: "Department Audit",
        data: departments
      });

      break;

  }

};
const startYear = 2010;
const currentYear = new Date().getFullYear();

const yearOptions = [
  "All",
  ...Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => (startYear + i).toString()
  )
];
const summary = auditData.summary || {};

const financial = auditData.financial || {};

const financialInstances = financial.instances ?? [];

const filteredFinancial = financialInstances.filter(item => {

  const yearMatch =
    selectedYear === "All" ||
    (
      item.purchaseDate &&
      new Date(item.purchaseDate)
        .getFullYear()
        .toString() === selectedYear
    );

  const typeMatch =
    selectedAssetType === "All" ||
    item.assetType === selectedAssetType;

  return yearMatch && typeMatch;

});
      const filteredFinancialSummary = filteredFinancial.reduce(
  (acc, asset) => {
    acc.purchaseCost += asset.purchaseCost || 0;
    acc.maintenanceCost += asset.maintenanceCost || 0;
    acc.warrantyCost += asset.warrantyCost || 0;
    acc.insuranceCost += asset.insuranceCost || 0;
    acc.renewalCost += asset.renewalCost || 0;
    acc.upgradeCost += asset.upgradeCost || 0;
    acc.totalOwnershipCost += asset.totalCost || 0;
    acc.totalAssets++;

    return acc;
  },
  {
    purchaseCost: 0,
    maintenanceCost: 0,
    warrantyCost: 0,
    insuranceCost: 0,
    renewalCost: 0,
    upgradeCost: 0,
    totalOwnershipCost: 0,
    totalAssets: 0
  }
);
const assets = auditData.summary?.assets || [];
const filteredAssets = assets.filter(item =>

  selectedAssetType === "All" ||
  item.assetType === selectedAssetType

);

const assignments =
  auditData.assignments || [];
  const filteredAssignments = assignments.filter(item =>

  selectedAssetType === "All" ||
  item.assetType === selectedAssetType

);

const warranty = auditData.warranty || [];

const filteredWarranty =
  selectedYear === "All"
    ? warranty
    : warranty.filter(item => {
        if (!item.expiryDate) return false;

        return (
          new Date(item.expiryDate)
            .getFullYear()
            .toString() === selectedYear
        );
      });

const insurance = auditData.insurance || [];

const filteredInsurance =
  selectedYear === "All"
    ? insurance
    : insurance.filter(item => {
        if (!item.expiryDate) return false;

        return (
          new Date(item.expiryDate)
            .getFullYear()
            .toString() === selectedYear
        );
      });
const maintenance = auditData.maintenance || [];

const filteredMaintenance =
  selectedYear === "All"
    ? maintenance
    : maintenance.filter(item => {
        if (!item.nextMaintenanceDate) return false;

        return (
          new Date(item.nextMaintenanceDate)
            .getFullYear()
            .toString() === selectedYear
        );
      });
const lifecycle = auditData.lifecycle || [];
const filteredLifecycle = lifecycle.filter(item => {

  const yearMatch =
    selectedYear === "All" ||
    (
      item.purchaseDate &&
      new Date(item.purchaseDate)
        .getFullYear()
        .toString() === selectedYear
    );

  const typeMatch =
    selectedAssetType === "All" ||
    item.assetType === selectedAssetType;

  return yearMatch && typeMatch;

});

const departments =
  auditData.departments || [];

const topExpensiveAssets =
  auditData.topExpensiveAssets || [];
const stats = [
  {
    title: "Total Assets",
    value: summary.totalAssets || 0,
  },
  {
    title: "Hardware Assets",
    value: summary.hardwareAssets || 0,
  },
  {
    title: "Software Assets",
    value: summary.softwareAssets || 0,
  },
  {
    title: "Assigned",
    value: summary.assignedAssets || 0,
  },
  {
    title: "Available",
    value: summary.availableAssets || 0,
  },
  {
    title: "Broken",
    value: summary.brokenAssets || 0,
  },
  {
    title: "Missing",
    value: summary.missingAssets || 0,
  },
  {
    title: "Warranty Expired",
    value: summary.warrantyExpired || 0,
  },
  {
    title: "Insurance Expired",
    value: summary.insuranceExpired || 0,
  },
  {
    title: "Maintenance Due",
    value: summary.maintenanceDue || 0,
  },
  {
    title: "Purchase Cost",
    value: `$${summary.purchaseCost}`,
  },
  {
    title: "Ownership Cost",
    value: `$${summary.totalOwnershipCost}`,
  },
];

  const tabs = [
    "summary",
    "department",
    "warranty",
    "insurance",
    "maintenance",
    "assignment",
    "lifecycle",
    "financial",
  ];

  if (loading) {
    return (
      <div className="audit-loading">
        Loading Audit Dashboard...
      </div>
    );
  }


const renderSummary = () => (
  <>
    <div className="audit-section-header">
      <h3>Asset Inventory Overview</h3>
    </div>

    <div className="audit-table-wrapper">

      <table className="audit-table">

        <thead>
          <tr>
            <th>Details</th>
            <th>Asset</th>
            <th>Type</th>
            <th>Status</th>
            <th>Location</th>
            <th>Total Cost</th>
          </tr>
        </thead>

        <tbody>

          {filteredAssets.map(asset => (

            <React.Fragment key={asset.instanceId}>

              <tr>

                <td>

                  <button
                    type="button"
                    className="expand-btn"
                    onClick={() =>
                      setExpandedSummary(
                        expandedSummary === asset.instanceId
                          ? null
                          : asset.instanceId
                      )
                    }
                  >
                    {expandedSummary === asset.instanceId
                      ? <FiChevronUp />
                      : <FiChevronDown />}
                  </button>

                </td>

                <td>
                  <strong>{asset.assetName}</strong>
                  <br />
                  <small>{asset.assetCode}</small>
                </td>

                <td>{asset.assetType}</td>

                <td>{asset.status}</td>

                <td>{asset.location}</td>

                <td>
                  <strong>
                    ${asset.totalCost.toLocaleString()}
                  </strong>
                </td>

              </tr>

{expandedSummary === asset.instanceId && (

<tr>

<td colSpan={6}>

<div className="asset-details-card">

<div className="asset-details-header">

<h4>
{asset.assetType === "hardware"
? "Hardware Details"
: "Software Details"}
</h4>

<span className="asset-status">
{asset.status}
</span>

</div>

<div className="asset-details-grid">

{/* Common */}

<div>
<label>Instance Code</label>
<p>{asset.instanceCode}</p>
</div>

<div>
<label>Device Name</label>
<p>{asset.deviceName || "-"}</p>
</div>

<div>
<label>Purchase Date</label>
<p>
{asset.purchaseDate
? new Date(asset.purchaseDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Installation Date</label>
<p>
{asset.installationDate
? new Date(asset.installationDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Purchase Cost</label>
<p>${asset.purchaseCost.toLocaleString()}</p>
</div>

<div>
<label>Total Cost</label>
<p>
<strong>
${asset.totalCost.toLocaleString()}
</strong>
</p>
</div>

{/* Hardware */}

{asset.assetType === "hardware" && (
<>

<div>
<label>Serial Number</label>
<p>{asset.serialNumber || "-"}</p>
</div>

<div>
<label>Model No.</label>
<p>{asset.modelNo || "-"}</p>
</div>

<div>
<label>Specification</label>
<p>{asset.specifications || "-"}</p>
</div>

<div>
<label>Next Maintenance</label>
<p>
{asset.nextMaintenanceDate
? new Date(asset.nextMaintenanceDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Warranty Expiry</label>
<p>
{asset.warrantyExpiry
? new Date(asset.warrantyExpiry).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Insurance Expiry</label>
<p>
{asset.insuranceExpiry
? new Date(asset.insuranceExpiry).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Maintenance Cost</label>
<p>${asset.maintenanceCost.toLocaleString()}</p>
</div>

<div>
<label>Insurance Cost</label>
<p>${asset.insuranceCost.toLocaleString()}</p>
</div>

<div>
<label>Upgrade Cost</label>
<p>${asset.upgradeCost.toLocaleString()}</p>
</div>

</>
)}

{/* Software */}

{asset.assetType === "software" && (
<>

<div>
<label>License Key</label>
<p>{asset.licenseKey || "-"}</p>
</div>

<div>
<label>License Number</label>
<p>{asset.licenseNumber || "-"}</p>
</div>

<div>
<label>Renewal Date</label>
<p>
{asset.renewalDate
? new Date(asset.renewalDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Renewal Cost</label>
<p>${asset.renewalCost.toLocaleString()}</p>
</div>

</>
)}

</div>

</div>

</td>

</tr>

)}

            </React.Fragment>

          ))}

        </tbody>

      </table>

    </div>
  </>
);
const renderDepartment = () => (
  <div className="department-container">

<div className="audit-table-wrapper">
  <table className="audit-table">

    <thead>
      <tr>
        <th>Details</th>
        <th>Department</th>
        <th>Employees</th>
        <th>Assets</th>
        <th>Total Value</th>
      </tr>
    </thead>

    <tbody>

      {departments.map((dept) => (

        <React.Fragment key={dept.departmentId}>

          {/* Main Row */}

          <tr
  className="expandable-row"
  onClick={() =>
    setExpandedDepartment(
      expandedDepartment === dept.departmentId
        ? null
        : dept.departmentId
    )
  }
>
    <td><button
    className="expand-btn"
    onClick={(e)=>{
        e.stopPropagation();
        setExpandedDepartment(
            expandedDepartment===dept.departmentId
            ? null
            : dept.departmentId
        );
    }}
>
    {expandedDepartment===dept.departmentId
        ? <FiChevronUp/>
        : <FiChevronDown/>
    }
</button></td>

            <td>{dept.departmentName}</td>

            <td>{dept.totalEmployees}</td>

            <td>{dept.totalAssets}</td>

            <td>${dept.totalValue.toLocaleString()}</td>



          </tr>

          {/* Expanded Row */}

{expandedDepartment === dept.departmentId && (

<tr>

<td colSpan={5}>

<div className="asset-details-card">

<div className="asset-details-header">

<h4>{dept.departmentName}</h4>

<span className="asset-status">
{dept.totalEmployees} Employees • {dept.activeAssignments} Active Assignments
</span>

</div>

{dept.assignmentHistory.map(record => {

const asset = dept.assets.find(
a => a.instanceCode === record.instanceCode
);

return (
  <div className="asset-details-section">
<div
key={record.assignmentId}
className="asset-details-grid"
style={{ marginBottom: "20px" }}
>

<div>
<label>Employee</label>
<p>{record.employeeName}</p>
</div>

<div>
<label>Employee Code</label>
<p>{record.employeeCode}</p>
</div>

<div>
<label>Asset</label>
<p>{record.assetName}</p>
</div>

<div>
<label>Instance</label>
<p>{record.instanceCode}</p>
</div>

<div>
<label>Status</label>
<p>{record.status}</p>
</div>

<div>
<label>Assigned Date</label>
<p>
{record.assignedAt
? new Date(record.assignedAt).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Returned Date</label>
<p>
{record.returnedAt
? new Date(record.returnedAt).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Location</label>
<p>{record.location || "-"}</p>
</div>

<div>
<label>Asset Value</label>
<p>
<strong>
${(asset?.totalCost ?? 0).toLocaleString()}
</strong>
</p>
</div>

</div>
</div>

);

})}

</div>

</td>

</tr>

)}
        </React.Fragment>

      ))}

    </tbody>

  </table>
</div>

      </div>
);
const renderWarranty = () => {
  const today = new Date();

  return (
    <div className="audit-table-wrapper">
      <table className="audit-table">

<thead>
  <tr>
    <th>Details</th>
    <th>Asset</th>
    <th>Type</th>
    <th>Warranty Expiry</th>
    <th>Status</th>
    <th>Total Cost</th>
  </tr>
</thead>

<tbody>

{filteredWarranty.map(item => {

  const expiry = new Date(item.expiryDate);

  const daysLeft = Math.ceil(
    (expiry - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (

    <React.Fragment key={item.instanceId}>

      {/* Summary Row */}

      <tr>

        <td>

          <button
            type="button"
            className="expand-btn"
            onClick={() =>
              setExpandedWarranty(
                expandedWarranty === item.instanceId
                  ? null
                  : item.instanceId
              )
            }
          >
            {expandedWarranty === item.instanceId
              ? <FiChevronUp />
              : <FiChevronDown />}
          </button>

        </td>

        <td>

          <strong>{item.assetName}</strong>

          <br />

          <small>{item.assetCode}</small>

        </td>

        <td>{item.assetType}</td>

        <td>{expiry.toLocaleDateString()}</td>

        <td>

          <span
            className={
              daysLeft < 0
                ? "status-expired"
                : daysLeft <= 30
                ? "status-warning"
                : "status-active"
            }
          >
            {daysLeft < 0
              ? `${Math.abs(daysLeft)} Days Expired`
              : `${daysLeft} Days Left`}
          </span>

        </td>

        <td>
          <strong>
            ${(item.totalCost ?? 0).toLocaleString()}
          </strong>
        </td>

      </tr>

      {/* Expanded Row */}

      {expandedWarranty === item.instanceId && (

        <tr>

          <td colSpan={6}>

            <table className="audit-table">

              <thead>

                <tr>
                  <th>Instance</th>
                  <th>Device</th>
                  <th>Location</th>
                  <th>Purchase</th>
                  <th>Installation</th>
                  <th>Warranty</th>
                  <th>Warranty Cost</th>
                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>
                    {item.instanceCode}
                    <br />
                    <small>{item.serialNumber}</small>
                    <br />
                    <small>{item.modelNo}</small>
                  </td>

                  <td>{item.deviceName || "-"}</td>

                  <td>
                    {item.location}
                    <br />
                    <small>{item.condition}</small>
                  </td>

                  <td>
                    {item.purchaseDate
                      ? new Date(item.purchaseDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {item.installationDate
                      ? new Date(item.installationDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {expiry.toLocaleDateString()}
                  </td>

                  <td>
                    ${(item.warrantyCost ?? 0).toLocaleString()}
                  </td>

                </tr>

              </tbody>

            </table>

          </td>

        </tr>

      )}

    </React.Fragment>

  );

})}

</tbody>
      </table>
    </div>
  );
};
const renderInsurance = () => (
  <div className="audit-report-grid">
<table className="audit-table">
<thead>
  <tr>
    <th>Details</th>
    <th>Asset</th>
    <th>Type</th>
    <th>Warranty Expiry</th>
    <th>Status</th>
    <th>Total Cost</th>
  </tr>
</thead>
<tbody>

{filteredInsurance.map(item => (

<tr key={item.instanceId}>

<td>{item.assetName}</td>

<td>{item.instanceCode}</td>

<td>{item.location}</td>

<td>{item.coverageType?.join(", ")}</td>

<td>
  {new Date(
    item.insuranceExpiry
  ).toLocaleDateString()}
</td>

<td>${item.totalCost}</td>

</tr>

))}

</tbody>
</table>
  </div>
);
// Helper Functions 
const getDaysRemaining = (date) => {
  if (!date) return null;

  const today = new Date();

  const target = new Date(date);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target - today) / (1000 * 60 * 60 * 24)
  );
};

const getMaintenanceStatus = (date) => {
  if (!date)
    return {
      label: "Not Scheduled",
      className: "status-gray",
    };

  const days = getDaysRemaining(date);

  if (days < 0)
    return {
      label: "Overdue",
      className: "status-red",
    };

  if (days <= 30)
    return {
      label: "Due Soon",
      className: "status-yellow",
    };

  return {
    label: "Scheduled",
    className: "status-green",
  };
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString()}`;


const renderMaintenance = () => (
  <div className="audit-table-wrapper">

    <h3>Maintenance Audit</h3>

    <table className="audit-table">

      <thead>
        <tr>
          <th>Details</th>
          <th>Asset</th>
          <th>Location</th>
          <th>Maintenance</th>
          <th>Costs</th>
          <th>Upgrades</th>
        </tr>
      </thead>

<tbody>

  {filteredMaintenance.map(item => {

    const days = getDaysRemaining(item.nextMaintenanceDate);
    const status = getMaintenanceStatus(item.nextMaintenanceDate);

    return (

      <React.Fragment key={item.instanceId}>

        {/* Summary Row */}

        <tr>

          <td>

            <button
              type="button"
              className="expand-btn"
              onClick={() =>
                setExpandedMaintenance(
                  expandedMaintenance === item.instanceId
                    ? null
                    : item.instanceId
                )
              }
            >
              {expandedMaintenance === item.instanceId
                ? <FiChevronUp />
                : <FiChevronDown />}
            </button>


          </td>
          <td>
            <strong>{item.assetName}</strong>

            <br />

            <small>{item.assetCode}</small>
            </td>

          <td>
            {item.location}
          </td>

          <td>

            <span className={status.className}>
              {status.label}
            </span>

            <br />

            <small>
              {days === null
                ? "-"
                : days < 0
                ? `${Math.abs(days)} Days Overdue`
                : `${days} Days Left`}
            </small>

          </td>


          <td>
            <strong>
              {formatCurrency(item.totalCost)}
            </strong>
          </td>
          <td>
            {item.upgrades?.length || 0}
          </td>

        </tr>

        {/* Expanded Row */}

{expandedMaintenance === item.instanceId && (

<tr>

<td colSpan={6}>

<div className="asset-details-card">

<div className="asset-details-header">

<h4>
{item.assetName}
</h4>

<span className="asset-status">

{item.assetType === "hardware"
? "Hardware"
: "Software"}

</span>

</div>

{/* General Information */}

<div className="asset-details-grid">

<div>
<label>Instance Code</label>
<p>{item.instanceCode}</p>
</div>

<div>
<label>Device</label>
<p>{item.deviceName || "-"}</p>
</div>

<div>
<label>Location</label>
<p>{item.location}</p>
</div>

<div>
<label>Status</label>
<p>{item.status}</p>
</div>

<div>
<label>Purchase Date</label>
<p>
{item.purchaseDate
? new Date(item.purchaseDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Installation Date</label>
<p>
{item.installationDate
? new Date(item.installationDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Total Cost</label>
<p>{formatCurrency(item.totalCost)}</p>
</div>

</div>

{/* Hardware */}

{item.assetType === "hardware" && (

<div className="asset-details-grid">

<div>
<label>Serial Number</label>
<p>{item.serialNumber || "-"}</p>
</div>

<div>
<label>Model Number</label>
<p>{item.modelNo || "-"}</p>
</div>

<div>
<label>Specifications</label>
<p>{item.specifications || "-"}</p>
</div>

<div>
<label>Condition</label>
<p>{item.condition}</p>
</div>

<div>
<label>Next Maintenance</label>
<p>
{item.nextMaintenanceDate
? new Date(item.nextMaintenanceDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Maintenance Cost</label>
<p>{formatCurrency(item.maintenanceCost)}</p>
</div>

<div>
<label>Warranty Cost</label>
<p>{formatCurrency(item.warrantyCost)}</p>
</div>

<div>
<label>Insurance Cost</label>
<p>{formatCurrency(item.insuranceCost)}</p>
</div>

<div>
<label>Upgrade Cost</label>
<p>{formatCurrency(item.upgradeCost)}</p>
</div>

</div>

)}

{/* Software */}

{item.assetType === "software" && (

<div className="asset-details-grid">

<div>
<label>License Key</label>
<p>{item.licenseKey || "-"}</p>
</div>

<div>
<label>License Number</label>
<p>{item.licenseNumber || "-"}</p>
</div>

<div>
<label>Renewal Date</label>
<p>
{item.renewalDate
? new Date(item.renewalDate).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Renewal Cost</label>
<p>{formatCurrency(item.renewalCost)}</p>
</div>

</div>

)}

{/* Cost Breakdown */}

<div className="asset-details-grid">

<div>
<label>Purchase Cost</label>
<p>{formatCurrency(item.purchaseCost)}</p>
</div>

<div>
<label>Maintenance Cost</label>
<p>{formatCurrency(item.maintenanceCost || 0)}</p>
</div>

<div>
<label>Warranty Cost</label>
<p>{formatCurrency(item.warrantyCost || 0)}</p>
</div>

<div>
<label>Insurance Cost</label>
<p>{formatCurrency(item.insuranceCost || 0)}</p>
</div>

<div>
<label>Renewal Cost</label>
<p>{formatCurrency(item.renewalCost || 0)}</p>
</div>

<div>
<label>Upgrade Cost</label>
<p>{formatCurrency(item.upgradeCost || 0)}</p>
</div>

</div>

{/* Upgrades */}

{item.upgrades?.length > 0 && (

<>

<h4 style={{marginTop:25}}>Upgrade History</h4>

{item.upgrades.map((upgrade,index)=>(

<div
key={index}
className="asset-details-grid"
style={{marginBottom:"18px"}}
>

<div>
<label>Description</label>
<p>{upgrade.description}</p>
</div>

<div>
<label>Date</label>
<p>
{upgrade.date
? new Date(upgrade.date).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Cost</label>
<p>{formatCurrency(upgrade.cost || 0)}</p>
</div>

</div>

))}

</>

)}

</div>

</td>

</tr>

)}

      </React.Fragment>

    );

  })}

</tbody>

    </table>

  </div>
);
const renderAssignment = () => (
  <div className="audit-table-wrapper">

    <h3>Assignment Audit</h3>

    <table className="audit-table">

<thead>
<tr>
  <th>Details</th>
  <th>Employee</th>
  <th>Asset</th>
  <th>Department</th>
  <th>Status</th>
  <th>Assigned</th>
  <th>Total Value</th>
</tr>
</thead>

<tbody>

{filteredAssignments.map(item => (

<React.Fragment key={item.assignmentId}>

<tr>

<td>

<button
className="expand-btn"
onClick={() =>
setExpandedAssignment(
expandedAssignment === item.assignmentId
? null
: item.assignmentId
)
}
>
{
expandedAssignment === item.assignmentId
? <FiChevronUp/>
: <FiChevronDown/>
}
</button>

</td>

<td>

<strong>{item.employeeName}</strong>

<br/>

<small>{item.employeeCode}</small>

</td>

<td>

<strong>{item.assetName}</strong>

<br/>

<small>{item.instanceCode}</small>

</td>

<td>{item.department}</td>

<td>{item.assignmentStatus}</td>

<td>

{
item.assignedAt
? new Date(item.assignedAt).toLocaleDateString()
: "-"
}

</td>

<td>

<strong>

${Number(item.totalCost || 0).toLocaleString()}

</strong>

</td>

</tr>

{expandedAssignment === item.assignmentId && (

<tr>

<td colSpan={7}>

<div className="expanded-panel">

<table className="audit-table nested-table">

<thead>

<tr>

<th>Employee Details</th>

<th>Asset Details</th>

<th>Assignment Details</th>

<th>Dates</th>

<th>Asset Status</th>

<th>Financial</th>

</tr>

</thead>

<tbody>

<tr>

<td>

<div><strong>Name:</strong> {item.employeeName}</div>

<div><strong>Code:</strong> {item.employeeCode}</div>

<div><strong>Email:</strong> {item.employeeEmail}</div>

<div><strong>Department:</strong> {item.department}</div>

</td>

<td>

<div><strong>Asset:</strong> {item.assetName}</div>

<div><strong>Code:</strong> {item.assetCode}</div>

<div><strong>Instance:</strong> {item.instanceCode}</div>

<div><strong>Device:</strong> {item.deviceName || "-"}</div>

<div><strong>Serial:</strong> {item.serialNumber || "-"}</div>

<div><strong>Model:</strong> {item.modelNo || "-"}</div>

</td>

<td>

<div><strong>Status:</strong> {item.assignmentStatus}</div>

<div><strong>Location:</strong> {item.assignmentLocation}</div>

<div><strong>Assigned By:</strong> {item.assignedBy || "-"}</div>

<div><strong>Returned By:</strong> {item.returnedBy || "-"}</div>

</td>

<td>

<div>

<strong>Assigned</strong>

<br/>

{
item.assignedAt
? new Date(item.assignedAt).toLocaleString()
: "-"
}

</div>

<br/>

<div>

<strong>Returned</strong>

<br/>

{
item.returnedAt
? new Date(item.returnedAt).toLocaleString()
: "-"
}

</div>

</td>

<td>

<div><strong>Status:</strong> {item.status}</div>

<div><strong>Condition:</strong> {item.condition}</div>

</td>

<td>

<div>

<strong>Purchase</strong>

<br/>

${Number(item.purchaseCost || 0).toLocaleString()}

</div>

<br/>

<div>

<strong>Maintenance</strong>

<br/>

${Number(item.maintenanceCost || 0).toLocaleString()}

</div>

<br/>

<div>

<strong>Warranty</strong>

<br/>

${Number(item.warrantyCost || 0).toLocaleString()}

</div>

<br/>

<div>

<strong>Insurance</strong>

<br/>

${Number(item.insuranceCost || 0).toLocaleString()}

</div>

<br/>

<div>

<strong>Total</strong>

<br/>

${Number(item.totalCost || 0).toLocaleString()}

</div>

</td>

</tr>

</tbody>

</table>

</div>

</td>

</tr>

)}

</React.Fragment>

))}

</tbody>

    </table>

  </div>
);

// Grouping the instances 
const lifecycleAssets = Object.values(

  filteredLifecycle.reduce((acc, item) => {

    if (!acc[item.instanceId]) {

      acc[item.instanceId] = {

        instanceId: item.instanceId,

        assetName: item.assetName,

        assetCode: item.assetCode,

        instanceCode: item.instanceCode,

        assetType: item.assetType,

        deviceName: item.deviceName,

        status: item.metadata?.status || "-",

        createdAt: item.createdAt,

        lastActivity: item.date,
        purchaseDate: item.metadata?.snapshot?.hardware?.purchaseDate,

        events: []

      };

    }

    acc[item.instanceId].events.push(item);

    if (
      new Date(item.date) >
      new Date(acc[item.instanceId].lastActivity)
    ) {

      acc[item.instanceId].lastActivity = item.date;

    }

    return acc;

  }, {})

);


const renderLifecycle = () => (
  <div className="audit-table-wrapper">

    <h3>Asset Lifecycle History</h3>

    <table className="audit-table">

      <thead>
        <tr>
          <th>Details</th>
          <th>Asset</th>
          <th>Type</th>
          <th>Status</th>
          <th>Events</th>
          <th>Purchased</th>
          <th>Last Activity</th>
        </tr>
      </thead>

      <tbody>

        {lifecycleAssets.map((asset) => (

          <React.Fragment key={asset.instanceId}>

            {/* Main Row */}

            <tr>

              <td>
                <button
                  type="button"
                  className="expand-btn"
                  onClick={() =>
                    setExpandedLifecycle(
                      expandedLifecycle === asset.instanceId
                        ? null
                        : asset.instanceId
                    )
                  }
                >
                  {expandedLifecycle === asset.instanceId
                    ? <FiChevronUp />
                    : <FiChevronDown />}
                </button>
              </td>

              <td>
                <strong>{asset.assetName}</strong>
                <br />
                <small>{asset.assetCode}</small>
                <br />
                <small>{asset.instanceCode}</small>
              </td>

              <td>{asset.assetType}</td>

              <td>{asset.status}</td>

              <td>{asset.events?.length || 0}</td>

              <td>
                {asset.purchaseDate}
              </td>

              <td>
                {asset.lastActivity
                  ? new Date(asset.lastActivity).toLocaleDateString()
                  : "-"}
              </td>

            </tr>

            {/* Expanded Row */}

            {expandedLifecycle === asset.instanceId && (

              <tr>

                <td colSpan={7}>

                  <table className="audit-table">

                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Description</th>
                        <th>Performed By</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>

                      {(asset.events || [])
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(a.date).getTime() -
                            new Date(b.date).getTime()
                        )
                        .map((event, index) => (

                          <tr key={index}>

                            <td>
                              <strong>{event.title}</strong>
                              <br />
                              <small>{event.eventType}</small>
                            </td>

                            <td>{event.description}</td>

                            <td>{event.performedBy || "System"}</td>

                            <td>
                              {event.date
                                ? new Date(event.date).toLocaleString()
                                : "-"}
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </td>

              </tr>

            )}

          </React.Fragment>

        ))}

      </tbody>

    </table>

  </div>
);
const renderFinancial = () => (
  <>
<div className="financial-grid">

  <div className="financial-card">
    <h5>Purchase Cost</h5>
    <h2>${filteredFinancialSummary.purchaseCost.toLocaleString()}</h2>
    <span>Initial Asset Investment</span>
  </div>

  <div className="financial-card">
    <h5>Maintenance</h5>
    <h2>${filteredFinancialSummary.maintenanceCost.toLocaleString()}</h2>
    <span>Repairs & Servicing</span>
  </div>

  <div className="financial-card">
    <h5>Warranty</h5>
    <h2>${filteredFinancialSummary.warrantyCost.toLocaleString()}</h2>
    <span>Warranty Renewals</span>
  </div>

  <div className="financial-card">
    <h5>Insurance</h5>
    <h2>${filteredFinancialSummary.insuranceCost.toLocaleString()}</h2>
    <span>Insurance Premiums</span>
  </div>

  <div className="financial-card">
    <h5>Renewals</h5>
    <h2>${filteredFinancialSummary.renewalCost.toLocaleString()}</h2>
    <span>Software Licenses</span>
  </div>

  <div className="financial-card">
    <h5>Upgrades</h5>
    <h2>${filteredFinancialSummary.upgradeCost.toLocaleString()}</h2>
    <span>Hardware & Software Upgrades</span>
  </div>

  <div className="financial-card">
    <h5>Total Assets</h5>
    <h2>{filteredFinancialSummary.totalAssets}</h2>
    <span>Tracked Assets</span>
  </div>

  <div className="financial-card highlight">
    <h5>Total Ownership Cost</h5>
    <h2>${filteredFinancialSummary.totalOwnershipCost.toLocaleString()}</h2>
    <span>Overall Asset Investment</span>
  </div>

</div>

    <div className="audit-table-wrapper">

      <h3>
        Top Expensive Assets
      </h3>

      <table className="audit-table">

<thead>

<tr>

<th>Asset</th>

<th>Type</th>

<th>Purchase</th>

<th>Maintenance</th>

<th>Warranty</th>

<th>Insurance</th>

<th>Renewal</th>

<th>Upgrade</th>

<th>Total</th>

</tr>

</thead>

<tbody>

{filteredFinancial
.sort((a,b)=>b.totalCost-a.totalCost)
.map(asset=>(

<tr key={asset.instanceId}>

<td>

<strong>{asset.assetName}</strong>

<br/>

<small>{asset.assetCode}</small>

<br/>

<small>{asset.instanceCode}</small>

</td>

<td>{asset.assetType}</td>

<td>${asset.purchaseCost.toLocaleString()}</td>

<td>${asset.maintenanceCost.toLocaleString()}</td>

<td>${asset.warrantyCost.toLocaleString()}</td>

<td>${asset.insuranceCost.toLocaleString()}</td>

<td>${asset.renewalCost.toLocaleString()}</td>

<td>${asset.upgradeCost.toLocaleString()}</td>

<td>

<strong>

${asset.totalCost.toLocaleString()}

</strong>

</td>

</tr>

))}

</tbody>

      </table>

    </div>
  </>
);
  const renderContent = () => {
   switch(activeTab){
      case "summary":
         return renderSummary();

      case "department":
         return renderDepartment();

      case "warranty":
         return renderWarranty();

      case "insurance":
         return renderInsurance();

      case "maintenance":
         return renderMaintenance();

      case "assignment":
         return renderAssignment();

      case "lifecycle":
         return renderLifecycle();

      case "financial":
         return renderFinancial();

      default:
         return null;
   }
};
  return (
    <div className="audit-page">

      {/* HEADER */}

      <div className="audit-header">

        <div>
          <h1>Audit & Compliance Center</h1>

          <p>
            Asset auditing, compliance tracking,
            lifecycle management and financial
            analysis.
          </p>
        </div>

        <button
          className="audit-refresh-btn"
          onClick={loadAuditData}
        >
          Refresh
        </button>

      </div>

      {/* KPI GRID */}

      <div className="audit-stats-grid">

        {stats.map((item) => (
          <div
            key={item.title}
            className="audit-stat-card"
          >
            <span>{item.title}</span>

            <h2>{item.value}</h2>
          </div>
        ))}

      </div>

      {/* REPORT TABS */}

      <div className="audit-tabs">

        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "audit-tab active"
                : "audit-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}

      </div>

      {/* FILTER BAR */}

<div className="audit-filters">

  {showYearFilter && (
    <select
      value={selectedYear}
      onChange={(e) =>
        setSelectedYear(e.target.value)
      }
    >
      {yearOptions.map(year => (
        <option key={year} value={year}>
          {year === "All"
            ? "All Years"
            : year}
        </option>
      ))}
    </select>
  )} 

    <select
    value={selectedAssetType}
    onChange={(e) => setSelectedAssetType(e.target.value)}
  >
    <option value="All">All Assets</option>
    <option value="hardware">Hardware</option>
    <option value="software">Software</option>
  </select>
    <div className="audit-actions">

        <button onClick={handleDownloadPDF} className="pdf-btn">
            Export PDF
        </button>

        <button onClick={handleDownloadExcel} className="excel-btn">
            Export Excel
        </button> 

    </div>

</div>

      {/* CONTENT */}

<div className="audit-content">
  {renderContent()}
</div>

    </div>
  );
};

export default AuditPage;