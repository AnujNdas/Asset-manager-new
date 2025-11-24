import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  bulkUploadHardwareAssets,
  bulkUploadSoftwareAssets,
} from "../Services/ApiServices";
import "../Component_styles/BulkUpload.css";
import { FiUploadCloud, FiDownload, FiFile, FiArchive } from "react-icons/fi";

const BulkUpload = ({ type, userRole }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState("strict");

  useEffect(() => {
    if (userRole === "super-admin") setMode("auto");
  }, [userRole]);

  const calculateAssetLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return "";
    const start = new Date(DOP);
    const end = new Date(DOE);
    const diff = end - start;
    if (diff <= 0) return "0 years";
    return `${Math.ceil(diff / (1000 * 60 * 60 * 24 * 365))} years`;
  };

  const templates = {
    hardware: [
      {
        assetCode: "",
        assetCategory: "",
        barcodeNumber: "",
        assetName: "",
        associateUnit: "",
        image: "", // <-- REQUIRED for ZIP matching
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
        name: "",
        version: "",
        publisher: "",
        category: "",
      },
    ],
  };

  const handleUpload = async () => {
    if (!excelFile)
      return Swal.fire("Missing File", "Upload an Excel file first!", "warning");

    const reader = new FileReader();

    reader.onload = async (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      if (type === "hardware") {
        worksheet.forEach(
          (row) => (row.assetLifetime = calculateAssetLifetime(row.DOP, row.DOE))
        );
      }

      // -----------------------------
      // PREPARE FORM DATA
      // -----------------------------
      const formData = new FormData();
      formData.append("excel", excelFile);
      if (zipFile) formData.append("imagesZip", zipFile);

      formData.append(
        "assets",
        JSON.stringify(worksheet)
      );
      formData.append("mode", mode);

      let res;

      try {
        if (type === "hardware") {
          res = await bulkUploadHardwareAssets(formData);
        } else if (type === "software") {
          res = await bulkUploadSoftwareAssets(formData);
        }

        Swal.fire(
          "Success!",
          `${res.data.inserted} assets imported\n${res.data.skipped} skipped`,
          "success"
        );
      } catch (err) {
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

      {/* Upload Zone */}
      <div
        className={`dropzone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          setFile(e.dataTransfer.files[0]);
        }}
      >
        <FiUploadCloud className="drop-icon" />

        <div className="drop-text-group">
          <p className="drop-main-text">Drag & Drop Excel File</p>
          <p className="drop-sub-text">or click to browse</p>
        </div>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      {/* File Preview */}
      {file && (
        <div className="file-preview">
          <FiFile className="file-icon" />
          <span>{file.name}</span>
        </div>
      )}

      {/* Action Buttons */}
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
