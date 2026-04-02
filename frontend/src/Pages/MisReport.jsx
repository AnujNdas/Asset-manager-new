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
  getStatuses,
  getUnits,
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

        setHardware(ha?.data || ha || []);
        setSoftware(sw?.data || sw || []);
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

  // 🔷 Hardware Summary
  const hardwareSummary = hardware.map((a) => ({
    assetName: a.assetName,
    category: a.assetCategory?.name,
    location: a.locationName?.name,
    inUse: a.inUse,
    total: a.assetQuantity,
    inStock: a.assetQuantity - a.inUse,
    cost: a.assetCost?.baseTotalAmount || 0,
  }));

  // 🔷 Hardware Instances
  const hardwareInstances = hardware.flatMap((asset) => {
    const assignmentMap = {};
    asset.assignmentRecords?.forEach((a) => {
      assignmentMap[String(a.assetInstanceId)] = a;
    });

    return (asset.instances || []).map((inst) => ({
      assetName: asset.assetName,
      instanceCode: inst.instanceCode,
      model: inst.hardwareDetails?.modelNo,
      status: inst.status,
      condition: inst.condition,
      location: inst.location,
      warranty: inst.warranty?.expiryDate,
      assignedTo:
        assignmentMap[String(inst._id)]?.employee?.name || "Unassigned",
      department:
        assignmentMap[String(inst._id)]?.department?.name || "-",
      cost: asset.assetCost?.baseTotalAmount || 0,
    }));
  });

  // 🔷 Software Instances
  const softwareInstances = software.flatMap((asset) => {
    const assignmentMap = {};
    asset.assignmentRecords?.forEach((a) => {
      assignmentMap[String(a.assetInstanceId)] = a;
    });

    return (asset.instances || []).map((inst) => ({
      assetName: asset.assetName,
      instanceCode: inst.instanceCode,
      licenseKey: inst.softwareDetails?.licenseKey,
      vendor: inst.softwareDetails?.vendor,
      status: inst.status,
      location: inst.location,
      expiry: inst.softwareDetails?.renewalDate,
      assignedTo:
        assignmentMap[String(inst._id)]?.employee?.name || "Unassigned",
      cost: asset.assetCost?.baseTotalAmount || 0,
    }));
  });

  // ================= DATA SWITCH =================
  let currentData = [];

  if (activeTab === "hardware") {
    currentData =
      viewMode === "summary"
        ? hardwareSummary
        : hardwareInstances;
  } else {
    currentData =
      viewMode === "summary"
        ? software
        : softwareInstances;
  }

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
        <h2>Asset MIS Report</h2>
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
                  <th>Cost</th>
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
                  <th>Warranty</th>
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
                  <th>Expiry</th>
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
                    <td>
                      {CURRENCY_SYMBOLS[currency]}{" "}
                      {convertFromBase(row.cost).toLocaleString()}
                    </td>
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
                    <td>{formatDate(row.warranty)}</td>
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
                    <td>{formatDate(row.expiry)}</td>
                  </>
                )}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default MisReport;