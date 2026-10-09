import React, { useEffect, useState } from "react";
import {
  FiChevronUp,
  FiChevronDown,
  FiShoppingCart,
  FiTool,
  FiShield,
  FiUmbrella,
  FiRefreshCw,
  FiTrendingUp,
  FiLayers,
  FiDollarSign,
  FiArrowRight
} from "react-icons/fi";
import {
  getAuditDashboard,
} from "../Services/ApiServices";
import "../Page_styles/TestAuditPageFile.css";
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
const assignments = auditData.assignmentAudit || [];

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

<>
  {/* ================= SECTION HEADER ================= */}

  <div className="audit-summary-header">

    <div className="audit-summary-heading">
      <span className="audit-summary-eyebrow">
        INVENTORY REPORT
      </span>

      <h3>Asset Inventory Overview</h3>

      <p>
        Review hardware and software assets,
        their status, locations, costs and lifecycle details.
      </p>
    </div>

    <div className="audit-summary-count">
      <span>Assets</span>
      <strong>{filteredAssets.length}</strong>
    </div>

  </div>


  {/* ================= INVENTORY TABLE ================= */}

  <div className="audit-summary-table-wrapper">

    <table className="audit-summary-table">

      <thead>
        <tr>
          <th className="audit-summary-expand-col">
            Details
          </th>
          <th>Asset</th>
          <th>Type</th>
          <th>Status</th>
          <th>Location</th>
          <th>Purchase Date</th>
        </tr>
      </thead>

      <tbody>

        {filteredAssets.length > 0 ? (

          filteredAssets.map((asset) => {

            const isExpanded =
              expandedSummary === asset.instanceId;

            const isHardware =
              asset.assetType === "hardware";

            const formatAssetDate = (date) => {
              if (!date) return "-";

              const parsed = new Date(date);

              return Number.isNaN(parsed.getTime())
                ? "-"
                : parsed.toLocaleDateString();
            };

            const formatAssetCost = (value) => {
              const amount = Number(value);

              return Number.isFinite(amount)
                ? `$${amount.toLocaleString()}`
                : "-";
            };

            return (

              <React.Fragment key={asset.instanceId}>

                {/* ================= MAIN ROW ================= */}

                <tr
                  className={
                    isExpanded
                      ? "audit-summary-row expanded"
                      : "audit-summary-row"
                  }
                >

                  {/* EXPAND */}

                  <td
                    className="audit-summary-expand-cell"
                    data-label="Details"
                  >

                    <button
                      type="button"
                      className={
                        isExpanded
                          ? "audit-summary-expand-btn active"
                          : "audit-summary-expand-btn"
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        `${isExpanded ? "Collapse" : "Expand"} details for ${asset.assetName}`
                      }
                      onClick={() =>
                        setExpandedSummary(
                          isExpanded
                            ? null
                            : asset.instanceId
                        )
                      }
                    >
                      {isExpanded
                        ? <FiChevronUp />
                        : <FiChevronDown />}
                    </button>

                  </td>


                  {/* ASSET */}

                  <td
                    data-label="Asset"
                    className="audit-summary-asset-cell"
                  >
                    <div className="audit-summary-asset-info">

                      <strong>
                        {asset.assetName || "-"}
                      </strong>

                      <span>
                        {asset.assetCode || "-"}
                      </span>

                    </div>
                  </td>


                  {/* TYPE */}

                  <td data-label="Type">

                    <span
                      className={
                        `audit-summary-type ${
                          isHardware
                            ? "hardware"
                            : "software"
                        }`
                      }
                    >
                      {isHardware
                        ? "Hardware"
                        : "Software"}
                    </span>

                  </td>


                  {/* STATUS */}

                  <td data-label="Status">

                    <span
                      className={
                        `audit-summary-status ${
                          String(asset.status || "")
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, "-")
                        }`
                      }
                    >
                      <span className="audit-summary-status-dot" />

                      {String(asset.status || "-")
                        .replace(/_/g, " ")}
                    </span>

                  </td>


                  {/* LOCATION */}

                  <td data-label="Location">

                    <span className="audit-summary-location">
                      {asset.location || "-"}
                    </span>

                  </td>


                  {/* PURCHASE DATE */}

                  <td data-label="Purchase Date">

                    <span className="audit-summary-date">
                      {formatAssetDate(asset.purchaseDate)}
                    </span>

                  </td>

                </tr>


                {/* ================= EXPANDED DETAILS ================= */}

                {isExpanded && (

                  <tr className="audit-summary-detail-row">

                    <td colSpan={6}>

                      <div className="audit-summary-details">

                        {/* DETAILS HEADER */}

                        <div className="audit-summary-details-header">

                          <div>
                            <span className="audit-summary-details-eyebrow">
                              INSTANCE INFORMATION
                            </span>

                            <h4>
                              {isHardware
                                ? "Hardware Details"
                                : "Software Details"}
                            </h4>

                            <p>
                              {asset.instanceCode || "-"}
                            </p>
                          </div>

                          <span className="audit-summary-details-status">
                            {String(asset.status || "-")
                              .replace(/_/g, " ")}
                          </span>

                        </div>


                        {/* COMMON DETAILS */}

                        <div className="audit-summary-detail-section">

                          <div className="audit-summary-detail-title">
                            <h5>General Information</h5>
                          </div>

                          <div className="audit-summary-details-grid">

                            <div className="audit-summary-detail-item">
                              <label>Instance Code</label>
                              <p>{asset.instanceCode || "-"}</p>
                            </div>

                            <div className="audit-summary-detail-item">
                              <label>Device Name</label>
                              <p>{asset.deviceName || "-"}</p>
                            </div>

                            <div className="audit-summary-detail-item">
                              <label>Purchase Date</label>
                              <p>
                                {formatAssetDate(asset.purchaseDate)}
                              </p>
                            </div>

                            <div className="audit-summary-detail-item">
                              <label>Installation Date</label>
                              <p>
                                {formatAssetDate(asset.installationDate)}
                              </p>
                            </div>

                          </div>

                        </div>


                        {/* FINANCIAL DETAILS */}

                        <div className="audit-summary-detail-section">

                          <div className="audit-summary-detail-title">
                            <h5>Financial Information</h5>
                          </div>

                          <div className="audit-summary-details-grid">

                            <div className="audit-summary-detail-item">
                              <label>Purchase Cost</label>
                              <p>
                                {formatAssetCost(asset.purchaseCost)}
                              </p>
                            </div>

                            <div className="audit-summary-detail-item highlight">
                              <label>Total Cost</label>
                              <p>
                                {formatAssetCost(asset.totalCost)}
                              </p>
                            </div>

                          </div>

                        </div>


                        {/* HARDWARE DETAILS */}

                        {isHardware && (

                          <div className="audit-summary-detail-section">

                            <div className="audit-summary-detail-title">
                              <h5>Hardware Specifications & Lifecycle</h5>
                            </div>

                            <div className="audit-summary-details-grid">

                              <div className="audit-summary-detail-item">
                                <label>Serial Number</label>
                                <p>{asset.serialNumber || "-"}</p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Model No.</label>
                                <p>{asset.modelNo || "-"}</p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Specification</label>
                                <p>{asset.specifications || "-"}</p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Next Maintenance</label>
                                <p>
                                  {formatAssetDate(
                                    asset.nextMaintenanceDate
                                  )}
                                </p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Warranty Expiry</label>
                                <p>
                                  {formatAssetDate(
                                    asset.warrantyExpiry
                                  )}
                                </p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Insurance Expiry</label>
                                <p>
                                  {formatAssetDate(
                                    asset.insuranceExpiry
                                  )}
                                </p>
                              </div>

                            </div>


                            <div className="audit-summary-detail-title audit-summary-cost-heading">
                              <h5>Additional Costs</h5>
                            </div>

                            <div className="audit-summary-details-grid">

                              <div className="audit-summary-detail-item">
                                <label>Maintenance Cost</label>
                                <p>
                                  {formatAssetCost(
                                    asset.maintenanceCost
                                  )}
                                </p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Insurance Cost</label>
                                <p>
                                  {formatAssetCost(
                                    asset.insuranceCost
                                  )}
                                </p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Upgrade Cost</label>
                                <p>
                                  {formatAssetCost(
                                    asset.upgradeCost
                                  )}
                                </p>
                              </div>

                            </div>

                          </div>

                        )}


                        {/* SOFTWARE DETAILS */}

                        {!isHardware && asset.assetType === "software" && (

                          <div className="audit-summary-detail-section">

                            <div className="audit-summary-detail-title">
                              <h5>Software License & Renewal</h5>
                            </div>

                            <div className="audit-summary-details-grid">

                              <div className="audit-summary-detail-item">
                                <label>License Key</label>
                                <p>{asset.licenseKey || "-"}</p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>License Number</label>
                                <p>{asset.licenseNumber || "-"}</p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Renewal Date</label>
                                <p>
                                  {formatAssetDate(asset.renewalDate)}
                                </p>
                              </div>

                              <div className="audit-summary-detail-item">
                                <label>Renewal Cost</label>
                                <p>
                                  {formatAssetCost(asset.renewalCost)}
                                </p>
                              </div>

                            </div>

                          </div>

                        )}

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            );

          })

        ) : (

          <tr>
            <td
              colSpan={6}
              className="audit-summary-empty"
            >
              <div>
                <h4>No Assets Found</h4>

                <p>
                  No assets match the selected filters.
                </p>
              </div>
            </td>
          </tr>

        )}

      </tbody>

    </table>

  </div>
</>

  </>
);
const renderDepartment = () => (

<div className="audit-department-container">

  {/* ================= HEADER ================= */}

  <div className="audit-department-header">

    <div className="audit-department-heading">

      <span className="audit-department-eyebrow">
        DEPARTMENT REPORT
      </span>

      <h3>Department Asset Overview</h3>

      <p>
        Monitor department-wise asset allocation,
        employee assignments and asset values.
      </p>

    </div>

    <div className="audit-department-count">
      <span>Departments</span>
      <strong>{departments.length}</strong>
    </div>

  </div>


  {/* ================= DEPARTMENT TABLE ================= */}

  <div className="audit-department-table-wrapper">

    <table className="audit-department-table">

      <thead>
        <tr>
          <th className="audit-department-expand-col">
            Details
          </th>
          <th>Department</th>
          <th>Employees</th>
          <th>Assets</th>
          <th>Total Value</th>
        </tr>
      </thead>

      <tbody>

        {departments.length > 0 ? (

          departments.map((dept) => {

            const isExpanded =
              expandedDepartment === dept.departmentId;

            const formatDate = (value) => {
              if (!value) return "-";

              const date = new Date(value);

              return Number.isNaN(date.getTime())
                ? "-"
                : date.toLocaleDateString();
            };

            const formatCost = (value) => {
              const amount = Number(value);

              return Number.isFinite(amount)
                ? `$${amount.toLocaleString()}`
                : "-";
            };

            return (

              <React.Fragment key={dept.departmentId}>

                {/* ================= MAIN ROW ================= */}

                <tr
                  className={
                    isExpanded
                      ? "audit-department-row expanded"
                      : "audit-department-row"
                  }
                  onClick={() =>
                    setExpandedDepartment(
                      isExpanded
                        ? null
                        : dept.departmentId
                    )
                  }
                >

                  {/* EXPAND BUTTON */}

                  <td
                    className="audit-department-expand-cell"
                    data-label="Details"
                  >

                    <button
                      type="button"
                      className={
                        isExpanded
                          ? "audit-department-expand-btn active"
                          : "audit-department-expand-btn"
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        `${isExpanded ? "Collapse" : "Expand"} ${dept.departmentName}`
                      }
                      onClick={(e) => {
                        e.stopPropagation();

                        setExpandedDepartment(
                          isExpanded
                            ? null
                            : dept.departmentId
                        );
                      }}
                    >
                      {isExpanded
                        ? <FiChevronUp />
                        : <FiChevronDown />}
                    </button>

                  </td>


                  {/* DEPARTMENT */}

                  <td
                    data-label="Department"
                    className="audit-department-name-cell"
                  >
                    <div className="audit-department-name">

                      <strong>
                        {dept.departmentName || "-"}
                      </strong>

                      <span>
                        Department Assets
                      </span>

                    </div>
                  </td>


                  {/* EMPLOYEES */}

                  <td data-label="Employees">

                    <span className="audit-department-metric">
                      {dept.totalEmployees ?? 0}
                    </span>

                  </td>


                  {/* ASSETS */}

                  <td data-label="Assets">

                    <span className="audit-department-metric">
                      {dept.totalAssets ?? 0}
                    </span>

                  </td>


                  {/* TOTAL VALUE */}

                  <td data-label="Total Value">

                    <strong className="audit-department-value">
                      {formatCost(dept.totalValue)}
                    </strong>

                  </td>

                </tr>


                {/* ================= EXPANDED ROW ================= */}

                {isExpanded && (

                  <tr className="audit-department-detail-row">

                    <td colSpan={5}>

                      <div className="audit-department-details">

                        {/* DETAILS HEADER */}

                        <div className="audit-department-details-header">

                          <div>
                            <span className="audit-department-details-eyebrow">
                              ASSIGNMENT HISTORY
                            </span>

                            <h4>
                              {dept.departmentName}
                            </h4>

                            <p>
                              Employee asset allocation
                              and assignment records
                            </p>
                          </div>

                          <div className="audit-department-details-badges">

                            <span className="audit-department-info-badge">
                              {dept.totalEmployees ?? 0} Employees
                            </span>

                            <span className="audit-department-info-badge active">
                              {dept.activeAssignments ?? 0} Active Assignments
                            </span>

                          </div>

                        </div>


                        {/* ASSIGNMENT HISTORY */}

                        {dept.assignmentHistory?.length > 0 ? (

                          <div className="audit-department-history-list">

                            {dept.assignmentHistory.map(
                              (record, index) => {

                                const asset =
                                  dept.assets?.find(
                                    (a) =>
                                      a.instanceCode ===
                                      record.instanceCode
                                  );

                                return (

                                  <div
                                    key={
                                      record.assignmentId ??
                                      `${record.instanceCode}-${index}`
                                    }
                                    className="audit-department-history-card"
                                  >

                                    {/* RECORD HEADER */}

                                    <div className="audit-department-history-header">

                                      <div className="audit-department-history-identity">

                                        <span className="audit-department-history-index">
                                          {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <div>
                                          <h5>
                                            {record.assetName || "Unnamed Asset"}
                                          </h5>

                                          <p>
                                            {record.instanceCode || "-"}
                                          </p>
                                        </div>

                                      </div>

                                      <span
                                        className={
                                          `audit-department-history-status ${
                                            String(record.status || "")
                                              .toLowerCase()
                                              .replace(/[^a-z0-9_-]/g, "-")
                                          }`
                                        }
                                      >
                                        <span className="audit-department-status-dot" />

                                        {String(record.status || "-")
                                          .replace(/_/g, " ")}
                                      </span>

                                    </div>


                                    {/* RECORD DETAILS */}

                                    <div className="audit-department-history-grid">

                                      <div className="audit-department-history-item">
                                        <label>Employee</label>
                                        <p>{record.employeeName || "-"}</p>
                                      </div>

                                      <div className="audit-department-history-item">
                                        <label>Employee Code</label>
                                        <p>{record.employeeCode || "-"}</p>
                                      </div>

                                      <div className="audit-department-history-item">
                                        <label>Asset</label>
                                        <p>{record.assetName || "-"}</p>
                                      </div>

                                      <div className="audit-department-history-item">
                                        <label>Instance</label>
                                        <p>{record.instanceCode || "-"}</p>
                                      </div>

                                      <div className="audit-department-history-item">
                                        <label>Status</label>
                                        <p>
                                          {String(record.status || "-")
                                            .replace(/_/g, " ")}
                                        </p>
                                      </div>

                                      <div className="audit-department-history-item">
                                        <label>Assigned Date</label>
                                        <p>
                                          {formatDate(record.assignedAt)}
                                        </p>
                                      </div>

                                      <div className="audit-department-history-item">
                                        <label>Returned Date</label>
                                        <p>
                                          {formatDate(record.returnedAt)}
                                        </p>
                                      </div>

                                      <div className="audit-department-history-item">
                                        <label>Location</label>
                                        <p>{record.location || "-"}</p>
                                      </div>

                                      <div className="audit-department-history-item highlight">
                                        <label>Asset Value</label>
                                        <p>
                                          {formatCost(asset?.totalCost ?? 0)}
                                        </p>
                                      </div>

                                    </div>

                                  </div>

                                );

                              }
                            )}

                          </div>

                        ) : (

                          <div className="audit-department-empty-history">

                            <h5>No Assignment History</h5>

                            <p>
                              No assignment records are
                              available for this department.
                            </p>

                          </div>

                        )}

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            );

          })

        ) : (

          <tr>
            <td
              colSpan={5}
              className="audit-department-empty"
            >
              <h4>No Departments Found</h4>

              <p>
                There are no department records
                available for the selected filters.
              </p>
            </td>
          </tr>

        )}

      </tbody>

    </table>

  </div>

</div>

);
const renderWarranty = () => {
  const today = new Date();

  return (

<div className="audit-warranty-container">

  {/* ================= HEADER ================= */}

  <div className="audit-warranty-header">

    <div className="audit-warranty-heading">

      <span className="audit-warranty-eyebrow">
        WARRANTY REPORT
      </span>

      <h3>Asset Warranty Overview</h3>

      <p>
        Monitor warranty expiration dates,
        coverage status and historical warranty costs.
      </p>

    </div>

    <div className="audit-warranty-count">
      <span>Assets</span>
      <strong>{filteredWarranty.length}</strong>
    </div>

  </div>


  {/* ================= WARRANTY TABLE ================= */}

  <div className="audit-warranty-table-wrapper">

    <table className="audit-warranty-table">

      <thead>
        <tr>
          <th className="audit-warranty-expand-col">
            Details
          </th>
          <th>Asset</th>
          <th>Type</th>
          <th>Warranty Purchase</th>
          <th>Warranty Expiry</th>
          <th>Total Cost</th>
        </tr>
      </thead>

      <tbody>

        {filteredWarranty.length > 0 ? (

          filteredWarranty.map((item) => {

            const isExpanded =
              expandedWarranty === item.instanceId;

            const expiry =
              item.expiryDate
                ? new Date(item.expiryDate)
                : null;

            const validExpiry =
              expiry &&
              !Number.isNaN(expiry.getTime());

            const daysLeft = validExpiry
              ? Math.ceil(
                  (expiry.getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
                )
              : null;

            const warrantyStatus =
              daysLeft === null
                ? {
                    label: "Not Available",
                    className: "unknown",
                  }
                : daysLeft < 0
                ? {
                    label: "Expired",
                    className: "expired",
                  }
                : daysLeft <= 30
                ? {
                    label: "Expiring Soon",
                    className: "expiring",
                  }
                : {
                    label: "Active",
                    className: "active",
                  };

            const formatWarrantyDate = (value) => {
              if (!value) return "-";

              const date = new Date(value);

              return Number.isNaN(date.getTime())
                ? "-"
                : date.toLocaleDateString();
            };

            return (

              <React.Fragment key={item.instanceId}>

                {/* ================= MAIN ROW ================= */}

                <tr
                  className={
                    isExpanded
                      ? "audit-warranty-row expanded"
                      : "audit-warranty-row"
                  }
                >

                  {/* EXPAND BUTTON */}

                  <td
                    className="audit-warranty-expand-cell"
                    data-label="Details"
                  >

                    <button
                      type="button"
                      className={
                        isExpanded
                          ? "audit-warranty-expand-btn active"
                          : "audit-warranty-expand-btn"
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        `${isExpanded ? "Collapse" : "Expand"} warranty details for ${item.assetName}`
                      }
                      onClick={() =>
                        setExpandedWarranty(
                          isExpanded
                            ? null
                            : item.instanceId
                        )
                      }
                    >
                      {isExpanded
                        ? <FiChevronUp />
                        : <FiChevronDown />}
                    </button>

                  </td>


                  {/* ASSET */}

                  <td
                    data-label="Asset"
                    className="audit-warranty-asset-cell"
                  >

                    <div className="audit-warranty-asset-info">

                      <strong>
                        {item.assetName || "-"}
                      </strong>

                      <span>
                        {item.assetCode || "-"}
                      </span>

                    </div>

                  </td>


                  {/* TYPE */}

                  <td data-label="Type">

                    <span
                      className={
                        `audit-warranty-type ${
                          item.assetType === "hardware"
                            ? "hardware"
                            : "software"
                        }`
                      }
                    >
                      {item.assetType === "hardware"
                        ? "Hardware"
                        : "Software"}
                    </span>

                  </td>


                  {/* PURCHASE DATE */}

                  <td data-label="Warranty Purchase">

                    <span className="audit-warranty-date">
                      {formatWarrantyDate(
                        item.warrantyPurchaseDate
                      )}
                    </span>

                  </td>


                  {/* EXPIRY */}

                  <td
                    data-label="Warranty Expiry"
                    className="audit-warranty-expiry-cell"
                  >

                    <div className="audit-warranty-expiry-info">

                      <span className="audit-warranty-date">
                        {formatWarrantyDate(item.expiryDate)}
                      </span>

                      <span
                        className={
                          `audit-warranty-status ${warrantyStatus.className}`
                        }
                      >
                        <span className="audit-warranty-status-dot" />

                        {warrantyStatus.label}
                      </span>

                      {daysLeft !== null && (
                        <small className="audit-warranty-days">
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)} days overdue`
                            : daysLeft === 0
                            ? "Expires today"
                            : `${daysLeft} days remaining`}
                        </small>
                      )}

                    </div>

                  </td>


                  {/* TOTAL COST */}

                  <td data-label="Total Cost">

                    <strong className="audit-warranty-total-value">
                      {formatCurrency(item.totalCost ?? 0)}
                    </strong>

                  </td>

                </tr>


                {/* ================= EXPANDED DETAILS ================= */}

                {isExpanded && (

                  <tr className="audit-warranty-detail-row">

                    <td colSpan={6}>

                      <div className="audit-warranty-details">

                        {/* DETAILS HEADER */}

                        <div className="audit-warranty-details-header">

                          <div>

                            <span className="audit-warranty-details-eyebrow">
                              WARRANTY COST ANALYSIS
                            </span>

                            <h4>
                              {item.assetName || "-"}
                            </h4>

                            <p>
                              {item.assetCode || "-"}
                            </p>

                          </div>


                          <div className="audit-warranty-details-badges">

                            <span
                              className={
                                `audit-warranty-type ${
                                  item.assetType === "hardware"
                                    ? "hardware"
                                    : "software"
                                }`
                              }
                            >
                              {item.assetType === "hardware"
                                ? "Hardware"
                                : "Software"}
                            </span>

                            <span
                              className={
                                `audit-warranty-status ${warrantyStatus.className}`
                              }
                            >
                              <span className="audit-warranty-status-dot" />

                              {warrantyStatus.label}
                            </span>

                          </div>

                        </div>


                        {/* ================= WARRANTY SUMMARY ================= */}

                        <div className="audit-warranty-summary-grid">

                          <div className="audit-warranty-summary-item">

                            <label>Warranty Purchase</label>

                            <strong>
                              {formatWarrantyDate(
                                item.warrantyPurchaseDate
                              )}
                            </strong>

                          </div>


                          <div className="audit-warranty-summary-item">

                            <label>Warranty Expiry</label>

                            <strong>
                              {formatWarrantyDate(
                                item.expiryDate
                              )}
                            </strong>

                          </div>


                          <div className="audit-warranty-summary-item highlight">

                            <label>Total Cost</label>

                            <strong>
                              {formatCurrency(
                                item.totalCost ?? 0
                              )}
                            </strong>

                          </div>

                        </div>


                        {/* ================= YEARLY WARRANTY HISTORY ================= */}

                        <div className="audit-warranty-history-section">

                          <div className="audit-warranty-history-heading">

                            <div>
                              <h5>Warranty Cost History</h5>

                              <p>
                                Year-wise purchase,
                                warranty and total costs
                              </p>
                            </div>

                            <span className="audit-warranty-history-count">
                              {item.yearlyWarranty?.length ?? 0} Years
                            </span>

                          </div>


                          {item.yearlyWarranty?.length > 0 ? (

                            <div className="audit-warranty-year-grid">

                              {item.yearlyWarranty.map((year) => {

                                const currentYear =
                                  new Date().getFullYear();

                                let badge;

                                if (year.year > currentYear) {
                                  badge = {
                                    text: "Upcoming",
                                    className: "upcoming",
                                  };
                                } else if (
                                  year.year === currentYear
                                ) {
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
                                    className="audit-warranty-year-card"
                                    key={year.year}
                                  >

                                    {/* YEAR HEADER */}

                                    <div className="audit-warranty-year-header">

                                      <div>
                                        <span className="audit-warranty-year-eyebrow">
                                          WARRANTY PERIOD
                                        </span>

                                        <h6>{year.year}</h6>
                                      </div>

                                      <span
                                        className={
                                          `audit-warranty-year-badge ${badge.className}`
                                        }
                                      >
                                        {badge.text}
                                      </span>

                                    </div>


                                    {/* PURCHASE DATE */}

                                    <div className="audit-warranty-year-purchase">

                                      <span>
                                        Warranty Purchase
                                      </span>

                                      <strong>
                                        {item.warrantyPurchaseDate
                                          ? formatDate(
                                              item.warrantyPurchaseDate
                                            )
                                          : "-"}
                                      </strong>

                                    </div>


                                    {/* YEARLY COSTS */}

                                    <div className="audit-warranty-year-costs">

                                      <div className="audit-warranty-year-row">

                                        <span>
                                          Purchase Cost
                                        </span>

                                        <strong>
                                          {formatCurrency(
                                            year.purchaseCost ?? 0
                                          )}
                                        </strong>

                                      </div>


                                      <div className="audit-warranty-year-row">

                                        <span>
                                          Warranty Cost
                                        </span>

                                        <strong>
                                          {formatCurrency(
                                            year.warrantyCost ?? 0
                                          )}
                                        </strong>

                                      </div>

                                    </div>


                                    {/* YEAR TOTAL */}

                                    <div className="audit-warranty-year-total">

                                      <span>Total Cost</span>

                                      <strong>
                                        {formatCurrency(
                                          year.totalCost ?? 0
                                        )}
                                      </strong>

                                    </div>

                                  </div>

                                );

                              })}

                            </div>

                          ) : (

                            <div className="audit-warranty-empty-history">

                              <h6>No Warranty History</h6>

                              <p>
                                No year-wise warranty cost
                                records are available.
                              </p>

                            </div>

                          )}

                        </div>

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            );

          })

        ) : (

          <tr>

            <td
              colSpan={6}
              className="audit-warranty-empty"
            >

              <h4>No Warranty Records Found</h4>

              <p>
                No warranty records match the
                selected filters.
              </p>

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

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

<div className="audit-insurance-container">

  {/* ================= HEADER ================= */}

  <div className="audit-insurance-header">

    <div className="audit-insurance-heading">

      <span className="audit-insurance-eyebrow">
        INSURANCE REPORT
      </span>

      <h3>Asset Insurance Overview</h3>

      <p>
        Monitor asset insurance coverage, expiration dates,
        policy information and historical insurance costs.
      </p>

    </div>

    <div className="audit-insurance-count">
      <span>Assets</span>
      <strong>{filteredInsurance.length}</strong>
    </div>

  </div>


  {/* ================= INSURANCE TABLE ================= */}

  <div className="audit-insurance-table-wrapper">

    <table className="audit-insurance-table">

      <thead>
        <tr>
          <th className="audit-insurance-expand-col">
            Details
          </th>
          <th>Asset</th>
          <th>Type</th>
          <th>Insurance Expiry</th>
          <th>Status</th>
          <th>Total Cost</th>
        </tr>
      </thead>

      <tbody>

        {filteredInsurance.length > 0 ? (

          filteredInsurance.map((item) => {

            const isExpanded =
              expandedInsurance === item.instanceId;

            const expiry = item.insuranceExpiry
              ? new Date(item.insuranceExpiry)
              : null;

            const validExpiry =
              expiry && !Number.isNaN(expiry.getTime());

            const daysLeft = validExpiry
              ? Math.ceil(
                  (expiry.getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
                )
              : null;

            const insuranceStatus =
              daysLeft === null
                ? {
                    text: "Not Available",
                    className: "unknown",
                  }
                : daysLeft < 0
                ? {
                    text: `${Math.abs(daysLeft)} Days Expired`,
                    className: "expired",
                  }
                : daysLeft === 0
                ? {
                    text: "Expires Today",
                    className: "warning",
                  }
                : daysLeft <= 30
                ? {
                    text: `${daysLeft} Days Left`,
                    className: "warning",
                  }
                : {
                    text: `${daysLeft} Days Left`,
                    className: "active",
                  };

            const formatInsuranceDate = (value) => {
              if (!value) return "-";

              const date = new Date(value);

              return Number.isNaN(date.getTime())
                ? "-"
                : date.toLocaleDateString();
            };

            const coverageTypes = Array.isArray(item.coverageType)
              ? item.coverageType
                  .map((coverage) =>
                    typeof coverage === "string"
                      ? coverage
                      : coverage?.label || coverage?.value || ""
                  )
                  .filter(Boolean)
              : item.coverageType
              ? [String(item.coverageType)]
              : [];

            return (

              <React.Fragment key={item.instanceId}>

                {/* ================= MAIN ROW ================= */}

                <tr
                  className={
                    isExpanded
                      ? "audit-insurance-row expanded"
                      : "audit-insurance-row"
                  }
                >

                  {/* EXPAND */}

                  <td
                    className="audit-insurance-expand-cell"
                    data-label="Details"
                  >

                    <button
                      type="button"
                      className={
                        isExpanded
                          ? "audit-insurance-expand-btn active"
                          : "audit-insurance-expand-btn"
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        `${isExpanded ? "Collapse" : "Expand"} insurance details for ${item.assetName}`
                      }
                      onClick={() =>
                        setExpandedInsurance(
                          isExpanded
                            ? null
                            : item.instanceId
                        )
                      }
                    >
                      {isExpanded
                        ? <FiChevronUp />
                        : <FiChevronDown />}
                    </button>

                  </td>


                  {/* ASSET */}

                  <td
                    data-label="Asset"
                    className="audit-insurance-asset-cell"
                  >

                    <div className="audit-insurance-asset-info">

                      <strong>
                        {item.assetName || "-"}
                      </strong>

                      <span>
                        {item.assetCode || "-"}
                      </span>

                    </div>

                  </td>


                  {/* TYPE */}

                  <td data-label="Type">

                    <span
                      className={
                        `audit-insurance-type ${
                          item.assetType === "hardware"
                            ? "hardware"
                            : "software"
                        }`
                      }
                    >
                      {item.assetType === "hardware"
                        ? "Hardware"
                        : "Software"}
                    </span>

                  </td>


                  {/* INSURANCE EXPIRY */}

                  <td data-label="Insurance Expiry">

                    <span className="audit-insurance-date">
                      {formatInsuranceDate(
                        item.insuranceExpiry
                      )}
                    </span>

                  </td>


                  {/* STATUS */}

                  <td data-label="Status">

                    <span
                      className={
                        `audit-insurance-status ${insuranceStatus.className}`
                      }
                    >
                      <span className="audit-insurance-status-dot" />

                      {insuranceStatus.text}
                    </span>

                  </td>


                  {/* TOTAL COST */}

                  <td data-label="Total Cost">

                    <strong className="audit-insurance-total-value">
                      {formatCurrency(item.totalCost ?? 0)}
                    </strong>

                  </td>

                </tr>


                {/* ================= EXPANDED ROW ================= */}

                {isExpanded && (

                  <tr className="audit-insurance-detail-row">

                    <td colSpan={6}>

                      <div className="audit-insurance-details">

                        {/* DETAILS HEADER */}

                        <div className="audit-insurance-details-header">

                          <div>

                            <span className="audit-insurance-details-eyebrow">
                              INSURANCE INFORMATION
                            </span>

                            <h4>
                              {item.assetName || "-"}
                            </h4>

                            <p>
                              {item.assetCode || "-"}
                            </p>

                          </div>


                          <div className="audit-insurance-details-badges">

                            <span
                              className={
                                `audit-insurance-type ${
                                  item.assetType === "hardware"
                                    ? "hardware"
                                    : "software"
                                }`
                              }
                            >
                              {item.assetType === "hardware"
                                ? "Hardware"
                                : "Software"}
                            </span>

                            <span
                              className={
                                `audit-insurance-status ${insuranceStatus.className}`
                              }
                            >
                              <span className="audit-insurance-status-dot" />

                              {insuranceStatus.text}
                            </span>

                          </div>

                        </div>


                        {/* ================= ASSET INFORMATION ================= */}

                        <div className="audit-insurance-detail-section">

                          <div className="audit-insurance-section-title">
                            <h5>Asset Information</h5>
                          </div>

                          <div className="audit-insurance-details-grid">

                            <div className="audit-insurance-detail-item">
                              <label>Instance Code</label>
                              <p>{item.instanceCode || "-"}</p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Device</label>
                              <p>{item.deviceName || "-"}</p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Location</label>
                              <p>{item.location || "-"}</p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Status</label>
                              <p>
                                {String(item.status || "-")
                                  .replace(/_/g, " ")}
                              </p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Purchase Date</label>
                              <p>
                                {formatInsuranceDate(
                                  item.purchaseDate
                                )}
                              </p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Insurance Expiry</label>
                              <p>
                                {formatInsuranceDate(
                                  item.insuranceExpiry
                                )}
                              </p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Condition</label>
                              <p>{item.condition || "-"}</p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Model Number</label>
                              <p>{item.modelNo || "-"}</p>
                            </div>

                            <div className="audit-insurance-detail-item">
                              <label>Serial Number</label>
                              <p>{item.serialNumber || "-"}</p>
                            </div>

                          </div>

                        </div>


                        {/* ================= INSURANCE COVERAGE ================= */}

                        <div className="audit-insurance-detail-section">

                          <div className="audit-insurance-section-title">
                            <h5>Insurance Coverage</h5>
                          </div>

                          <div className="audit-insurance-coverage-box">

                            <label>Coverage Types</label>

                            {coverageTypes.length > 0 ? (

                              <div className="audit-insurance-coverage-list">

                                {coverageTypes.map((coverage, index) => (

                                  <span
                                    key={`${coverage}-${index}`}
                                    className="audit-insurance-coverage-badge"
                                  >
                                    {coverage}
                                  </span>

                                ))}

                              </div>

                            ) : (

                              <p className="audit-insurance-no-coverage">
                                No coverage information available
                              </p>

                            )}

                          </div>

                        </div>


                        {/* ================= FINANCIAL SUMMARY ================= */}

                        <div className="audit-insurance-detail-section">

                          <div className="audit-insurance-section-title">
                            <h5>Financial Summary</h5>
                          </div>

                          <div className="audit-insurance-financial-grid">

                            <div className="audit-insurance-financial-item">

                              <label>Purchase Cost</label>

                              <strong>
                                {formatCurrency(
                                  item.purchaseCost ?? 0
                                )}
                              </strong>

                            </div>

                            <div className="audit-insurance-financial-item">

                              <label>Insurance Cost</label>

                              <strong>
                                {formatCurrency(
                                  item.insuranceCost ?? 0
                                )}
                              </strong>

                            </div>

                            <div className="audit-insurance-financial-item highlight">

                              <label>Total Cost</label>

                              <strong>
                                {formatCurrency(
                                  item.totalCost ?? 0
                                )}
                              </strong>

                            </div>

                          </div>

                        </div>


                        {/* ================= YEARLY INSURANCE HISTORY ================= */}

                        <div className="audit-insurance-history-section">

                          <div className="audit-insurance-history-heading">

                            <div>
                              <h5>Insurance Cost History</h5>

                              <p>
                                Year-wise purchase,
                                insurance and total costs
                              </p>
                            </div>

                            <span className="audit-insurance-history-count">
                              {item.yearlyInsurance?.length ?? 0} Years
                            </span>

                          </div>


                          {item.yearlyInsurance?.length > 0 ? (

                            <div className="audit-insurance-year-grid">

                              {item.yearlyInsurance.map((year) => {

                                const currentYear =
                                  new Date().getFullYear();

                                let badge;

                                if (year.year > currentYear) {
                                  badge = {
                                    text: "Upcoming",
                                    className: "upcoming",
                                  };
                                } else if (
                                  year.year === currentYear
                                ) {
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
                                    className="audit-insurance-year-card"
                                  >

                                    {/* YEAR HEADER */}

                                    <div className="audit-insurance-year-header">

                                      <div>
                                        <span className="audit-insurance-year-eyebrow">
                                          INSURANCE PERIOD
                                        </span>

                                        <h6>{year.year}</h6>
                                      </div>

                                      <span
                                        className={
                                          `audit-insurance-year-badge ${badge.className}`
                                        }
                                      >
                                        {badge.text}
                                      </span>

                                    </div>


                                    {/* PURCHASE DATE */}

                                    <div className="audit-insurance-year-purchase">

                                      <span>
                                        Insurance Purchase
                                      </span>

                                      <strong>
                                        {item.insurancePurchaseDate
                                          ? formatDate(
                                              item.insurancePurchaseDate
                                            )
                                          : "-"}
                                      </strong>

                                    </div>


                                    {/* COST DETAILS */}

                                    <div className="audit-insurance-year-costs">

                                      <div className="audit-insurance-year-row">

                                        <span>Purchase Cost</span>

                                        <strong>
                                          {formatCurrency(
                                            year.purchaseCost ?? 0
                                          )}
                                        </strong>

                                      </div>

                                      <div className="audit-insurance-year-row">

                                        <span>Insurance Cost</span>

                                        <strong>
                                          {formatCurrency(
                                            year.insuranceCost ?? 0
                                          )}
                                        </strong>

                                      </div>

                                    </div>


                                    {/* TOTAL */}

                                    <div className="audit-insurance-year-total">

                                      <span>Total Cost</span>

                                      <strong>
                                        {formatCurrency(
                                          year.totalCost ?? 0
                                        )}
                                      </strong>

                                    </div>

                                  </div>

                                );

                              })}

                            </div>

                          ) : (

                            <div className="audit-insurance-empty-history">

                              <h6>No Insurance History</h6>

                              <p>
                                No year-wise insurance cost
                                records are available.
                              </p>

                            </div>

                          )}

                        </div>

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            );

          })

        ) : (

          <tr>
            <td
              colSpan={6}
              className="audit-insurance-empty"
            >
              <h4>No Insurance Records Found</h4>

              <p>
                No insurance records match the
                selected filters.
              </p>
            </td>
          </tr>

        )}

      </tbody>

    </table>

  </div>

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

<div className="audit-maintenance-container">

  {/* ================= HEADER ================= */}

  <div className="audit-maintenance-header">

    <div className="audit-maintenance-heading">

      <span className="audit-maintenance-eyebrow">
        LIFECYCLE REPORT
      </span>

      <h3>Maintenance & Renewal Audit</h3>

      <p>
        Track upcoming maintenance schedules,
        software renewals and historical asset costs.
      </p>

    </div>

    <div className="audit-maintenance-count">
      <span>Assets</span>
      <strong>{filteredMaintenance.length}</strong>
    </div>

  </div>


  {/* ================= TABLE ================= */}

  <div className="audit-maintenance-table-wrapper">

    <table className="audit-maintenance-table">

      <thead>
        <tr>
          <th className="audit-maintenance-expand-col">
            Details
          </th>

          <th>Asset</th>

          <th>Purchase Date</th>

          <th>
            {assetType === "hardware"
              ? "Maintenance Date"
              : assetType === "software"
              ? "Renewal Date"
              : "Maintenance / Renewal"}
          </th>

          <th>Purchase Cost</th>

          <th>Days Left</th>
        </tr>
      </thead>


      <tbody>

        {filteredMaintenance.length > 0 ? (

          filteredMaintenance.map((item) => {

            const isHardware =
              item.assetType === "hardware";

            const isExpanded =
              expandedMaintenance === item.instanceId;

            const scheduleDate = isHardware
              ? item.nextMaintenanceDate
              : item.renewalDate;

            const days = scheduleDate
              ? getDaysRemaining(scheduleDate)
              : null;

            const status = scheduleDate
              ? getMaintenanceStatus(scheduleDate)
              : null;

            const yearlyHistory = isHardware
              ? item.yearlyMaintenance
              : item.yearlyRenewal;

            const historyLabel = isHardware
              ? "Maintenance"
              : "Renewal";

            const formatMaintenanceDate = (value) => {
              if (!value) return "-";

              const date = new Date(value);

              return Number.isNaN(date.getTime())
                ? "-"
                : date.toLocaleDateString();
            };

            const scheduleStatus =
              days === null || !Number.isFinite(days)
                ? {
                    text: "Not Scheduled",
                    className: "unknown",
                  }
                : days < 0
                ? {
                    text: `${Math.abs(days)} Days Overdue`,
                    className: "overdue",
                  }
                : days === 0
                ? {
                    text: "Due Today",
                    className: "warning",
                  }
                : days <= 30
                ? {
                    text: `${days} Days Left`,
                    className: "warning",
                  }
                : {
                    text: `${days} Days Left`,
                    className: "active",
                  };

            return (

              <React.Fragment key={item.instanceId}>

                {/* ================= MAIN ROW ================= */}

                <tr
                  className={
                    isExpanded
                      ? "audit-maintenance-row expanded"
                      : "audit-maintenance-row"
                  }
                >

                  {/* EXPAND BUTTON */}

                  <td
                    className="audit-maintenance-expand-cell"
                    data-label="Details"
                  >

                    <button
                      type="button"
                      className={
                        isExpanded
                          ? "audit-maintenance-expand-btn active"
                          : "audit-maintenance-expand-btn"
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        `${isExpanded ? "Collapse" : "Expand"} details for ${item.assetName}`
                      }
                      onClick={() =>
                        setExpandedMaintenance(
                          isExpanded
                            ? null
                            : item.instanceId
                        )
                      }
                    >
                      {isExpanded
                        ? <FiChevronUp />
                        : <FiChevronDown />}
                    </button>

                  </td>


                  {/* ASSET */}

                  <td
                    data-label="Asset"
                    className="audit-maintenance-asset-cell"
                  >

                    <div className="audit-maintenance-asset-info">

                      <strong>
                        {item.assetName || "-"}
                      </strong>

                      <span>
                        {item.assetCode || "-"}
                      </span>

                      <span
                        className={
                          `audit-maintenance-type ${
                            isHardware
                              ? "hardware"
                              : "software"
                          }`
                        }
                      >
                        {isHardware
                          ? "Hardware"
                          : "Software"}
                      </span>

                    </div>

                  </td>


                  {/* PURCHASE DATE */}

                  <td data-label="Purchase Date">

                    <span className="audit-maintenance-date">
                      {formatMaintenanceDate(
                        item.purchaseDate
                      )}
                    </span>

                  </td>


                  {/* MAINTENANCE / RENEWAL DATE */}

                  <td
                    data-label={
                      isHardware
                        ? "Maintenance Date"
                        : "Renewal Date"
                    }
                  >

                    <div className="audit-maintenance-schedule-info">

                      <span className="audit-maintenance-date">
                        {formatMaintenanceDate(scheduleDate)}
                      </span>

                      <small>
                        {isHardware
                          ? "Next Maintenance"
                          : "Next Renewal"}
                      </small>

                    </div>

                  </td>


                  {/* PURCHASE COST */}

                  <td data-label="Purchase Cost">

                    <strong className="audit-maintenance-purchase-value">
                      {formatCurrency(
                        item.purchaseCost ?? 0
                      )}
                    </strong>

                  </td>


                  {/* DAYS LEFT */}

                  <td data-label="Days Left">

                    <span
                      className={
                        `audit-maintenance-status ${scheduleStatus.className}`
                      }
                      title={
                        status == null
                          ? undefined
                          : String(
                              typeof status === "object"
                                ? status.label ?? status.text ?? ""
                                : status
                            )
                      }
                    >
                      <span className="audit-maintenance-status-dot" />

                      {scheduleStatus.text}
                    </span>

                  </td>

                </tr>


                {/* ================= EXPANDED ROW ================= */}

                {isExpanded && (

                  <tr className="audit-maintenance-detail-row">

                    <td colSpan={6}>

                      <div className="audit-maintenance-details">

                        {/* DETAILS HEADER */}

                        <div className="audit-maintenance-details-header">

                          <div>

                            <span className="audit-maintenance-details-eyebrow">
                              {isHardware
                                ? "HARDWARE MAINTENANCE"
                                : "SOFTWARE RENEWAL"}
                            </span>

                            <h4>
                              {item.assetName || "-"}
                            </h4>

                            <p>
                              {item.assetCode || "-"}
                            </p>

                          </div>


                          <div className="audit-maintenance-details-badges">

                            <span
                              className={
                                `audit-maintenance-type ${
                                  isHardware
                                    ? "hardware"
                                    : "software"
                                }`
                              }
                            >
                              {isHardware
                                ? "Hardware"
                                : "Software"}
                            </span>

                            <span
                              className={
                                `audit-maintenance-status ${scheduleStatus.className}`
                              }
                            >
                              <span className="audit-maintenance-status-dot" />

                              {scheduleStatus.text}
                            </span>

                          </div>

                        </div>


                        {/* ================= SCHEDULE SUMMARY ================= */}

                        <div className="audit-maintenance-summary-grid">

                          <div className="audit-maintenance-summary-item">

                            <label>Purchase Date</label>

                            <strong>
                              {formatMaintenanceDate(
                                item.purchaseDate
                              )}
                            </strong>

                          </div>


                          <div className="audit-maintenance-summary-item">

                            <label>
                              {isHardware
                                ? "Next Maintenance"
                                : "Next Renewal"}
                            </label>

                            <strong>
                              {formatMaintenanceDate(
                                scheduleDate
                              )}
                            </strong>

                          </div>


                          <div className="audit-maintenance-summary-item highlight">

                            <label>Purchase Cost</label>

                            <strong>
                              {formatCurrency(
                                item.purchaseCost ?? 0
                              )}
                            </strong>

                          </div>

                        </div>


                        {/* ================= HISTORY ================= */}

                        <div className="audit-maintenance-history-section">

                          <div className="audit-maintenance-history-heading">

                            <div>

                              <h5>
                                {isHardware
                                  ? "Maintenance Cost History"
                                  : "Renewal Cost History"}
                              </h5>

                              <p>
                                Year-wise purchase,
                                {isHardware
                                  ? " maintenance"
                                  : " renewal"}{" "}
                                and total costs
                              </p>

                            </div>

                            <span className="audit-maintenance-history-count">
                              {yearlyHistory?.length ?? 0} Years
                            </span>

                          </div>


                          {yearlyHistory?.length > 0 ? (

                            <div className="audit-maintenance-year-grid">

                              {[...yearlyHistory]
                                .sort((a, b) => a.year - b.year)
                                .map((year) => {

                                  const currentYear =
                                    new Date().getFullYear();

                                  let badge;

                                  if (year.year > currentYear) {
                                    badge = {
                                      text: "Upcoming",
                                      className: "upcoming",
                                    };
                                  } else if (
                                    year.year === currentYear
                                  ) {
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
                                      className="audit-maintenance-year-card"
                                    >

                                      {/* YEAR HEADER */}

                                      <div className="audit-maintenance-year-header">

                                        <div>

                                          <span className="audit-maintenance-year-eyebrow">
                                            {isHardware
                                              ? "MAINTENANCE PERIOD"
                                              : "RENEWAL PERIOD"}
                                          </span>

                                          <h6>{year.year}</h6>

                                        </div>


                                        <span
                                          className={
                                            `audit-maintenance-year-badge ${badge.className}`
                                          }
                                        >
                                          {badge.text}
                                        </span>

                                      </div>


                                      {/* PURCHASE DATE */}

                                      <div className="audit-maintenance-year-purchase">

                                        <span>Asset Purchase</span>

                                        <strong>
                                          {formatMaintenanceDate(
                                            item.purchaseDate
                                          )}
                                        </strong>

                                      </div>


                                      {/* YEARLY COSTS */}

                                      <div className="audit-maintenance-year-costs">

                                        <div className="audit-maintenance-year-row">

                                          <span>Purchase Cost</span>

                                          <strong>
                                            {formatCurrency(
                                              year.purchaseCost ?? 0
                                            )}
                                          </strong>

                                        </div>


                                        <div className="audit-maintenance-year-row">

                                          <span>
                                            {historyLabel} Cost
                                          </span>

                                          <strong>
                                            {formatCurrency(
                                              isHardware
                                                ? year.maintenanceCost ?? 0
                                                : year.renewalCost ?? 0
                                            )}
                                          </strong>

                                        </div>

                                      </div>


                                      {/* YEAR TOTAL */}

                                      <div className="audit-maintenance-year-total">

                                        <span>Total Cost</span>

                                        <strong>
                                          {formatCurrency(
                                            year.totalCost ?? 0
                                          )}
                                        </strong>

                                      </div>

                                    </div>

                                  );

                                })}

                            </div>

                          ) : (

                            <div className="audit-maintenance-empty-history">

                              <h6>
                                No {historyLabel} History
                              </h6>

                              <p>
                                No year-wise{" "}
                                {historyLabel.toLowerCase()}{" "}
                                cost records are available.
                              </p>

                            </div>

                          )}

                        </div>

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            );

          })

        ) : (

          <tr>

            <td
              colSpan={6}
              className="audit-maintenance-empty"
            >

              <h4>No Maintenance Records Found</h4>

              <p>
                No maintenance or renewal records
                match the selected filters.
              </p>

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

</div>

);
const renderAssignment = () => (

<div className="audit-assignment-container">

  {/* ================= HEADER ================= */}

  <div className="audit-assignment-header">

    <div className="audit-assignment-heading">

      <span className="audit-assignment-eyebrow">
        ASSET MOVEMENT REPORT
      </span>

      <h3>Assignment Audit</h3>

      <p>
        Track asset assignments, employee transfers,
        returns and complete assignment history.
      </p>

    </div>

    <div className="audit-assignment-count">
      <span>Assets</span>
      <strong>{assignments.length}</strong>
    </div>

  </div>


  {/* ================= TABLE ================= */}

  <div className="audit-assignment-table-wrapper">

    <table className="audit-assignment-table">

      <thead>
        <tr>
          <th className="audit-assignment-expand-col">
            Details
          </th>
          <th>Asset</th>
          <th>Type</th>
          <th>Current Status</th>
          <th>Purchase Date</th>
          <th>Total Cost</th>
        </tr>
      </thead>

      <tbody>

        {assignments.length > 0 ? (

          assignments.map((item) => {

            const isExpanded =
              expandedAssignment === item.instanceId;

            const isHardware =
              item.assetType === "hardware";

            const assetStatus = String(
              item.status || "unknown"
            ).toLowerCase();

            const statusClass =
              assetStatus === "assigned" ||
              assetStatus === "active"
                ? "assigned"
                : assetStatus === "returned" ||
                  assetStatus === "in_stock"
                ? "returned"
                : assetStatus === "transferred"
                ? "transferred"
                : "neutral";

            const formatAssignmentDate = (value) => {
              if (!value) return "-";

              const date = new Date(value);

              return Number.isNaN(date.getTime())
                ? "-"
                : date.toLocaleDateString();
            };

            const assignmentHistory =
              item.assignmentHistory || [];

            return (

              <React.Fragment key={item.instanceId}>

                {/* ================= SUMMARY ROW ================= */}

                <tr
                  className={
                    isExpanded
                      ? "audit-assignment-row expanded"
                      : "audit-assignment-row"
                  }
                >

                  {/* EXPAND */}

                  <td
                    className="audit-assignment-expand-cell"
                    data-label="Details"
                  >

                    <button
                      type="button"
                      className={
                        isExpanded
                          ? "audit-assignment-expand-btn active"
                          : "audit-assignment-expand-btn"
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        `${isExpanded ? "Collapse" : "Expand"} assignment history for ${item.deviceName || item.assetName || "asset"}`
                      }
                      onClick={() =>
                        setExpandedAssignment(
                          isExpanded
                            ? null
                            : item.instanceId
                        )
                      }
                    >
                      {isExpanded
                        ? <FiChevronUp />
                        : <FiChevronDown />}
                    </button>

                  </td>


                  {/* ASSET */}

                  <td
                    data-label="Asset"
                    className="audit-assignment-asset-cell"
                  >

                    <div className="audit-assignment-asset-info">

                      <strong>
                        {item.deviceName ||
                          item.assetName ||
                          "-"}
                      </strong>

                      <span>
                        {item.instanceCode ||
                          item.assetCode ||
                          "-"}
                      </span>

                    </div>

                  </td>


                  {/* TYPE */}

                  <td data-label="Type">

                    <span
                      className={
                        `audit-assignment-type ${
                          isHardware
                            ? "hardware"
                            : "software"
                        }`
                      }
                    >
                      {isHardware
                        ? "Hardware"
                        : "Software"}
                    </span>

                  </td>


                  {/* CURRENT STATUS */}

                  <td data-label="Current Status">

                    <span
                      className={
                        `audit-assignment-status ${statusClass}`
                      }
                    >
                      <span className="audit-assignment-status-dot" />

                      {String(item.status || "Unknown")
                        .replace(/_/g, " ")}
                    </span>

                  </td>


                  {/* PURCHASE DATE */}

                  <td data-label="Purchase Date">

                    <span className="audit-assignment-date">
                      {formatAssignmentDate(
                        item.purchaseDate
                      )}
                    </span>

                  </td>


                  {/* TOTAL COST */}

                  <td data-label="Total Cost">

                    <strong className="audit-assignment-total-value">
                      {formatCurrency(
                        item.totalCost ?? 0
                      )}
                    </strong>

                  </td>

                </tr>


                {/* ================= EXPANDED HISTORY ================= */}

                {isExpanded && (

                  <tr className="audit-assignment-detail-row">

                    <td colSpan={6}>

                      <div className="audit-assignment-details">

                        {/* DETAILS HEADER */}

                        <div className="audit-assignment-details-header">

                          <div>

                            <span className="audit-assignment-details-eyebrow">
                              ASSIGNMENT ACTIVITY
                            </span>

                            <h4>
                              {item.deviceName ||
                                item.assetName ||
                                "-"}
                            </h4>

                            <p>
                              {item.instanceCode ||
                                item.assetCode ||
                                "-"}
                            </p>

                          </div>


                          <div className="audit-assignment-details-badges">

                            <span
                              className={
                                `audit-assignment-type ${
                                  isHardware
                                    ? "hardware"
                                    : "software"
                                }`
                              }
                            >
                              {isHardware
                                ? "Hardware"
                                : "Software"}
                            </span>

                            <span
                              className={
                                `audit-assignment-status ${statusClass}`
                              }
                            >
                              <span className="audit-assignment-status-dot" />

                              {String(
                                item.status || "Unknown"
                              ).replace(/_/g, " ")}
                            </span>

                          </div>

                        </div>


                        {/* ================= ASSET SUMMARY ================= */}

                        <div className="audit-assignment-summary-grid">

                          <div className="audit-assignment-summary-item">

                            <label>Asset Type</label>

                            <strong>
                              {isHardware
                                ? "Hardware"
                                : "Software"}
                            </strong>

                          </div>


                          <div className="audit-assignment-summary-item">

                            <label>Purchase Date</label>

                            <strong>
                              {formatAssignmentDate(
                                item.purchaseDate
                              )}
                            </strong>

                          </div>


                          <div className="audit-assignment-summary-item highlight">

                            <label>Total Asset Cost</label>

                            <strong>
                              {formatCurrency(
                                item.totalCost ?? 0
                              )}
                            </strong>

                          </div>

                        </div>


                        {/* ================= HISTORY HEADER ================= */}

                        <div className="audit-assignment-history-heading">

                          <div>

                            <h5>Assignment History</h5>

                            <p>
                              Complete movement and
                              assignment activity for this asset.
                            </p>

                          </div>

                          <span className="audit-assignment-history-count">
                            {assignmentHistory.length} Events
                          </span>

                        </div>


                        {/* ================= HISTORY TIMELINE ================= */}

                        {assignmentHistory.length > 0 ? (

                          <div className="audit-assignment-timeline">

                            {assignmentHistory.map(
                              (history, index) => {

                                const eventType = String(
                                  history.eventType || ""
                                ).toLowerCase();

                                const eventClass =
                                  eventType === "assigned" ||
                                  eventType === "reassigned" ||
                                  eventType === "returned"
                                    ? eventType
                                    : "default";

                                const from = history.from || {};
                                const to = history.to || {};

                                return (

                                  <div
                                    className="audit-assignment-timeline-item"
                                    key={
                                      history.assignmentId ||
                                      history._id ||
                                      index
                                    }
                                  >

                                    {/* TIMELINE MARKER */}

                                    <div className="audit-assignment-timeline-marker">

                                      <span
                                        className={
                                          `audit-assignment-timeline-dot ${eventClass}`
                                        }
                                      />

                                    </div>


                                    {/* HISTORY CARD */}

                                    <div className="audit-assignment-history-card">

                                      {/* EVENT HEADER */}

                                      <div className="audit-assignment-history-top">

                                        <div className="audit-assignment-history-event">

                                          <span
                                            className={
                                              `audit-assignment-event-badge ${eventClass}`
                                            }
                                          >
                                            {eventType
                                              ? eventType
                                                  .replace(/_/g, " ")
                                              : "Unknown"}
                                          </span>

                                          <span className="audit-assignment-event-number">
                                            Event {index + 1}
                                          </span>

                                        </div>


                                        <span className="audit-assignment-history-date">
                                          {formatAssignmentDate(
                                            history.date
                                          )}
                                        </span>

                                      </div>


                                      {/* ================= ASSIGNED ================= */}

                                      {eventType === "assigned" && (

                                        <div className="audit-assignment-history-body">

                                          <div className="audit-assignment-history-info-grid">

                                            <div className="audit-assignment-history-info">

                                              <label>
                                                Assigned From
                                              </label>

                                              <strong>
                                                {from.location ||
                                                  "Inventory"}
                                              </strong>

                                            </div>


                                            <div className="audit-assignment-history-info">

                                              <label>
                                                Assigned To
                                              </label>

                                              <strong>
                                                {to.employeeName || "-"}
                                              </strong>

                                            </div>


                                            <div className="audit-assignment-history-info">

                                              <label>Department</label>

                                              <p>
                                                {to.department || "-"}
                                              </p>

                                            </div>


                                            <div className="audit-assignment-history-info">

                                              <label>Location</label>

                                              <p>
                                                {to.location || "-"}
                                              </p>

                                            </div>

                                          </div>

                                        </div>

                                      )}


                                      {/* ================= REASSIGNED ================= */}

                                      {eventType === "reassigned" && (

                                        <div className="audit-assignment-history-body">

                                          <div className="audit-assignment-transfer">

                                            {/* FROM */}

                                            <div className="audit-assignment-transfer-person">

                                              <span className="audit-assignment-transfer-label">
                                                FROM
                                              </span>

                                              <strong>
                                                {from.employeeName || "-"}
                                              </strong>

                                              <span>
                                                {from.department || "-"}
                                              </span>

                                              <small>
                                                {from.location || "-"}
                                              </small>

                                            </div>


                                            {/* ARROW */}

                                            <div className="audit-assignment-transfer-arrow">
                                              <FiArrowRight />
                                            </div>


                                            {/* TO */}

                                            <div className="audit-assignment-transfer-person destination">

                                              <span className="audit-assignment-transfer-label">
                                                TO
                                              </span>

                                              <strong>
                                                {to.employeeName || "-"}
                                              </strong>

                                              <span>
                                                {to.department || "-"}
                                              </span>

                                              <small>
                                                {to.location || "-"}
                                              </small>

                                            </div>

                                          </div>

                                        </div>

                                      )}


                                      {/* ================= RETURNED ================= */}

                                      {eventType === "returned" && (

                                        <div className="audit-assignment-history-body">

                                          <div className="audit-assignment-history-info-grid">

                                            <div className="audit-assignment-history-info">

                                              <label>
                                                Returned From
                                              </label>

                                              <strong>
                                                {from.employeeName || "-"}
                                              </strong>

                                            </div>


                                            <div className="audit-assignment-history-info">

                                              <label>
                                                Returned To
                                              </label>

                                              <strong>
                                                Inventory
                                              </strong>

                                            </div>

                                          </div>

                                        </div>

                                      )}

                                    </div>

                                  </div>

                                );

                              }
                            )}

                          </div>

                        ) : (

                          <div className="audit-assignment-empty-history">

                            <h6>No Assignment History</h6>

                            <p>
                              No assignment, reassignment or
                              return records are available
                              for this asset.
                            </p>

                          </div>

                        )}

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            );

          })

        ) : (

          <tr>

            <td
              colSpan={6}
              className="audit-assignment-empty"
            >

              <h4>No Assignment Records Found</h4>

              <p>
                No assignment records match
                the selected filters.
              </p>

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

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

<div className="audit-lifecycle-container">

  {/* ================= HEADER ================= */}

  <div className="audit-lifecycle-header">

    <div className="audit-lifecycle-heading">

      <span className="audit-lifecycle-eyebrow">
        ASSET ACTIVITY REPORT
      </span>

      <h3>Asset Lifecycle History</h3>

      <p>
        Review asset information, lifecycle events,
        purchase records and historical activity.
      </p>

    </div>

    <div className="audit-lifecycle-count">
      <span>Assets</span>
      <strong>{lifecycleAssets.length}</strong>
    </div>

  </div>


  {/* ================= TABLE ================= */}

  <div className="audit-lifecycle-table-wrapper">

    <table className="audit-lifecycle-table">

      <thead>
        <tr>
          <th className="audit-lifecycle-expand-col">
            Details
          </th>
          <th>Asset</th>
          <th>Type</th>
          <th>Status</th>
          <th>Events</th>
          <th>Purchased</th>
          <th>Last Activity</th>
        </tr>
      </thead>

      <tbody>

        {lifecycleAssets.length > 0 ? (

          lifecycleAssets.map((asset) => {

            const isExpanded =
              expandedLifecycle === asset.instanceId;

            const isHardware =
              asset.assetType === "hardware";

            const events = asset.events || [];

            const statusValue = String(
              asset.status || "unknown"
            ).toLowerCase();

            const statusClass =
              statusValue === "assigned" ||
              statusValue === "active"
                ? "assigned"
                : statusValue === "in_stock" ||
                  statusValue === "returned"
                ? "in-stock"
                : statusValue === "maintenance"
                ? "maintenance"
                : statusValue === "retired"
                ? "retired"
                : "neutral";

            const formatLifecycleDate = (
              value,
              includeTime = false
            ) => {
              if (!value) return "-";

              const date = new Date(value);

              if (Number.isNaN(date.getTime())) {
                return "-";
              }

              return includeTime
                ? date.toLocaleString()
                : date.toLocaleDateString();
            };

            const sortedEvents = [...events].sort(
              (a, b) =>
                new Date(a.date).getTime() -
                new Date(b.date).getTime()
            );

            return (

              <React.Fragment key={asset.instanceId}>

                {/* ================= SUMMARY ROW ================= */}

                <tr
                  className={
                    isExpanded
                      ? "audit-lifecycle-row expanded"
                      : "audit-lifecycle-row"
                  }
                >

                  {/* EXPAND BUTTON */}

                  <td
                    className="audit-lifecycle-expand-cell"
                    data-label="Details"
                  >

                    <button
                      type="button"
                      className={
                        isExpanded
                          ? "audit-lifecycle-expand-btn active"
                          : "audit-lifecycle-expand-btn"
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        `${isExpanded ? "Collapse" : "Expand"} lifecycle for ${asset.assetName || "asset"}`
                      }
                      onClick={() =>
                        setExpandedLifecycle(
                          isExpanded
                            ? null
                            : asset.instanceId
                        )
                      }
                    >
                      {isExpanded
                        ? <FiChevronUp />
                        : <FiChevronDown />}
                    </button>

                  </td>


                  {/* ASSET */}

                  <td
                    data-label="Asset"
                    className="audit-lifecycle-asset-cell"
                  >

                    <div className="audit-lifecycle-asset-info">

                      <strong>
                        {asset.assetName || "-"}
                      </strong>

                      <span>
                        {asset.assetCode || "-"}
                      </span>

                      <small>
                        {asset.instanceCode || "-"}
                      </small>

                    </div>

                  </td>


                  {/* TYPE */}

                  <td data-label="Type">

                    <span
                      className={
                        `audit-lifecycle-type ${
                          isHardware
                            ? "hardware"
                            : "software"
                        }`
                      }
                    >
                      {isHardware
                        ? "Hardware"
                        : "Software"}
                    </span>

                  </td>


                  {/* STATUS */}

                  <td data-label="Status">

                    <span
                      className={
                        `audit-lifecycle-status ${statusClass}`
                      }
                    >
                      <span className="audit-lifecycle-status-dot" />

                      {String(
                        asset.status || "Unknown"
                      ).replace(/_/g, " ")}
                    </span>

                  </td>


                  {/* EVENTS */}

                  <td data-label="Events">

                    <span className="audit-lifecycle-event-count">
                      {events.length}
                      <span>Events</span>
                    </span>

                  </td>


                  {/* PURCHASE DATE */}

                  <td data-label="Purchased">

                    <span className="audit-lifecycle-date">
                      {formatLifecycleDate(asset.purchase)}
                    </span>

                  </td>


                  {/* LAST ACTIVITY */}

                  <td data-label="Last Activity">

                    <span className="audit-lifecycle-date">
                      {formatLifecycleDate(
                        asset.lastActivity
                      )}
                    </span>

                  </td>

                </tr>


                {/* ================= EXPANDED DETAILS ================= */}

                {isExpanded && (

                  <tr className="audit-lifecycle-detail-row">

                    <td colSpan={7}>

                      <div className="audit-lifecycle-details">

                        {/* DETAILS HEADER */}

                        <div className="audit-lifecycle-details-header">

                          <div>

                            <span className="audit-lifecycle-details-eyebrow">
                              ASSET LIFECYCLE
                            </span>

                            <h4>
                              {asset.assetName || "-"}
                            </h4>

                            <p>
                              {asset.assetCode || "-"}
                              {" • "}
                              {asset.instanceCode || "-"}
                            </p>

                          </div>


                          <div className="audit-lifecycle-details-badges">

                            <span
                              className={
                                `audit-lifecycle-type ${
                                  isHardware
                                    ? "hardware"
                                    : "software"
                                }`
                              }
                            >
                              {isHardware
                                ? "Hardware"
                                : "Software"}
                            </span>

                            <span
                              className={
                                `audit-lifecycle-status ${statusClass}`
                              }
                            >
                              <span className="audit-lifecycle-status-dot" />

                              {String(
                                asset.status || "Unknown"
                              ).replace(/_/g, " ")}
                            </span>

                          </div>

                        </div>


                        {/* ================= OVERVIEW ================= */}

                        <div className="audit-lifecycle-section-heading">

                          <h5>General Information</h5>

                          <span>Asset Overview</span>

                        </div>


                        <div className="audit-lifecycle-info-grid">

                          <div className="audit-lifecycle-info-item">
                            <label>Asset Name</label>
                            <strong>
                              {asset.assetName || "-"}
                            </strong>
                          </div>

                          <div className="audit-lifecycle-info-item">
                            <label>Asset Code</label>
                            <strong>
                              {asset.assetCode || "-"}
                            </strong>
                          </div>

                          <div className="audit-lifecycle-info-item">
                            <label>Instance Code</label>
                            <strong>
                              {asset.instanceCode || "-"}
                            </strong>
                          </div>

                          <div className="audit-lifecycle-info-item">
                            <label>Asset Type</label>
                            <strong>
                              {isHardware
                                ? "Hardware"
                                : "Software"}
                            </strong>
                          </div>

                          <div className="audit-lifecycle-info-item">
                            <label>Status</label>
                            <strong>
                              {String(
                                asset.status || "-"
                              ).replace(/_/g, " ")}
                            </strong>
                          </div>

                          <div className="audit-lifecycle-info-item">
                            <label>Purchase Date</label>
                            <strong>
                              {formatLifecycleDate(
                                asset.purchase
                              )}
                            </strong>
                          </div>

                          <div className="audit-lifecycle-info-item highlight">
                            <label>Total Events</label>
                            <strong>
                              {events.length}
                            </strong>
                          </div>

                          <div className="audit-lifecycle-info-item">
                            <label>Device</label>
                            <strong>
                              {asset.deviceName || "-"}
                            </strong>
                          </div>

                        </div>


                        {/* ================= SOFTWARE DETAILS ================= */}

                        {!isHardware && (

                          <>

                            <div className="audit-lifecycle-section-heading">

                              <h5>Software Information</h5>

                              <span>License & Renewal</span>

                            </div>


                            <div className="audit-lifecycle-info-grid">

                              <div className="audit-lifecycle-info-item">
                                <label>Device</label>
                                <strong>
                                  {asset.deviceName || "-"}
                                </strong>
                              </div>

                              <div className="audit-lifecycle-info-item">
                                <label>License Key</label>
                                <strong>
                                  {asset.licenseKey || "-"}
                                </strong>
                              </div>

                              <div className="audit-lifecycle-info-item">
                                <label>License Number</label>
                                <strong>
                                  {asset.licenseNumber || "-"}
                                </strong>
                              </div>

                              <div className="audit-lifecycle-info-item">
                                <label>Renewal Date</label>
                                <strong>
                                  {formatLifecycleDate(
                                    asset.renewalDate
                                  )}
                                </strong>
                              </div>

                              <div className="audit-lifecycle-info-item">
                                <label>Location</label>
                                <strong>
                                  {asset.location || "-"}
                                </strong>
                              </div>

                            </div>

                          </>

                        )}


                        {/* ================= LIFECYCLE TIMELINE ================= */}

                        <div className="audit-lifecycle-timeline-section">

                          <div className="audit-lifecycle-timeline-heading">

                            <div>

                              <h5>Lifecycle Timeline</h5>

                              <p>
                                Chronological history of
                                recorded asset events.
                              </p>

                            </div>

                            <span className="audit-lifecycle-timeline-count">
                              {events.length} Events
                            </span>

                          </div>


                          {sortedEvents.length > 0 ? (

                            <div className="audit-lifecycle-timeline">

                              {sortedEvents.map((event, index) => {

                                const eventType = String(
                                  event.eventType || "event"
                                );

                                const normalizedType =
                                  eventType.toLowerCase();

                                const eventClass =
                                  normalizedType.includes("assign")
                                    ? "assignment"
                                    : normalizedType.includes("return")
                                    ? "return"
                                    : normalizedType.includes("maintenance")
                                    ? "maintenance"
                                    : normalizedType.includes("renew")
                                    ? "renewal"
                                    : normalizedType.includes("upgrad")
                                    ? "upgrade"
                                    : normalizedType.includes("creat")
                                    ? "created"
                                    : "default";

                                return (

                                  <div
                                    className="audit-lifecycle-timeline-item"
                                    key={index}
                                  >

                                    {/* TIMELINE MARKER */}

                                    <div className="audit-lifecycle-timeline-marker">

                                      <span
                                        className={
                                          `audit-lifecycle-timeline-dot ${eventClass}`
                                        }
                                      />

                                    </div>


                                    {/* EVENT CARD */}

                                    <div className="audit-lifecycle-event-card">

                                      <div className="audit-lifecycle-event-header">

                                        <div className="audit-lifecycle-event-heading">

                                          <span
                                            className={
                                              `audit-lifecycle-event-badge ${eventClass}`
                                            }
                                          >
                                            {eventType.replace(
                                              /_/g,
                                              " "
                                            )}
                                          </span>

                                          <h6>
                                            {event.title ||
                                              "Lifecycle Event"}
                                          </h6>

                                        </div>


                                        <span className="audit-lifecycle-event-date">
                                          {formatLifecycleDate(
                                            event.date,
                                            true
                                          )}
                                        </span>

                                      </div>


                                      <div className="audit-lifecycle-event-body">

                                        <div className="audit-lifecycle-event-info">

                                          <label>Event</label>

                                          <strong>
                                            {event.title || "-"}
                                          </strong>

                                        </div>


                                        <div className="audit-lifecycle-event-info">

                                          <label>Type</label>

                                          <span>
                                            {eventType.replace(
                                              /_/g,
                                              " "
                                            )}
                                          </span>

                                        </div>


                                        <div className="audit-lifecycle-event-info description">

                                          <label>Description</label>

                                          <p>
                                            {event.description || "-"}
                                          </p>

                                        </div>


                                        <div className="audit-lifecycle-event-info">

                                          <label>Date & Time</label>

                                          <span>
                                            {formatLifecycleDate(
                                              event.date,
                                              true
                                            )}
                                          </span>

                                        </div>

                                      </div>

                                    </div>

                                  </div>

                                );

                              })}

                            </div>

                          ) : (

                            <div className="audit-lifecycle-empty-history">

                              <h6>No Lifecycle Events</h6>

                              <p>
                                No lifecycle events have been
                                recorded for this asset.
                              </p>

                            </div>

                          )}

                        </div>

                      </div>

                    </td>

                  </tr>

                )}

              </React.Fragment>

            );

          })

        ) : (

          <tr>

            <td
              colSpan={7}
              className="audit-lifecycle-empty"
            >

              <h4>No Lifecycle Records Found</h4>

              <p>
                No asset lifecycle records
                match the selected filters.
              </p>

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

</div>

);
const renderFinancial = () => (
  <>

<div className="audit-financial-container">

  {/* ================= FINANCIAL OVERVIEW HEADER ================= */}

  <div className="audit-financial-header">

    <div className="audit-financial-heading">

      <span className="audit-financial-eyebrow">
        FINANCIAL ANALYSIS
      </span>

      <h3>Financial Overview</h3>

      <p>
        Monitor asset investments, operating expenses,
        renewals and total ownership costs.
      </p>

    </div>

    <div className="audit-financial-header-count">
      <span>Tracked Assets</span>
      <strong>
        {filteredFinancialSummary.totalAssets ?? 0}
      </strong>
    </div>

  </div>


  {/* ================= FINANCIAL CARDS ================= */}

  <div className="audit-financial-grid">

    {/* PURCHASE COST */}

    <div className="audit-financial-card">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiShoppingCart />
        </span>
        <span className="audit-financial-card-category">
          Investment
        </span>
      </div>

      <h5>Purchase Cost</h5>

      <h2>
        ${Number(
          filteredFinancialSummary.purchaseCost ?? 0
        ).toLocaleString()}
      </h2>

      <p>Initial Asset Investment</p>

    </div>


    {/* MAINTENANCE */}

    <div className="audit-financial-card">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiTool />
        </span>
        <span className="audit-financial-card-category">
          Operational
        </span>
      </div>

      <h5>Maintenance</h5>

      <h2>
        ${Number(
          filteredFinancialSummary.maintenanceCost ?? 0
        ).toLocaleString()}
      </h2>

      <p>Repairs &amp; Servicing</p>

    </div>


    {/* WARRANTY */}

    <div className="audit-financial-card">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiShield />
        </span>
        <span className="audit-financial-card-category">
          Protection
        </span>
      </div>

      <h5>Warranty</h5>

      <h2>
        ${Number(
          filteredFinancialSummary.warrantyCost ?? 0
        ).toLocaleString()}
      </h2>

      <p>Warranty Renewals</p>

    </div>


    {/* INSURANCE */}

    <div className="audit-financial-card">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiUmbrella />
        </span>
        <span className="audit-financial-card-category">
          Protection
        </span>
      </div>

      <h5>Insurance</h5>

      <h2>
        ${Number(
          filteredFinancialSummary.insuranceCost ?? 0
        ).toLocaleString()}
      </h2>

      <p>Insurance Premiums</p>

    </div>


    {/* RENEWALS */}

    <div className="audit-financial-card">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiRefreshCw />
        </span>
        <span className="audit-financial-card-category">
          Recurring
        </span>
      </div>

      <h5>Renewals</h5>

      <h2>
        ${Number(
          filteredFinancialSummary.renewalCost ?? 0
        ).toLocaleString()}
      </h2>

      <p>Software Licenses</p>

    </div>


    {/* UPGRADES */}

    <div className="audit-financial-card">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiTrendingUp />
        </span>
        <span className="audit-financial-card-category">
          Improvement
        </span>
      </div>

      <h5>Upgrades</h5>

      <h2>
        ${Number(
          filteredFinancialSummary.upgradeCost ?? 0
        ).toLocaleString()}
      </h2>

      <p>Hardware &amp; Software Upgrades</p>

    </div>


    {/* TOTAL ASSETS */}

    <div className="audit-financial-card">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiLayers />
        </span>
        <span className="audit-financial-card-category">
          Inventory
        </span>
      </div>

      <h5>Total Assets</h5>

      <h2>
        {Number(
          filteredFinancialSummary.totalAssets ?? 0
        ).toLocaleString()}
      </h2>

      <p>Tracked Assets</p>

    </div>


    {/* TOTAL OWNERSHIP COST */}

    <div className="audit-financial-card highlight">

      <div className="audit-financial-card-top">
        <span className="audit-financial-card-icon">
          <FiDollarSign />
        </span>
        <span className="audit-financial-card-category">
          Total Investment
        </span>
      </div>

      <h5>Total Ownership Cost</h5>

      <h2>
        ${Number(
          filteredFinancialSummary.totalOwnershipCost ?? 0
        ).toLocaleString()}
      </h2>

      <p>Overall Asset Investment</p>

    </div>

  </div>


  {/* =====================================================
      TOP EXPENSIVE ASSETS
  ===================================================== */}

  <div className="audit-financial-assets-section">

    {/* SECTION HEADER */}

    <div className="audit-financial-section-header">

      <div>

        <span className="audit-financial-eyebrow">
          ASSET COST ANALYSIS
        </span>

        <h3>Top Expensive Assets</h3>

        <p>
          Review the most expensive assets and
          their yearly cost breakdown.
        </p>

      </div>

      <div className="audit-financial-assets-count">
        <span>Assets</span>
        <strong>{filteredFinancial.length}</strong>
      </div>

    </div>


    {/* ================= ASSET TABLE ================= */}

    <div className="audit-financial-table-wrapper">

      <table className="audit-financial-table">

        <thead>
          <tr>
            <th className="audit-financial-expand-col">
              Details
            </th>
            <th>Asset</th>
            <th>Type</th>
            <th>Purchase</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

          {filteredFinancial.length > 0 ? (

            [...filteredFinancial]
              .sort(
                (a, b) =>
                  (Number(b.totalCost) || 0) -
                  (Number(a.totalCost) || 0)
              )
              .map((asset) => {

                const isExpanded =
                  expandedFinancial === asset.instanceId;

                const isHardware =
                  asset.assetType === "hardware";

                const yearlyCosts = asset.yearlyCosts || [];

                const formatAmount = (value) =>
                  formatCurrency(Number(value) || 0);

                return (

                  <React.Fragment key={asset.instanceId}>

                    {/* ================= SUMMARY ROW ================= */}

                    <tr
                      className={
                        isExpanded
                          ? "audit-financial-row expanded"
                          : "audit-financial-row"
                      }
                    >

                      {/* EXPAND BUTTON */}

                      <td
                        className="audit-financial-expand-cell"
                        data-label="Details"
                      >

                        <button
                          type="button"
                          className={
                            isExpanded
                              ? "audit-financial-expand-btn active"
                              : "audit-financial-expand-btn"
                          }
                          aria-expanded={isExpanded}
                          aria-label={
                            `${isExpanded ? "Collapse" : "Expand"} financial history for ${asset.assetName || "asset"}`
                          }
                          onClick={() =>
                            setExpandedFinancial(
                              isExpanded
                                ? null
                                : asset.instanceId
                            )
                          }
                        >
                          {isExpanded
                            ? <FiChevronUp />
                            : <FiChevronDown />}
                        </button>

                      </td>


                      {/* ASSET */}

                      <td
                        data-label="Asset"
                        className="audit-financial-asset-cell"
                      >

                        <div className="audit-financial-asset-info">

                          <strong>
                            {asset.assetName || "-"}
                          </strong>

                          <span>
                            {asset.assetCode || "-"}
                          </span>

                          <small>
                            {asset.instanceCode || "-"}
                          </small>

                        </div>

                      </td>


                      {/* TYPE */}

                      <td data-label="Type">

                        <span
                          className={
                            `audit-financial-type ${
                              isHardware
                                ? "hardware"
                                : "software"
                            }`
                          }
                        >
                          {isHardware
                            ? "Hardware"
                            : "Software"}
                        </span>

                      </td>


                      {/* PURCHASE COST */}

                      <td data-label="Purchase">

                        <span className="audit-financial-purchase-value">
                          {formatAmount(asset.purchaseCost)}
                        </span>

                      </td>


                      {/* TOTAL COST */}

                      <td data-label="Total">

                        <strong className="audit-financial-total-value">
                          {formatAmount(asset.totalCost)}
                        </strong>

                      </td>

                    </tr>


                    {/* ================= EXPANDED PANEL ================= */}

                    {isExpanded && (

                      <tr className="audit-financial-detail-row">

                        <td colSpan={5}>

                          <div className="audit-financial-details">

                            {/* DETAILS HEADER */}

                            <div className="audit-financial-details-header">

                              <div>

                                <span className="audit-financial-details-eyebrow">
                                  FINANCIAL HISTORY
                                </span>

                                <h4>
                                  {asset.assetName || "-"}
                                </h4>

                                <p>
                                  {asset.assetCode || "-"}
                                  {" • "}
                                  {asset.instanceCode || "-"}
                                </p>

                              </div>

                              <span
                                className={
                                  `audit-financial-type ${
                                    isHardware
                                      ? "hardware"
                                      : "software"
                                  }`
                                }
                              >
                                {isHardware
                                  ? "Hardware"
                                  : "Software"}
                              </span>

                            </div>


                            {/* COST SUMMARY */}

                            <div className="audit-financial-details-summary">

                              <div className="audit-financial-summary-item">

                                <label>Purchase Cost</label>

                                <strong>
                                  {formatAmount(
                                    asset.purchaseCost
                                  )}
                                </strong>

                              </div>


                              <div className="audit-financial-summary-item highlight">

                                <label>Total Ownership Cost</label>

                                <strong>
                                  {formatAmount(
                                    asset.totalCost
                                  )}
                                </strong>

                              </div>


                              <div className="audit-financial-summary-item">

                                <label>Financial Years</label>

                                <strong>
                                  {yearlyCosts.length}
                                </strong>

                              </div>

                            </div>


                            {/* YEARLY HISTORY HEADING */}

                            <div className="audit-financial-history-heading">

                              <div>

                                <h5>Yearly Cost History</h5>

                                <p>
                                  Detailed financial expenses
                                  recorded for each year.
                                </p>

                              </div>

                              <span className="audit-financial-history-count">
                                {yearlyCosts.length} Years
                              </span>

                            </div>


                            {/* ================= YEARLY CARDS ================= */}

                            {yearlyCosts.length > 0 ? (

                              <div className="audit-financial-year-grid">

                                {yearlyCosts.map((year) => {

                                  const currentYear =
                                    new Date().getFullYear();

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
                                      className="audit-financial-year-card"
                                      key={year.year}
                                    >

                                      {/* YEAR HEADER */}

                                      <div className="audit-financial-year-header">

                                        <div>

                                          <span className="audit-financial-year-label">
                                            FINANCIAL YEAR
                                          </span>

                                          <h4>
                                            {year.year}
                                          </h4>

                                        </div>

                                        <span
                                          className={
                                            `audit-financial-year-badge ${badge.className}`
                                          }
                                        >
                                          {badge.text}
                                        </span>

                                      </div>


                                      {/* YEAR COST ROWS */}

                                      <div className="audit-financial-year-body">

                                        <div className="audit-financial-year-row">

                                          <span>Purchase</span>

                                          <strong>
                                            {formatAmount(
                                              year.purchaseCost
                                            )}
                                          </strong>

                                        </div>


                                        <div className="audit-financial-year-row">

                                          <span>Maintenance</span>

                                          <strong>
                                            {formatAmount(
                                              year.maintenanceCost
                                            )}
                                          </strong>

                                        </div>


                                        <div className="audit-financial-year-row">

                                          <span>Warranty</span>

                                          <strong>
                                            {formatAmount(
                                              year.warrantyCost
                                            )}
                                          </strong>

                                        </div>


                                        <div className="audit-financial-year-row">

                                          <span>Insurance</span>

                                          <strong>
                                            {formatAmount(
                                              year.insuranceCost
                                            )}
                                          </strong>

                                        </div>


                                        {/* SOFTWARE RENEWAL */}

                                        {!isHardware && (

                                          <div className="audit-financial-year-row">

                                            <span>Renewal</span>

                                            <strong>
                                              {formatAmount(
                                                year.renewalCost
                                              )}
                                            </strong>

                                          </div>

                                        )}


                                        <div className="audit-financial-year-row">

                                          <span>Upgrade</span>

                                          <strong>
                                            {formatAmount(
                                              year.upgradeCost
                                            )}
                                          </strong>

                                        </div>

                                      </div>


                                      {/* YEAR TOTAL */}

                                      <div className="audit-financial-year-total">

                                        <span>Year Total</span>

                                        <strong>
                                          {formatAmount(
                                            year.totalCost
                                          )}
                                        </strong>

                                      </div>

                                    </div>

                                  );

                                })}

                              </div>

                            ) : (

                              <div className="audit-financial-empty-history">

                                <h5>No Financial History</h5>

                                <p>
                                  No year-wise cost records
                                  are available for this asset.
                                </p>

                              </div>

                            )}

                          </div>

                        </td>

                      </tr>

                    )}

                  </React.Fragment>

                );

              })

          ) : (

            <tr>

              <td
                colSpan={5}
                className="audit-financial-empty"
              >

                <h4>No Financial Records Found</h4>

                <p>
                  No financial records match
                  the selected filters.
                </p>

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  </div>

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
//     <div className="audit-page">

//       {/* HEADER */}

//       <div className="audit-header">

//         <div>
//           <h1>Audit & Compliance Center</h1>

//           <p>
//             Asset auditing, compliance tracking,
//             lifecycle management and financial
//             analysis.
//           </p>
//         </div>

//         <button
//           className="audit-refresh-btn"
//           onClick={loadAuditData}
//         >
//           Refresh
//         </button>

//       </div>

//       {/* KPI GRID */}

//       <div className="audit-stats-grid">

//         {stats.map((item) => (
//           <div
//             key={item.title}
//             className="audit-stat-card"
//           >
//             <span>{item.title}</span>

//             <h2>{item.value}</h2>
//           </div>
//         ))}

//       </div>

//       {/* REPORT TABS */}

//       <div className="audit-tabs">

//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             className={
//               activeTab === tab
//                 ? "audit-tab active"
//                 : "audit-tab"
//             }
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab}
//           </button>
//         ))}

//       </div>

//       {/* FILTER BAR */}

// <div className="audit-filters">

//   {showYearFilter && (
//     <select
//       value={selectedYear}
//       onChange={(e) =>
//         setSelectedYear(e.target.value)
//       }
//     >
//       {yearOptions.map(year => (
//         <option key={year} value={year}>
//           {year === "All"
//             ? "All Years"
//             : year}
//         </option>
//       ))}
//     </select>
//   )} 

//     <select
//     value={selectedAssetType}
//     onChange={(e) => setSelectedAssetType(e.target.value)}
//   >
//     <option value="All">All Assets</option>
//     <option value="hardware">Hardware</option>
//     <option value="software">Software</option>
//   </select>
//     <div className="audit-actions">

//         <button onClick={handleDownloadPDF} className="pdf-btn">
//             Export PDF
//         </button>

//         <button onClick={handleDownloadExcel} className="excel-btn">
//             Export Excel
//         </button> 

//     </div>

// </div>

//       {/* CONTENT */}

// <div className="audit-content">
//   {renderContent()}
// </div>

//     </div>


<div className="audit-page">

  {/* ================= PAGE HEADER ================= */}

  <div className="audit-header">

    <div className="audit-header-content">

      <span className="audit-page-eyebrow">
        ASSET MANAGEMENT / REPORTING
      </span>

      <h1>Audit & Compliance Center</h1>

      <p>
        Monitor asset compliance, lifecycle activities,
        inventory performance and financial insights.
      </p>

    </div>

    <div className="audit-header-actions">

      <button
        type="button"
        className="audit-refresh-btn"
        onClick={loadAuditData}
      >
        <span className="audit-refresh-icon">↻</span>
        Refresh Data
      </button>

    </div>

  </div>


  {/* ================= KPI SECTION ================= */}

  <section className="audit-overview-section">

    <div className="audit-section-heading">

      <div>
        <h2>Asset Overview</h2>
        <p>
          Key inventory and compliance metrics
        </p>
      </div>

      <span className="audit-section-indicator">
        LIVE OVERVIEW
      </span>

    </div>


    <div className="audit-stats-grid">

      {stats.map((item, index) => (

        <div
          key={item.title}
          className="audit-stat-card"
        >

          <div className="audit-stat-top">

            <span className="audit-stat-label">
              {item.title}
            </span>

            <span className="audit-stat-index">
              {String(index + 1).padStart(2, "0")}
            </span>

          </div>

          <div className="audit-stat-bottom">

            <h2>{item.value}</h2>

            <span className="audit-stat-decoration">
              ↗
            </span>

          </div>

        </div>

      ))}

    </div>

  </section>


  {/* ================= REPORT SECTION ================= */}

  <section className="audit-report-section">

    <div className="audit-section-heading">

      <div>
        <h2>Audit Reports</h2>

        <p>
          Explore asset records, compliance reports
          and financial analysis.
        </p>
      </div>

    </div>


    {/* ================= REPORT TABS ================= */}

    <div className="audit-tabs-wrapper">

      <div
        className="audit-tabs"
        role="tablist"
        aria-label="Audit reports"
      >

        {tabs.map((tab) => (

          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
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

    </div>


    {/* ================= FILTER TOOLBAR ================= */}

    <div className="audit-filters">

      <div className="audit-filter-group">

        {showYearFilter && (

          <div className="audit-filter-field">

            <label htmlFor="audit-year-filter">
              Report Year
            </label>

            <select
              id="audit-year-filter"
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value)
              }
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year === "All"
                    ? "All Years"
                    : year}
                </option>
              ))}
            </select>

          </div>

        )}


        <div className="audit-filter-field">

          <label htmlFor="audit-asset-filter">
            Asset Type
          </label>

          <select
            id="audit-asset-filter"
            value={selectedAssetType}
            onChange={(e) =>
              setSelectedAssetType(e.target.value)
            }
          >
            <option value="All">
              All Assets
            </option>

            <option value="hardware">
              Hardware
            </option>

            <option value="software">
              Software
            </option>

          </select>

        </div>

      </div>


      {/* ================= EXPORT ACTIONS ================= */}

      <div className="audit-actions">

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="pdf-btn"
        >
          <span className="audit-export-icon">
            ↓
          </span>

          Export PDF
        </button>


        <button
          type="button"
          onClick={handleDownloadExcel}
          className="excel-btn"
        >
          <span className="audit-export-icon">
            ↓
          </span>

          Export Excel
        </button>

      </div>

    </div>


    {/* ================= REPORT CONTENT ================= */}

    <div className="audit-content">

      {renderContent()}

    </div>

  </section>

</div>

  );
};

export default AuditPage;