import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import Swal from "sweetalert2";
import axios from "axios";
import "../Page_styles/CoreLicenseCapture.css";

const REGISTRATION_TYPES = [
  "Sole Proprietorship",
  "Partnership (General / Limited)",
  "Private Limited Company (Pvt Ltd)",
  "Public Limited Company",
  "LLC (Limited Liability Company)",
  "Non-Profit Organization",
];

const LICENSE_TYPES = [
  "GST",
  "FSSAI",
  "Pollution",
  "Trade License",
  "Import Export (IEC)",
  "Fire NOC",
  "Factory License",
  "Shop & Establishment Act License",
  "Labour License",
  "ISO Certificate",
];

const LOCATIONS = ["Head Office", "Branch Office", "Factory", "Warehouse"];

const CoreCompanyLicenseCapture = () => {
  const [registrationType, setRegistrationType] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");

  const [fileName, setFileName] = useState("No file chosen");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    licenseNumber: "",
    issuingAuthority: "",
    businessActivity: "",
    address: "",
    issueDate: "",
    expiryDate: "",
    classification: "",
  });

  // 🟦 1) FILE UPLOAD + OCR EXTRACT
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!registrationType || !licenseType || !businessLocation) {
      Swal.fire("Missing Info", "Please select all dropdowns.", "warning");
      return;
    }

    setFileName(file.name);

    const form = new FormData();
    form.append("file", file);
    form.append("registrationType", registrationType);
    form.append("licenseType", licenseType);

    try {
      Swal.showLoading();

      const res = await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses/extract",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.close();

      if (res.data.success) {
        const extracted = res.data.extractedData || {};

        // Update OCR fields safely
        setFormData({
          businessName: extracted.businessName || "",
          licenseNumber: extracted.licenseNumber || "",
          issuingAuthority: extracted.issuingAuthority || "",
          businessActivity: extracted.businessActivity || "",
          address: extracted.address || "",
          issueDate: extracted.issueDate || "",
          expiryDate: extracted.expiryDate || "",
          classification: extracted.classification || "",
        });

        setShowForm(true);

        Swal.fire("Success", "OCR extraction completed.", "success");
      } else {
        Swal.fire("OCR Failed", "Could not extract data.", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // 🟩 2) MANUAL INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟧 3) SAVE LICENSE TO DB
  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      registrationType,
      licenseType,
      businessLocation,
      ...formData,
    };

    try {
      const res = await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses",
        payload
      );

      if (res.data.success) {
        Swal.fire("Saved!", "License saved successfully.", "success");

        setShowForm(false);
        setFileName("No file chosen");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="license-capture-container">
      <h2 className="license-title">Core Company License Capture</h2>

      {/* 🟦 REGISTRATION + LICENSE DROPDOWN SECTION */}
      <div className="business-selection">
        <div className="form-group">
          <label>Business Registration Type</label>
          <select
            value={registrationType}
            onChange={(e) => {
              setRegistrationType(e.target.value);
              setLicenseType("");
            }}
          >
            <option value="">Select Registration Type</option>
            {REGISTRATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {registrationType && (
          <div className="form-group">
            <label>License Type</label>
            <select
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
            >
              <option value="">Select License Type</option>
              {LICENSE_TYPES.map((lt) => (
                <option key={lt} value={lt}>
                  {lt}
                </option>
              ))}
            </select>
          </div>
        )}

        {licenseType && (
          <div className="form-group">
            <label>Business Location</label>
            <select
              value={businessLocation}
              onChange={(e) => setBusinessLocation(e.target.value)}
            >
              <option value="">Select Business Location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 🟩 UPLOAD SECTION */}
      <div className="document-section">
        <div className="upload-card">
          <FiUploadCloud className="icon" />
          <p>Upload Document</p>

          <label className="upload-btn">
            Choose File
            <input type="file" onChange={handleFileChange} />
          </label>

          <span className="file-name">{fileName}</span>
        </div>
      </div>

      {/* 🟧 AUTO-FILLED OCR FORM */}
      {showForm && (
        <form className="extracted-form" onSubmit={handleSave}>
          <h3>Extracted License Details</h3>

          <div className="form-grid">
            <div className="form-field">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Issuing Authority</label>
              <input
                type="text"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>Business Activity</label>
              <input
                type="text"
                name="businessActivity"
                value={formData.businessActivity}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>Classification</label>
              <input
                type="text"
                name="classification"
                value={formData.classification}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-save">
            Save License Info
          </button>
        </form>
      )}
    </div>
  );
};

export default CoreCompanyLicenseCapture;
