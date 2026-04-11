import React, { useState } from "react";
import { upgradeInstance } from "../Services/ApiServices";

const currencyOptions = [
  "INR", "USD", "EUR", "GBP", "JPY",
  "AUD", "CAD", "SGD", "AED", "CNY"
];

const UpgradeModal = ({ instance, onClose, refresh }) => {
  const isHardware = !!instance?.hardware;
  const isSoftware = !!instance?.software;

  /* =============================
     🔹 FIELD CONFIG (DYNAMIC)
  ============================== */

  const fieldConfig = [
    // 🔸 HARDWARE COSTS
...(isHardware ? [
  { name: "maintenanceCost", label: "Maintenance Cost", type: "number" },
  { name: "warrantyRenewalCost", label: "Warranty Renewal Cost", type: "number" },
  { name: "insuranceCost", label: "Insurance Cost", type: "number" },

  // ✅ NEW
  { name: "newWarrantyPurchaseDate", label: "Warranty Purchase Date", type: "date" },
  { name: "newWarrantyExpiry", label: "Warranty Expiry", type: "date" },

  { name: "newInsurancePurchaseDate", label: "Insurance Purchase Date", type: "date" },
  { name: "newInsuranceExpiry", label: "Insurance Expiry", type: "date" },

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
  currency: instance?.hardware?.currency || instance?.software?.currency || "INR",

  // ✅ COSTS (numbers now)
  maintenanceCost: instance?.hardware?.costs?.maintenanceCost || "",
  warrantyRenewalCost: instance?.hardware?.costs?.warrantyRenewalCost || "",
  insuranceCost: instance?.hardware?.costs?.insuranceCost || "",

  renewalCost: instance?.software?.costs?.renewalCost || "",

  // ✅ NEW DATES
  newWarrantyPurchaseDate:
    instance?.hardware?.warrantyPurchaseDate?.split("T")[0] || "",

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

  condition: instance?.condition || ""
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
        currency: form.currency,

        ...(isHardware && {
          maintenanceCost: Number(form.maintenanceCost) || 0,
          warrantyRenewalCost: Number(form.warrantyRenewalCost) || 0,
          insuranceCost: Number(form.insuranceCost) || 0,

          newWarrantyExpiry: form.newWarrantyExpiry || undefined,
          newInsuranceExpiry: form.newInsuranceExpiry || undefined,
          newMaintenanceDate: form.newMaintenanceDate || undefined,
          newInstallationDate: form.newInstallationDate || undefined
        }),

        ...(isSoftware && {
          renewalCost: Number(form.renewalCost) || 0,

          newRenewalDate: form.newRenewalDate || undefined,
          newLastUsedDate: form.newLastUsedDate || undefined,
          newInstallationDate: form.newInstallationDate || undefined
        }),

        condition: form.condition || undefined
      };

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
        <div className="input-group">
          <label>Currency</label>
          <select name="currency" value={form.currency} onChange={handleChange}>
            {currencyOptions.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        {/* ✅ DYNAMIC FIELDS */}
        <div className="grid-2">
          {fieldConfig.map((field) => (
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
            <option value="">Select Condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>

          <button className="primary" onClick={handleSubmit}>
            Apply Upgrade
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpgradeModal;