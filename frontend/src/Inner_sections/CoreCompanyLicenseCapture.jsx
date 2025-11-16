import React, { useState } from "react";
import axios from "axios";

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
    businessType: "",     // 👈 Added missing field!
  });

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

  // ───────────────────────────────────────────────
  // File upload handler
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ───────────────────────────────────────────────
  // OCR Extraction
  const handleExtract = async () => {
    if (!file) return alert("Please upload a document first!");

    if (!formData.licenseType || !formData.businessLocation) {
      return alert("Please select License Type & Business Location first!");
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

      console.log("📥 OCR RESULT:", res.data);

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

  // ───────────────────────────────────────────────
  // Save license
  const handleSave = async () => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const payload = { ...formData, userId };

    try {
      await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses/",
        payload
      );

      alert("License saved successfully!");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Failed to save license.");
    }
  };

  // ───────────────────────────────────────────────
  // Input handler
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="ocr-wrapper">
      <h2 className="title">Company License OCR Scanner</h2>

      {/* File Upload */}
      <div className="input-group">
        <label>Upload License Document</label>
        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
      </div>

      {/* License Type */}
      <div className="input-group">
        <label>License Type</label>
        <select
          name="licenseType"
          value={formData.licenseType}
          onChange={handleInputChange}
        >
          <option value="">Select License Type</option>
          {LICENSE_TYPES.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Business Location */}
      <div className="input-group">
        <label>Business Location</label>
        <select
          name="businessLocation"
          value={formData.businessLocation}
          onChange={handleInputChange}
        >
          <option value="">Select Business Location</option>
          {BUSINESS_LOCATIONS.map((b, i) => (
            <option key={i} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Business Type */}
      <div className="input-group">
        <label>Business Type</label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
        >
          <option value="">Select Business Type</option>
          {BUSINESS_TYPES.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <button className="btn" onClick={handleExtract} disabled={loading}>
        {loading ? "Extracting..." : "Extract License Data"}
      </button>

      <hr />

      {/* ─────────────────────────────────────────────── */}
      {/* SHOW FORM AFTER OCR */}
      {showForm && (
        <div className="form-section">
          <h3>Extracted / Editable Data</h3>

          {/* NOT showing dropdowns inside dynamic loop */}

          <div className="input-group">
            <label>License Number</label>
            <input
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>License Name</label>
            <input
              name="licenseName"
              value={formData.licenseName}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Business Name</label>
            <input
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Issue Date</label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Issuing Authority</label>
            <input
              name="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label>Address</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleInputChange}
            ></textarea>
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
