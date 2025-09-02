import React, { useState } from "react";
import { createCoreLicense } from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/CaptureForm.css"; // reuse styles

const CoreCompanyLicenseCapture = () => {
  const [formData, setFormData] = useState({
    documentType: "",
    licenseNumber: "",
    issuingAuthority: "",
    licenseHolder: "",
    businessActivity: "",
    issueDate: "",
    expiryDate: "",
    renewalCycle: "",
    reminderStatus: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCoreLicense(formData);
      Swal.fire("Success", "Core Company License captured successfully!", "success");
      setFormData({});
    } catch (error) {
      Swal.fire("Error", "Failed to capture license", "error");
    }
  };

  return (
    <div className="capture-container">
      <h2>Core Company License Capture</h2>
      <form className="capture-form" onSubmit={handleSubmit}>
        <input type="text" name="documentType" placeholder="Document Type" onChange={handleChange} required />
        <input type="text" name="licenseNumber" placeholder="License Number" onChange={handleChange} required />
        <input type="text" name="issuingAuthority" placeholder="Issuing Authority" onChange={handleChange} />
        <input type="text" name="licenseHolder" placeholder="License Holder / Company Name" onChange={handleChange} />
        <input type="text" name="businessActivity" placeholder="Business Activity" onChange={handleChange} />
        <input type="date" name="issueDate" placeholder="Issue Date" onChange={handleChange} />
        <input type="date" name="expiryDate" placeholder="Expiry Date" onChange={handleChange} />
        <input type="text" name="renewalCycle" placeholder="Renewal Cycle" onChange={handleChange} />
        <input type="text" name="reminderStatus" placeholder="Reminder Status" onChange={handleChange} />

        <button type="submit" className="btn-primary">Save Company License</button>
      </form>
    </div>
  );
};

export default CoreCompanyLicenseCapture;
