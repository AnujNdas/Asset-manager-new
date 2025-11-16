import React, { useState } from "react";
import axios from "axios";
import "./CoreLicenseCapture.css"; // 👈 CSS FILE

const CoreCompanyLicenseCapture = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "",
    licenseType: "",
    businessLocation: "",
    licenseNumber: "",
    licenseName: "",
    businessName: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    address: "",
  });

  // Dropdown options
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

  // File Upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Mobile Scan (camera capture)
  const handleCameraCapture = (e) => {
    setFile(e.target.files[0]);
  };

  // OCR Extraction Flow
  const handleExtract = async () => {
    if (!file) return alert("Please upload or scan a document!");

    if (!formData.businessType || !formData.licenseType || !formData.businessLocation) {
      return alert("Please select all dropdowns before scanning!");
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("businessType", formData.businessType);
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
      console.error("OCR ERROR:", err.response?.data || err);
      alert("OCR failed!");
    }

    setLoading(false);
  };

  // Save to DB
  const handleSave = async () => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const payload = {
      userId,
      businessType: formData.businessType,
      licenseType: formData.licenseType,
      businessLocation: formData.businessLocation,
      extractedData: {
        licenseNumber: formData.licenseNumber,
        licenseName: formData.licenseName,
        businessName: formData.businessName,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        issuingAuthority: formData.issuingAuthority,
        address: formData.address,
      },
      status: "Pending Verification",
    };

    try {
      await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses/",
        payload
      );
      alert("License saved successfully!");
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err);
      alert("Saving failed!");
    }
  };

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="license-wrapper">
      <h2 className="title">Company License Capture</h2>

      {/* Step 1: Business Type */}
      <div className="input-group">
        <label>Business Type</label>
        <select name="businessType" value={formData.businessType} onChange={handleInput}>
          <option value="">Select Business Type</option>
          {BUSINESS_TYPES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Step 2: License Type */}
      {formData.businessType && (
        <div className="input-group slide-in">
          <label>License Type</label>
          <select name="licenseType" value={formData.licenseType} onChange={handleInput}>
            <option value="">Select License</option>
            {LICENSE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Business Location */}
      {formData.licenseType && (
        <div className="input-group slide-in">
          <label>Business Location</label>
          <select
            name="businessLocation"
            value={formData.businessLocation}
            onChange={handleInput}
          >
            <option value="">Select Location</option>
            {BUSINESS_LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      )}

      {/* Step 4: Scan & Upload Options */}
      {formData.businessLocation && (
        <div className="capture-section slide-in">

          {/* Upload */}
          <div className="upload-box">
            <label>Upload Document</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
          </div>

          {/* Mobile Scan */}
          <div className="upload-box">
            <label>Scan Using Camera</label>
            <input type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} />
          </div>

          <button className="btn" onClick={handleExtract}>
            {loading ? "Extracting..." : "Start OCR"}
          </button>
        </div>
      )}

      {/* Step 5: OCR Form */}
      {showForm && (
        <div className="form-section slide-in">
          <h3>Extracted License Details</h3>

          {[
            "licenseNumber",
            "licenseName",
            "businessName",
            "issuingAuthority",
          ].map((field) => (
            <div className="input-group" key={field}>
              <label>{field.replace(/([A-Z])/g, " $1")}</label>
              <input name={field} value={formData[field]} onChange={handleInput} />
            </div>
          ))}

          <div className="input-group">
            <label>Issue Date</label>
            <input type="date" name="issueDate" value={formData.issueDate} onChange={handleInput} />
          </div>

          <div className="input-group">
            <label>Expiry Date</label>
            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInput} />
          </div>

          <div className="input-group">
            <label>Address</label>
            <textarea name="address" rows={2} value={formData.address} onChange={handleInput} />
          </div>

          <button className="btn save-btn" onClick={handleSave}>
            Save License
          </button>
        </div>
      )}
    </div>
  );
};

export default CoreCompanyLicenseCapture;
