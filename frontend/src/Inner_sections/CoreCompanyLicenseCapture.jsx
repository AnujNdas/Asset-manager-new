import React, { useState } from "react";
import axios from "axios";

const CoreCompanyLicenseCapture = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // 👈 show editable form only after OCR

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
  });
  const businessTypes = [
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ------------------------------------------------------
  // 1️⃣ OCR Extraction
  // ------------------------------------------------------
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

      const safe = {
        licenseNumber: extracted.licenseNumber || "",
        licenseName: extracted.licenseName || "",
        businessName: extracted.businessName || "",
        issueDate: extracted.issueDate || "",
        expiryDate: extracted.expiryDate || "",
        issuingAuthority: extracted.issuingAuthority || "",
        address: extracted.address || "",
        businessLocation: formData.businessLocation,
        licenseType: formData.licenseType,
      };

      setFormData(safe);
      setShowForm(true); // 👈 now show form

    } catch (err) {
      console.error("❌ OCR ERROR:", err);
      alert("OCR failed. Check console.");
    }

    setLoading(false);
  };

  // ------------------------------------------------------
  // 2️⃣ Save License
  // ------------------------------------------------------
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ------------------------------------------------------

  return (
    <div className="capture-container">
      <h2>Company License OCR Scanner</h2>

      {/* File Upload */}
      <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />

      {/* License Type Dropdown */}
      <div>
          <label className="block mb-1 font-medium">Business Type</label>

          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-white"
          >
            <option value="">Select Business Type</option>

            {businessTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      <select
        name="licenseType"
        value={formData.licenseType}
        onChange={handleInputChange}
      >
        <option value="">Select License Type</option>
        {LICENSE_TYPES.map((t, i) => (
          <option key={i} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Business Location Dropdown */}
      <select
        name="businessLocation"
        value={formData.businessLocation}
        onChange={handleInputChange}
      >
        <option value="">Select Business Location</option>
        {BUSINESS_LOCATIONS.map((b, i) => (
          <option key={i} value={b}>
            {b}
          </option>
        ))}
      </select>

      <button onClick={handleExtract} disabled={loading}>
        {loading ? "Extracting..." : "Extract License Data"}
      </button>

      <hr />

      {/* 👇 SHOW ONLY AFTER OCR IS DONE */}
      {showForm && (
        <>
          <h3>Extracted / Editable Data</h3>

          {Object.keys(formData).map((key) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label>{key}</label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleInputChange}
              />
            </div>
          ))}

          <button onClick={handleSave}>Save License</button>
        </>
      )}
    </div>
  );
};

export default CoreCompanyLicenseCapture;
