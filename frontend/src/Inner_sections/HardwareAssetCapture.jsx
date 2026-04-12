  // src/Pages/AssetCapture.jsx
  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import {
    getUnits,
    getLocations,
    getCategories,
    getStatuses,
    createHardwareAsset,
    bulkUploadHardwareAssets
  } from "../Services/ApiServices";
  import Swal from "sweetalert2";
  import "../Page_styles/SoftwareCapture.css";

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
  assetStatus: "",
  DOE: "",
  purchaseFrom: "",
  type: "",
  assetQuantity: "",
  DOP: "", // 🔥 required now
};


    const [formData, setFormData] = useState(defaultFormData);
    const [units, setUnits] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
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
          getStatuses(),
        ]);
        console.log("category RESPONSE:", c);
        setUnits(Array.isArray(u) ? u : []);
        setLocations(Array.isArray(l?.data) ? l.data : []);
        setCategories(Array.isArray(c) ? c : []);
        setStatuses(Array.isArray(s) ? s : []);

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
        text : "Put cost Values like this"
      },
      {
        title: "status",
        image: "/guide/status.webp",
        text : "Always use Instock for status"
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
        width: 500
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

  const formData = new FormData();
  formData.append("file", importFile);

  try {
    setImportLoading(true);

    const res = await bulkUploadHardwareAssets(formData);

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

  setFormData((prev) => {
    let updated = {
      ...prev,
      [name]: value   // ✅ THIS LINE FIXES EVERYTHING
    };

    // ✅ Auto-calc lifetime
    if (name === "DOP" || name === "DOE") {
      const { DOP, DOE } = updated;
      if (DOP && DOE) {
        const start = new Date(DOP);
        const end = new Date(DOE);
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        updated.assetLifetime =
          Number.isFinite(days) && days >= 0 ? `${days} days` : "Invalid";
      } else {
        updated.assetLifetime = "";
      }
    }

    // ✅ Auto-calc warranty lifetime (safe version)
    if (name === "DOP" || name === "warranty.expiryDate") {
      const warrantyExpiry = updated.warranty?.expiryDate;

      if (updated.DOP && warrantyExpiry) {
        const start = new Date(updated.DOP);
        const end = new Date(warrantyExpiry);
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));

        updated.warranty = {
          ...updated.warranty,
          lifetime:
            Number.isFinite(days) && days >= 0 ? `${days} days` : "Invalid"
        };
      } else if (updated.warranty) {
        updated.warranty = {
          ...updated.warranty,
          lifetime: ""
        };
      }
    }

    return updated;
  });
};

  const validateRequired = () => {
    const missing = [];

    if (!formData.assetName) missing.push("Asset Name");
    if (!formData.assetCategory) missing.push("Category");
    if (!formData.associateUnit) missing.push("Unit");
    if (!formData.locationName) missing.push("Location");
    if (!formData.assetStatus) missing.push("Status");
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
  assetStatus: formData.assetStatus,
  type: formData.type,
  assetQuantity: Number(formData.assetQuantity),

  DOE: formData.DOE || null,

  purchaseDetails: {
    purchaseDate: formData.DOP,
    vendor: {
      name: formData.purchaseFrom || "",
    },
  },
};

      const createdAsset = await createHardwareAsset(payload);
      const assetId = createdAsset._id;

      await Swal.fire("Success", "Asset added successfully!", "success");
      navigate("/instance-assets", {
        state: { selectedAssetId: assetId }
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.userMessage || err.response?.data?.message || "Failed to add asset.",
        "error"
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
          Add physical assets with proper tracking, cost visibility, and lifecycle management.
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
            <li>Always set status as <b>In Stock</b></li>
            <li>Enter accurate cost for reports</li>
          </ul>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="right-panel">
        <div className="form-card">
          <div className="capture-header">

          <h3>Hardware Details</h3>
          <button 
    className="import-btn"
    onClick={() => setShowImport(true)}
  >
    ⬆ Import Excel
  </button>
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
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>




          <h3>Location & Status</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>Unit *</label>
              <select
                name="associateUnit"
                value={formData.associateUnit}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {units.map(u => (
                  <option key={u._id} value={u._id}>{u.name}</option>
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
                {locations.map(l => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">

            <div className="input-group">
              <label>Status *</label>
              <select
                name="assetStatus"
                value={formData.assetStatus}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {statuses.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          <div className="input-group">
            <label>Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="one_time">One-Time</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
                                  <div className="input-group">
            <label>Vendor</label>
            <input
              name="purchaseFrom"
              value={formData.purchaseFrom}
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

          <h3>Lifecycle</h3>

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
              <label>Next Maintenance</label>
              <input
                type="date"
                name="DOE"
                value={formData.DOE}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="submit-btn" disabled={isSubmitting} onClick={handleAddAsset}>
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
        <button onClick={() => setShowImport(false)}>
          Cancel
        </button>

        <button 
          onClick={handleImport}
          disabled={importLoading}
        >
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
