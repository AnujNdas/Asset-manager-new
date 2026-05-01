// ✅ src/Pages/MisReport.jsx

import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../Page_styles/MisReport.css";
import Loader from "../Components/Loader";
import Pagination from "../Components/Pagination";
import CurrencyFilter from "../Components/CurrencyFilter";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

import {
  getLocations,
  getCategories,
  getSoftwareAssets,
  getHardwareAssets,
} from "../Services/ApiServices";

const MisReport = () => {
  const { currency, convertFromBase, loadingRates } = useCurrency();

  const [activeTab, setActiveTab] = useState("hardware");
  const [viewMode, setViewMode] = useState("summary");

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
    category: getCategoryName(a.assetCategory),
    location:
      typeof a.locationName === "object"
        ? a.locationName?.name
        : locations.find((l) => l._id === a.locationName)?.name,
    inUse: a.inUse,
    total: a.assetQuantity,
    inStock: a.assetQuantity - a.inUse,
    purchaseDate: a.purchaseDetails?.purchaseDate || null,
  }));

  const hardwareInstances = hardware.flatMap((asset) => {
    const assignmentMap = {};
    asset.assignmentRecords?.forEach((a) => {
      assignmentMap[String(a.assetInstanceId)] = a;
    });

    return (asset.instances || []).map((inst) => ({
      assetName: inst.deviceName,
      instanceCode: inst.instanceCode,
      model: inst.hardware?.modelNo,
      status: inst.status,
      condition: inst.condition,
      location: inst.location,
      warranty: inst.warranty?.expiryDate,
      assignedTo:
        assignmentMap[String(inst._id)]?.employee?.name || "Unassigned",
      department:
        assignmentMap[String(inst._id)]?.department?.name || "-",
      cost: inst.hardware?.purchaseCost?.baseAmount || 0
    }));
  });

const softwareInstances = software.flatMap((asset) => {
  const assignmentMap = {};
  asset.assignmentRecords?.forEach((a) => {
    assignmentMap[String(a.assetInstanceId)] = a;
  });

  return (asset.instances || []).map((inst) => ({
    assetName: inst.deviceName,
    instanceCode: inst.instanceCode,
    licenseKey: inst.software?.licenseKey,
    licenseNumber: inst.software?.licenseNumber,
    status: inst.status,
    location: inst.location,
    expiry: inst.software?.renewalDate,
    assignedTo:
      assignmentMap[String(inst._id)]?.employee?.name || "Unassigned",

    // ❌ OLD
    // cost: asset.assetCost?.baseTotalAmount || 0,

    // ✅ NEW
    cost: inst.software?.purchaseCost?.baseAmount || 0,
  }));
});

  // ================= DATA SWITCH =================
  let baseData =
    activeTab === "hardware"
      ? viewMode === "summary"
        ? hardwareSummary
        : hardwareInstances
      : viewMode === "summary"
      ? softwareSummary
      : softwareInstances;

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
          Asset: row.assetName,
          Instance: row.instanceCode,
          Status: row.status,
          Assigned: row.assignedTo,
          Location: row.location,
          Cost: convertFromBase(row.cost),
        };
      }

      return {
        Asset: row.assetName,
        Category: row.category,
        InUse: row.inUse,
        Stock: row.inStock,
        Location: row.location,
        Cost: convertFromBase(row.cost),
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

  if (loading || loadingRates)
    return <Loader type="mis" apiDone={apiDone} />;

  // ================= UI =================
  return (
    <div className="mis-content">

      {/* HEADER */}
      <div className="report-header">
        <h3>Asset MIS Report</h3>
        <div className="header-actions">
          <CurrencyFilter />
          <button onClick={exportData} className="misbutton">
            Export Excel
          </button>
        </div>
      </div>

      {/* MAIN TABS */}
      <div className="navs">
        <button
          className={activeTab === "hardware" ? "active-tab" : ""}
          onClick={() => setActiveTab("hardware")}
        >
          Hardware
        </button>
        <button
          className={activeTab === "software" ? "active-tab" : ""}
          onClick={() => setActiveTab("software")}
        >
          Software
        </button>
      </div>

      {/* SUB TABS */}
      <div className="sub-tabs">
        <button
          className={viewMode === "summary" ? "active-tab" : ""}
          onClick={() => setViewMode("summary")}
        >
          Summary
        </button>
        <button
          className={viewMode === "instance" ? "active-tab" : ""}
          onClick={() => setViewMode("instance")}
        >
          Instances
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

      {/* TABLE */}
   <div className="table-wrapper">

        <table className="mis-table">
          <thead>
            <tr>

              {/* HARDWARE */}
              {activeTab === "hardware" && viewMode === "summary" && (
                <>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>In Use</th>
                  <th>Stock</th>
                  <th>Location</th>
                  <th>Purchase Date</th>
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
    <th>Category</th>
    <th>In Use</th>
    <th>Stock</th>
    <th>Location</th>
    <th>Purchase Date</th>
  </>
)}

              {/* SOFTWARE */}
              {activeTab === "software" && viewMode === "instance" && (
                <>
                  <th>Asset</th>
                  <th>License</th>
                  <th>Vendor</th>
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
                    <td>{row.model}</td>
                    <td>{row.status}</td>
                    <td>{row.condition}</td>
                    <td>{row.assignedTo}</td>
                    <td>{row.department}</td>
                                        <td>
  {CURRENCY_SYMBOLS[currency]} {convertFromBase(row.cost).toFixed(2)}
</td>
                  </>
                )}
                {activeTab === "software" && viewMode === "summary" && (
  <>
    <td>{row.assetName}</td>
    <td>{row.category}</td>
    <td>{row.inUse}</td>
    <td>{row.inStock}</td>
    <td>{row.location}</td>
    <td>
      {formatDate(row.purchaseDate)}
    </td>
  </>
)}
                {/* SOFTWARE INSTANCE */}
                {activeTab === "software" && viewMode === "instance" && (
                  <>
                    <td>{row.assetName}</td>
                    <td>{row.licenseKey}</td>
                    <td>{row.vendor}</td>
                    <td>{row.status}</td>
                    <td>{row.assignedTo}</td>
                    <td>
  {CURRENCY_SYMBOLS[currency]} {convertFromBase(row.cost).toFixed(2)}
</td>
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

   