import React, { useState } from "react";
import axios from "axios";

const CoreCompanyLicenseCapture = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState({
    licenseNumber: "",
    licenseName: "",
    businessName: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    address: "",
    additionalFields: {}
  });

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ---------------------------------------------------------
  // 1️⃣ STEP: OCR Extract
  // ---------------------------------------------------------
  const handleExtract = async () => {
    if (!file) return alert("Please upload a document first!");

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("licenseType", formData.licenseType);
      form.append("businessLocation", formData.businessLocation);

      console.log("📤 SENDING TO OCR ROUTE:", {
        licenseType: formData.licenseType,
        businessLocation: formData.businessLocation,
      });

      const res = await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses/extract",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("📥 OCR RESPONSE:", res.data);

      const extracted = res.data.extractedData || {};

      // safe fallback fields
      const safe = {
        licenseNumber: extracted.licenseNumber || "",
        licenseName: extracted.licenseName || "",
        businessName: extracted.businessName || "",
        issueDate: extracted.issueDate || "",
        expiryDate: extracted.expiryDate || "",
        issuingAuthority: extracted.issuingAuthority || "",
        address: extracted.address || "",
        additionalFields: extracted.additionalFields || {},
      };

      setExtractedData(safe);
      setFormData({ ...formData, ...safe });
    } catch (err) {
      console.error("❌ OCR Extract Error:", err.response?.data || err);
      alert("OCR extraction failed. Check console.");
    }

    setLoading(false);
  };

  // ---------------------------------------------------------
  // 2️⃣ STEP: Save Final License
  // ---------------------------------------------------------
  const handleSave = async () => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User ID missing! Something is wrong with login.");
      return;
    }

    const payload = {
      ...formData,
      userId, // ⭐ REQUIRED
    };

    console.log("📤 PAYLOAD TO SAVE:", payload);

    try {
      const res = await axios.post(
        "https://asset-manager-new.onrender.com/api/company-licenses/",
        payload
      );

      console.log("📥 SAVE RESPONSE:", res.data);
      alert("License Saved Successfully!");
    } catch (err) {
      console.error("❌ Save Error:", err.response?.data || err);
      alert("Failed to save license. Check console.");
    }
  };

  // ---------------------------------------------------------

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="capture-container">
      <h2>Company License OCR Scanner</h2>

      {/* Upload */}
      <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />

      {/* Basic Fields Needed Before Extraction */}
      <input
        name="licenseType"
        placeholder="License Type"
        value={formData.licenseType}
        onChange={handleInputChange}
      />

      <input
        name="businessLocation"
        placeholder="Business Location"
        value={formData.businessLocation}
        onChange={handleInputChange}
      />

      <button onClick={handleExtract} disabled={loading}>
        {loading ? "Extracting..." : "Extract License Data"}
      </button>

      <hr />

      {/* Extracted Form */}
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
    </div>
  );
};

export default CoreCompanyLicenseCapture;
