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

const assets = auditData.summary?.assets || [];

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
    <th>Asset</th>
    <th>Instance</th>
    <th>Type</th>
    <th>Location</th>
    <th>Status</th>
    <th>Condition</th>
    <th>Purchase Date</th>
    <th>Purchase Cost</th>
    <th>Upgrade Cost</th>
    <th>Total Cost</th>
  </tr>
</thead>

<tbody>

{assets.map(asset => (

<tr key={asset.instanceId}>

<td>
    <strong>{asset.assetName}</strong>
    <br />
    <small>{asset.assetCode}</small>
</td>

<td>{asset.instanceCode}</td>

<td>{asset.assetType}</td>

<td>{asset.location}</td>

<td>{asset.status}</td>

<td>{asset.condition}</td>

<td>
{
asset.purchaseDate
? new Date(asset.purchaseDate).toLocaleDateString()
: "-"
}
</td>

<td>
${asset.purchaseCost.toLocaleString()}
</td>

<td>
${asset.upgradeCost.toLocaleString()}
</td>

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
const renderDepartment = () => (
  <div className="department-container">

    {departments.map((dept) => (
      <div
        key={dept.departmentId}
        className="department-card"
      >

        {/* Header */}

        <div className="department-header">
          <div>
            <h2>{dept.departmentName}</h2>

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
  {dept.assets.map(asset => (
    <tr key={asset.instanceId}>
      <td>
        <strong>{asset.assetName}</strong>
        <br />
        <small>{asset.assetCode}</small>
      </td>

      <td>{asset.instanceCode}</td>

      <td>{asset.assetType}</td>

      <td>{asset.location}</td>

      <td>{asset.status}</td>

      <td>{asset.condition}</td>

      <td>
        ${(asset.totalCost ?? 0).toLocaleString()}
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

            </thead><thead>
<tr>
    <th>Employee</th>
    <th>Code</th>
    <th>Email</th>
    <th>Total Assets</th>
    <th>Active</th>
    <th>Returned</th>
    <th>Total Value</th>
</tr>
</thead>

<tbody>

{dept.employees.map(emp => (

<tr key={emp.employeeId}>

<td>{emp.employeeName}</td>

<td>{emp.employeeCode}</td>

<td>{emp.email}</td>

<td>{emp.totalAssets}</td>

<td>{emp.activeAssets}</td>

<td>{emp.returnedAssets}</td>

<td>${(emp.totalValue ?? 0).toLocaleString()}</td>

</tr>

))}

</tbody>

          </table>

        </div>
  <div className="audit-table-wrapper">

<h3>Assignment History</h3>

<table className="audit-table">

<thead>
<tr>
<th>Employee</th>
<th>Asset</th>
<th>Instance</th>
<th>Status</th>
<th>Assigned</th>
<th>Returned</th>
<th>Location</th>
</tr>
</thead>

<tbody>

{dept.assignmentHistory.map(record => (

<tr key={record.assignmentId}>

<td>{record.employeeName}</td>

<td>{record.assetName}</td>

<td>{record.instanceCode}</td>

<td>{record.status}</td>

<td>
{record.assignedAt
? new Date(record.assignedAt).toLocaleDateString()
: "-"}
</td>

<td>
{record.returnedAt
? new Date(record.returnedAt).toLocaleDateString()
: "-"}
</td>

<td>{record.location}</td>

</tr>

))}

</tbody>

</table>

</div>
      </div>
    ))}

  </div>
);
const renderWarranty = () => {
  const today = new Date();

  return (
    <div className="audit-table-wrapper">
      <table className="audit-table">

<thead>
  <tr>
    <th>Asset</th>
    <th>Instance Details</th>
    <th>Location</th>
    <th>Warranty</th>
    <th>Cost</th>
    <th>Status</th>
  </tr>
</thead>

<tbody>
  {warranty.map((item) => {

    const expiry = new Date(item.expiryDate);

    const today = new Date();

    const daysLeft = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24)
    );

    return (
      <tr key={item.instanceId}>

        {/* Asset */}

        <td>
          <strong>{item.assetName}</strong>
          <br />
          <small>{item.assetCode}</small>
          <br />
          <small>{item.assetType.toUpperCase()}</small>
        </td>

        {/* Instance */}

        <td>
          <div>
            <strong>Instance:</strong> {item.instanceCode}
          </div>

          {item.deviceName && (
            <div>
              <strong>Device:</strong> {item.deviceName}
            </div>
          )}

          {item.serialNumber && (
            <div>
              <strong>Serial:</strong> {item.serialNumber}
            </div>
          )}

          {item.modelNo && (
            <div>
              <strong>Model:</strong> {item.modelNo}
            </div>
          )}
        </td>

        {/* Location */}

        <td>
          <div>{item.location}</div>

          <small>
            {item.condition}
          </small>
        </td>

        {/* Warranty */}

        <td>

          <div>
            <strong>Purchased</strong>
            <br />
            {item.purchaseDate
              ? new Date(item.purchaseDate).toLocaleDateString()
              : "-"}
          </div>

          <br />

          <div>
            <strong>Installed</strong>
            <br />
            {item.installationDate
              ? new Date(item.installationDate).toLocaleDateString()
              : "-"}
          </div>

          <br />

          <div>
            <strong>Expires</strong>
            <br />
            {expiry.toLocaleDateString()}
          </div>

        </td>

        {/* Cost */}

        <td>

          <div>
            <strong>Warranty</strong>
            <br />
            ${(item.warrantyCost ?? 0).toLocaleString()}
          </div>

          <br />

          <div>
            <strong>Total</strong>
            <br />
            ${(item.totalCost ?? 0).toLocaleString()}
          </div>

        </td>

        {/* Status */}

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

          <br />

          <small>{item.status}</small>

        </td>

      </tr>
    );
  })}
</tbody>
      </table>
    </div>
  );
};
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
          <th>Asset</th>
          <th>Instance Details</th>
          <th>Location</th>
          <th>Maintenance</th>
          <th>Costs</th>
          <th>Upgrades</th>
        </tr>
      </thead>

      <tbody>

        {maintenance.map(item => {

          const days =
            getDaysRemaining(
              item.nextMaintenanceDate
            );

          const status =
            getMaintenanceStatus(
              item.nextMaintenanceDate
            );

          return (

            <tr key={item.instanceId}>

              {/* Asset */}

              <td>

                <strong>{item.assetName}</strong>

                <br />

                <small>{item.assetCode}</small>

                <br />

                <small>{item.assetType}</small>

              </td>

              {/* Instance */}

              <td>

                <div>
                  <strong>Instance:</strong> {item.instanceCode}
                </div>

                {item.deviceName && (
                  <div>
                    <strong>Device:</strong> {item.deviceName}
                  </div>
                )}

                {item.serialNumber && (
                  <div>
                    <strong>Serial:</strong> {item.serialNumber}
                  </div>
                )}

                {item.modelNo && (
                  <div>
                    <strong>Model:</strong> {item.modelNo}
                  </div>
                )}

                {item.specifications && (
                  <div>
                    <strong>Specs:</strong> {item.specifications}
                  </div>
                )}

              </td>

              {/* Location */}

              <td>

                <div>{item.location}</div>

                <small>
                  {item.condition}
                </small>

                <br />

                <small>{item.status}</small>

              </td>

              {/* Maintenance */}

              <td>

                <div>

                  <strong>Purchase</strong>

                  <br />

                  {item.purchaseDate
                    ? new Date(
                        item.purchaseDate
                      ).toLocaleDateString()
                    : "-"}

                </div>

                <br />

                <div>

                  <strong>Installed</strong>

                  <br />

                  {item.installationDate
                    ? new Date(
                        item.installationDate
                      ).toLocaleDateString()
                    : "-"}

                </div>

                <br />

                <div>

                  <strong>Next Service</strong>

                  <br />

                  {item.nextMaintenanceDate
                    ? new Date(
                        item.nextMaintenanceDate
                      ).toLocaleDateString()
                    : "-"}

                </div>

                <br />

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

              {/* Costs */}

              <td>

                <div>

                  <strong>Purchase</strong>

                  <br />

                  {formatCurrency(
                    item.purchaseCost
                  )}

                </div>

                <br />

                <div>

                  <strong>Maintenance</strong>

                  <br />

                  {formatCurrency(
                    item.maintenanceCost
                  )}

                </div>

                <br />

                <div>

                  <strong>Warranty</strong>

                  <br />

                  {formatCurrency(
                    item.warrantyCost
                  )}

                </div>

                <br />

                <div>

                  <strong>Upgrade</strong>

                  <br />

                  {formatCurrency(
                    item.upgradeCost
                  )}

                </div>

                <hr />

                <strong>

                  {formatCurrency(
                    item.totalCost
                  )}

                </strong>

              </td>

              {/* Upgrades */}

              <td>

                <strong>

                  {item.upgrades?.length || 0}

                </strong>

                <br />

                {item.upgrades?.length > 0 &&

                  item.upgrades
                    .slice(0, 3)
                    .map((upgrade, index) => (

                      <div key={index}>

                        • {upgrade.description}

                        <br />

                        <small>

                          {new Date(
                            upgrade.date
                          ).toLocaleDateString()}

                        </small>

                      </div>

                    ))}

                {item.upgrades?.length > 3 && (

                  <small>

                    +{item.upgrades.length - 3} more

                  </small>

                )}

              </td>

            </tr>

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
          <th>Employee</th>
          <th>Asset</th>
          <th>Department</th>
          <th>Assignment</th>
          <th>Dates</th>
          <th>Asset Status</th>
          <th>Total Value</th>
        </tr>
      </thead>

      <tbody>

        {assignments.map(item => (

          <tr key={item.assignmentId}>

            {/* Employee */}

            <td>
              <strong>{item.employeeName}</strong>
              <br />
              <small>{item.employeeCode}</small>
              <br />
              <small>{item.employeeEmail}</small>
            </td>

            {/* Asset */}

            <td>
              <strong>{item.assetName}</strong>
              <br />
              <small>{item.assetCode}</small>

              <br />

              <small>
                {item.instanceCode}
              </small>

              <br />

              <small>
                {item.deviceName}
              </small>
            </td>

            {/* Department */}

            <td>
              {item.department}
            </td>

            {/* Assignment */}

            <td>

              <div>
                <strong>Status:</strong> {item.assignmentStatus}
              </div>

              <div>
                <strong>Location:</strong> {item.assignmentLocation}
              </div>

              <div>
                <strong>Assigned By:</strong>{" "}
                {item.assignedBy || "-"}
              </div>

              <div>
                <strong>Returned By:</strong>{" "}
                {item.returnedBy || "-"}
              </div>

            </td>

            {/* Dates */}

            <td>

              <div>
                <strong>Assigned</strong>
                <br />
                {item.assignedAt
                  ? new Date(item.assignedAt).toLocaleDateString()
                  : "-"}
              </div>

              <br />

              <div>
                <strong>Returned</strong>
                <br />
                {item.returnedAt
                  ? new Date(item.returnedAt).toLocaleDateString()
                  : "-"}
              </div>

            </td>

            {/* Asset Status */}

            <td>

              <div>
                <strong>{item.status}</strong>
              </div>

              <small>
                {item.condition}
              </small>

            </td>

            {/* Value */}

            <td>

              <strong>
                ${Number(item.totalCost || 0).toLocaleString()}
              </strong>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>
);
const renderLifecycle = () => (
  <div className="audit-table-wrapper">

    <h3>Asset Lifecycle History</h3>

    <table className="audit-table">

      <thead>
        <tr>
          <th>Asset</th>
          <th>Event</th>
          <th>Description</th>
          <th>Performed By</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>

        {lifecycle.map((item, index) => (

          <tr key={`${item.instanceId}-${index}`}>

            <td>

              <strong>{item.assetName}</strong>

              <br />

              <small>{item.assetCode}</small>

              <br />

              <small>{item.instanceCode}</small>

              <br />

              <small>{item.deviceName || "-"}</small>

            </td>

            <td>

              <strong>{item.title}</strong>

              <br />

              <small>{item.eventType}</small>

            </td>

            <td>

              {item.description || "-"}

            </td>

            <td>

              {item.performedBy || "System"}

            </td>

            <td>

              {item.date
                ? new Date(item.date).toLocaleString()
                : "-"}

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
    <h5>Purchase Cost</h5>
    <h2>${financial.summary.purchaseCost.toLocaleString()}</h2>
    <span>Initial Asset Investment</span>
  </div>

  <div className="financial-card">
    <h5>Maintenance</h5>
    <h2>${financial.summary.maintenanceCost.toLocaleString()}</h2>
    <span>Repairs & Servicing</span>
  </div>

  <div className="financial-card">
    <h5>Warranty</h5>
    <h2>${financial.summary.warrantyCost.toLocaleString()}</h2>
    <span>Warranty Renewals</span>
  </div>

  <div className="financial-card">
    <h5>Insurance</h5>
    <h2>${financial.summary.insuranceCost.toLocaleString()}</h2>
    <span>Insurance Premiums</span>
  </div>

  <div className="financial-card">
    <h5>Renewals</h5>
    <h2>${financial.summary.renewalCost.toLocaleString()}</h2>
    <span>Software Licenses</span>
  </div>

  <div className="financial-card">
    <h5>Upgrades</h5>
    <h2>${financial.summary.upgradeCost.toLocaleString()}</h2>
    <span>Hardware & Software Upgrades</span>
  </div>

  <div className="financial-card">
    <h5>Total Assets</h5>
    <h2>{financial.summary.totalAssets}</h2>
    <span>Tracked Assets</span>
  </div>

  <div className="financial-card highlight">
    <h5>Total Ownership Cost</h5>
    <h2>${financial.summary.totalOwnershipCost.toLocaleString()}</h2>
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

{financial.instances
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