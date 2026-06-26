import React, { useEffect, useState } from "react";

import {
  getAuditDashboard,
} from "../Services/ApiServices";

import "../Page_styles/AuditPage.css";

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

  const [loading, setLoading] = useState(true);

  const [assetType, setAssetType] = useState("hardware");

  const [activeTab, setActiveTab] = useState("summary");

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
const summary = auditData.summary || {};

const financial = auditData.financial || {};

const assets = auditData.assets || [];

const assignments =
  auditData.assignments || [];

const warranty =
  auditData.warranty || [];

const insurance =
  auditData.insurance || [];

const maintenance =
  auditData.maintenance || [];

const lifecycle =
  auditData.lifecycle || [];

const departments =
  auditData.departments || [];

const topExpensiveAssets =
  auditData.topExpensiveAssets || [];
const stats = [
  {
    title: "Total Assets",
    value: summary.totalAssets || 0
  },
  {
    title: "Assigned",
    value: summary.assignedAssets || 0
  },
  {
    title: "Unassigned",
    value: summary.unassignedAssets || 0
  },
  {
    title: "Warranty Expired",
    value: summary.warrantyExpired || 0
  },
  {
    title: "Insurance Expired",
    value: summary.insuranceExpired || 0
  },
  {
    title: "Maintenance Due",
    value: summary.maintenanceDue || 0
  },
  {
    title: "Purchase Cost",
    value: `$${summary.purchaseCost || 0}`
  },
  {
    title: "Total Ownership",
    value: `$${financial.totalOwnershipCost || 0}`
  }
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
            <th>Asset Code</th>
            <th>Name</th>
            <th>Instance Code</th>
            <th>Type</th>
            <th>Location</th>
            <th>Status</th>
            <th>Condition</th>
            <th>Total Cost</th>
          </tr>
        </thead>

<tbody>

{assets.map(asset => (

<tr key={asset.instanceId}>

<td>{asset.assetCode}</td>

<td>{asset.assetName}</td>

<td>{asset.instanceCode}</td>

<td>{asset.assetType}</td>

<td>{asset.location}</td>

<td>{asset.status}</td>

<td>{asset.condition}</td>

<td>${asset.totalCost}</td>

</tr>

))}

</tbody>

      </table>
    </div>
  </>
);
const renderDepartment = () => (
  <div className="department-container">

    {departments.map((dept) => (
      <div
        key={dept.name}
        className="department-card"
      >

        {/* Header */}

        <div className="department-header">
          <div>
            <h2>{dept.name}</h2>

            <p>
              Complete Department Audit
            </p>
          </div>

          <div className="department-value">
            ₹{dept.totalValue.toLocaleString()}
          </div>
        </div>

        {/* Summary */}

        <div className="department-summary">

          <div className="summary-box">
            <span>Total Assets</span>
            <h3>{dept.totalAssets}</h3>
          </div>

          <div className="summary-box">
            <span>Active Assignments</span>
            <h3>{dept.activeAssignments}</h3>
          </div>

          <div className="summary-box">
            <span>Returned</span>
            <h3>{dept.returnedAssignments}</h3>
          </div>

          <div className="summary-box">
            <span>Total Value</span>
            <h3>
              ${dept.totalValue.toLocaleString()}
            </h3>
          </div>

        </div>

        {/* Assets */}

        <div className="audit-table-wrapper">

          <h3>Assets</h3>

          <table className="audit-table">

            <thead>
              <tr>
                <th>Asset</th>
                <th>Code</th>
                <th>Instance</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>

              {dept.assets.map((asset) => (

                <tr key={asset.instanceId}>

                  <td>{asset.assetName}</td>

                  <td>{asset.assetCode}</td>

                  <td>{asset.instanceCode}</td>

                  <td>{asset.assetType}</td>

                  <td>{asset.location}</td>

                  <td>{asset.status}</td>

                  <td>{asset.condition}</td>

                  <td>
                    ${asset.totalCost.toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* Employees */}

        <div className="audit-table-wrapper">

          <h3>Employees</h3>

          <table className="audit-table">

            <thead>

              <tr>

                <th>Employee</th>

                <th>Code</th>

                <th>Email</th>

                <th>Assigned Asset</th>

                <th>Instance</th>

                <th>Status</th>

                <th>Value</th>

              </tr>

            </thead>

            <tbody>

              {dept.employees.map((emp, index) => (

                <tr
                  key={`${emp.employeeId}-${index}`}
                >

                  <td>{emp.employeeName}</td>

                  <td>{emp.employeeCode}</td>

                  <td>{emp.email}</td>

                  <td>{emp.assignedAsset}</td>

                  <td>{emp.instanceCode}</td>

                  <td>{emp.status}</td>

                  <td>
                    ${emp.totalCost.toLocaleString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    ))}

  </div>
);
const renderWarranty = () => (
  <div className="audit-report-grid">

<table className="audit-table">

<thead>
<tr>
<th>Asset</th>
<th>Instance</th>
<th>Location</th>
<th>Condition</th>
<th>Expiry</th>
<th>Cost</th>
</tr>
</thead>

<tbody>

{warranty.map(item => (

<tr key={item.instanceId}>
<td>{item.assetName}</td>
<td>{item.instanceCode}</td>
<td>{item.location}</td>
<td>{item.condition}</td>
<td>{new Date(item.expiryDate).toLocaleDateString()}</td>
<td>${item.totalCost}</td>
</tr>

))}

</tbody>

</table>

  </div>
);
const renderInsurance = () => (
  <div className="audit-report-grid">

<tbody>

{insurance.map(item => (

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

  </div>
);
const renderMaintenance = () => (
  <div className="audit-report-grid">
<tbody>

{maintenance.map(item => (

<tr key={item.instanceId}>

<td>{item.assetName}</td>

<td>{item.instanceCode}</td>

<td>{item.location}</td>

<td>{item.condition}</td>

<td>
  {new Date(
    item.nextMaintenanceDate
  ).toLocaleDateString()}
</td>

<td>₹{item.maintenanceCost}</td>

</tr>

))}

</tbody>

  </div>
);
const renderAssignment = () => (
  <div className="audit-report-grid">

<table className="audit-table">

<thead>
<tr>
<th>Employee</th>
<th>Department</th>
<th>Location</th>
<th>Status</th>
<th>Assigned</th>
<th>Returned</th>
</tr>
</thead>

<tbody>

{assignments.map(item => (

<tr key={item.assignmentId}>

<td>{item.employee}</td>

<td>{item.department}</td>

<td>{item.location}</td>

<td>{item.status}</td>

<td>
{new Date(item.assignedAt)
.toLocaleDateString()}
</td>

<td>
{item.returnedAt
? new Date(item.returnedAt)
.toLocaleDateString()
: "-"}
</td>

</tr>

))}

</tbody>

</table>

  </div>
);
const renderLifecycle = () => (
  <div className="audit-table-wrapper">

    <table className="audit-table">

      <thead>
        <tr>
          <th>Asset</th>
          <th>Code</th>
          <th>Type</th>
        </tr>
      </thead>

      <tbody>

{lifecycle.map((item,index) => (

<tr key={index}>

<td>{item.assetName}</td>

<td>{item.eventType}</td>

<td>{item.title}</td>

<td>{item.performedBy}</td>

<td>
{new Date(item.date)
.toLocaleDateString()}
</td>

</tr>

))}

</tbody>

    </table>

  </div>
);
const renderFinancial = () => (
  <>
    <div className="financial-grid">

      <div className="financial-card">
        <h4>Purchase Cost</h4>
        <h2>
          ${financial?.summary?.purchaseCost ?? 0}
        </h2>
      </div>

      <div className="financial-card">
        <h4>Maintenance Cost</h4>
        <h2>
          ${financial?.summary?.maintenanceCost ?? 0}


        </h2>
      </div>

      <div className="financial-card">
        <h4>Renewal Cost</h4>
        <h2>
${financial?.summary?.renewalCost ?? 0}
        </h2>
      </div>

      <div className="financial-card">
        <h4>Total Ownership</h4>
        <h2>
${financial?.summary?.totalOwnershipCost ?? 0}
        </h2>
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
            <th>Total Cost</th>
          </tr>
        </thead>

        <tbody>

{topExpensiveAssets.map(asset => (

<tr key={asset.instanceId}>

<td>{asset.assetName}</td>

<td>{asset.instanceCode}</td>

<td>${asset.totalCost}</td>

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

      {/* HARDWARE / SOFTWARE */}

      <div className="audit-switch">

        <button
          className={
            assetType === "hardware"
              ? "switch-btn active"
              : "switch-btn"
          }
          onClick={() => setAssetType("hardware")}
        >
          Hardware
        </button>

        <button
          className={
            assetType === "software"
              ? "switch-btn active"
              : "switch-btn"
          }
          onClick={() => setAssetType("software")}
        >
          Software
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

        <select>
          <option>Category</option>
        </select>

        <select>
          <option>Location</option>
        </select>

        <input type="date" />

        <input type="date" />

      </div>

      {/* CONTENT */}

<div className="audit-content">
  {renderContent()}
</div>

    </div>
  );
};

export default AuditPage;