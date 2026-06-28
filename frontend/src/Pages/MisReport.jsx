import React, { useEffect, useState } from "react";

import {
  getAuditDashboard,
} from "../Services/ApiServices";

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

const filteredFinancial =
  selectedYear === "All"
    ? financialInstances
    : financialInstances.filter((item) => {
        if (!item.purchaseDate) return false;

        return (
          new Date(item.purchaseDate)
            .getFullYear()
            .toString() === selectedYear
        );
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

const assignments =
  auditData.assignments || [];

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

const filteredLifecycle =
  selectedYear === "All"
    ? lifecycle
    : lifecycle.filter(item => {
        if (!item.purchaseDate) return false;

        return (
          new Date(item.purchaseDate)
            .getFullYear()
            .toString() === selectedYear
        );
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

<div className="audit-table-wrapper">
  <table className="audit-table">

    <thead>
      <tr>
        <th>Department</th>
        <th>Employees</th>
        <th>Assets</th>
        <th>Assigned</th>
        <th>Total Value</th>
        <th>Asset Preview</th>
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
            <td>{dept.departmentName}</td>

            <td>{dept.totalEmployees}</td>

            <td>{dept.totalAssets}</td>

            <td>{dept.activeAssignments}</td>

            <td>${dept.totalValue.toLocaleString()}</td>

            <td>
              {dept.assets
                .slice(0, 2)
                .map(asset => asset.assetName)
                .join(", ")}
              {dept.assets.length > 2 && "..."}
            </td>

          </tr>

          {/* Expanded Row */}

          {expandedDepartment === dept.departmentId && (

            <tr>

              <td colSpan={6}>

                <div className="department-expanded">

                  <div className="expanded-section">

                    <h4>Employees</h4>

                    {dept.employees.map(emp => (

                      <div
                        key={emp.employeeId}
                        className="employee-card"
                      >
                        <strong>{emp.employeeName}</strong>

                        <div>{emp.employeeCode}</div>

                        <div>
                          Active Assets: {emp.activeAssets}
                        </div>

                        <div>
                          Returned: {emp.returnedAssets}
                        </div>

                      </div>

                    ))}

                  </div>

                  <div className="expanded-section">

                    <h4>Assets</h4>

                    {dept.assets.map(asset => (

                      <div
                        key={asset.instanceId}
                        className="asset-card"
                      >
                        <strong>{asset.assetName}</strong>

                        <div>{asset.instanceCode}</div>

                        <div>{asset.assetType}</div>

                        <div>{asset.status}</div>

                        <div>
                          ${asset.totalCost.toLocaleString()}
                        </div>

                      </div>

                    ))}

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
  {filteredWarranty .map((item) => {

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

        {filteredMaintenance.map(item => {

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

        {filteredLifecycle.map((item, index) => (

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