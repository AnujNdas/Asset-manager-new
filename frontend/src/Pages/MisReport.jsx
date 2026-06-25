import React, { useEffect, useState } from "react";

import {
  getAuditDashboard,
  getFinancialAudit,
  getAuditAssets,
  getLifecycleAudit,
} from "../Services/ApiServices";

import "../Page_styles/AuditPage.css";

const AuditPage = () => {
  const [dashboard, setDashboard] = useState({});
  const [financial, setFinancial] = useState({});
  const [assets, setAssets] = useState([]);
  const [lifecycle, setLifecycle] = useState([]);

  const [loading, setLoading] = useState(true);

  const [assetType, setAssetType] = useState("hardware");

  const [activeTab, setActiveTab] = useState("summary");

  const loadAuditData = async () => {
    try {
      const [
        dashboardRes,
        financialRes,
        assetsRes,
        lifecycleRes,
      ] = await Promise.all([
        getAuditDashboard(),
        getFinancialAudit(),
        getAuditAssets(),
        getLifecycleAudit(),
      ]);

      setDashboard(dashboardRes?.data || {});
      setFinancial(financialRes?.data || {});
      setAssets(assetsRes?.data || []);
      setLifecycle(lifecycleRes?.data || []);
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
  console.log("Dashboard", dashboard);
  console.log("Financial", financial);
  console.log("Assets", assets);
  console.log("Lifecycle", lifecycle);
}, [dashboard, financial, assets, lifecycle]);
const stats = [
  {
    title: "Total Assets",
    value: dashboard.totalAssets
  },
  {
    title: "Assigned",
    value: dashboard.assignedAssets
  },
  {
    title: "Unassigned",
    value: dashboard.unassignedAssets
  },
  {
    title: "Warranty Expired",
    value: dashboard.warrantyExpired
  },
  {
    title: "Maintenance Due",
    value: dashboard.maintenanceDue
  },
  {
    title: "Failed Audit",
    value: dashboard.failedAssets
  },
  {
    title: "Purchase Cost",
    value: `₹${dashboard.totalPurchaseCost}`
  },
  {
    title: "Renewal Cost",
    value: `₹${dashboard.totalRenewalCost}`
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
          </tr>
        </thead>

        <tbody>

          {assets.map((asset) => (
            <tr key={asset.instanceId}>
              <td>{asset.assetCode}</td>
              <td>{asset.assetName}</td>
              <td>{asset.instanceCode}</td>
              <td>{asset.assetType}</td>
            </tr>
          ))}

        </tbody>

      </table>
    </div>
  </>
);
const renderDepartment = () => {
  const hardware = assets.filter(
    a => a.assetType === "hardware"
  ).length;

  const software = assets.filter(
    a => a.assetType === "software"
  ).length;

  return (
    <div className="audit-card-grid">

      <div className="audit-mini-card">
        <h4>Hardware Assets</h4>
        <span>{hardware}</span>
      </div>

      <div className="audit-mini-card">
        <h4>Software Assets</h4>
        <span>{software}</span>
      </div>

    </div>
  );
};
const renderWarranty = () => (
  <div className="audit-report-grid">

    <div className="audit-report-card">
      <h3>Warranty Expired</h3>
      <span>
        {dashboard.warrantyExpired}
      </span>
    </div>

    <div className="audit-report-card">
      <h3>Warranty Cost</h3>
      <span>
        ₹{financial.summary?.warrantyCost || 0}
      </span>
    </div>

  </div>
);
const renderInsurance = () => (
  <div className="audit-report-grid">

    <div className="audit-report-card">
      <h3>Insurance Expired</h3>
      <span>
        {dashboard.insuranceExpired}
      </span>
    </div>

    <div className="audit-report-card">
      <h3>Total Insurance Cost</h3>
      <span>
        ₹{financial.summary?.insuranceCost || 0}
      </span>
    </div>

  </div>
);
const renderMaintenance = () => (
  <div className="audit-report-grid">

    <div className="audit-report-card">
      <h3>Maintenance Due</h3>
      <span>
        {dashboard.maintenanceDue}
      </span>
    </div>

    <div className="audit-report-card">
      <h3>Total Maintenance Cost</h3>
      <span>
        ₹{financial.summary?.maintenanceCost}
      </span>
    </div>

  </div>
);
const renderAssignment = () => (
  <div className="audit-report-grid">

    <div className="audit-report-card">
      <h3>Assigned Assets</h3>
      <span>
        {dashboard.assignedAssets}
      </span>
    </div>

    <div className="audit-report-card">
      <h3>Unassigned Assets</h3>
      <span>
        {dashboard.unassignedAssets}
      </span>
    </div>

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

        {lifecycle.slice(0, 50).map((item, index) => (
          <tr key={index}>
            <td>{item.assetName}</td>
            <td>{item.instanceCode}</td>
            <td>{item.assetType}</td>
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
          ₹{financial.summary.purchaseCost}
        </h2>
      </div>

      <div className="financial-card">
        <h4>Maintenance Cost</h4>
        <h2>
          ₹{financial.summary.maintenanceCost}
        </h2>
      </div>

      <div className="financial-card">
        <h4>Renewal Cost</h4>
        <h2>
          ₹{financial.summary.renewalCost}
        </h2>
      </div>

      <div className="financial-card">
        <h4>Total Ownership</h4>
        <h2>
          ₹{financial.summary.totalOwnershipCost}
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

          {financial.topExpensiveAssets.map(
            (asset) => (
              <tr
                key={asset.instanceId}
              >
                <td>
                  {asset.deviceName ||
                   asset.instanceCode}
                </td>

                <td>
                  {asset.assetType}
                </td>

                <td>
                  ₹{asset.totalCost}
                </td>
              </tr>
            )
          )}

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