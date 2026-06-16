// ✅ src/Pages/MisReport.jsx

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../Page_styles/MisReport.css";
import Loader from "../Components/Loader";
import Pagination from "../Components/Pagination";
import {
  getLocations,
  getCategories,
  getSoftwareAssets,
  getHardwareAssets,
} from "../Services/ApiServices";

const MisReport = () => {

  const [activeTab, setActiveTab] = useState("hardware");
  const [viewMode, setViewMode] = useState("overview");

  const [hardware, setHardware] = useState([]);
  const [software, setSoftware] = useState([]);

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [filters, setFilters] = useState({
    category: "all",
    location: "all",
    purchaseFrom: "",
    purchaseTo: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ================= FETCH =================
  useEffect(() => {
    (async () => {
      try {
        const [ha, sw, cat, loc] = await Promise.all([
          getHardwareAssets(),
          getSoftwareAssets(),
          getCategories(),
          getLocations(),
        ]);
        console.log(ha, sw);
        setHardware(ha?.data || ha || []);
        setSoftware(Array.isArray(sw) ? sw : sw?.data || []);
        setCategories(cat || []);
        setLocations(loc?.data || []);

        setApiDone(true);
        setTimeout(() => setLoading(false), 400);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, viewMode]);

  // ================= HELPERS =================
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN") : "-";
  const formatCost = (costObj) => {
  if (!costObj) return "USD 0.00";

  // legacy numeric fallback
  if (typeof costObj === "number") {
    return `USD ${costObj.toFixed(2)}`;
  }

  return `${costObj.currency || "USD"} ${Number(
    costObj.amount || 0
  ).toFixed(2)}`;
};
  const getCategoryName = (id) =>
    categories.find((c) => c._id === id)?.name || "-";

  // ================= NORMALIZATION =================

  const hardwareSummary = hardware.map((a) => ({
    assetName: a.assetName,
    category: a.assetCategory?.name,
    location: a.locationName?.name,
    inUse: a.inUse,
    total: a.assetQuantity,
    inStock: a.assetQuantity - a.inUse,
    purchaseDate: a.purchaseDetails?.purchaseDate || null,
  }));

  const softwareSummary = software.map((a) => ({
    assetName: a.assetName,
    category: a.assetCategory?.name,
    location:
      typeof a.locationName === "object"
        ? a.locationName?.name
        : locations.find((l) => l._id === a.locationName)?.name,
    inUse: a.inUse,
    total: a.assetQuantity,
    inStock: a.assetQuantity - a.inUse,
    purchaseDate: a.purchaseDetails?.purchaseDate || null,
  }));
  const hardwareFindings = hardware.flatMap((asset) => {
    const assignmentMap = {};
  
    asset.assignmentRecords?.forEach((a) => {
      assignmentMap[String(a.assetInstanceId)] = a;
    });
  
    return (asset.instances || []).map((inst) => {
      const assignedTo =
        assignmentMap[String(inst._id)]?.employee?.name ||
        "Unassigned";
  
      const department =
        assignmentMap[String(inst._id)]?.department?.name ||
        "-";
  
      let auditStatus = "Verified";
      let finding = "No Issues";
  
      if (assignedTo === "Unassigned") {
        auditStatus = "Issue";
        finding = "Asset Not Assigned";
      }
  
      if (
        inst.condition === "damaged" ||
        inst.condition === "repair"
      ) {
        auditStatus = "Critical";
        finding = "Condition Issue";
      }
  
      return {
        instanceCode: inst.instanceCode,
        assetName: inst.deviceName,
        status: inst.status,
        condition: inst.condition,
        assignedTo,
        department,
        auditStatus,
        finding,
      };
    });
  });

  const softwareFindings = software.flatMap((asset) => {
    const assignmentMap = {};
  
    asset.assignmentRecords?.forEach((a) => {
      assignmentMap[String(a.assetInstanceId)] = a;
    });
  
    return (asset.instances || []).map((inst) => {
      const assignedTo =
        assignmentMap[String(inst._id)]?.employee?.name ||
        "Unassigned";
  
      let auditStatus = "Verified";
      let finding = "No Issues";
  
      if (assignedTo === "Unassigned") {
        auditStatus = "Issue";
        finding = "License Not Assigned";
      }
  
      const renewalDate = inst.software?.renewalDate;
  
      if (
        renewalDate &&
        new Date(renewalDate) < new Date()
      ) {
        auditStatus = "Critical";
        finding = "License Expired";
      }
  
      return {
        assetName: inst.deviceName,
        licenseKey: inst.software?.licenseKey,
        licenseNumber: inst.software?.licenseNumber,
        expiry: renewalDate,
        assignedTo,
        auditStatus,
        finding,
      };
    });
  });
  const findings =
  activeTab === "hardware"
    ? hardwareFindings
    : softwareFindings;

const totalAssets = findings.length;

const verifiedAssets = findings.filter(
  (f) => f.auditStatus === "Verified"
).length;

const issueAssets = findings.filter(
  (f) => f.auditStatus === "Issue"
).length;

const criticalAssets = findings.filter(
  (f) => f.auditStatus === "Critical"
).length;

const auditAccuracy =
  totalAssets > 0
    ? Math.round(
        (verifiedAssets / totalAssets) * 100
      )
    : 0;

  // ================= DATA SWITCH =================
  let baseData =
    activeTab === "hardware"
      ? viewMode === "summary"
        ? hardwareSummary
        : hardwareFindings
      : viewMode === "summary"
      ? softwareSummary
      : softwareFindings;

  // ================= FILTER (ONLY SUMMARY) =================
  let currentData =
    viewMode === "summary"
      ? baseData.filter((row) => {
          const categoryMatch =
            filters.category === "all" ||
            row.category === filters.category;

          const locationMatch =
            filters.location === "all" ||
            row.location === filters.location;

          const rowDate = row.purchaseDate
            ? new Date(row.purchaseDate)
            : null;

          const fromDate = filters.purchaseFrom
            ? new Date(filters.purchaseFrom)
            : null;

          const toDate = filters.purchaseTo
            ? new Date(filters.purchaseTo)
            : null;

          const dateMatch =
            (!fromDate || (rowDate && rowDate >= fromDate)) &&
            (!toDate || (rowDate && rowDate <= toDate));

          return categoryMatch && locationMatch && dateMatch;
        })
      : baseData;

  // ================= PAGINATION =================
  const paginated = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  // ================= EXPORT =================
  const exportData = () => {
    const rows = currentData.map((row) => {
      if (viewMode === "instance") {
        return {
          Instance: row.instanceCode,
          Model: row.model || row.licenseKey,
          Status: row.status,
          Asset: row.assetName,
          Status: row.status,
          Assigned: row.assignedTo,
          Location: row.location,
          Department : row.department || "-",
          Cost: formatCost(row.cost),
        };
      }

      return {
        Asset: row.assetName,
        Category: row.category,
        InUse: row.inUse,
        Stock: row.inStock,
        Location: row.location,
        Cost: formatCost(row.cost),
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `${activeTab}_${viewMode}`
    );

    XLSX.writeFile(
      wb,
      `${activeTab}_${viewMode}_MIS.xlsx`
    );
  };

  if (loading)
    return <Loader type="mis" apiDone={apiDone} />;

  // ================= UI =================
  return (
    <div className="mis-content">

      {/* HEADER */}
      <div className="report-header">
  <div>
    <h2>Audit Center</h2>
    <p>
      Review asset verification, assignment accuracy,
      condition status and audit findings.
    </p>
  </div>

  <div className="header-actions">
    <button>Export Audit Report</button>
  </div>
</div>

      {/* MAIN TABS */}
      <button
  className={viewMode === "overview" ? "active-tab" : ""}
  onClick={() => setViewMode("overview")}
>
  Audit Overview
</button>

<button
  className={viewMode === "findings" ? "active-tab" : ""}
  onClick={() => setViewMode("findings")}
>
  Audit Findings
</button>

      {/* SUB TABS */}
      <div className="sub-tabs">
  <button
    className={
      viewMode === "overview"
        ? "active-tab"
        : ""
    }
    onClick={() => setViewMode("overview")}
  >
    Audit Overview
  </button>

  <button
    className={
      viewMode === "findings"
        ? "active-tab"
        : ""
    }
    onClick={() => setViewMode("findings")}
  >
    Audit Findings
  </button>
</div>

      {/* FILTERS (ONLY SUMMARY) */}
      {viewMode === "summary" && (
        <div className="mis-filters">
          <select onChange={(e) =>
            setFilters(p => ({ ...p, category: e.target.value }))
          }>
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select onChange={(e) =>
            setFilters(p => ({ ...p, location: e.target.value }))
          }>
            <option value="all">All Locations</option>
            {locations.map(l => (
              <option key={l._id} value={l.name}>{l.name}</option>
            ))}
          </select>

          <input type="date"
            onChange={(e) =>
              setFilters(p => ({ ...p, purchaseFrom: e.target.value }))
            }
          />

          <input type="date"
            onChange={(e) =>
              setFilters(p => ({ ...p, purchaseTo: e.target.value }))
            }
          />
        </div>
      )}
      {viewMode === "overview" && (
  <div className="audit-overview-grid">

    <div className="audit-card">
      <h3>Total Assets</h3>
      <span>{totalAssets}</span>
    </div>

    <div className="audit-card">
      <h3>Verified</h3>
      <span>{verifiedAssets}</span>
    </div>

    <div className="audit-card">
      <h3>Issues</h3>
      <span>{issueAssets}</span>
    </div>

    <div className="audit-card">
      <h3>Critical</h3>
      <span>{criticalAssets}</span>
    </div>

    <div className="audit-card">
      <h3>Audit Accuracy</h3>
      <span>{auditAccuracy}%</span>
    </div>

  </div>
)}

      {/* TABLE */}
   <div className="table-wrapper">

        <table className="mis-table">
          <thead>
            <tr>

              {/* HARDWARE */}
              {activeTab === "hardware" && viewMode === "summary" && (
                <>
  <th>Instance</th>
  <th>Asset</th>
  <th>Status</th>
  <th>Condition</th>
  <th>Assigned To</th>
  <th>Department</th>
  <th>Audit Status</th>
  <th>Finding</th>
                </>
              )}

              {activeTab === "hardware" && viewMode === "instance" && (
                <>
                  <th>Instance</th>
                  <th>Asset</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Assigned</th>
                  <th>Department</th>
                  <th>Cost</th>
                </>
              )}
                {activeTab === "software" && viewMode === "summary" && (
                  <>
  <th>Asset</th>
  <th>License Key</th>
  <th>License No</th>
  <th>Expiry</th>
  <th>Assigned To</th>
  <th>Audit Status</th>
  <th>Finding</th>
</>
)}

              {/* SOFTWARE */}
              {activeTab === "software" && viewMode === "instance" && (
                <>
                  <th>Asset</th>
                  <th>License</th>
                  <th>License No</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Cost</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, i) => (
              <tr key={i}>

                {/* HARDWARE SUMMARY */}
                {activeTab === "hardware" && viewMode === "summary" && (
                  <>
                    <td>{row.assetName}</td>
                    <td>{row.category}</td>
                    <td>{row.inUse}</td>
                    <td>{row.inStock}</td>
                    <td>{row.location}</td>
                    <td>{formatDate(row.purchaseDate)}</td>
                  </>
                )}

                {/* HARDWARE INSTANCE */}
                {activeTab === "hardware" && viewMode === "instance" && (
                  <>
  <td>{row.instanceCode}</td>
  <td>{row.assetName}</td>
  <td>{row.status}</td>
  <td>{row.condition}</td>
  <td>{row.assignedTo}</td>
  <td>{row.department}</td>

  <td>
    <span className={`audit-status ${row.auditStatus.toLowerCase()}`}>
      {row.auditStatus}
    </span>
  </td>

  <td>{row.finding}</td>
</> 
                )}
                {activeTab === "software" && viewMode === "summary" && (
                  <>
  <td>{row.assetName}</td>
  <td>{row.licenseKey}</td>
  <td>{row.licenseNumber}</td>
  <td>{formatDate(row.expiry)}</td>
  <td>{row.assignedTo}</td>

  <td>
    <span className={`audit-status ${row.auditStatus.toLowerCase()}`}>
      {row.auditStatus}
    </span>
  </td>

  <td>{row.finding}</td>
</>
)}
                {/* SOFTWARE INSTANCE */}
                {activeTab === "software" && viewMode === "instance" && (
                  <>
                    <td>{row.assetName}</td>
                    <td>{row.licenseKey}</td>
                    <td>{row.licenseNumber}</td>
                    <td>{formatDate(row.expiry)}</td>
                    <td>{row.status}</td>
                    <td>{row.assignedTo}</td>
<td>{formatCost(row.cost)}</td>
                  </>
                )}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default MisReport;

   