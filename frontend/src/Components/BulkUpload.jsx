import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  bulkUploadHardwareAssets,
  bulkUploadSoftwareAssets,
} from "../Services/ApiServices";
import "../Component_styles/BulkUpload.css";
import { FiUploadCloud, FiDownload, FiFile } from "react-icons/fi";

const BulkUpload = ({ type, userRole }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [mode, setMode] = useState("strict");
  const [dragOverExcel, setDragOverExcel] = useState(false);

  useEffect(() => {
    if (userRole === "super-admin") setMode("auto");
  }, [userRole]);

  // Auto-calc asset lifetime (hardware only)
  const calculateAssetLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return "";
    const diff = new Date(DOE) - new Date(DOP);
    return diff <= 0
      ? "0 years"
      : `${Math.ceil(diff / (1000 * 60 * 60 * 24 * 365))} years`;
  };

  // Excel templates
  const templates = {
    hardware: [
      {
        assetCode: "",
        assetCategory: "",
        barcodeNumber: "",
        assetName: "",
        associateUnit: "",
        locationName: "",
        assetSpecification: "",
        assetStatus: "",
        DOP: "",
        DOE: "",
        assetLifetime: "",
        purchaseFrom: "",
      },
    ],

    software: [
  {
    assetCode: "",
    assetName: "",
    assetCategory: "",
    assetSpecification: "",   // version
    purchaseFrom: "",         // publisher
    associateUnit: "",

    locationName: "",
    locationAddress: "",

    licenseKey: "",
    licenseType: "",
    licenseModel: "",
    licenseMetric: "",
    licenseUse: "",

    assetStatus: "",

    DOP: "",                  // license purchase/start date
    DOE: "",                  // license expiry
    assetLifetime: "",

    assetCost: "",
    assetQuantity: "",
  },
],

  };

  const handleUpload = () => {
    if (!excelFile)
      return Swal.fire("Missing File", "Please upload an Excel file!", "warning");

    const reader = new FileReader();

    reader.onload = async (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), {
        type: "array",
      });
      const sheet = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      // Add lifetime for hardware
      if (type === "hardware") {
        sheet.forEach((row) => {
          row.assetLifetime = calculateAssetLifetime(row.DOP, row.DOE);
        });
      }

      try {
        let res;

        // -------------------------
        // ✅ Hardware (JSON upload)
        // -------------------------
        if (type === "hardware") {
          const payload = {
            assets: JSON.stringify(sheet),
            mode,
          };

          res = await bulkUploadHardwareAssets(payload);
        }

        // -------------------------
        // ✅ Software (JSON upload)
        // -------------------------
        if (type === "software") {
          const payload = {
            assets: JSON.stringify(sheet),
            mode,
          };

          res = await bulkUploadSoftwareAssets(payload);
        }

        Swal.fire(
          "Success!",
          `${res.inserted} assets imported\n${res.skipped} skipped`,
          "success"
        );
      } catch (err) {
        console.log("❌ ERROR:", err);
        console.log("❌ RESPONSE:", err.response?.data);
        Swal.fire("Error", "Import failed!", "error");
      }
    };

    reader.readAsArrayBuffer(excelFile);
  };

  return (
    <div className="bulk-wrapper">
      <div className="bulk-card">
        <div className="bulk-header">
          <h2>
            Import {type === "hardware" ? "Hardware Assets" : "Software Assets"}
          </h2>
          <span className="mode-chip">
            {mode === "auto" ? "Auto Mode (Super Admin)" : "Strict Mode"}
          </span>
        </div>

        {/* Excel Upload */}
        <div
          className={`dropzone ${dragOverExcel ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverExcel(true);
          }}
          onDragLeave={() => setDragOverExcel(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverExcel(false);
            setExcelFile(e.dataTransfer.files[0]);
          }}
        >
          <FiUploadCloud className="drop-icon" />
          <div className="drop-text-group">
            <p className="drop-main-text">Upload Excel File</p>
            <p className="drop-sub-text">Only .xlsx or .xls</p>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setExcelFile(e.target.files[0])}
          />
        </div>

        {excelFile && (
          <div className="file-preview">
            <FiFile className="file-icon" />
            <span>{excelFile.name}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="bulk-actions">
          <button className="import-btn" onClick={handleUpload}>
            <FiUploadCloud /> Import
          </button>

          <button
            className="template-btn"
            onClick={() => {
              const ws = XLSX.utils.json_to_sheet(templates[type]);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Template");
              XLSX.writeFile(wb, `${type}-template.xlsx`);
            }}
          >
            <FiDownload /> Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
