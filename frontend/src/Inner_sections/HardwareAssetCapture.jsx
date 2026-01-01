// src/Pages/AssetCapture.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUnits,
  getLocations,
  getCategories,
  getStatuses,
  createHardwareAsset
} from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/HardwareCapture.css";
import { FiSave } from "react-icons/fi";

export const SUPPORTED_CURRENCIES = [
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "USD", label: "US Dollar", symbol: "$" },
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
const AssetCapture = () => {
  // src/constants/currencies.js


  const navigate = useNavigate();

  const defaultFormData = {
    assetCategory: "",
    barcodeNumber: "",
    assetName: "",
    associateUnit: "",
    locationName: "",
    locationAddress: "", // ✅ NEW
    assetSpecification: "",
    assetStatus: "",
    DOP: "",
    DOE: "",
    assetLifetime: "",
    purchaseFrom: "",
    PMD: "",
     assetCost: {
    amount: "",
    currency: "INR",
  },
    assetQuantity: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


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

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    let updated = { ...prev };

    // ✅ Handle assetCost nested fields
    if (name.startsWith("assetCost.")) {
      const field = name.split(".")[1];

      updated.assetCost = {
        ...prev.assetCost,
        [field]:
          field === "amount" ? Number(value) || "" : value,
      };
    } else {
      updated[name] = value;
    }

    // ✅ Auto-calculate lifetime
    if (name === "DOP" || name === "DOE") {
      const { DOP, DOE } = updated;

      if (DOP && DOE) {
        const start = new Date(DOP);
        const end = new Date(DOE);
        const days = Math.floor(
          (end - start) / (1000 * 60 * 60 * 24)
        );

        updated.assetLifetime =
          Number.isFinite(days) && days >= 0
            ? `${days} days`
            : "Invalid";
      } else {
        updated.assetLifetime = "";
      }
    }

    return updated;
  });
};

  const validateRequired = () => {
    const required = [
      "assetName",
      "assetCategory",
      "associateUnit",
      "locationName",
      "locationAddress", // ✅ NEW
      "assetStatus",
      "assetCost",
      "assetQuantity",
    ];

    const missing = required.filter((k) => !formData[k]);
    if (missing.length) {
      Swal.fire("Missing fields", "Please fill in all required fields.", "error");
      return false;
    }
    return true;
  };

const handleAddAsset = async (e) => {
  e.preventDefault();
  if (!validateRequired()) return;

  setIsSubmitting(true);

  try {
    await createHardwareAsset(formData);

    await Swal.fire("Success", "Asset added successfully!", "success");
    navigate("/inventory");
  } catch (err) {
    Swal.fire(
      "Error",
      err.userMessage || err.response?.data?.message || "Failed to add asset.",
      "error"
    );
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

            {/* Asset Name */}
            <div className="input-group">
              <label>
                Asset Name <span>*</span>
              </label>
              <input
                type="text"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="input-group">
              <label>
                Category <span>*</span>
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

          {/* Barcode Number */}
          {/* <div className="input-group">
            <label>Barcode Number</label>
            <input
              type="text"
              name="barcodeNumber"
              value={formData.barcodeNumber}
              onChange={handleChange}
              placeholder="Enter barcode"
            />
          </div> */}

          {/* Specification */}
          <div className="input-group">
            <label>Specification</label>
            <input
              type="text"
              name="assetSpecification"
              value={formData.assetSpecification}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Location */}
        <div className="section">
          <h3 className="section-title">Location & Management</h3>

          <div className="grid-2">
            {/* Location */}
            <div className="input-group">
              <label>
                Location <span>*</span>
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
            {/* Location Address */}
<div className="input-group">
  <label>
    Location Address <span>*</span>
  </label>
  <input
    type="text"
    name="locationAddress"
    value={formData.locationAddress}
    onChange={handleChange}
    placeholder="Building, floor, room, address"
    required
  />
</div>


          {/* Status */}
          <div className="input-group">
            <label>
              Status <span>*</span>
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

          {/* PMD */}
          {/* <div className="input-group">
            <label>PMD</label>
            <input
              type="text"
              name="PMD"
              value={formData.PMD}
              onChange={handleChange}
              placeholder="Enter PMD"
            />
          </div> */}
        </div>


          </div>
        {/* Cost & Quantity */}
        <div className="section">
          <h3 className="section-title">Cost & Quantity</h3>

          <div className="grid-2">
            {/* Cost */}

<div className="input-group">
  <label> Currency</label>

    <select
      name="assetCost.currency"
      value={formData.assetCost.currency}
      onChange={handleChange}
      required
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.label} ({c.symbol})
        </option>
      ))}
    </select>

</div>
<div className="input-group">
  <label>Asset Cost</label>
    <input
      type="number"
      name="assetCost.amount"
      value={formData.assetCost.amount}
      onChange={handleChange}
      min="0"
      step="0.01"
      placeholder="Unit cost"
      required
    />

</div>

            {/* Quantity */}
            <div className="input-group">
              <label>
                Quantity <span>*</span>
              </label>
              <input
                type="number"
                name="assetQuantity"
                value={formData.assetQuantity}
                onChange={handleChange}
                required
              />
            </div>
                        {/* Associate Unit */}
            <div className="input-group">
              <label>
                Associate Unit <span>*</span>
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
        </div>

        {/* Dates */}
        <div className="section">
          <h3 className="section-title">Dates</h3>

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
            />
          </div>
        </div>

        {/* Submit */}
        <button className="submit-btn" type="submit" disabled={isSubmitting}>
          <FiSave />
          {isSubmitting ? " Saving..." : " Save Hardware Asset"}
        </button>
      </form>
    </div>
  );
};

export default AssetCapture;
