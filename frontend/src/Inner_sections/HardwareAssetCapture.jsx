// src/Pages/AssetCapture.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUnits,
  getLocations,
  getCategories,
  getStatuses,
} from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/HardwareCapture.css";
import { FiSave } from "react-icons/fi";

const API_URL = "https://asset-manager-new.onrender.com/api";

const AssetCapture = () => {
  const navigate = useNavigate();

  const defaultFormData = {
    assetCode: "",
    assetCategory: "",
    assetName: "",
    associateUnit: "",
    locationName: "",
    assetSpecification: "",
    assetStatus: "",
    DOP: "",
    DOE: "",
    assetLifetime: "",
    purchaseFrom: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate asset code
  const generateAssetCode = async () => {
    const res = await fetch(`${API_URL}/assets/asset-code`);
    if (!res.ok) throw new Error("Failed to generate asset code");
    const data = await res.json();
    return data.assetCode;
  };

  // Save asset (NO IMAGE)
  const saveAssetToDatabase = async (data) => {
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_URL}/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to save asset");
    }

    return true;
  };

  // Load dropdown lists
  useEffect(() => {
    (async () => {
      try {
        const [u, l, c, s] = await Promise.all([
          getUnits(),
          getLocations(),
          getCategories(),
          getStatuses(),
        ]);
        setUnits(u || []);
        setLocations(l || []);
        setCategories(c || []);
        setStatuses(s || []);
      } catch (e) {
        console.error(e);
        Swal.fire("Error", "Failed to load classifications", "error");
      }
    })();
  }, []);

  // Change handler (NO IMAGE LOGIC)
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // auto-calc lifetime
      if (name === "DOP" || name === "DOE") {
        const { DOP, DOE } = updated;
        if (DOP && DOE) {
          const start = new Date(DOP);
          const end = new Date(DOE);
          const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
          updated.assetLifetime =
            Number.isFinite(days) && days >= 0 ? `${days} days` : "Invalid";
        } else {
          updated.assetLifetime = "";
        }
      }

      return updated;
    });
  };

  // Validation
  const validateRequired = () => {
    const required = [
      "assetName",
      "assetCategory",
      "associateUnit",
      "locationName",
      "assetStatus",
    ];
    const missing = required.filter((k) => !formData[k]);
    if (missing.length) {
      Swal.fire("Missing fields", "Please fill in all required fields.", "error");
      return false;
    }
    return true;
  };

  // Submit
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!validateRequired()) return;

    setIsSubmitting(true);

    try {
      const assetCode = await generateAssetCode();
      const payload = { ...formData, assetCode };

      await saveAssetToDatabase(payload);

      await Swal.fire("Success", "Asset added successfully!", "success");
      navigate("/inventory");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to add asset.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="asset-wrapper">
      <div className="asset-header">
        <h2>Hardware Capture</h2>
      </div>

      <form className="asset-form" onSubmit={handleAddAsset}>
        {/* Basic */}
        <div className="section">
          <h3 className="section-title">Basic Details</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>
                Asset Name <span style={{ color: "#e11d48" }}>*</span>
              </label>
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
              <label>
                Category <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                name="assetCategory"
                value={formData.assetCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Specification</label>
            <input
              type="text"
              name="assetSpecification"
              value={formData.assetSpecification}
              onChange={handleChange}
              placeholder="Example: i5 / 8GB / 256GB SSD"
            />
          </div>
        </div>

        {/* Location */}
        <div className="section">
          <h3 className="section-title">Location & Management</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>
                Location <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                required
              >
                <option value="">Select Location</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>
                Associate Unit <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                name="associateUnit"
                value={formData.associateUnit}
                onChange={handleChange}
                required
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>
              Status <span style={{ color: "#e11d48" }}>*</span>
            </label>
            <select
              name="assetStatus"
              value={formData.assetStatus}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
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
                name="DOP"
                value={formData.DOP}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Date of Expiry</label>
              <input
                type="date"
                name="DOE"
                value={formData.DOE}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Lifetime</label>
              <input
                type="text"
                name="assetLifetime"
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

        {/* Submit */}
        <button
          className="submit-btn"
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <FiSave />
          {isSubmitting ? " Saving..." : " Save Hardware Asset"}
        </button>
      </form>
    </div>
  );
};

export default AssetCapture;
