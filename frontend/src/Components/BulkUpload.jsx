// src/Components/BulkUpload.jsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  bulkUploadHardwareAssets,
  bulkUploadSoftwareAssets,
  bulkUploadCoreLicenses,
} from "../Services/ApiServices";
import "../Component_styles/BulkUpload.css";

const BulkUpload = ({ type }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Define templates for each type
  const templates = {
    hardware: [
      {
        "assetCode": '',
        "assetCategory": '',
        "barcodeNumber": '',
        "assetName": '',
        "associateUnit": '',
        "locationName": '',
        "assetSpecification": '',
        "assetStatus": '',
        "DOP": '',
        "DOE": '',
        "assetLifetime": '',
        "purchaseFrom": '',
        "image": '',
      },
    ],
    software: [
      {
        "name": "",
        "version": "",
        "publisher": "",
        "category": "",
        "licenseKey": "",
        "licenseType": "",
        "licenseModel": "",
        "licenseUse": "",
        "installLocation": "",
        "totalLicenses": "",
        "licensesAssigned": "",
        "licenseExpiry": "",
        "purchaseDate": "",
        "purchaseOrder": "",
        "cost": "",
        "assignedTo": "",
        "complianceStatus": "",
      },
    ],
    "core-license": [
      {
        "documentType": "",
        "licenseNumber": "",
        "issuingAuthority": "",
        "licenseHolder": "",
        "businessActivity": "",
        "issueDate": "",
        "expiryDate": "",
        "renewalCycle": "Annual",
        "reminderDaysBefore": 30,
        'status': "",
      },
    ],
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      Swal.fire("⚠️ Error", "Please select an Excel file first!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      try {
        let res;
        if (type === "hardware") {
          res = await bulkUploadHardwareAssets(worksheet);
        } else if (type === "software") {
          res = await bulkUploadSoftwareAssets(worksheet);
        } else if (type === "core-license") {
          res = await bulkUploadCoreLicenses(worksheet);
        }

        Swal.fire("✅ Success", `${res.insertedCount} records uploaded!`, "success");
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
      <h2>
        📥 Bulk Upload{" "}
        {type === "hardware"
          ? "Hardware Assets"
          : type === "software"
          ? "Software Assets"
          : "Core Licenses"}
      </h2>

      {/* Drag & Drop Zone */}
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
        <p>
          {file
            ? `📄 ${file.name}`
            : "📂 Drag & drop Excel file here or click to browse"}
        </p>
      </div>

      <div className="bulk-actions">
        <button onClick={handleUpload}>⬆️ Upload</button>
        <button onClick={handleDownloadTemplate}>⬇️ Download Template</button>
      </div>
    </div>
  );
};

export default BulkUpload;
