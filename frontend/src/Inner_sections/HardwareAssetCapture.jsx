// src/Pages/HardwareAssetCapture.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../Page_styles/CaptureForm.css";
import { getUnits, getLocations, getCategories, getStatuses } from "../Services/ApiServices";
import { FiCamera, FiUploadCloud, FiSave } from "react-icons/fi";

const API_URL = "https://asset-manager-new.onrender.com/api";

const defaultForm = {
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
  image: "",
};

export default function HardwareAssetCapture() {
  const navigate = useNavigate();

  // Tabs: 0=Basic,1=Purchase & Warranty,2=Location & Status,3=Upload & Submit
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState(defaultForm);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // load dropdowns
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
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load classifications.", "error");
      }
    })();
  }, []);

  // calculate lifetime whenever DOP/DOE change
  useEffect(() => {
    const { DOP, DOE } = formData;
    if (DOP && DOE) {
      const start = new Date(DOP);
      const end = new Date(DOE);
      const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({
        ...prev,
        assetLifetime: Number.isFinite(days) && days >= 0 ? `${days} days` : "Invalid",
      }));
    } else {
      setFormData((prev) => ({ ...prev, assetLifetime: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.DOP, formData.DOE]);

  const generateAssetCode = async () => {
    const res = await fetch(`${API_URL}/assets/asset-code`);
    if (!res.ok) throw new Error("Failed to generate asset code");
    const data = await res.json();
    return data.assetCode;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      setFormData((prev) => ({ ...prev, image: file || "" }));
      if (file) {
        const r = new FileReader();
        r.onloadend = () => setImagePreview(r.result);
        r.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateRequired = () => {
    const required = ["assetName", "assetCategory", "associateUnit", "locationName", "assetStatus"];
    const missing = required.filter((k) => !formData[k]);
    if (missing.length) {
      Swal.fire("Validation", "Please fill in all required fields.", "warning");
      // switch to first tab including missing field (Basic)
      setTab(0);
      return false;
    }
    return true;
  };

  const saveAssetToBackend = async (payloadObj) => {
    const token = sessionStorage.getItem("token");
    const fd = new FormData();

    Object.entries(payloadObj).forEach(([k, v]) => {
      // append only non-empty values
      if (v !== undefined && v !== null && v !== "") {
        fd.append(k, v);
      }
    });

    const res = await fetch(`${API_URL}/assets`, {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to save asset");
    }

    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequired()) return;

    setIsSubmitting(true);
    try {
      // generate assetCode from server
      const assetCode = await generateAssetCode();

      const payload = {
        ...formData,
        assetCode,
      };

      await saveAssetToBackend(payload);

      await Swal.fire("Success", "Hardware asset added successfully!", "success");
      // reset and navigate
      setFormData(defaultForm);
      setImagePreview(null);
      navigate("/inventory");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to add asset.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabBtn = ({ idx, label }) => (
    <button
      type="button"
      className={`tab-btn ${tab === idx ? "active" : ""}`}
      onClick={() => setTab(idx)}
    >
      {label}
    </button>
  );

  return (
    <div className="capture-container capture-upgraded">
      <h2 className="capture-title">Hardware Asset Capture</h2>

      <div className="tabs-wrap">
        <TabBtn idx={0} label="Basic Info" />
        <TabBtn idx={1} label="Purchase & Warranty" />
        <TabBtn idx={2} label="Location & Status" />
        <TabBtn idx={3} label="Upload & Submit" />
      </div>

      <form className="capture-form upgrade-form" onSubmit={handleSubmit} encType="multipart/form-data">
        {/* TAB 0 - Basic */}
        {tab === 0 && (
          <div className="tab-panel">
            <div className="row">
              <div className="col">
                <label>Asset Name *</label>
                <input name="assetName" value={formData.assetName} onChange={handleChange} placeholder="e.g. Dell OptiPlex 7090" />
              </div>

              <div className="col">
                <label>Category *</label>
                <select name="assetCategory" value={formData.assetCategory} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>Specification</label>
                <input name="assetSpecification" value={formData.assetSpecification} onChange={handleChange} placeholder="CPU, RAM, Storage, SN..." />
              </div>

              <div className="col">
                <label>Asset Code (generated on save)</label>
                <input name="assetCode" value={formData.assetCode} onChange={handleChange} placeholder="(auto)" disabled />
              </div>
            </div>
          </div>
        )}

        {/* TAB 1 - Purchase & Warranty */}
        {tab === 1 && (
          <div className="tab-panel">
            <div className="row">
              <div className="col">
                <label>Date of Purchase</label>
                <input type="date" name="DOP" value={formData.DOP} onChange={handleChange} />
              </div>

              <div className="col">
                <label>Date of Expiry (warranty / EoL)</label>
                <input type="date" name="DOE" value={formData.DOE} onChange={handleChange} />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>Asset Lifetime</label>
                <input name="assetLifetime" value={formData.assetLifetime} disabled placeholder="Auto-calculated (days)" />
              </div>

              <div className="col">
                <label>Purchased From</label>
                <input name="purchaseFrom" value={formData.purchaseFrom} onChange={handleChange} placeholder="Vendor / Store" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 - Location & Status */}
        {tab === 2 && (
          <div className="tab-panel">
            <div className="row">
              <div className="col">
                <label>Location *</label>
                <select name="locationName" value={formData.locationName} onChange={handleChange}>
                  <option value="">Select Location</option>
                  {locations.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col">
                <label>Associate Unit *</label>
                <select name="associateUnit" value={formData.associateUnit} onChange={handleChange}>
                  <option value="">Select Unit</option>
                  {units.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>Status *</label>
                <select name="assetStatus" value={formData.assetStatus} onChange={handleChange}>
                  <option value="">Select Status</option>
                  {statuses.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col" />
            </div>
          </div>
        )}

        {/* TAB 3 - Upload & Submit */}
        {tab === 3 && (
          <div className="tab-panel">
            <div className="upload-area">
              <label className="file-btn">
                <FiCamera /> Open Camera
                <input type="file" accept="image/*" capture="environment" onChange={handleChange} />
              </label>

              <label className="file-btn">
                <FiUploadCloud /> Upload from Device
                <input type="file" accept="image/*" onChange={handleChange} />
              </label>

              <div className="preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <div className="preview-placeholder">No image selected</div>
                )}
              </div>
            </div>

            <div className="notes">
              <small>Tip: Use a clear photo of serial number and label. Image is optional but recommended.</small>
            </div>
          </div>
        )}

        <div className="form-actions">
          <div className="left-actions">
            <button type="button" className="btn-secondary" onClick={() => setTab((t) => Math.max(0, t - 1))}>
              Previous
            </button>
            <button type="button" className="btn-secondary" onClick={() => setTab((t) => Math.min(3, t + 1))}>
              Next
            </button>
          </div>

          <div className="right-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              <FiSave />
              {isSubmitting ? " Saving..." : " Save Hardware Asset"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
