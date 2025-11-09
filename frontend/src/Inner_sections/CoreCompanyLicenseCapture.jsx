import React, { useState } from "react";
import { FiUploadCloud, FiCamera } from "react-icons/fi";
import "../Page_styles/CoreLicenseCapture.css";

const CoreCompanyLicenseCapture = () => {
  const [location, setLocation] = useState("");
  const [registrationType, setRegistrationType] = useState("");
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="license-capture-container">
      <h2 className="license-title">Core Company License Capture</h2>

      {/* Business Selection */}
      <div className="business-selection">
        <div className="form-group">
          <label>Business Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            <option value="">Select Region</option>
            <option value="Asia">Asia</option>
            <option value="Africa">Africa</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Oceania">Oceania</option>
          </select>
        </div>

        <div className="form-group">
          <label>Business Registration Type</label>
          <select
            value={registrationType}
            onChange={(e) => setRegistrationType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Partnership">Partnership (General / Limited)</option>
            <option value="Private Limited">Private Limited Company (Pvt Ltd)</option>
            <option value="Public Limited">Public Limited Company</option>
            <option value="LLC">LLC (Limited Liability Company)</option>
            <option value="Non-Profit">Non-Profit Organization</option>
          </select>
        </div>
      </div>

      {/* Document Section */}
      <div className="document-section">
        <div className="scan-card">
          <FiCamera className="icon" />
          <p>Scan Document</p>
          <button className="btn-scan">Start Scan</button>
        </div>

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
    </div>
  );
};

export default CoreCompanyLicenseCapture;
