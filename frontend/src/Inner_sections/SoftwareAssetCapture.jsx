// src/Pages/SoftwareAssetCapture.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../Page_styles/SoftwareCapture.css";
import {
  getStatuses,
  getCategories,
  createSoftwareAsset,
  getUnits,
  getLocations,
} from "../Services/ApiServices";
  export const SUPPORTED_CURRENCIES = [
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "JPY", label: "Japanese Yen", symbol: "¥" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
    { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", label: "Swiss Franc", symbol: "Fr." },
    { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
    { code: "HKD", label: "Hong Kong Dollar", symbol: "HK$" },
    { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
    { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
    { code: "SAR", label: "Saudi Riyal", symbol: "﷼" },
    { code: "QAR", label: "Qatari Riyal", symbol: "﷼" },
    { code: "KWD", label: "Kuwaiti Dinar", symbol: "د.ك" },
    { code: "SEK", label: "Swedish Krona", symbol: "kr" },
    { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
  ];
const initialForm = {
  assetName: "",
  assetCategory: "",
  associateUnit: "",
  locationName: "",
  locationAddress: "",
  type: "",

  licenseKey: "",
  licenseModel: "",
  licenseMetric: "",

  DOP: "",
  DOE: "",

  assetQuantity: "",
  assetCost: {
    amount: "",
    currency: "USD",
  },

  assetStatus: "",
};

export default function SoftwareAssetCapture() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);

  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [u, l, c, s] = await Promise.all([
        getUnits(),
        getLocations(),
        getCategories(),
        getStatuses(),
      ]);
      setUnits(u || []);
      setLocations(l?.data || []);
      setCategories(c || []);
      setStatuses(s || []);
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("assetCost.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        assetCost: {
          ...prev.assetCost,
          [field]: field === "amount" ? Number(value) || "" : value,
        },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createSoftwareAsset(formData);
      Swal.fire("Success", "Asset created!", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 4) * 100;
  return (
<div className="split-container">

  {/* LEFT INFO PANEL */}
  <div className="left-panel">
    <h2>Create Software Asset</h2>
    <p className="description">
      Add software licenses with proper tracking, cost visibility, and lifecycle management.
    </p>

    <div className="info-box">
      <h4>What we need</h4>
      <ul>
        <li>Basic software details</li>
        <li>License information</li>
        <li>Cost & quantity</li>
        <li>Validity period</li>
      </ul>
    </div>

    <div className="info-box">
      <h4>Tips</h4>
      <ul>
        <li>Use correct license count</li>
        <li>Match cost with billing cycle</li>
        <li>Ensure expiry date is accurate</li>
      </ul>
    </div>
  </div>

  {/* RIGHT FORM PANEL */}
  <div className="right-panel">

    <div className="form-card">

      <h3>Software Details</h3>

      <div className="grid-2">
        <div className="input-group">
          <label>Software Name *</label>
          <input name="assetName" onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>Category *</label>
          <select name="assetCategory" onChange={handleChange}>
            <option value="">Select</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="input-group">
          <label>Unit *</label>
          <select name="associateUnit" onChange={handleChange}>
            <option value="">Select</option>
            {units.map(u => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Location</label>
          <select name="locationName" onChange={handleChange}>
            <option value="">Select</option>
            {locations.map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <h3>License Info</h3>

      <div className="grid-2">


        <div className="input-group">
          <label>Type *</label>
          <select name="type" onChange={handleChange}>
            <option value="">Select</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="one_time">One-Time</option>
          </select>
        </div>
                <div className="input-group">
          <label>Status</label>
          <select name="assetStatus" onChange={handleChange}>
            <option value="">Select</option>
            {statuses.map(l => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <h3>Financial</h3>

      <div className="grid-2">
                    <div className="input-group">
                      <label>Currency</label>
                      <select
                        name="assetCost.currency"
                        value={formData.assetCost.currency}
                        onChange={handleChange}
                      >
                        {SUPPORTED_CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                    </div>
        <div className="input-group">
          <label>Total Cost *</label>
          <input type="number" name="assetCost.amount" onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>Quantity *</label>
          <input type="number" name="assetQuantity" onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Vendor</label>
          <input
            name="purchaseFrom"
            value={formData.purchaseFrom}
            onChange={handleChange}
          />
        </div>
      </div>
            <h3> Dates</h3>
      <div className="grid-2">
        <div className="input-group">
          <label>Start Date</label>
          <input type="date" name="DOP" onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>Expiry Date</label>
          <input type="date" name="DOE" onChange={handleChange} />
        </div>
      </div>

      <button 
  className="submit-btn" 
  onClick={handleSubmit}
  disabled={isSubmitting}
>
  {isSubmitting ? "Saving..." : "Save Asset"}
</button>

    </div>
  </div>
</div>
  );
}