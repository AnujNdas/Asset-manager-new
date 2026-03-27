import React, { useState } from "react";

import { upgradeInstance } from "../Services/ApiServices";

const UpgradeModal = ({ instance, onClose, refresh }) => {
  const [form, setForm] = useState({
    maintenanceCost: "",
    warrantyRenewalCost: "",
    insuranceCost: "",
    newWarrantyExpiry: "",
    newInsuranceExpiry: "",
    condition: ""
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
        maintenanceCost: Number(form.maintenanceCost) || 0,
        warrantyRenewalCost: Number(form.warrantyRenewalCost) || 0,
        insuranceCost: Number(form.insuranceCost) || 0,
        newWarrantyExpiry: form.newWarrantyExpiry || undefined,
        newInsuranceExpiry: form.newInsuranceExpiry || undefined,
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

        {/* COSTS */}
        <input
          type="number"
          name="maintenanceCost"
          placeholder="Maintenance Cost"
          onChange={handleChange}
        />

        <input
          type="number"
          name="warrantyRenewalCost"
          placeholder="Warranty Renewal Cost"
          onChange={handleChange}
        />

        <input
          type="number"
          name="insuranceCost"
          placeholder="Insurance Cost"
          onChange={handleChange}
        />

        {/* DATES */}
        <label>Warranty Expiry</label>
        <input
          type="date"
          name="newWarrantyExpiry"
          onChange={handleChange}
        />

        <label>Insurance Expiry</label>
        <input
          type="date"
          name="newInsuranceExpiry"
          onChange={handleChange}
        />

        {/* CONDITION */}
        <select name="condition" onChange={handleChange}>
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