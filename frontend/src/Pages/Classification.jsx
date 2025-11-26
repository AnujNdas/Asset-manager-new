import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import "../Page_styles/Classification.css";

import Unit from "../Inner_sections/Unit";
import Category from "../Inner_sections/Category";
import Location from "../Inner_sections/Location";
import Status from "../Inner_sections/Status";

// Export utilities
import * as XLSX from "xlsx";

import Swal from "sweetalert2";

// API calls
import {
  getUnits,
  getLocations,
  getCategories,
  getStatuses,
} from "../Services/ApiServices";

const tabs = [
  { name: "Location", path: "/classification/location" },
  { name: "Unit", path: "/classification/unit" },
  { name: "Category", path: "/classification/category" },
  { name: "Status", path: "/classification/status" },
];

const Classification = () => {
  const location = useLocation();
  const [exportOpen, setExportOpen] = useState(false);

  // EXPORT HANDLER
  const handleExport = async (format) => {
    try {
      const [units, locations, categories, statuses] = await Promise.all([
        getUnits(),
        getLocations(),
        getCategories(),
        getStatuses(),
      ]);

      const data = {
        Units: units,
        Locations: locations,
        Categories: categories,
        Statuses: statuses,
      };

      if (format === "csv") {
        exportCSV(data);
      } else if (format === "excel") {
        exportExcel(data);
      }

      setExportOpen(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to export data!", "error");
    }
  };

  // CSV EXPORT FUNCTION
  const exportCSV = (data) => {
    let csv = "";

    Object.keys(data).forEach((section) => {
      csv += `\n${section}\n`;

      const rows = data[section];

      if (rows.length === 0) return;

      const headers = Object.keys(rows[0]).join(",");
      csv += headers + "\n";

      rows.forEach((r) => {
        csv += Object.values(r).join(",") + "\n";
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "classification_export.csv";
    link.click();
  };

  // EXCEL EXPORT FUNCTION
  const exportExcel = (data) => {
    const workbook = XLSX.utils.book_new();

    Object.keys(data).forEach((sheetName) => {
      const sheet = XLSX.utils.json_to_sheet(data[sheetName]);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    });

    XLSX.writeFile(workbook, "classification_export.xlsx");
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
