// src/Pages/SoftwareAssetCapture.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../Page_styles/HardwareCapture.css"; // reuse same CSS as hardware
import { getStatuses, getCategories, createSoftwareAsset , getUnits , getLocations , generateSoftwareAssetCode } from "../Services/ApiServices";
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
const initialForm = {
  // Core
  assetCode: "",
  assetName: "",
  assetCategory: "",
  assetSpecification: "",
  purchaseFrom: "",

  associateUnit: "",
  locationName: "",
  locationAddress: "",

  // License
  licenseKey: "",
  licenseType: "",
  licenseModel: "",
  licenseMetric: "",
  licenseUse: "",
  DOP: "",
  DOE: "",
  assetLifetime: "",

  // Quantity & Cost
  assetQuantity: "",
  assetCost: {
  amount: "",
  currency: "INR",
},
assetStatus: "",


};


export default function SoftwareAssetCapture() {
  const [formData, setFormData] = useState(initialForm);
  const [tab, setTab] = useState(0); // not used visually but keep for quick nav if needed
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [contractFiles, setContractFiles] = useState([]);
  const [licenseFiles, setLicenseFiles] = useState([]);
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

      setUnits(Array.isArray(u) ? u : []);
      setLocations(Array.isArray(l?.data) ? l.data : []);
      setCategories(Array.isArray(c) ? c : []);
      setStatuses(Array.isArray(s) ? s : []);

      console.log("LOCATION RESPONSE:", l);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Failed to load classifications", "error");
    }
  })();
}, []);
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  // assetCost fields
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

  if (type === "checkbox") {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  const resetForm = () => {
    setFormData(initialForm);
    setContractFiles([]);
    setLicenseFiles([]);
    setTab(0);
  };

const buildJsonPayload = () => ({
  assetName: formData.assetName,
  assetCategory: formData.assetCategory,
  assetSpecification: formData.assetSpecification,
  purchaseFrom: formData.purchaseFrom,

  associateUnit: formData.associateUnit,
  locationName: formData.locationName,
  locationAddress: formData.locationAddress,

  licenseKey: formData.licenseKey,
  licenseType: formData.licenseType,
  licenseModel: formData.licenseModel,
  licenseMetric: formData.licenseMetric,
  licenseUse: formData.licenseUse,

  assetStatus: formData.assetStatus,

  DOP: formData.DOP,
  DOE: formData.DOE,
  assetLifetime: formData.assetLifetime,

  assetQuantity: Number(formData.assetQuantity),
  assetCost: {
  amount: Number(formData.assetCost.amount),
  currency: formData.assetCost.currency,
},

});


const calculateAssetLifetime = (start, end) => {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (endDate <= startDate) return "";

  const diffMs = endDate - startDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);

  if (years > 0 && months > 0) return `${years} year(s) ${months} month(s)`;
  if (years > 0) return `${years} year(s)`;
  return `${months} month(s)`;
};
useEffect(() => {
  const lifetime = calculateAssetLifetime(formData.DOP, formData.DOE);

  setFormData((prev) => ({
    ...prev,
    assetLifetime: lifetime,
  }));
}, [formData.DOP, formData.DOE]);


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.assetName || !formData.assetCategory) {
    Swal.fire("Validation", "Please fill required fields", "warning");
    return;
  }

  setIsSubmitting(true);

  try {
    const payload = buildJsonPayload();

    await createSoftwareAsset(payload);

    Swal.fire("Success", "Software asset captured successfully!", "success");
    resetForm();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", err.message || "Failed to capture asset", "error");
  } finally {
    setIsSubmitting(false);
  }
};


  // Small helper UI components to match hardware layout
  const SectionTitle = ({ children }) => <h3 className="section-title">{children}</h3>;

  return (
    <div className="asset-wrapper">
      <div className="asset-header">
        <h2>Software Capture</h2>
      </div>

      <form className="asset-form" onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Basic Details */}
        <div className="section">
          <SectionTitle>Basic Details</SectionTitle>
          <div className="grid-2">
            <div className="input-group">
              <label>Software Name <span style={{ color: "#e11d48" }}>*</span></label>
              <input name="assetName" value={formData.assetName} onChange={handleChange} placeholder="Software name" />
            </div>

            <div className="input-group">
              <label>Version</label>
              <input name="assetSpecification" value={formData.assetSpecification} onChange={handleChange} placeholder="1.0.0" />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Publisher</label>
              <input name="purchaseFrom" value={formData.purchaseFrom} onChange={handleChange} placeholder="Publisher name" />
            </div>

            <div className="input-group">
              <label>Category <span style={{ color: "#e11d48" }}>*</span></label>
              <select name="assetCategory" value={formData.assetCategory} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Unit <span style={{ color: "#e11d48" }}>*</span></label>
              <select name="associateUnit" value={formData.associateUnit} onChange={handleChange}>
                <option value="">Select Unit</option>
                {units.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Location</label>
              <select name="locationName" value={formData.locationName} onChange={handleChange}>
                <option value="">Select Location</option>
                {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Landmark</label>
              <input name="locationAddress" value={formData.locationAddress} onChange={handleChange} placeholder="Landmark" />
            </div>
          </div>

          {/* <div className="grid-2">
            <div className="input-group">
              <label>Asset Tag</label>
              <input name="assetTag" value={formData.assetTag} onChange={handleChange} placeholder="e.g. LICS-0001" />
            </div>

            <div className="input-group">
              <label>Software ID</label>
              <input name="softwareID" value={formData.softwareID} onChange={handleChange} placeholder="internal id" />
            </div>
          </div> */}
        </div>

        {/* License Details */}
        <div className="section">
          <SectionTitle>License Details</SectionTitle>

          <div className="grid-2">
            <div className="input-group">
              <label>License Key</label>
              <input name="licenseKey" value={formData.licenseKey} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>License Type</label>
              <input name="licenseType" value={formData.licenseType} onChange={handleChange} placeholder="Perpetual / Subscription" />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>License Model</label>
              <input name="licenseModel" value={formData.licenseModel} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>License Metric</label>
              <input name="licenseMetric" value={formData.licenseMetric} onChange={handleChange} placeholder="Per User / Per Device" />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>License Start Date</label>
              <input type="date" name="DOP" value={formData.DOP} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>License Expiry</label>
              <input type="date" name="DOE" value={formData.DOE} onChange={handleChange} />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Total Licenses</label>
              <input type="number" name="assetQuantity" value={formData.assetQuantity} onChange={handleChange} />
            </div> 
          </div>

          <div className="grid-2">

            <div className="input-group">
              <label>License Use</label>
              <input name="licenseUse" value={formData.licenseUse} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Financial & Contract */}
        <div className="section">
          <SectionTitle>Financial & Contract</SectionTitle>

         <div className="grid-2">
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
    <label>Cost Per License</label>
    <input
      type="number"
      name="assetCost.amount"
      value={formData.assetCost.amount}
      onChange={handleChange}
      placeholder="Unit cost"
    />
  </div>
</div>

            <div className="input-group">
              <label>Status</label>
              <select name="assetStatus" value={formData.assetStatus} onChange={handleChange}>
                <option value="">Select Status</option>
                {statuses.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="input-group">
  <label>Asset Lifetime</label>
  <input
    value={formData.assetLifetime}
    readOnly
    placeholder="Auto-calculated"
    style={{ backgroundColor: "#f9fafb" }}
  />
</div>

          {/* <div className="grid-2">
            <div className="input-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange}>
                <option>INR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>

            <div className="input-group">
              <label>Cost Center</label>
              <input name="costCenter" value={formData.costCenter} onChange={handleChange} />
            </div>
          </div> */}
{/* 
          <div className="grid-2">
            <div className="input-group">
              <label>Purchase Date</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>Purchase Order</label>
              <input name="purchaseOrder" value={formData.purchaseOrder} onChange={handleChange} />
            </div>
          </div> */}
{/* 
          <div className="input-group">
            <label>Contract Term / Notes</label>
            <input name="contractTerm" value={formData.contractTerm} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Support Vendor</label>
            <input name="supportVendor" value={formData.supportVendor} onChange={handleChange} />
          </div> */}

          {/* <div className="grid-2">
            <div className="input-group">
              <label>Support Email</label>
              <input name="supportEmail" value={formData.supportEmail} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Support Phone</label>
              <input name="supportPhone" value={formData.supportPhone} onChange={handleChange} />
            </div>
          </div> */}

          {/* <div className="input-group">
            <label>Upload Contract Documents (multiple)</label>
            <input type="file" multiple onChange={(e) => handleFiles(e, setContractFiles)} />
            {contractFiles.length > 0 && (
              <ul className="file-list">
                {contractFiles.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
            )}
          </div>

          <div className="input-group">
            <label>Upload License Documents (multiple)</label>
            <input type="file" multiple onChange={(e) => handleFiles(e, setLicenseFiles)} />
            {licenseFiles.length > 0 && (
              <ul className="file-list">
                {licenseFiles.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
            )}
          </div> */}
        </div>
        {/* Compliance & Risk */}


          {/* <div className="left-actions">
            <button type="button" className="btn-secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Top
            </button>
            <button type="button" className="btn-secondary" onClick={() => resetForm()}>
              Reset
            </button>
          </div> */}

            <button className="submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Software Asset"}
            </button>
      </form>
    </div>
  );
}
