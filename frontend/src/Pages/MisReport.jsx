import React, { useEffect, useState } from "react";

import {
  getAuditDashboard,
  getFinancialAudit,
  getAuditAssets,
  getLifecycleAudit,
} from "../Services/ApiServices";

import AuditOverviewCards from "../Components/Audit/AuditOverviewCard";
import FinancialAudit from "../Components/Audit/FinancialOverview";
import AssetInventoryTable from "../Components/Audit/AuditInventoryTable";
import LifecycleAudit from "../Components/Audit/LifecycleTimeline";

import "../Page_styles/AuditPage.css";

const AuditPage = () => {
  const [dashboard, setDashboard] = useState({});
  const [financial, setFinancial] = useState({});
  const [assets, setAssets] = useState([]);
  const [lifecycle, setLifecycle] = useState([]);

  const [loading, setLoading] = useState(true);

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
      console.error("Audit Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  if (loading) {
    return (
      <div className="audit-loading">
        <div className="audit-spinner"></div>
        <p>Loading Audit Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="audit-page">

      {/* Header */}

      <div className="audit-header">
        <div>
          <h1>Audit & Compliance Center</h1>

          <p>
            Track asset utilization, lifecycle history,
            compliance and financial performance.
          </p>
        </div>

        <button
          className="audit-refresh-btn"
          onClick={loadAuditData}
        >
          Refresh
        </button>
      </div>

      {/* Overview Cards */}

      <AuditOverviewCards
        data={dashboard}
      />

      {/* Financial Section */}

      <FinancialAudit
        data={financial}
      />

      {/* Asset Inventory */}

      <AssetInventoryTable
        assets={assets}
      />

      {/* Lifecycle Timeline */}

      <LifecycleAudit
        lifecycle={lifecycle}
      />

    </div>
  );
};

export default AuditPage;