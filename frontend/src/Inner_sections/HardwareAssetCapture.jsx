import React, { useState } from "react";
import "../Page_styles/HardwareCapture.css";
import { FiUploadCloud, FiCamera, FiSave } from "react-icons/fi";

const AssetCapture = () => {
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    assetName: "",
    assetCategory: "",
    specification: "",
    location: "",
    unit: "",
    status: "",
    dop: "",
    doe: "",
    purchaseFrom: "",
    assetLifetime: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      setFormData({ ...formData, image: file });

      const r = new FileReader();
      r.onloadend = () => setImagePreview(r.result);
      r.readAsDataURL(file);

      return;
    }

    let updated = { ...formData, [name]: value };

    if (name === "dop" || name === "doe") {
      if (updated.dop && updated.doe) {
        const start = new Date(updated.dop);
        const end = new Date(updated.doe);
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        updated.assetLifetime = days >= 0 ? `${days} days` : "";
      }
    }

    setFormData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Form Submitted (replace with API call)");
  };

  return (
    <div className="asset-wrapper">
      <div className="asset-header">
        <h2>New Hardware Asset</h2>
        <p>Add a new hardware asset to the inventory system.</p>
      </div>

      <form className="asset-form" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="section">
          <h3 className="section-title">Basic Details</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>Asset Name</label>
              <input
                type="text"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                placeholder="Enter asset name"
                required
              />
            </div>

            <div className="input-group">
              <label>Category</label>
              <select
                name="assetCategory"
                value={formData.assetCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Monitor">Monitor</option>
                <option value="Printer">Printer</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Specification</label>
            <input
              type="text"
              name="specification"
              value={formData.specification}
              onChange={handleChange}
              placeholder="Example: i5 / 8GB / 256GB SSD"
            />
          </div>
        </div>

        {/* Location & Unit */}
        <div className="section">
          <h3 className="section-title">Location & Management</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              >
                <option value="">Select Location</option>
                <option value="Head Office">Head Office</option>
                <option value="Branch">Branch</option>
              </select>
            </div>

            <div className="input-group">
              <label>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Select Unit</option>
                <option value="IT">IT</option>
                <option value="Accounts">Accounts</option>
                <option value="HR">HR</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="Working">Working</option>
              <option value="In Repair">In Repair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="section">
          <h3 className="section-title">Date & Lifetime</h3>

          <div className="grid-3">
            <div className="input-group">
              <label>Date of Purchase</label>
              <input
                type="date"
                name="dop"
                value={formData.dop}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Date of Expiry</label>
              <input
                type="date"
                name="doe"
                value={formData.doe}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Lifetime</label>
              <input
                type="text"
                value={formData.assetLifetime}
                placeholder="Auto Calculated"
                disabled
              />
            </div>
          </div>

          <div className="input-group">
            <label>Purchased From</label>
            <input
              type="text"
              name="purchaseFrom"
              value={formData.purchaseFrom}
              onChange={handleChange}
              placeholder="Vendor / Shop Name"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="section">
          <h3 className="section-title">Upload Asset Image</h3>

          <div className="upload-box">
            <label className="upload-btn">
              <FiCamera />
              Open Camera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
              />
            </label>

            <label className="upload-btn">
              <FiUploadCloud />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
            </label>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button className="submit-btn">
          <FiSave /> Save Hardware Asset
        </button>
      </form>
    </div>
  );
};

export default AssetCapture;
