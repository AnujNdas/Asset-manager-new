// src/Pages/SoftwareAssetCapture.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwal from "../utils/swalTheme";
import "../Page_styles/TestFile.css";
import {
  getStatuses,
  getCategories,
  createSoftwareAsset,
  getUnits,
  getLocations,
  bulkUploadSoftwareAssets,
} from "../Services/ApiServices";
import * as XLSX from "xlsx";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
import { getErrorMessage } from "../utils/getErrorMessage";
const downloadTemplate = () => {
  const data = [
    {
      assetName: "Adobe Photoshop",
      assetCategory: "Operating System",
      associateUnit: "Concurrent User",
      locationName: "Paris, France",
      type: "yearly",
      assetQuantity: 10,
      dateOfPurchase: "2026-01-01",
      vendorName: "Adobe Inc.",
      vendorContact: "1234567890",
      vendorEmail: "support@adobe.com",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);

  const capitalizeHeader = (str) =>
    str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase());

  Object.keys(data[0]).forEach((key, index) => {
    const cell = XLSX.utils.encode_cell({ r: 0, c: index });
    worksheet[cell].v = capitalizeHeader(key);
  });

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Software Template"
  );

  XLSX.writeFile(
    workbook,
    "software_asset_template.xlsx"
  );
};
export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", label: "Swiss Franc", symbol: "Fr." },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", label: "Qatari Riyal", symbol: "﷼" },
  { code: "KWD", label: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "SEK", label: "Swedish Krona", symbol: "kr" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
];
const initialForm = {
  assetName: "",
  assetCategory: "",
  associateUnit: "",
  locationName: "",
  locationAddress: "",
  type: "",

  licenseKey: "",
  licenseModel: "",
  licenseMetric: "",

  DOP: "",

  assetQuantity: "",
  vendor: {
    name: "",
    contact: "",
    supportEmail: "",
  },
};

export default function SoftwareAssetCapture() {
    const { registerTour } = useTour();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
      const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
    
      overlayColor: "rgba(0,0,0,0.75)",
    
      popoverClass: "custom-driver-popover",
    
      steps: [
        {
          element: ".tour-import",
          popover: {
            title: "Import Assets",
            description: "You can add more than one Software asset at a time.",
            side: "bottom",
            align: "start",
          },
        },
    
        {
          element: ".tour-template",
          popover: {
            title: "Download Template",
            description:
              "Download and View the Format in which data is required for import.",
            side: "bottom",
          },
        },
    
        {
          element: ".tour-category",
          popover: {
            title: "Category section",
            description: "Categories are set as default for both hardware and software",
            side: "bottom",
          },
        },
    
        {
          element: ".tour-unit",
          popover: {
            title: "Unit Section",
            description: "Defaults units are there but you can add them if you want.",
            side: "bottom",
          },
        },
    
        {
          element: ".tour-location",
          popover: {
            title: "Location Section",
            description: "Defaults Locations are there but you can add them if you want.",
            side: "bottom",
          },
        },
        {
          element: ".tour-quantity",
          popover: {
            title: "Quantity Section",
            description: "Number of Instances you want to add under this Software Asset.",
            side: "bottom",
          },
        },
        {
          element: ".tour-save",
          popover: {
            title: "Save Section",
            description: "Click here to save Software here.",
            side: "bottom",
          },
        },
      ],
    });
  useEffect(() => {
    const seen = localStorage.getItem("inventoryTourSeen");
  
    if (!seen) {
      setTimeout(() => {
        driverObj.drive();
  
        localStorage.setItem(
          "inventoryTourSeen",
          "true"
        );
      }, 1000);
    }
  }, []);
  useEffect(() => {
  registerTour(driverObj);
}, []);
useEffect(() => {
  (async () => {
    try {
      const [u, l, c] = await Promise.all([
        getUnits(),
        getLocations(),
        getCategories("software"),
      ]);

      setUnits(u || []);
      setLocations(l?.data || []);
      setCategories(c || []);

    } catch (err) {
      ThemeSwal.fire(
        "Error",
        getErrorMessage(err, "Failed to load initial data"),
        "error"
      );
    }
  })();
}, []);
  const validateRequired = () => {
    const missing = [];

    if (!formData.assetName) missing.push("Software Name");
    if (!formData.assetCategory) missing.push("Category");
    if (!formData.associateUnit) missing.push("Unit");
    if (!formData.type) missing.push("Type");
    if (!formData.assetQuantity) missing.push("Quantity");
    if (!formData.DOP) missing.push("Start Date"); // 🔥 IMPORTANT

    if (missing.length) {
      ThemeSwal.fire("Missing fields", missing.join(", "), "error");
      return false;
    }

    return true;
  };

