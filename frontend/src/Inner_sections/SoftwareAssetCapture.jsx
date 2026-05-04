// src/Pages/SoftwareAssetCapture.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwal from "../utils/SwalTheme";
import "../Page_styles/SoftwareCapture.css";
import {
  getStatuses,
  getCategories,
  createSoftwareAsset,
  getUnits,
  getLocations,
  bulkUploadSoftwareAssets,
} from "../Services/ApiServices";
import * as XLSX from "xlsx";
import { getErrorMessage } from "../utils/getErrorMessage";
const downloadTemplate = () => {
  const data = [
    {
      assetName: "Adobe Photoshop",
      assetCategory: "Design Software",
      associateUnit: "IT Department",
      BillingLocation: "Head Office",

      type: "yearly", // monthly / yearly / one_time

      assetQuantity: 10,

      DateOfPurchase: "2026-01-01", 

      vendorName: "Adobe Inc.",
      vendorContact: "1234567890",
      vendorEmail: "support@adobe.com",

      renewalTerm: "1_year", // 6_month / 1_year / 2_year
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Software Template");

  XLSX.writeFile(workbook, "software_asset_template.xlsx");
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

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });

    /* =============================
       🚀 SEND JSON TO BACKEND
    ============================== */
    const res = await bulkUploadSoftwareAssets({
      assets: jsonData,
      type: "software", // 🔥 important
    });

    if (res.success) {
ThemeSwal.fire({
  title: "Upload Complete",
  html: `
    <b>${res.inserted}</b> assets uploaded<br/>
    <b>${res.skipped}</b> skipped
  `,
  icon: res.skipped > 0 ? "warning" : "success"
});

      setShowImport(false);
      setImportFile(null);
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
    <div className="split-container">
      {/* LEFT INFO PANEL */}
      <div className="left-panel">
        <h2>Create Software Asset</h2>
        <p className="description">
          Add software licenses with proper tracking, cost visibility, and
          lifecycle management.
        </p>

        <div className="info-box">
          <h4>What we need</h4>
          <ul>
            <li>Basic software details</li>
            <li>License information</li>
            <li>Cost & quantity</li>
            <li>Validity period</li>
          </ul>
        </div>

        <div className="info-box">
          <h4>Tips</h4>
          <ul>
            <li>Use correct license count</li>
            <li>Match cost with billing cycle</li>
            <li>Ensure expiry date is accurate</li>
          </ul>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="right-panel">
        <div className="form-card">
          <div className="capture-header">
            <h3>Software Details</h3>
            <div className="group-buttons">

            <button className="import-btn" onClick={() => setShowImport(true)}>
              ⬆ Import Excel
            </button>
            <button onClick={downloadTemplate} className="btn-cancel">⬇ Download Template</button>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Software Name *</label>
              <input name="assetName" onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Category *</label>
              <select name="assetCategory" onChange={handleChange}>
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Unit *</label>
              <select name="associateUnit" onChange={handleChange}>
                <option value="">Select</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Billing Location</label>
              <select name="locationName" onChange={handleChange}>
                <option value="">Select</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3>License Info</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>Type *</label>
              <select name="type" onChange={handleChange}>
                <option value="">Select</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one_time">One-Time</option>
              </select>
            </div>
            <div className="input-group">
              <label>Start Date</label>
              <input type="date" name="DOP" onChange={handleChange} />
            </div>
          </div>

          <h3>Financial</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="assetQuantity"
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Vendor Name</label>
              <input
                name="vendor.name"
                value={formData.vendor.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Vendor Contact</label>
              <input
                name="vendor.contact"
                value={formData.vendor.contact}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Support Email</label>
              <input
                name="vendor.supportEmail"
                value={formData.vendor.supportEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 
          <div className="input-group">
            <label>Expiry Date</label>
            <input type="date" name="DOE" onChange={handleChange} />
          </div> */}

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Asset"}
          </button>
        </div>
      </div>
      {showImport && (
        <div className="import-modal">
          <div className="import-box">
            <h3>Import Software Assets</h3>

            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setImportFile(e.target.files[0])}
            />

            <div className="import-actions">
              <button onClick={() => setShowImport(false)}>Cancel</button>

              <button onClick={handleImport} disabled={importLoading}>
                {importLoading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
