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
  const [isValidExcel, setIsValidExcel] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userRole === "super-admin") setMode("auto");
  }, [userRole]);

  /* ---------- HELPERS ---------- */

  const calculateAssetLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return "";
    const diff = new Date(DOE) - new Date(DOP);
    if (diff <= 0) return "0 years";
    return `${Math.ceil(diff / (1000 * 60 * 60 * 24 * 365))} years`;
  };

  /* ---------- TEMPLATES ---------- */

  const templates = {
    hardware: [
      {
        assetName: "",
        assetCategory: "",
        assetSpecification: "",
        purchaseFrom: "",
        associateUnit: "",
        locationName: "",
        locationAddress: "",
        assetStatus: "",
        DOP: "",
        DOE: "",
        assetCost: "",
        assetQuantity: "",
      },
    ],
    software: [
      {
        assetName: "",
        assetCategory: "",
        assetSpecification: "",
        purchaseFrom: "",
        associateUnit: "",
        locationName: "",
        locationAddress: "",
        licenseKey: "",
        licenseType: "",
        licenseModel: "",
        licenseMetric: "",
        licenseUse: "",
        assetStatus: "",
        DOP: "",
        DOE: "",
        assetCost: "",
        assetQuantity: "",
      },
    ],
  };

  const getTemplateKeys = (t) =>
    Object.keys(templates[t][0]).sort();

  const validateExcelFormat = (row, type) => {
    const excelKeys = Object.keys(row).sort();
    const templateKeys = getTemplateKeys(type);
    return JSON.stringify(excelKeys) === JSON.stringify(templateKeys);
  };

  /* ---------- FILE SELECT ---------- */

  const handleFileSelect = (file) => {
    setExcelFile(file);
    setIsValidExcel(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), {
        type: "array",
      });
      const sheet = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      if (!sheet.length)
        return Swal.fire("Empty File", "Excel file has no data", "warning");

      if (!validateExcelFormat(sheet[0], type))
        return Swal.fire(
          "Wrong Excel Format",
          `This file does not match the ${type.toUpperCase()} template`,
          "error"
        );

      setIsValidExcel(true);
    };

    reader.readAsArrayBuffer(file);
  };

  /* ---------- UPLOAD ---------- */

  const handleUpload = () => {
    if (!excelFile || !isValidExcel || uploading) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workbook = XLSX.read(new Uint8Array(e.target.result), {
          type: "array",
        });
        const sheet = XLSX.utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]]
        );

        // Only calculate derived fields
        for (const row of sheet) {
          row.assetLifetime = calculateAssetLifetime(row.DOP, row.DOE);
        }

        const payload = {
          assets: JSON.stringify(sheet),
          mode,
        };

        const res =
          type === "hardware"
            ? await bulkUploadHardwareAssets(payload)
            : await bulkUploadSoftwareAssets(payload);

        Swal.fire(
          "Import Completed",
          `${res.inserted} imported, ${res.skipped} skipped`,
          res.inserted ? "success" : "warning"
        );

        setExcelFile(null);
        setIsValidExcel(false);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Import failed", "error");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsArrayBuffer(excelFile);
  };

  /* ---------- UI ---------- */

  return (
    <div className="bulk-wrapper">
      <div className="bulk-card">
        <div className="bulk-header">
          <h2>Import {type === "hardware" ? "Hardware" : "Software"} Assets</h2>
          <span className="mode-chip">
            {mode === "auto" ? "Auto Mode" : "Strict Mode"}
          </span>
        </div>

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
            handleFileSelect(e.dataTransfer.files[0]);
          }}
        >
          <FiUploadCloud className="drop-icon" />
          <p>Upload Excel File</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </div>

        {excelFile && (
          <div className="file-preview">
            <FiFile /> {excelFile.name}
          </div>
        )}

        <div className="bulk-actions">
          <button
            className="import-btn"
            onClick={handleUpload}
            disabled={!excelFile || !isValidExcel || uploading}
          >
            {uploading ? "Importing..." : <><FiUploadCloud /> Import</>}
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