const handleImport = async () => {
  if (!importFile) {
    ThemeSwal.fire("Error", "Please select a file", "error");
    return;
  }

  try {
    setImportLoading(true);

    /* =============================
       📊 PARSE EXCEL → JSON
    ============================== */
    const data = await importFile.arrayBuffer();

    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

   const normalizeKey = (key) =>
  key
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");

const jsonData = XLSX.utils
  .sheet_to_json(sheet, {
    defval: "",
  })
  .map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        normalizeKey(key),
        value,
      ])
    )
  );

console.log(jsonData);
    console.log(jsonData);

    /* =============================
       🚀 SEND JSON TO BACKEND
    ============================== */
    const res = await bulkUploadSoftwareAssets({
      assets: jsonData,
      type: "software", // 🔥 important
    });

if (res.success) {
  const {
    inserted = 0,
    skipped = 0,
    invalidRows = [],
  } = res.data || {};

  const errorHtml =
    invalidRows.length > 0
      ? `
        <div style="
          max-height:300px;
          overflow-y:auto;
          margin-top:15px;
          text-align:left;
          border-top:1px solid #333;
          padding-top:10px;
        ">
          ${invalidRows
            .map(
              (row) => `
              <div style="
                margin-bottom:12px;
                padding:10px;
                border-radius:8px;
                background:#1e1e1e;
                border-left:4px solid #ff4d4f;
              ">
                <div style="font-weight:600; color:#ff7875;">
                  Row ${row.row}
                </div>

                <div style="margin-top:4px;">
                  ${row.reason}
                </div>

                ${
                  row.asset?.assetName
                    ? `
                  <div style="
                    margin-top:6px;
                    font-size:12px;
                    opacity:0.8;
                  ">
                    Asset: ${row.asset.assetName}
                  </div>
                `
                    : ""
                }
              </div>
            `
            )
            .join("")}
        </div>
      `
      : "";

  ThemeSwal.fire({
    title: "Bulk Upload Result",
    html: `
      <div style="text-align:left; line-height:1.8">
        <p>✅ Uploaded: <b>${inserted}</b></p>
        <p>⚠️ Skipped: <b>${skipped}</b></p>

        ${errorHtml}
      </div>
    `,
    icon: skipped > 0 ? "warning" : "success",
    width: 650,
    confirmButtonText: "Okay",
    customClass: {
      confirmButton: "my-confirm-btn",
    },
  });
  setShowImport(false);
  setImportFile(null);
  navigate("/instance-assets");
} else {
      ThemeSwal.fire("Error", res.message, "error");
    }
} catch (err) {
  ThemeSwal.fire(
    "Error",
    getErrorMessage(err, "Upload failed"),
    "error"
  );
} finally {
    setImportLoading(false);
  }
};
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔥 handle nested vendor fields
    if (name.startsWith("vendor.")) {
      const field = name.split(".")[1];

      setFormData((prev) => ({
        ...prev,
        vendor: {
          ...prev.vendor,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validateRequired()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        assetName: formData.assetName,
        assetCategory: formData.assetCategory,
        associateUnit: formData.associateUnit,
        locationName: formData.locationName,
        type: formData.type,
        assetQuantity: Number(formData.assetQuantity),

        purchaseDetails: {
          purchaseDate: formData.DOP,
          vendor: formData.vendor,
        },
      };

      // ✅ CAPTURE RESPONSE
      const createdAsset = await createSoftwareAsset(payload);

      // ⚠️ depends on your API response shape
      const assetId = createdAsset?._id || createdAsset?.data?._id;

      await ThemeSwal.fire("Success", "Asset created!", "success");

      // ✅ NAVIGATE SAME AS HARDWARE
      navigate("/instance-assets", {
        state: { selectedAssetId: assetId },
      });
    } catch (err) {
      ThemeSwal.fire(
        "Error",
        getErrorMessage(err, "Failed to create asset."),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 4) * 100;
  return (
<div className="capture-page">
  <div className="split-container">

    {/* ================= LEFT PANEL ================= */}
    <aside className="left-panel">
      <div className="capture-intro">
        <span className="capture-eyebrow">ASSET CAPTURE</span>

        <h2>Create Software Asset</h2>

        <p className="description">
          Add software licenses with proper tracking, cost visibility,
          and lifecycle management.
        </p>
      </div>

      <div className="capture-info-content">

        {/* WHAT YOU'LL NEED */}
        <div className="info-box">
          <div className="info-box-header">
            <span className="info-icon">01</span>
            <h4>What you'll need</h4>
          </div>

          <ul>
            <li>
              <span></span>
              Basic software details
            </li>

            <li>
              <span></span>
              License information
            </li>

            <li>
              <span></span>
              Cost & quantity
            </li>

            <li>
              <span></span>
              Billing information
            </li>
          </ul>
        </div>

        {/* BEFORE YOU SAVE */}
        <div className="info-box">
          <div className="info-box-header">
            <span className="info-icon">02</span>
            <h4>Before you save</h4>
          </div>

          <ul>
            <li>
              <span></span>
              Verify the license quantity
            </li>

            <li>
              <span></span>
              Match the type with the billing cycle
            </li>

            <li>
              <span></span>
              Confirm the purchase or start date
            </li>
          </ul>
        </div>
      </div>

      {/* SIDE NOTE */}
      <div className="capture-side-note">
        <span className="side-note-icon">i</span>

        <p>
          Individual software licenses and device assignments can be
          configured after the asset is created.
        </p>
      </div>
    </aside>


    {/* ================= RIGHT PANEL ================= */}
    <main className="right-panel">
      <div className="form-card">

        {/* ================= HEADER ================= */}
        <div className="capture-header">
          <div className="capture-header-copy">
            <span className="form-eyebrow">SOFTWARE</span>

            <h1>Software Details</h1>

            <p>
              Enter the information required to create your software asset.
            </p>
          </div>

          <div className="group-buttons">

            <button
              type="button"
              className="secondary-action tour-template"
              onClick={downloadTemplate}
            >
              <span className="button-icon">↓</span>
              Template
            </button>

            <button
              type="button"
              className="import-btn tour-import"
              onClick={() => setShowImport(true)}
            >
              <span className="button-icon">↑</span>
              Import Excel
            </button>

          </div>
        </div>


        {/* =====================================================
            SECTION 01 - SOFTWARE INFORMATION
        ===================================================== */}
        <section className="form-section">

          <div className="section-heading">
            <div className="section-number">01</div>

            <div>
              <h3>Software Information</h3>
              <p>
                Basic information used to identify and organize this software.
              </p>
            </div>
          </div>


          <div className="grid-2">

            {/* SOFTWARE NAME */}
            <div className="input-group">
              <label>
                Software Name <span className="required">*</span>
              </label>

              <input
                name="assetName"
                onChange={handleChange}
                placeholder="e.g. Microsoft 365 Business"
              />
            </div>


            {/* CATEGORY */}
            <div className="input-group tour-category">
              <label>
                Category <span className="required">*</span>
              </label>

              <select
                name="assetCategory"
                onChange={handleChange}
              >
                <option value="">Select category</option>

                {categories.map((c) => (
                  <option
                    key={c._id}
                    value={c._id}
                  >
                    {c.name}
                  </option>
                ))}

              </select>
            </div>


            {/* UNIT */}
            <div className="input-group tour-unit">
              <label>
                Unit <span className="required">*</span>
              </label>

              <select
                name="associateUnit"
                onChange={handleChange}
              >
                <option value="">Select unit</option>

                {units.map((u) => (
                  <option
                    key={u._id}
                    value={u._id}
                  >
                    {u.name}
                  </option>
                ))}

              </select>
            </div>


            {/* LOCATION */}
            <div className="input-group tour-location">
              <label>Billing Location</label>

              <select
                name="locationName"
                onChange={handleChange}
              >
                <option value="">Select location</option>

                {locations.map((l) => (
                  <option
                    key={l._id}
                    value={l._id}
                  >
                    {l.name}
                  </option>
                ))}

              </select>
            </div>

          </div>
        </section>


        {/* =====================================================
            SECTION 02 - LICENSE & BILLING
        ===================================================== */}
        <section className="form-section">

          <div className="section-heading">
            <div className="section-number">02</div>

            <div>
              <h3>License & Billing</h3>

              <p>
                Define the billing model, start date, and license quantity.
              </p>
            </div>
          </div>


          <div className="grid-2">

            {/* TYPE */}
            <div className="input-group">
              <label>
                Billing Type <span className="required">*</span>
              </label>

              <select
                name="type"
                onChange={handleChange}
              >
                <option value="">Select billing type</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one_time">One-Time</option>
              </select>
            </div>


            {/* START DATE */}
            <div className="input-group">
              <label>Start Date</label>

              <input
                type="date"
                name="DOP"
                onChange={handleChange}
              />
            </div>


            {/* QUANTITY */}
            <div className="input-group tour-quantity">
              <label>
                License Quantity <span className="required">*</span>
              </label>

              <input
                type="number"
                name="assetQuantity"
                onChange={handleChange}
                placeholder="Enter number of licenses"
                min="1"
              />
            </div>

          </div>
        </section>


        {/* =====================================================
            SECTION 03 - VENDOR INFORMATION
        ===================================================== */}
        <section className="form-section">

          <div className="section-heading">
            <div className="section-number">03</div>

            <div>
              <h3>Vendor Information</h3>

              <p>
                Optional supplier and support information for this software.
              </p>
            </div>
          </div>


          <div className="grid-2">

            {/* VENDOR NAME */}
            <div className="input-group">
              <label>Vendor Name</label>

              <input
                name="vendor.name"
                value={formData.vendor.name}
                onChange={handleChange}
                placeholder="e.g. Microsoft"
              />
            </div>


            {/* VENDOR CONTACT */}
            <div className="input-group">
              <label>Vendor Contact</label>

              <input
                name="vendor.contact"
                value={formData.vendor.contact}
                onChange={handleChange}
                placeholder="Phone or contact number"
              />
            </div>


            {/* SUPPORT EMAIL */}
            <div className="input-group full-width">
              <label>Support Email</label>

              <input
                type="email"
                name="vendor.supportEmail"
                value={formData.vendor.supportEmail}
                onChange={handleChange}
                placeholder="support@vendor.com"
              />
            </div>

          </div>
        </section>


        {/* =====================================================
            FORM FOOTER
        ===================================================== */}
        <div className="form-footer">

          <div className="form-footer-message">
            <span>✓</span>

            <p>
              Required fields are marked with
              <strong> *</strong>
            </p>
          </div>


          <button
            className="submit-btn tour-save"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >

            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                Saving Asset...
              </>
            ) : (
              <>
                Save Software Asset
                <span className="submit-arrow">→</span>
              </>
            )}

          </button>

        </div>

      </div>
    </main>

  </div>


  {/* =========================================================
      IMPORT MODAL
  ========================================================= */}
  {showImport && (
    <div
      className="import-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !importLoading) {
          setShowImport(false);
        }
      }}
    >

      <div className="import-box">

        {/* MODAL HEADER */}
        <div className="import-modal-header">

          <div>
            <span className="form-eyebrow">
              BULK IMPORT
            </span>

            <h3>
              Import Software Assets
            </h3>

            <p>
              Upload your completed software asset template.
            </p>
          </div>


          <button
            type="button"
            className="modal-close"
            onClick={() => setShowImport(false)}
            disabled={importLoading}
            aria-label="Close import modal"
          >
            ×
          </button>

        </div>


        {/* FILE UPLOAD */}
        <label className="file-upload-area">

          <div className="upload-icon">
            ↑
          </div>

          <strong>
            Select software asset file
          </strong>

          <span>
            Excel file · .xlsx, .xls
          </span>


          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) =>
              setImportFile(e.target.files[0])
            }
          />

        </label>


        {/* SELECTED FILE */}
        {importFile && (
          <div className="selected-file">

            <div className="selected-file-icon">
              ✓
            </div>

            <div>
              <strong>
                {importFile.name}
              </strong>

              <span>
                {(importFile.size / 1024).toFixed(1)} KB
              </span>
            </div>

          </div>
        )}


        {/* MODAL ACTIONS */}
        <div className="import-actions">

          <button
            type="button"
            className="modal-cancel"
            onClick={() => setShowImport(false)}
            disabled={importLoading}
          >
            Cancel
          </button>


          <button
            type="button"
            className="modal-upload"
            onClick={handleImport}
            disabled={importLoading || !importFile}
          >
            {importLoading
              ? "Uploading..."
              : "Upload Assets"}
          </button>

        </div>

      </div>
    </div>
  )}

</div>
  );
}
