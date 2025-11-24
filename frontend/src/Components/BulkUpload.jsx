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

        <h2 className="bulk-title">
          Import {type === "hardware" ? "Hardware Assets" : "Software Assets"}
        </h2>

        <p className="bulk-mode">
          Mode: <strong>{mode === "auto" ? "Auto (Super Admin)" : "Strict"}</strong>
        </p>

        {/* EXCEL UPLOAD */}
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
            setExcelFile(e.dataTransfer.files[0]);
          }}
        >
          <FiUploadCloud className="drop-icon" />
          <p className="drop-main-text">Drag & drop Excel file</p>
          <p className="drop-sub-text">or click to browse</p>

          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setExcelFile(e.target.files[0])}
          />
        </div>

        {excelFile && (
          <div className="file-preview">
            <FiFile className="file-icon" />
            <span>{excelFile.name}</span>
          </div>
        )}

        {/* ZIP UPLOAD */}
        {type === "hardware" && (
          <>
            <label className="zip-label">Upload ZIP (Images Folder)</label>

            <div className="zip-box">
              <FiArchive className="zip-icon" />
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
        <div className="bulk-actions-modern">
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
