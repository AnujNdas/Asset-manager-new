// src/Pages/AssetCapture.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUnits,
  getLocations,
  getCategories,
  createHardwareAsset,
  bulkUploadHardwareAssets,
} from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/SoftwareCapture.css";
import * as XLSX from "xlsx";

const downloadTemplate = () => {
  const data = [
    {
      assetName: "Dell Laptop",
      assetCategory: "IT Equipment",
      associateUnit: "Head Office",
      locationName: "Mumbai",

      type: "one_time", // one_time / maintenance

      assetQuantity: 10,

      DateOfPurchase: "2026-04-01",

      vendorName: "Dell India",
      vendorContact: "9876543210",
      vendorEmail: "support@dell.com",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Hardware Template");

  XLSX.writeFile(workbook, "hardware_asset_template.xlsx");
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
const AssetCapture = () => {
  // src/constants/currencies.js

  const navigate = useNavigate();

  const defaultFormData = {
    assetCategory: "",
    assetName: "",
    associateUnit: "",
    locationName: "",
    purchaseFrom: "",
    type: "",
    assetQuantity: "",
    DOP: "", // 🔥 required now
    vendor: {
      name: "",
      contact: "",
      supportEmail: "",
    },
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [u, l, c, s] = await Promise.all([
          getUnits(),
          getLocations(),
          getCategories("hardware"),
        ]);
        console.log("category RESPONSE:", c);
        setUnits(Array.isArray(u) ? u : []);
        setLocations(Array.isArray(l?.data) ? l.data : []);
        setCategories(Array.isArray(c) ? c : []);

        console.log("LOCATION RESPONSE:", l);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "Failed to load classifications", "error");
      }
    })();
  }, []);

  useEffect(() => {
    const guideSeen = localStorage.getItem("assetCaptureGuideSeen");

    if (!guideSeen) {
      showGuide();
    }
  }, []);
  const showGuide = async () => {
    const steps = [
      // {
      //   title: "Asset Name",
      //   image: "/guide/asset-name.png",
      //   text: "Enter a clear and descriptive name for the hardware asset."
      // },
      // {
      //   title: "Category Selection",
      //   image: "/guide/category.png",
      //   text: "Choose the correct category so assets are organized properly."
      // },
      // {
      //   title: "Location Information",
      //   image: "/guide/location.png",
      //   text: "Specify where the asset is physically located."
      // },
      {
        title: "Cost & Quantity",
        image: "/guide/cost&quantity.webp",
        text: "Put cost Values like this",
      },
      {
        title: "Availability",
        image: "/guide/status.webp",
        text: "Assets are automatically available after creation. Assignment will update their usage.",
      },
      // {
      //   title: "Warranty & Insurance",
      //   image: "/guide/warranty.png",
      // }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      const result = await Swal.fire({
        title: step.title,
        html: `
          <div style="display:flex;flex-direction:column;align-items:center">
            <img src="${step.image}" 
                style="max-width:320px;margin-bottom:15px;border-radius:8px" />
            <p style="font-size:14px">${step.text}</p>  
          </div>
        `,
        confirmButtonText: i === steps.length - 1 ? "Start Using Page" : "Next",
        showCancelButton: true,
        cancelButtonText: "Skip",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#9ca3af",
        width: 500,
      });

      if (result.dismiss === Swal.DismissReason.cancel) {
        break;
      }
    }

    localStorage.setItem("assetCaptureGuideSeen", "true");
  };
const handleImport = async () => {
  if (!importFile) {
    Swal.fire("Error", "Please select a file", "error");
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
      defval: "", // avoid undefined
    });

    /* =============================
       🚀 SEND JSON TO BACKEND
    ============================== */
    const res = await bulkUploadHardwareAssets({
      assets: jsonData,
      type: "hardware", // 🔥 important
    });

    if (res.success) {
      Swal.fire(
        "Success",
        `${res.inserted} assets uploaded, ${res.skipped} skipped`,
        "success"
      );

      setShowImport(false);
      setImportFile(null);
    } else {
      Swal.fire("Error", res.message, "error");
    }
  } catch (err) {
    Swal.fire(
      "Error",
      err.response?.data?.message || "Upload failed",
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

  const validateRequired = () => {
    const missing = [];

    if (!formData.assetName) missing.push("Asset Name");
    if (!formData.assetCategory) missing.push("Category");
    if (!formData.associateUnit) missing.push("Unit");
    if (!formData.locationName) missing.push("Location");
    if (!formData.type) missing.push("Type");
    if (!formData.assetQuantity) missing.push("Quantity");
    if (!formData.DOP) missing.push("Purchase Date");

    if (missing.length) {
      Swal.fire("Missing fields", missing.join(", "), "error");
      return false;
    }

    return true;
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
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

      const createdAsset = await createHardwareAsset(payload);
      const assetId = createdAsset._id;

      await Swal.fire("Success", "Asset added successfully!", "success");
      navigate("/instance-assets", {
        state: { selectedAssetId: assetId },
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.userMessage ||
          err.response?.data?.message ||
          "Failed to add asset.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="split-container">
      {/* LEFT INFO PANEL */}
      <div className="left-panel">
        <h2>Create Hardware Asset</h2>
        <p className="description">
          Add physical assets with proper tracking, cost visibility, and
          lifecycle management.
        </p>

        <div className="info-box">
          <h4>What we need</h4>
          <ul>
            <li>Basic asset details</li>
            <li>Location & unit mapping</li>
            <li>Lifecycle tracking & Quantity</li>
          </ul>
        </div>

        <div className="info-box">
          <h4>Tips</h4>
          <ul>
            <li>Use correct quantity</li>
            <li>Status is managed automatically based on usage</li>
            <li>Enter accurate cost for reports</li>
          </ul>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="right-panel">
        <div className="form-card">
          <div className="capture-header">
            <h3>Hardware Details</h3>
            <div>
            <button className="import-btn" onClick={() => setShowImport(true)}>
              ⬆ Import Excel
            </button>
            <button onClick={downloadTemplate}>⬇ Download Template</button>
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Asset Name *</label>
              <input
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Category *</label>
              <select
                name="assetCategory"
                value={formData.assetCategory}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3>Location & Dates</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>Unit *</label>
              <select
                name="associateUnit"
                value={formData.associateUnit}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Location *</label>
              <select
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Purchase Date</label>
              <input
                type="date"
                name="DOP"
                value={formData.DOP}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="assetQuantity"
                value={formData.assetQuantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <h3>Financial & Quantity</h3>

          <div className="grid-2">
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
            <div className="input-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="">Select</option>
                <option value="one_time">One-Time</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <button
            className="submit-btn"
            disabled={isSubmitting}
            onClick={handleAddAsset}
          >
            {isSubmitting ? "Saving..." : "Save Asset"}
          </button>
        </div>
      </div>
      {showImport && (
        <div className="import-modal">
          <div className="import-box">
            <h3>Import Hardware Assets</h3>

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
};

export default AssetCapture;
