import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import "../Page_styles/Classification.css";

import Unit from "../Inner_sections/Unit";
import Category from "../Inner_sections/Category";
import Location from "../Inner_sections/Location";
import Status from "../Inner_sections/Status";

import * as XLSX from "xlsx";
import Swal from "sweetalert2";

import {
  getUnits,
  getLocations,
  getCategories,
  getStatuses,
} from "../Services/ApiServices";

const tabs = [
  { name: "Location", key: "location", path: "/classification/location" },
  { name: "Department", key: "unit", path: "/classification/unit" },
  { name: "Category", key: "category", path: "/classification/category" },
  { name: "Status", key: "status", path: "/classification/status" },
];

const Classification = () => {
  const location = useLocation();
  const [exportOpen, setExportOpen] = useState(false);

  // Determine active tab key
  const activeTab = tabs.find((t) => location.pathname.includes(t.key));

  // EXPORT HANDLER
  const handleExport = async (format) => {
    try {
      let data = [];
      let fileName = "";

      // Fetch only the active tab's data
      switch (activeTab.key) {
        case "location":
          data = await getLocations();
          fileName = "locations";
          break;
        case "unit":
          data = await getUnits();
          fileName = "units";
          break;
        case "category":
          data = await getCategories();
          fileName = "categories";
          break;
        case "status":
          data = await getStatuses();
          fileName = "statuses";
          break;
        default:
          return Swal.fire("Error", "Unknown tab selected!", "error");
      }

      // Export based on selected format
      if (format === "csv") {
        exportCSV(data, fileName);
      } else if (format === "excel") {
        exportExcel(data, fileName);
      }

      setExportOpen(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to export data!", "error");
    }
  };

  // CSV EXPORT
  const exportCSV = (rows, fileName) => {
    if (!rows.length) {
      return Swal.fire("Empty", "No data to export!", "warning");
    }

    const headers = Object.keys(rows[0]).join(",");
    const csvRows = rows.map((row) => Object.values(row).join(",")).join("\n");

    const csv = `${headers}\n${csvRows}`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  // EXCEL EXPORT
  const exportExcel = (rows, fileName) => {
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, fileName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <div className="classification_container">
      {/* HEADER WITH EXPORT BUTTON */}
      <div className="classification_header">
        <h2 className="classify_heading2">Classification</h2>

        <div className="export-wrapper">
          <button
            className="export-btn"
            onClick={() => setExportOpen(!exportOpen)}
          >
            Export ▾
          </button>

          {exportOpen && (
            <div className="export-dropdown">
              <div onClick={() => handleExport("csv")}>CSV</div>
              <div onClick={() => handleExport("excel")}>Excel</div>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="tabs_container">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`tab ${
              location.pathname === tab.path ? "active" : ""
            }`}
          >
            <span className="tab-text2">{tab.name}</span>
          </Link>
        ))}
      </div>

      {/* CONTENT SECTION */}
      <div className="classify_items">
        <Routes>
          <Route path="/" element={<Navigate to="location" />} />
          <Route path="/unit" element={<Unit />} />
          <Route path="/category" element={<Category />} />
          <Route path="/location" element={<Location />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </div>
    </div>
  );
};

export default Classification;
