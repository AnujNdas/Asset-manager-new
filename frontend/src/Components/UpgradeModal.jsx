import React, { useState } from "react";
import { upgradeInstance } from "../Services/ApiServices";

const currencyOptions = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "SGD",
  "AED",
  "CNY"
];

const UpgradeModal = ({ instance, onClose, refresh }) => {
  const isHardware = !!instance?.hardware;
  const isSoftware = !!instance?.software;

  const [form, setForm] = useState({
    currency: "INR",

    // hardware
    maintenanceCost:
      instance?.hardware?.costs?.maintenanceCost?.amount || "",
    warrantyRenewalCost:
      instance?.hardware?.costs?.warrantyRenewalCost?.amount || "",
    insuranceCost:
      instance?.hardware?.costs?.insuranceCost?.amount || "",

    newWarrantyExpiry: instance?.hardware?.warrantyExpiry
      ? instance.hardware.warrantyExpiry.split("T")[0]
      : "",

    newInsuranceExpiry: instance?.hardware?.insuranceExpiry
      ? instance.hardware.insuranceExpiry.split("T")[0]
      : "",

    // software
    renewalCost:
      instance?.software?.costs?.renewalCost?.amount || "",

    newRenewalDate: instance?.software?.renewalDate
      ? instance.software.renewalDate.split("T")[0]
      : "",

    // shared
    condition: instance?.condition || ""
  });

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

        // hardware
        ...(isHardware && {
          maintenanceCost: Number(form.maintenanceCost) || 0,
          warrantyRenewalCost:
            Number(form.warrantyRenewalCost) || 0,
          insuranceCost: Number(form.insuranceCost) || 0,

          newWarrantyExpiry:
            form.newWarrantyExpiry || undefined,
          newInsuranceExpiry:
            form.newInsuranceExpiry || undefined
        }),

        // software
        ...(isSoftware && {
          renewalCost: Number(form.renewalCost) || 0,
          newRenewalDate: form.newRenewalDate || undefined
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

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Upgrade Asset</h2>

        {/* ✅ CURRENCY */}
        <label>Currency</label>
        <select
          name="currency"
          value={form.currency}
          onChange={handleChange}
        >
          {currencyOptions.map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>

        {/* ================= HARDWARE ================= */}
        {isHardware && (
          <>
            <h4>Hardware Costs</h4>

            <input
              type="number"
              name="maintenanceCost"
              placeholder="Maintenance Cost"
              value={form.maintenanceCost}
              onChange={handleChange}
            />

            <input
              type="number"
              name="warrantyRenewalCost"
              placeholder="Warranty Renewal"
              value={form.warrantyRenewalCost}
              onChange={handleChange}
            />

            <input
              type="number"
              name="insuranceCost"
              placeholder="Insurance Cost"
              value={form.insuranceCost}
              onChange={handleChange}
            />

            <label>Warranty Expiry</label>
            <input
              type="date"
              name="newWarrantyExpiry"
              value={form.newWarrantyExpiry}
              onChange={handleChange}
            />

            <label>Insurance Expiry</label>
            <input
              type="date"
              name="newInsuranceExpiry"
              value={form.newInsuranceExpiry}
              onChange={handleChange}
            />
          </>
        )}

        {/* ================= SOFTWARE ================= */}
        {isSoftware && (
          <>
            <h4>Software Renewal</h4>

            <input
              type="number"
              name="renewalCost"
              placeholder="Renewal Cost"
              value={form.renewalCost}
              onChange={handleChange}
            />

            <label>Renewal Date</label>
            <input
              type="date"
              name="newRenewalDate"
              value={form.newRenewalDate}
              onChange={handleChange}
            />
          </>
        )}

        {/* ================= CONDITION ================= */}
        <h4>Condition</h4>
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