import React, { useState , useEffect} from "react";
import { createCoreLicense } from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/CaptureForm.css";
import { getStatuses } from '../Services/ApiServices';

const CoreCompanyLicenseCapture = () => {
  const defaultFormData = {
    documentType: "",
    licenseNumber: "",
    issuingAuthority: "",
    licenseHolder: "",
    businessActivity: "",
    issueDate: "",
    expiryDate: "",
    renewalCycle: "Annual",
    reminderDaysBefore: 30,
    status: "",
  };
  
  const [statuses, setStatuses] = useState([]);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
        (async () => {
          try {
            const [s] = await Promise.all([
              getStatuses(),
            ]);
            setStatuses(s || []);
          } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to load classifications', 'error');
          }
        })();
      }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCoreLicense(formData);
      Swal.fire("✅ Success", "Core Company License captured successfully!", "success");
      setFormData(defaultFormData); // reset properly
    } catch (error) {
      console.error("Error creating core license:", error);
      Swal.fire("❌ Error", "Failed to capture license", "error");
    }
  };

  return (
    <div className="capture-container">
      <h2 className="capture-title">Core Company License Capture</h2>
      <form className="capture-form" onSubmit={handleSubmit}>
        <input type="text" name="documentType" placeholder="Document Type" value={formData.documentType} onChange={handleChange} required />
        <input type="text" name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} required />
        <input type="text" name="issuingAuthority" placeholder="Issuing Authority" value={formData.issuingAuthority} onChange={handleChange} required />
        <input type="text" name="licenseHolder" placeholder="License Holder / Company Name" value={formData.licenseHolder} onChange={handleChange} required />
        <input type="text" name="businessActivity" placeholder="Business Activity" value={formData.businessActivity} onChange={handleChange} required />

        <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required />

        <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />

        <select name="renewalCycle" value={formData.renewalCycle} onChange={handleChange}>
          <option value="Annual">Annual</option>
          <option value="Biennial">Biennial</option>
          <option value="Custom">Custom</option>
        </select>
        <input type="number" name="reminderDaysBefore" value={formData.reminderDaysBefore} onChange={handleChange} />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
        </select>

        <button type="submit" className="btn-primary">Save Company License</button>
      </form>
    </div>
  );
};

export default CoreCompanyLicenseCapture;
