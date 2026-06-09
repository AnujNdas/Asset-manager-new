import React, { useState } from "react";
import { upgradeInstance } from "../Services/ApiServices";
import ThemeSwal from "../Utils/ThemeSwal";
const UpgradeModal = ({ instance, onClose, refresh }) => {
  const isHardware = instance?.assetType === "hardware";
  const isSoftware = instance?.assetType === "software";

  /* =============================
     🔹 FIELD CONFIG (DYNAMIC)
  ============================== */

  const fieldConfig = [
    // 🔸 HARDWARE COSTS
...(isHardware ? [
  { name: "maintenanceCost", label: "Maintenance Cost", type: "number" },
  { name: "warrantyRenewalCost", label: "Warranty Renewal Cost", type: "number" },

  // ✅ NEW
  { name: "newWarrantyPurchaseDate", label: "Warranty Purchase Date", type: "date" },
  { name: "newWarrantyExpiry", label: "Warranty Expiry", type: "date" },

  { name: "newMaintenanceDate", label: "Next Maintenance", type: "date" },
  { name: "newInstallationDate", label: "Installation Date", type: "date" }
] : []),
    // 🔸 SOFTWARE
    ...(isSoftware ? [
      { name: "renewalCost", label: "Renewal Cost", type: "number" },
      { name: "newRenewalDate", label: "Renewal Date", type: "date" },
      { name: "newLastUsedDate", label: "Last Used Date", type: "date" },
      { name: "newInstallationDate", label: "Installation Date", type: "date" }
    ] : [])
  ];

  /* =============================
     🔹 INITIAL STATE
  ============================== */

const [form, setForm] = useState({
  // ❌ REMOVE currency

  maintenanceCost:
    instance?.hardware?.costs?.maintenanceCost?.amount || "",

  warrantyRenewalCost:
    instance?.hardware?.costs?.warrantyRenewalCost?.amount || "",

  insuranceCost:
    instance?.hardware?.costs?.insuranceCost?.amount || "",

  renewalCost:
    instance?.software?.costs?.renewalCost?.amount || "",

  // ✅ NEW DATES
  newWarrantyPurchaseDate:
    instance?.hardware?.warrantyPurchaseDate?.split("T")[0] || "",

    hasInsurance: instance?.hardware?.hasInsurance || false,

    insuranceTerm: instance?.hardware?.insuranceTerm || "1_year",

    newInsurancePurchaseDate:
      instance?.hardware?.insurancePurchaseDate?.split("T")[0] || "",

  newWarrantyExpiry:
    instance?.hardware?.warrantyExpiry?.split("T")[0] || "",

  newInsuranceExpiry:
    instance?.hardware?.insuranceExpiry?.split("T")[0] || "",

  newMaintenanceDate:
    instance?.hardware?.nextMaintenanceDate?.split("T")[0] || "",

  newRenewalDate:
    instance?.software?.renewalDate?.split("T")[0] || "",

  newLastUsedDate:
    instance?.software?.lastUsedDate?.split("T")[0] || "",

  newInstallationDate:
    instance?.hardware?.installationDate?.split("T")[0] ||
    instance?.software?.installationDate?.split("T")[0] ||
    "",

  condition: instance?.condition || "",
  upgradeDescription: "",
  upgradeNotes: "",
  upgradeDate: new Date().toISOString().split("T")[0] ,
  upgradeCost: "",
});

  /* =============================
     🔹 HANDLERS
  ============================== */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
const payload = {
  ...(isHardware && {
    maintenanceCost:
      Number(form.maintenanceCost) || 0,

    warrantyRenewalCost:
      Number(form.warrantyRenewalCost) || 0,

    hasInsurance: form.hasInsurance,

    insuranceTerm: form.insuranceTerm,

    insuranceCost: form.hasInsurance
      ? Number(form.insuranceCost) || 0
      : 0,

    newInsurancePurchaseDate:
      form.hasInsurance
        ? form.newInsurancePurchaseDate || undefined
        : undefined,

    newWarrantyExpiry:
      form.newWarrantyExpiry || undefined,

    newMaintenanceDate:
      form.newMaintenanceDate || undefined,

    newInstallationDate:
      form.newInstallationDate || undefined
  }),

  ...(isSoftware && {
    renewalCost:
      Number(form.renewalCost) || 0,

    newRenewalDate:
      form.newRenewalDate || undefined,

    newLastUsedDate:
      form.newLastUsedDate || undefined,

    newInstallationDate:
      form.newInstallationDate || undefined
  }),

  condition: form.condition || undefined,
  upgradeDescription: form.upgradeDescription || undefined,
  upgradeNotes: form.upgradeNotes || undefined,
    upgradeDate:
    form.upgradeDate || undefined,
     upgradeCost:
    Number(form.upgradeCost) || 0,
};
if (
  form.upgradeCost > 0 &&
  !form.upgradeDescription.trim()
) {
ThemeSwal.fire(
  "Validation",
  "Upgrade description is required when an upgrade cost is entered.",
  "warning"
);
return;
}

      await upgradeInstance(instance._id, payload);

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  /* =============================
     🔹 RENDER
  ============================== */

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Upgrade Asset</h2>

        {/* ✅ CURRENCY */}
{/* ✅ CURRENCY (READ ONLY) */}
<div className="input-group">
  <label>Currency</label>

  <input
    type="text"
    value="USD"
    readOnly
    className="readonly-input"
  />
</div>
        {isHardware && (
  <>
    {/* HAS INSURANCE */}
<div className="checkbox-group">
  <input
    type="checkbox"
    className="checkbox-ins"
    name="hasInsurance"
    checked={form.hasInsurance}
    onChange={(e) => {
      const checked = e.target.checked;
    
      setForm({
        ...form,
        hasInsurance: checked,
        ...(checked
          ? {}
          : {
              insuranceTerm: "1_year",
              insuranceCost: "",
              newInsurancePurchaseDate: ""
            })
      });
    }}  
  />
  <label>Has Insurance</label>
</div>

    {/* INSURANCE TERM */}
{form.hasInsurance && (
  <>
    <div className="input-group">
      <label>Insurance Term</label>
      <select
        name="insuranceTerm"
        value={form.insuranceTerm}
        onChange={handleChange}
      >
        <option value="6_months">6 Months</option>
        <option value="1_year">1 Year</option>
        <option value="3_years">3 Years</option>
      </select>
    </div>

    <div className="input-group">
      <label>Insurance Purchase Date</label>
      <input
        type="date"
        name="newInsurancePurchaseDate"
        value={form.newInsurancePurchaseDate}
        onChange={handleChange}
      />
    </div>

    <div className="input-group">
      <label>Insurance Cost</label>
      <input
        type="number"
        name="insuranceCost"
        value={form.insuranceCost}
        onChange={handleChange}
      />
    </div>
  </>
)}
  </>
)}

        {/* ✅ DYNAMIC FIELDS */}
        <div className="grid-2">
          {fieldConfig
            .map((field) => (
              <div className="input-group" key={field.name}>
                <label>{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
        </div>

        {/* ✅ CONDITION */}
        <div className="input-group">
          <label>Condition</label>
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
          >
           <option value="new">New</option>
                <option value="used">Used</option>
                <option value="damaged">Damaged</option>
                <option value="stolen">Stolen</option>
                <option value="broken">Broken</option>
                <option value="repaired(in)">Repaired(IN)</option>
                <option value="repaired(out)">Repaired(OUT)</option>
          </select>
        </div>
        <div className="input-group">
  <label>Upgrade Cost</label>

  <input
    type="number"
    name="upgradeCost"
    value={form.upgradeCost}
    onChange={handleChange}
    placeholder="Cost of upgrade"
  />
</div>
        <div className="input-group">

          <label>Upgrade Details</label>
<textarea
  name="upgradeDescription"
  placeholder="Describe the upgrade"
  value={form.upgradeDescription}
  onChange={handleChange}
  rows={3}
/>
        </div>
        <div>
  <label>Upgrade Date</label>

<input
  type="date"
  name="upgradeDate"
  value={form.upgradeDate}
  onChange={handleChange}
/>
</div>

        {/* ACTIONS */}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>

          <button onClick={handleSubmit} className="btn-save">
            Apply Upgrade 
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpgradeModal;