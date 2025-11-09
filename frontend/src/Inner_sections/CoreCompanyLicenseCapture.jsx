import React, { useState } from "react";
import { FiUploadCloud, FiCamera } from "react-icons/fi";
import Swal from "sweetalert2";
import "../Page_styles/CoreLicenseCapture.css";

const CoreCompanyLicenseCapture = () => {
  const [location, setLocation] = useState("");
  const [registrationType, setRegistrationType] = useState("");
  const [fileName, setFileName] = useState("No file chosen");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    registrationNumber: "",
    registrationDate: "",
    validityDate: "",
    businessActivity: "",
    address: "",
    classification: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      // Simulate scanning + OCR extraction
      setTimeout(() => {
        setFormData({
          businessName: "Vaultifly Technologies Pvt. Ltd.",
          registrationNumber: "GSTIN-29ABCDE1234F1Z5",
          registrationDate: "2023-05-18",
          validityDate: "2026-05-18",
          businessActivity: "Software Development and IT Services",
          address: "Bengaluru, Karnataka, India",
          classification: "Private Limited Company",
        });
        setShowForm(true);
        Swal.fire("Document Scanned", "Form data extracted successfully!", "success");
      }, 1200);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Confirm Save?",
      text: "Do you want to save this license information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Save it",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Saved!", "License information has been stored.", "success");
        setShowForm(false);
        setFileName("No file chosen");
        setFormData({});
      }
    });
  };

  return (
    <div className="license-capture-container">
      <h2 className="license-title">Core Company License Capture</h2>

      {/* Business Selection */}
      <div className="business-selection">
        <div className="form-group">
          <label>Business Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} required>
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

      {/* Auto-filled Form */}
      {showForm && (
        <form className="extracted-form" onSubmit={handleSave}>
          <h3>Extracted License Details</h3>

          <div className="form-grid">
            <div className="form-field">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Registration Date</label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Validity Date</label>
              <input
                type="date"
                name="validityDate"
                value={formData.validityDate || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>Business Activity</label>
              <input
                type="text"
                name="businessActivity"
                value={formData.businessActivity || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>Classification</label>
              <input
                type="text"
                name="classification"
                value={formData.classification || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-save">Save License Info</button>
        </form>
      )}
    </div>
  );
};

export default CoreCompanyLicenseCapture;
