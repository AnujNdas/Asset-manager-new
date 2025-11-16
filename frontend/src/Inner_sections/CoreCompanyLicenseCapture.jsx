import React, { useState } from "react";
import axios from "axios";
import "../page_styles/CoreLicenseCapture.css";

const CoreCompanyLicenseCapture = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    licenseNumber: "",
    licenseName: "",
    businessName: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    address: "",
    businessLocation: "",
    licenseType: "",
    businessType: "",
  });

  const BUSINESS_TYPES = [
    "Private Limited Company",
    "Public Limited Company",
    "Partnership",
    "Proprietorship",
    "LLP (Limited Liability Partnership)",
    "NGO / Trust",
    "One Person Company (OPC)",
    "Co-operative Society",
  ];

  const LICENSE_TYPES = [
    "GST Registration",
    "Trade License",
    "FSSAI License",
    "Factory License",
    "Shop & Establishment",
    "Professional Tax",
    "Fire Safety Certificate",
  ];

  const BUSINESS_LOCATIONS = [
    "Ranchi",
    "Jamshedpur",
    "Bokaro",
    "Dhanbad",
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Other",
  ];

  // ----------------------------
  // File Upload
  // ----------------------------
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ----------------------------
  // OCR EXTRACT
  // ----------------------------
  const handleExtract = async () => {
    if (!file) return alert("Please upload or scan a document!");

    if (!formData.businessType || !formData.licenseType || !formData.businessLocation) {
      return alert("Please select all dropdowns first.");
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("licenseType", formData.licenseType);
      form.append("businessLocation", formData.businessLocation);

      const res = await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses/extract",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const extracted = res.data.extractedData || {};

      setFormData((prev) => ({
        ...prev,
        licenseNumber: extracted.licenseNumber || "",
        licenseName: extracted.licenseName || prev.licenseType,
        businessName: extracted.businessName || "",
        issueDate: extracted.issueDate || "",
        expiryDate: extracted.expiryDate || "",
        issuingAuthority: extracted.issuingAuthority || "",
        address: extracted.address || "",
      }));

      setShowForm(true);
    } catch (err) {
      console.error("❌ OCR ERROR:", err);
      alert("OCR failed. Check console.");
    }

    setLoading(false);
  };

  // ----------------------------
  // SAVE LICENSE
  // ----------------------------
  const handleSave = async () => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) return alert("No user logged in!");

    try {
      await axios.post("https://asset-manager-new.onrender.com/api/company-licenses/", {
        ...formData,
        userId,
      });

      alert("License saved successfully!");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Saving failed!");
    }
  };

  return (
    <div className="ocr-container">

      <h2 className="title">Company License OCR Scanner</h2>

      {/* BUSINESS TYPE → FIRST LEVEL */}
      <div className="input-group">
        <label>Business Type</label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={(e) =>
            setFormData({ ...formData, businessType: e.target.value })
          }
        >
          <option value="">Select Business Type</option>
          {BUSINESS_TYPES.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* LICENSE TYPE → visible only after business type */}
      {formData.businessType && (
        <div className="input-group animate-fade">
          <label>License Type</label>
          <select
            name="licenseType"
            value={formData.licenseType}
            onChange={(e) =>
              setFormData({ ...formData, licenseType: e.target.value })
            }
          >
            <option value="">Select License Type</option>
            {LICENSE_TYPES.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* BUSINESS LOCATION → visible only after license type */}
      {formData.licenseType && (
        <div className="input-group animate-fade">
          <label>Business Location</label>
          <select
            name="businessLocation"
            value={formData.businessLocation}
            onChange={(e) =>
              setFormData({ ...formData, businessLocation: e.target.value })
            }
          >
            <option value="">Select Business Location</option>
            {BUSINESS_LOCATIONS.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* FILE UPLOAD + MOBILE SCAN */}
      {formData.businessLocation && (
        <div className="upload-section animate-fade">

          {/* SCAN (Mobile Only) */}
          <label className="scan-btn">
            Scan (Mobile)
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden-input"
              onChange={handleFileChange}
            />
          </label>

          {/* UPLOAD */}
          <label className="upload-btn">
            Upload File
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden-input"
              onChange={handleFileChange}
            />
          </label>

          {file && <p className="file-name">📄 {file.name}</p>}

          <button className="btn extract" onClick={handleExtract}>
            {loading ? "Extracting..." : "Run OCR"}
          </button>
        </div>
      )}

      {/* SHOW EXTRACTED FORM */}
      {showForm && (
        <div className="form-section animate-fade">
          <h3>Extracted Details</h3>

          <div className="input-group">
            <label>License Number</label>
            <input
              value={formData.licenseNumber}
              onChange={(e) =>
                setFormData({ ...formData, licenseNumber: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>License Name</label>
            <input
              value={formData.licenseName}
              onChange={(e) =>
                setFormData({ ...formData, licenseName: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Business Name</label>
            <input
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Issue Date</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) =>
                setFormData({ ...formData, issueDate: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Expiry Date</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Issuing Authority</label>
            <input
              value={formData.issuingAuthority}
              onChange={(e) =>
                setFormData({ ...formData, issuingAuthority: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <button className="btn save" onClick={handleSave}>
            Save License
          </button>
        </div>
      )}
    </div>
  );
};

export default CoreCompanyLicenseCapture;
