// src/Components/BulkUpload.jsx
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  bulkUploadHardwareAssets,
  bulkUploadSoftwareAssets,
  bulkUploadCoreLicenses,
} from "../Services/ApiServices";
import "../Component_styles/BulkUpload.css";

const BulkUpload = ({ type, userRole }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState("strict"); // default

  useEffect(() => {
    // Super-admin automatically gets auto mode
    if (userRole === "super-admin") {
      setMode("auto");
    } else {
      setMode("strict");
    }
  }, [userRole]);

  const calculateAssetLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return "";
    const start = new Date(DOP);
    const end = new Date(DOE);
    if (isNaN(start) || isNaN(end)) return "";
    const diffTime = end - start;
    if (diffTime <= 0) return "0 years";
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return `${diffYears} years`;
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

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) setFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return Swal.fire("⚠️ Error", "Please select an Excel file first!", "error");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      let worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      try {
        if (type === "hardware") {
          worksheet = worksheet.map((row) => ({
            ...row,
            assetLifetime: calculateAssetLifetime(row.DOP, row.DOE),
          }));
        }

        // Upload with mode passed in request body (backend enforces)
        let res;
        const payload = { assets: worksheet, mode };
        if (type === "hardware") {
          console.log("Sending payload:", payload)
          res = await bulkUploadHardwareAssets(payload);
        } else if (type === "software") {
          res = await bulkUploadSoftwareAssets(payload);
        } else if (type === "core-license") {
          res = await bulkUploadCoreLicenses(payload);
        }

        Swal.fire(
          "✅ Success",
          `${res.insertedCount} records uploaded! Mode: ${res.mode}`,
          "success"
        );
      } catch (err) {
        Swal.fire("❌ Error", "Bulk upload failed", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const sampleData = templates[type];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${type}-template.xlsx`);
  };

  return (
    <div className="bulk-upload">
      <h2 className="capture-title">
        📥 Bulk Upload{" "}
        {type === "hardware" ? "Hardware Assets" : type === "software" ? "Software Assets" : "Core Licenses"}
      </h2>

      <p>
        <strong>Mode:</strong> {mode === "auto" ? "Auto (Super Admin)" : "Strict (Normal Admin/User)"}
      </p>

      <div
        className={`file-dropzone ${dragOver ? "dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <p>{file ? `📄 ${file.name}` : "📂 Drag & drop Excel file here or click to browse"}</p>
      </div>

      <div className="bulk-actions">
        <button onClick={handleUpload}>⬆️ Upload</button>
        <button onClick={handleDownloadTemplate}>⬇️ Download Template</button>
      </div>
    </div>
  );
};

export default BulkUpload;
