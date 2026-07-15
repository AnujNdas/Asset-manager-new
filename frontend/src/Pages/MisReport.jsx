import React, { useEffect, useState } from "react";

import {
  getAuditDashboard,
} from "../Services/ApiServices";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../Page_styles/AuditPage.css";
import { exportAuditPDF } from "../utils/exportPdfFile";
import { exportAuditExcel } from "../utils/exportExcelFile";
import { useOrganization } from "../Context/OrganizationContext";
import { CURRENCY_SYMBOLS } from "../utils/currency.js";
import Loader from "../Components/Loader.jsx"
const AuditPage = () => {
  const { organization } = useOrganization();
  const currencySymbol = CURRENCY_SYMBOLS[organization?.currency] || "NA";
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
const [expandedFinancial, setExpandedFinancial] = useState(null);
const [expandedDepartment, setExpandedDepartment] = useState(null);
const [expandedInsurance, setExpandedInsurance] = useState(null);
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

const filteredMaintenance = maintenance.filter(item => {

  const yearMatch =
    selectedYear === "All" ||
    (
      item.eventDate &&
      new Date(item.eventDate)
        .getFullYear()
        .toString() === selectedYear
    );

  const typeMatch =
    selectedAssetType === "All" ||
    item.assetType === selectedAssetType;

  return yearMatch && typeMatch;

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
            <th>Purchase Date</th>
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
                    {asset.purchaseDate
                      ? new Date(asset.purchaseDate).toLocaleDateString()
                      : "-"}
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
    <th>Warranty Purchase</th>
    <th>Warranty Expiry</th>
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
        </td>

        <td>{item.assetType}</td>

        <td>{item.warrantyPurchaseDate ? new Date(item.warrantyPurchaseDate).toLocaleDateString() : "-"}</td>

        <td>{expiry.toLocaleDateString()}</td>

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

<div className="asset-details-card">

<div className="asset-details-header">

<h4>{item.assetName}</h4>
<p>{item.assetCode}</p>

<span className="asset-status">

{item.assetType === "hardware"
? "Hardware"
: "Software"}

</span>

</div>

{/* General Information */}

{/* Year-wise Warranty Cost */}

{item.yearlyWarranty?.length > 0 && (

  <>

    <h4 style={{ marginTop: 30 }}>
      Warranty Cost History
    </h4>

    <div className="yearly-cost-grid">
{item.yearlyWarranty
  ?.slice()
  .sort((a, b) => b.year - a.year) // Latest → Oldest
  .map((year) => {

    const currentYear = new Date().getFullYear();

    let badge;

    if (year.year > currentYear) {
      badge = {
        text: "Upcoming",
        className: "upcoming",
      };
    } else if (year.year === currentYear) {
      badge = {
        text: "Current",
        className: "current",
      };
    } else {
      badge = {
        text: "Completed",
        className: "completed",
      };
    }

    return (

      <div
        className="year-card"
        key={year.year}
      >

        <span className={`year-badge ${badge.className}`}>
          {badge.text}
        </span>

        <div className="year-card-header">
          <h4>Year :- {year.year}</h4>

          <p>
            {item.warrantyPurchaseDate
              ? formatDate(item.warrantyPurchaseDate)
              : "-"}
          </p>
        </div>

        <div className="year-row">
          <span>Purchase Cost</span>
          <span>{formatCurrency(year.purchaseCost || 0)}</span>
        </div>

        <div className="year-row">
          <span>Warranty Cost</span>
          <span>{formatCurrency(year.warrantyCost || 0)}</span>
        </div>

        <div className="year-total">
          Total : {formatCurrency(year.totalCost || 0)}
        </div>

      </div>

    );

  })}

    </div>

  </>

)}
{/* Warranty Summary */}

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
};
const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};
const renderInsurance = () => (
  <div className="audit-report-grid">
<table className="audit-table">
<thead>
<tr>
  <th>Details</th>
  <th>Asset</th>
  <th>Type</th>
  <th>Insurance Expiry</th>
  <th>Status</th>
  <th>Total Cost</th>
</tr>
</thead>

<tbody>

{filteredInsurance.map(item => {

const expiry = new Date(item.insuranceExpiry);

const daysLeft = Math.ceil(
  (expiry - new Date()) /
  (1000 * 60 * 60 * 24)
);

return (

<React.Fragment key={item.instanceId}>

<tr>

<td>

<button
className="expand-btn"
onClick={()=>
setExpandedInsurance(
expandedInsurance===item.instanceId
? null
: item.instanceId
)
}
>

{
expandedInsurance===item.instanceId
? <FiChevronUp/>
: <FiChevronDown/>
}

</button>

</td>

<td>

<strong>{item.assetName}</strong>

<br/>

<small>{item.assetCode}</small>

</td>

<td>{item.assetType}</td>

<td>

{expiry.toLocaleDateString()}

</td>

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

{
daysLeft < 0
? `${Math.abs(daysLeft)} Days Expired`
: `${daysLeft} Days Left`
}

</span>

</td>

<td>

<strong>

{formatCurrency(item.totalCost)}

</strong>

</td>

</tr>
{expandedInsurance === item.instanceId && (

<tr>

<td colSpan={6}>

<div className="asset-details-card">

<div className="asset-details-header">

<h4>{item.assetName}</h4>

<span className="asset-status">
  {item.assetType === "hardware" ? "Hardware" : "Software"}
</span>

</div>

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
<label>Insurance Expiry</label>
<p>
{item.insuranceExpiry
? new Date(item.insuranceExpiry).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<label>Condition</label>
<p>{item.condition}</p>
</div>

<div>
<label>Total Cost</label>
<p>{formatCurrency(item.totalCost)}</p>
</div>

<div>
<label>Purchase Cost</label>
<p>{formatCurrency(item.purchaseCost)}</p>
</div>

<div>
<label>Insurance Cost</label>
<p>{formatCurrency(item.insuranceCost)}</p>
</div>

<div>
<label>Model Number</label>
<p>{item.modelNo || "-"}</p>
</div>

<div>
<label>Serial Number</label>
<p>{item.serialNumber || "-"}</p>
</div>
<div>
<label>Coverage Types</label>
<p>{item.coverageType || "-"}</p>
</div>


</div>

{item.yearlyInsurance?.length > 0 && (

<>

<h4 style={{ marginTop: 30 }}>
Insurance Cost History
</h4>

<div className="yearly-cost-grid">

{item.yearlyInsurance?.map((year) => {

  const currentYear = new Date().getFullYear();

  let badge;

  if (year.year > currentYear) {
    badge = {
      text: "Upcoming",
      className: "upcoming",
    };
  } else if (year.year === currentYear) {
    badge = {
      text: "Current",
      className: "current",
    };
  } else {
    badge = {
      text: "Completed",
      className: "completed",
    };
  }

  return (
    <div key={year.year} className="year-card">

      <span className={`year-badge ${badge.className}`}>
        {badge.text}
      </span>

      <div className="year-card-header">
        <h4>Year :- {year.year}</h4>

        <p>
          {item.insurancePurchaseDate
            ? formatDate(item.insurancePurchaseDate)
            : "-"}
        </p>
      </div>

      <div className="year-row">
        <span>Purchase</span>
        <span>{formatCurrency(year.purchaseCost || 0)}</span>
      </div>

      <div className="year-row">
        <span>Insurance</span>
        <span>{formatCurrency(year.insuranceCost || 0)}</span>
      </div>

      <div className="year-total">
        Total : {formatCurrency(year.totalCost || 0)}
      </div>

    </div>
  );

})}

</div>

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
  `${currencySymbol} ${Number(amount || 0).toLocaleString()}`;


const renderMaintenance = () => (
  <div className="audit-table-wrapper">

    <h3>Maintenance Audit</h3>

    <table className="audit-table">

      <thead>
        <tr>
          <th>Details</th>
          <th>Asset</th>
          <th>Purchase Date</th>
          <th>{assetType === "hardware" ? "Maintenance Date" : "Renewal Date"}</th>
          <th>Purchase Cost</th>
          <th>Days Left</th>
        </tr>
      </thead>

<tbody>

  {filteredMaintenance.map(item => {

    const days = getDaysRemaining(item.nextMaintenanceDate);
    const status = getMaintenanceStatus(item.nextMaintenanceDate);
    const yearlyHistory =
  item.assetType === "hardware"
    ? item.yearlyMaintenance
    : item.yearlyRenewal;
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
            </td>

          <td>
            {item.purchaseDate
              ? new Date(item.purchaseDate).toLocaleDateString()
              : "-"}
          </td>

          <td>
            {item.assetType === "hardware"
              ? item.nextMaintenanceDate
                ? new Date(item.nextMaintenanceDate).toLocaleDateString()
                : "-"
              : item.renewalDate
                ? new Date(item.renewalDate).toLocaleDateString()
                : "-"}

          </td>


          <td>
            <strong>
              {formatCurrency(item.purchaseCost)}
            </strong>
          </td>
          <td>
           {days === null
                ? "-"
                : days < 0
                ? `${Math.abs(days)} Days Overdue`
                : `${days} Days Left`}
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
<p>{item.assetCode}</p>

<span className="asset-status">

{item.assetType === "hardware"
? "Hardware"
: "Software"}

</span>

</div>

{/* General Information */}

{/* Maintenance Cost History */}

{yearlyHistory?.length > 0 && (

  <>

    <h4 style={{ marginTop: 30 }}>
  {item.assetType === "hardware"
    ? "Maintenance Cost History"
    : "Renewal Cost History"}
</h4>

    <div className="yearly-cost-grid">

{[...yearlyHistory]
  .sort((a, b) => a.year - b.year) // oldest → newest
  .map((year) => {

  const currentYear = new Date().getFullYear();

  let badge = null;

  if (year.year > currentYear) {
    badge = {
      text: "Upcoming",
      className: "upcoming",
    };
  } else if (year.year === currentYear) {
    badge = {
      text: "Current",
      className: "current",
    };
  } else {
    badge = {
      text: "Completed",
      className: "completed",
    };
  }

  return (

    <div
      key={year.year}
      className="year-card"
    >

      <span className={`year-badge ${badge.className}`}>
        {badge.text}
      </span>

      <div className="year-card-header">
        <h4>Year :- {year.year}</h4>
           <p>{item.purchaseDate
              ? new Date(item.purchaseDate).toLocaleDateString()
              : "-"}</p>
      </div>

      <div className="year-row">
        <span>Purchase</span>
        <span>{formatCurrency(year.purchaseCost || 0)}</span>
      </div>

      {item.assetType === "hardware" ? (
        <>
          <div className="year-row">
            <span>Maintenance</span>
            <span>{formatCurrency(year.maintenanceCost || 0)}</span>
          </div>

          <div className="year-row">
            <span>Warranty</span>
            <span>{formatCurrency(year.warrantyCost || 0)}</span>
          </div>

          <div className="year-row">
            <span>Insurance</span>
            <span>{formatCurrency(year.insuranceCost || 0)}</span>
          </div>

          <div className="year-row">
            <span>Upgrade</span>
            <span>{formatCurrency(year.upgradeCost || 0)}</span>
          </div>
        </>
      ) : (
        <div className="year-row">
          <span>Renewal</span>
          <span>{formatCurrency(year.renewalCost || 0)}</span>
        </div>
      )}

      <div className="year-total">
        Total : {formatCurrency(year.totalCost || 0)}
      </div>

    </div>

  );

})}

    </div>

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

{formatCurrency(item.totalCost || 0).toLocaleString()}

</strong>

</td>

</tr>
{expandedAssignment === item.assignmentId && (

<tr>

<td colSpan={7}>

<div className="asset-details-card">

<div className="asset-details-header">

<h4>{item.assetName}</h4>

<span className="asset-status">
{item.assetType === "hardware"
? "Hardware"
: "Software"}
</span>

</div>

{/* General Information */}

<div className="asset-details-grid">

<div>
<label>Employee</label>
<p>{item.employeeName}</p>
</div>

<div>
<label>Employee Code</label>
<p>{item.employeeCode}</p>
</div>

<div>
<label>Email</label>
<p>{item.employeeEmail || "-"}</p>
</div>

<div>
<label>Department</label>
<p>{item.department}</p>
</div>

<div>
<label>Assignment Status</label>
<p>{item.assignmentStatus}</p>
</div>

<div>
<label>Asset Status</label>
<p>{item.status}</p>
</div>

<div>
<label>Condition</label>
<p>{item.condition}</p>
</div>

<div>
<label>Location</label>
<p>{item.assignmentLocation || "-"}</p>
</div>

</div>

{/* Asset Information */}

<div className="asset-details-grid">

<div>
<label>Asset Name</label>
<p>{item.assetName}</p>
</div>

{/* <div>
<label>Asset Code</label>
<p>{item.assetCode}</p>
</div> */}

<div>
<label>Instance Code</label>
<p>{item.instanceCode}</p>
</div>

<div>
<label>Device</label>
<p>{item.deviceName || "-"}</p>
</div>

{item.assetType === "hardware" && (

<>
<div>
<label>Model Number</label>
<p>{item.modelNo || "-"}</p>
</div>

<div>
<label>Specifications</label>
<p>{item.specifications || "-"}</p>
</div>
  
<div>
<label>Purchase Cost</label>
<p>{formatCurrency(item.purchaseCost || 0).toLocaleString()}</p>
</div>
<div>
<label>Upgrade Cost</label>
<p>{formatCurrency(item.upgradeCost || 0).toLocaleString()}</p>
</div>
<div>
<label>Total Cost</label>
<p>
<strong>
{formatCurrency(item.totalCost || 0).toLocaleString()}
</strong>
</p>
</div>

</>

)}

{item.assetType === "software" && (

<>

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
<p>{formatCurrency(item.renewalCost || 0).toLocaleString()}</p>
</div>

</>

)}

</div>

{/* Assignment Timeline */}

<div className="asset-details-grid">

<div>
<label>Assigned Date</label>
<p>
{item.assignedAt
? new Date(item.assignedAt).toLocaleString()
: "-"}
</p>
</div>

<div>
<label>Returned Date</label>
<p>
{item.returnedAt
? new Date(item.returnedAt).toLocaleString()
: "-"}
</p>
</div>

<div>
<label>Assigned By</label>
<p>{item.assignedBy || "-"}</p>
</div>

<div>
<label>Returned By</label>
<p>{item.returnedBy || "-"}</p>
</div>

</div>

{/* Financial */}

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
        purchase : item.purchaseDate,
        assetCode: item.assetCode,

        instanceCode: item.instanceCode,

        assetType: item.assetType,

        deviceName: item.deviceName,

        status: item.status || "-",

        createdAt: item.createdAt,

        lastActivity: item.date,
        // purchaseDate: item.metadata?.snapshot?.hardware?.purchaseDate,

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
                {asset.purchase.toLocaleDateString}
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

<div className="asset-details-card">

<div className="asset-details-header">

<h4>{asset.assetName}</h4>

<span className="asset-status">

{asset.assetType === "hardware"
  ? "Hardware"
  : "Software"}

</span>

</div>

{/* General Information */}

<div className="asset-details-grid">

<div>
<label>Asset Name</label>
<p>{asset.assetName}</p>
</div>

<div>
<label>Asset Code</label>
<p>{asset.assetCode}</p>
</div>

<div>
<label>Instance Code</label>
<p>{asset.instanceCode}</p>
</div>

<div>
<label>Asset Type</label>
<p>{asset.assetType}</p>
</div>

<div>
<label>Status</label>
<p>{asset.status}</p>
</div>

<div>
<label>Purchase Date</label>
<p>
{asset.purchase
  ? new Date(asset.purchase).toLocaleDateString()
  : "-"}
</p>
</div>

<div>
<label>Total Events</label>
<p>{asset.events?.length || 0}</p>
</div>
<div>
<label>Device</label>
<p>{asset.deviceName || "-"}</p>
</div>
</div>

{/* Hardware Details */}

{/* {asset.assetType === "hardware" && (

<div className="asset-details-grid">


<div>
<label>Model Number</label>
<p>{asset.modelNo || "-"}</p>
</div>

<div>
<label>Specifications</label>
<p>{asset.specifications || "-"}</p>
</div>

<div>
<label>Location</label>
<p>{asset.location || "-"}</p>
</div>

<div>
<label>Condition</label>
<p>{asset.condition || "-"}</p>
</div>

</div>

)} */}

{/* Software Details */}

{asset.assetType === "software" && (

<div className="asset-details-grid">

<div>
<label>Device</label>
<p>{asset.deviceName || "-"}</p>
</div>

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
<label>Location</label>
<p>{asset.location || "-"}</p>
</div>

</div>

)}

{/* Lifecycle Timeline */}

<h4 style={{ marginTop: 25 }}>Lifecycle Timeline</h4>

{(asset.events || [])
  .slice()
  .sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
  )
  .map((event, index) => (

<div
key={index}
className="asset-details-grid"
style={{ marginBottom: "18px" }}
>

<div>
<label>Event</label>
<p>{event.title}</p>
</div>

<div>
<label>Type</label>
<p>{event.eventType}</p>
</div>

<div>
<label>Description</label>
<p>{event.description || "-"}</p>
</div>

{/* <div>
<label>Performed By</label>
<p>{event.performedBy || "System"}</p>
</div> */}

<div>
<label>Date</label>
<p>
{event.date
  ? new Date(event.date).toLocaleString()
  : "-"}
</p>
</div>

</div>

))}

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
<th> Details </th>
<th>Asset</th>

<th>Type</th>

<th>Purchase</th>

<th>Total</th>

</tr>

</thead>

<tbody>

{filteredFinancial
  .sort((a, b) => b.totalCost - a.totalCost)
  .map(asset => (

    <React.Fragment key={asset.instanceId}>

      {/* Summary Row */}

      <tr>

        <td>

          <button
            type="button"
            className="expand-btn"
            onClick={() =>
              setExpandedFinancial(
                expandedFinancial === asset.instanceId
                  ? null
                  : asset.instanceId
              )
            }
          >
            {expandedFinancial === asset.instanceId
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

        <td>
          ${asset.purchaseCost.toLocaleString()}
        </td>

        <td>

          <strong>
            ${asset.totalCost.toLocaleString()}
          </strong>

        </td>

      </tr>

      {/* Expanded Panel */}

      {expandedFinancial === asset.instanceId && (

        <tr>

          <td colSpan={5}>

<div className="yearly-cost-grid">

{asset.yearlyCosts
  ?.slice()
  .sort((a, b) => b.year - a.year) // Latest year first
  .map((year) => {

    const currentYear = new Date().getFullYear();

    let badge;

    if (year.year > currentYear) {
      badge = {
        text: "Upcoming",
        className: "upcoming",
      };
    } else if (year.year === currentYear) {
      badge = {
        text: "Current",
        className: "current",
      };
    } else {
      badge = {
        text: "Completed",
        className: "completed",
      };
    }

    return (

      <div
        className="year-card"
        key={year.year}
      >

        <span className={`year-badge ${badge.className}`}>
          {badge.text}
        </span>

        <h4>Year :- {year.year}</h4>

        <div className="year-row">
          <span>Purchase</span>
          <span>{formatCurrency(year.purchaseCost)}</span>
        </div>

        <div className="year-row">
          <span>Maintenance</span>
          <span>{formatCurrency(year.maintenanceCost)}</span>
        </div>

        <div className="year-row">
          <span>Warranty</span>
          <span>{formatCurrency(year.warrantyCost)}</span>
        </div>

        <div className="year-row">
          <span>Insurance</span>
          <span>{formatCurrency(year.insuranceCost)}</span>
        </div>

        <div className="year-row">
          <span>Renewal</span>
          <span>{formatCurrency(year.renewalCost)}</span>
        </div>

        <div className="year-row">
          <span>Upgrade</span>
          <span>{formatCurrency(year.upgradeCost)}</span>
        </div>

        <div className="year-total">
          Total : {formatCurrency(year.totalCost)}
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
   setLoading(false)
};

if (loading) return <Loader/>
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