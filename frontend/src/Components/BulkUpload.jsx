import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  bulkUploadHardwareAssets,
  bulkUploadSoftwareAssets,
  bulkUploadCoreLicenses,
} from "../Services/ApiServices";
import "../Component_styles/BulkUpload.css";
import { FiUploadCloud, FiDownload, FiFile } from "react-icons/fi";

const BulkUpload = ({ type, userRole }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState("strict");

  useEffect(() => {
    if (userRole === "super-admin") setMode("auto");
  }, [userRole]);

  const calculateAssetLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return "";
    const start = new Date(DOP);
    const end = new Date(DOE);
    const diffTime = end - start;
    if (diffTime <= 0) return "0 years";
    return `${Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365))} years`;
  };

  const templates = {
    hardware: [
      {
        assetCategory: "",
        assetName: "",
        associateUnit: "",
        locationName: "",
        assetSpecification: "",
        assetStatus: "",
        DOP: "",
        DOE: "",
        purchaseFrom: "",
        image: "",
      },
    ],
    software: [
      {
        name: "",
        version: "",
        publisher: "",
        category: "",
        licenseKey: "",
        licenseType: "",
        licenseModel: "",
        licenseUse: "",
        installLocation: "",
        totalLicenses: "",
        licensesAssigned: "",
        licenseExpiry: "",
        purchaseDate: "",
        purchaseOrder: "",
        cost: "",
        assignedTo: "",
        complianceStatus: "",
      },
    ],
    "core-license": [
      {
        documentType: "",
        licenseNumber: "",
        issuingAuthority: "",
        licenseHolder: "",
        businessActivity: "",
        issueDate: "",
        expiryDate: "",
        renewalCycle: "Annual",
        reminderDaysBefore: 30,
        status: "",
      },
    ],
  };

  const handleUpload = async () => {
    if (!file)
      return Swal.fire("No File", "Please upload an Excel file!", "warning");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), {
        type: "array",
      });
      const worksheet = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      try {
        if (type === "hardware") {
          worksheet.forEach(
            (row) =>
              (row.assetLifetime = calculateAssetLifetime(row.DOP, row.DOE))
          );
        }

        const payload = { assets: worksheet, mode };
        let res;

        if (type === "hardware")
          res = await bulkUploadHardwareAssets(payload);
        if (type === "software")
          res = await bulkUploadSoftwareAssets(payload);
        if (type === "core-license")
          res = await bulkUploadCoreLicenses(payload);

        Swal.fire(
          "Success",
          `${res.insertedCount} records imported successfully`,
          "success"
        );
      } catch (err) {
        Swal.fire("Error", "Import failed!", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bulk-wrapper">
      <div className="bulk-card">
        <h2 className="bulk-title">
          Import {type === "hardware" ? "Hardware Assets" :
                  type === "software" ? "Software Assets" :
                  "Core Licenses"}
        </h2>

        <p className="bulk-mode">
          Mode: <strong>{mode === "auto" ? "Auto (Super Admin)" : "Strict"}</strong>
        </p>

        {/* DRAG AND DROP ZONE */}
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
          <p className="drop-main-text">
            Drag & drop your Excel file here
          </p>
          <p className="drop-sub-text">or click to browse</p>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* SELECTED FILE PREVIEW */}
        {file && (
          <div className="file-preview">
            <FiFile className="file-icon" />
            <span>{file.name}</span>
          </div>
        )}

        {/* BUTTONS */}
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
