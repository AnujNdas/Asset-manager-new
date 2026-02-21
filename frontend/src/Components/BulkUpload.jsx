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
  console.log("UserRole:", userRole);
}, [userRole]);

  useEffect(() => {
    if (userRole === "admin") setMode("auto");
  }, [userRole]);
useEffect(() => {
  if (!mode) return;

const modeContent =
  mode === "strict"
    ? {
        title: "Strict Import Mode",
        html: `
<div style="text-align:left; font-size:14px; line-height:1.6; padding:5px 10px;">

  <p style="margin-bottom:12px;">
    You are importing assets using <strong>Strict Mode</strong>.
    This mode enforces validation rules to maintain system consistency.
  </p>

  <div style="margin-bottom:12px;">
    <div style="font-weight:600; margin-bottom:6px;">What will happen:</div>
    <ul style="padding-left:18px; margin:0;">
      <li style="margin-bottom:6px;">
        All classifications (<strong>Category, Location, Unit, Status</strong>) must already exist.
      </li>
      <li style="margin-bottom:6px;">
        Rows with missing classifications will be <strong>skipped automatically</strong>.
      </li>
      <li>
        No new classifications will be created.
      </li>
    </ul>
  </div>

  <div style="background:#f8f9fa; padding:8px 10px; border-radius:6px;">
    <strong>Recommended for:</strong> Controlled environments where data structure must remain unchanged.
  </div>

  <p style="margin-top:12px; font-size:13px; color:#6c757d;">
    Tip: Review existing classifications in the <strong>Classification</strong> section before importing.
  </p>

</div>
        `,
        icon: "info",
      }
    : {
        title: "Auto Import Mode",
        html: `
<div style="text-align:center; font-size:14px; line-height:1.6; padding:0px 10px;">

  <p style="margin-bottom:12px; text-align:center;">
    You are importing assets using <strong>Auto Mode</strong>.
    This mode prioritizes speed and flexibility during bulk imports.
  </p>

  <div style="margin-bottom:12px;">
    <div style="font-weight:600; margin-bottom:6px;">What will happen:</div>
    <ul style="margin:0; display:flex; flex-direction:column; gap:6px; list-style-type: bullet; padding-left: 20px;">
      <li style="margin-bottom:6px;text-align:left;">
        1. New classifications (Category, Location, Unit, Status) will be created automatically.
      </li>
      <li style="margin-bottom:6px;text-align:left;">
        2. Newly created classifications will be permanently stored.
      </li>
      <li style="margin-bottom:6px;text-align:center;">
        3. This action cannot be reversed.
      </li>
    </ul>
  </div>

  <div style="background:#fff3cd; padding:8px 10px; border-radius:6px;">
    <strong>Recommended for:</strong> Large imports where classifications are evolving.
  </div>

  <p style="margin-top:12px; font-size:13px; color:#6c757d;">
    Please verify your file carefully before proceeding.
  </p>

</div>
        `,
        icon: "warning",
      };
Swal.fire({
  title: modeContent.title,
  html: modeContent.html,
  icon: modeContent.icon,

  width: "520px",

  confirmButtonText: "Got it",
  confirmButtonColor: "#2563eb",

  allowOutsideClick: false,
  scrollbarPadding: false,

  customClass: {
    popup: "responsive-swal",
    htmlContainer: "swal-html-fix"
  }
});


}, [mode]);

  /* ---------- HELPERS ---------- */

  const calculateAssetLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return "";
    const diff = new Date(DOE) - new Date(DOP);
    if (diff <= 0) return "0 years";
    return `${Math.ceil(diff / (1000 * 60 * 60 * 24 * 365))} years`;
  };
const calculateWarrantyLifetime = (DOP, warrantyExpiryDate) => {
  if (!DOP || !warrantyExpiryDate) return "";
  const diff = new Date(warrantyExpiryDate) - new Date(DOP);
  if (diff <= 0) return "0 years";
  return `${Math.ceil(diff / (1000 * 60 * 60 * 24 * 365))} years`;
};

  /* ---------- TEMPLATES ---------- */

 const templates = {
hardware: [
  {
    assetName: "",
    assetCategory: "",
    type: "one_time",          // REQUIRED
    assetSpecification: "",
    purchaseFrom: "",
    associateUnit: "",
    locationName: "",
    locationAddress: "",
    assetStatus: "",
    DateOfPurchase: "",
    DateOfExpiry: "",
    assetCost: "",
    assetCurrency: "INR",
    assetQuantity: "",

    // ⭐ WARRANTY (NEW)
    warrantyId: "",
    warrantyExpiryDate: "",
    warrantyLifetime: "",      // auto-calculated
  },
],

  software: [
    {
      SoftwareName: "",
      Category: "",
      type: "monthly",           // 🔴 REQUIRED
      Version: "",
      Publisher: "",
      Unit: "",
      locationName: "",
      locationAddress: "",
      licenseKey: "",
      licenseType: "",
      licenseModel: "",
      licenseMetric: "",
      licenseUse: "",
      Status: "",
      DateOfPurchase: "",
      DateOfExpiry: "",
      assetCost: "",             // TOTAL COST
      assetCurrency: "INR",
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

  // ⭐ WARRANTY AUTO CALC (HARDWARE ONLY)
  if (type === "hardware") {
    row.warrantyLifetime = calculateWarrantyLifetime(
      row.DOP,
      row.warrantyExpiryDate
    );
  }
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
<p className="bulk-hint">
  <b>Hardware type:</b> one_time, maintenance <br />
  <b>Warranty:</b> warrantyId, warrantyExpiryDate (optional) <br />
  <b>Software type:</b> monthly, yearly, one_time
</p>


        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
