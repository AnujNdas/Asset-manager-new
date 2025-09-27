import React, { useState , useEffect } from "react";
import { createSoftwareAsset } from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/CaptureForm.css";
import { getStatuses , getCategories } from '../Services/ApiServices';


const SoftwareAssetCapture = () => {
  
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    version: "",
    publisher: "",
    category: "",
    licenseKey: "",
    licenseType: "",
    licenseModel: "",
    licenseUse: "",          // NEW
    installLocation: "",     // NEW
    totalLicenses: "",
    licensesAssigned: "",
    licenseExpiry: "",
    purchaseDate: "",
    purchaseOrder: "",
    cost: "",
    assignedTo: "",
    complianceStatus: "",
  });
    useEffect(() => {
      (async () => {
        try {
          const [s , c] = await Promise.all([
            getStatuses(),
            getCategories(),
          ]);
          setStatuses(s || []);
          setCategories(c || []);
        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'Failed to load classifications', 'error');
        }
      })();
    }, []);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      totalLicenses: Number(formData.totalLicenses),
      licensesAssigned: Number(formData.licensesAssigned),
      licensesAvailable: Number(formData.totalLicenses) - Number(formData.licensesAssigned || 0),
      assignedTo: formData.assignedTo ? [formData.assignedTo] : [],
      auditHistory: [{ date: new Date().toISOString(), details: "Initial entry" }],
      linkedDevices: [],
    };

    try {
      await createSoftwareAsset(payload);
      Swal.fire("Success", "Software asset captured successfully!", "success");

      setFormData({
        name: "",
        version: "",
        publisher: "",
        category: "",
        licenseKey: "",
        licenseType: "",
        licenseModel: "",
        licenseUse: "",
        installLocation: "",
        totalLicenses: "",
        licensesAssigned: "",
        licenseExpiry: "",
        purchaseDate: "",
        purchaseOrder: "",
        cost: "",
        assignedTo: "",
        complianceStatus: "",
      });
    } catch (error) {
      console.error("Error creating software asset:", error);
      Swal.fire("Error", "Failed to capture software asset", "error");
    }
  };

  return (
    <div className="capture-container">
      <h2 className="capture-title">Software Asset Capture</h2>
      <form className="capture-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Software Name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="version" placeholder="Version" value={formData.version} onChange={handleChange} />
        <input type="text" name="publisher" placeholder="Publisher" value={formData.publisher} onChange={handleChange} />
<select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
                  <input type="text" name="licenseKey" placeholder="License Key" value={formData.licenseKey} onChange={handleChange} />
        <input type="text" name="licenseType" placeholder="License Type" value={formData.licenseType} onChange={handleChange} />
        <input type="text" name="licenseModel" placeholder="License Model" value={formData.licenseModel} onChange={handleChange} />

        {/* New Fields */}
        <input type="text" name="licenseUse" placeholder="License Use (e.g., Internal, External, Test)" value={formData.licenseUse} onChange={handleChange} />
        <input type="text" name="installLocation" placeholder="Install Location (e.g., Server A, Device XYZ)" value={formData.installLocation} onChange={handleChange} />

        <input type="number" name="totalLicenses" placeholder="Total Licenses" value={formData.totalLicenses} onChange={handleChange} />
        <input type="number" name="licensesAssigned" placeholder="Licenses Assigned" value={formData.licensesAssigned} onChange={handleChange} />
        <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} />
        <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
        <input type="text" name="purchaseOrder" placeholder="Purchase Order" value={formData.purchaseOrder} onChange={handleChange} />
        <input type="number" name="cost" placeholder="License Cost" value={formData.cost} onChange={handleChange} />
        <input type="text" name="assignedTo" placeholder="Assigned To (single)" value={formData.assignedTo} onChange={handleChange} />

        <select name="complianceStatus" value={formData.complianceStatus} onChange={handleChange}>
          <option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
        </select>

        <button type="submit" className="btn-primary">Save Software Asset</button>
      </form>
    </div>
  );
};

export default SoftwareAssetCapture;
