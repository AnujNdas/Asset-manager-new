import React, { useState } from "react";
import axios from "axios";
import "../Page_styles/CoreLicenseCapture.css";

const CoreCompanyLicenseCapture = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // FORM STATE
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

  // Dropdown Options
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

  // Mobile Camera
  const handleCameraCapture = (e) => {
    setFile(e.target.files[0]);
  };

  // Extract OCR
  const handleExtract = async () => {
    if (!file) {
      alert("Please upload or scan a document first!");
      return;
    }

    if (!formData.businessType || !formData.licenseType || !formData.businessLocation) {
      alert("Please fill the three dropdowns before OCR!");
      return;
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

      const extracted = res.data?.extractedData || {};

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
      alert("OCR failed. Try again.");
    }

    setLoading(false);
  };

  // Save to DB
  const handleSave = async () => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in");
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
      const res = await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses",
        payload
      );

      console.log("SAVE RESPONSE:", res.data);
      alert("License saved successfully!");

      setShowForm(false);
      setFormData({
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
      setFile(null);

    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err);
      alert("Saving failed. Check console.");
    }
  };

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="license-wrapper">
      <h2 className="title">Company License Capture</h2>

      {/* BUSINESS TYPE */}
      <div className="input-group">
        <label>Business Type</label>
        <select name="businessType" value={formData.businessType} onChange={handleInput}>
          <option value="">Select Business Type</option>
          {BUSINESS_TYPES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* LICENSE TYPE */}
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

      {/* BUSINESS LOCATION */}
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

      {/* FILE UPLOAD + SCAN */}
      {formData.businessLocation && (
        <div className="capture-section slide-in">

          <div className="upload-box">
            <label>Upload Document</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
          </div>

          <div className="upload-box">
            <label>Scan Using Camera</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
            />
          </div>

          <button className="btn" onClick={handleExtract}>
            {loading ? "Extracting..." : "Start OCR"}
          </button>
        </div>
      )}

      {/* EXTRACTED FORM */}
      {showForm && (
        <div className="form-section slide-in">
          <h3>Extracted License Details</h3>

          {/* AUTO PREFILLED FIELDS */}
          {[
            "licenseNumber",
            "licenseName",
            "businessName",
            "issuingAuthority",
          ].map((field) => (
            <div className="input-group" key={field}>
              <label>{field.replace(/([A-Z])/g, " $1")}</label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleInput}
              />
            </div>
          ))}

          <div className="input-group">
            <label>Issue Date</label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInput}
            />
          </div>

          <div className="input-group">
            <label>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInput}
            />
          </div>

          <div className="input-group">
            <label>Address</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleInput}
            />
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
