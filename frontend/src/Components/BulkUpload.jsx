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
  const [dragOverExcel, setDragOverExcel] = useState(false);
  const [dragOverZip, setDragOverZip] = useState(false);
  const [mode, setMode] = useState("strict");

  useEffect(() => {
    if (userRole === "super-admin") setMode("auto");
  }, [userRole]);

  const calculateAssetLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return "";
    const diff = new Date(DOE) - new Date(DOP);
    return diff <= 0 ? "0 years" : `${Math.ceil(diff / (1000 * 60 * 60 * 24 * 365))} years`;
  };

  const templates = {
    hardware: [
      {
        assetCode: "",
        assetCategory: "",
        barcodeNumber: "",
        assetName: "",
        associateUnit: "",
        image: "",
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
    "Software Name": "",
    "Version": "",
    "Publisher": "",
    "Category": "",
    "License Key": "",
    "License Type": "",
    "License Model": "",
    "License Use": "",
    "Total Licenses": "",
    "Licenses Assigned": "",
    "License Start Date": "",
    "License Expiry": "",
    "Renewal Cycle": "",
    "Purchase Date": "",
    "Cost Per Unit": "",
    "Currency": "",
    "Purchase Order": "",
    "Compliance Status": "",
    "Assigned To": "",
    "Install Location": "",
  }
]

  };

  const handleUpload = async () => {
    if (!excelFile)
      return Swal.fire("Missing File", "Upload an Excel file!", "warning");

    const reader = new FileReader();

    reader.onload = async (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      if (type === "hardware") {
        sheet.forEach(
          (row) => (row.assetLifetime = calculateAssetLifetime(row.DOP, row.DOE))
        );
      }

      const formData = new FormData();
      formData.append("excel", excelFile);
      if (zipFile) formData.append("imagesZip", zipFile);
      formData.append("assets", JSON.stringify(sheet));
      formData.append("mode", mode);

      try {
        let res;
        if (type === "hardware") res = await bulkUploadHardwareAssets(formData);
        if (type === "software") res = await bulkUploadSoftwareAssets(formData);

        Swal.fire(
          "Success!",
         `${res.inserted} assets imported\n${res.skipped} skipped`,
          "success"
        );
      } catch (err) {
  console.log("❌ AXIOS ERROR:", err);
  console.log("❌ AXIOS RESPONSE:", err.response?.data);
  Swal.fire("Error", "Import failed!", "error");
}

    };

    reader.readAsArrayBuffer(excelFile);
  };

  return (
    <div className="bulk-wrapper">
      <div className="bulk-card">

        <div className="bulk-header">
          <h2>Import {type === "hardware" ? "Hardware Assets" : "Software Assets"}</h2>
          <span className="mode-chip">
            {mode === "auto" ? "Auto Mode (Super Admin)" : "Strict Mode"}
          </span>
        </div>

        {/* EXCEL UPLOAD */}
        <div
          className={`dropzone ${dragOverExcel ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOverExcel(true); }}
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

        {/* ZIP UPLOAD (ONLY FOR HARDWARE) */}
        {type === "hardware" && (
          <>
            <div
              className={`dropzone ${dragOverZip ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverZip(true); }}
              onDragLeave={() => setDragOverZip(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverZip(false);
                setZipFile(e.dataTransfer.files[0]);
              }}
            >
              <FiArchive className="drop-icon" />
              <div className="drop-text-group">
                <p className="drop-main-text">Upload Images ZIP (Optional)</p>
                <p className="drop-sub-text">ZIP filenames must match Excel image column</p>
              </div>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files[0])}
              />
            </div>

            {zipFile && (
              <div className="file-preview">
                <FiArchive className="file-icon" />
                <span>{zipFile.name}</span>
              </div>
            )}
          </>
        )}

        {/* ACTION BUTTONS */}
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
