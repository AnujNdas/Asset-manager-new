// src/pages/CreateInstances.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Page_styles/CreateInstance.css";
import { useParams } from "react-router-dom";
import { getLocations , createAssetInstances , getAssetById } from "../Services/ApiServices";
const CreateInstances = () => {
  const { assetId } = useParams();

  const [asset, setAsset] = useState(null);
  const [locations, setLocations] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bulkValues, setBulkValues] = useState({
  location: "",
  condition: "",
  modelNo: ""
});
const total = asset?.assetQuantity || 0;
const pending = asset?.pendingInstances || 0;
const created = total - pending;

const progress = total > 0 ? (created / total) * 100 : 0;
const applyBulkValues = () => {
  const updated = instances.map((inst) => ({
    ...inst,
    location: bulkValues.location || inst.location,
    condition: bulkValues.condition || inst.condition,
    modelNo: bulkValues.modelNo || inst.modelNo
  }));

  setInstances(updated);
};
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    setLoading(true);

    const [assetData, locationData] = await Promise.all([
      getAssetById(assetId),
      getLocations()
    ]);

    setAsset(assetData);
    setLocations(locationData);
    console.log("ASSET DATA:", assetData);

    const pending = assetData.pendingInstances || 0;

    // ✅ Generate rows safely
    const rows = Array.from({ length: pending }, (_, i) => ({
      serialNumber: "",
      condition: "new",
      location: "",
       modelNo: assetData?.modelNo || ""
    }));

    setInstances(rows);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  // HANDLE CHANGE
const handleChange = (index, field, value) => {
  const updated = [...instances];
  updated[index][field] = value;
  setInstances(updated);

  // ✅ Clear error for that field
  if (errors[index]?.[field]) {
    const newErrors = { ...errors };
    delete newErrors[index][field];

    if (Object.keys(newErrors[index]).length === 0) {
      delete newErrors[index];
    }

    setErrors(newErrors);
  }
};

  // ADD ROW
const addRow = () => {
  if (instances.length >= pending) {
    alert("Cannot add more than pending instances");
    return;
  }

  setInstances([
    ...instances,
    {
      serialNumber: "",
      condition: "new",
      location: "",
      modelNo: asset?.hardwareDetails?.modelNo || "",
    }
  ]);
};
  // REMOVE ROW
const removeRow = (index) => {
  const updatedInstances = instances.filter((_, i) => i !== index);

  const newErrors = { ...errors };
  delete newErrors[index];

  setInstances(updatedInstances);
  setErrors(newErrors);
};

  // VALIDATION
const validate = () => {
  const newErrors = {};
  const serials = new Set();

  instances.forEach((inst, index) => {
    const rowErrors = {};

    if (!inst.location) {
      rowErrors.location = "Location required";
    }

    if (inst.serialNumber) {
      if (serials.has(inst.serialNumber)) {
        rowErrors.serialNumber = "Duplicate serial";
      }
      serials.add(inst.serialNumber);
    }

    if (Object.keys(rowErrors).length > 0) {
      newErrors[index] = rowErrors;
    }
  });

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  // SUBMIT
  const handleSubmit = async () => {
    if (!validate()) {
  const firstErrorIndex = Object.keys(errors)[0];
  const element = document.querySelectorAll(".table-row")[firstErrorIndex];
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
  return;
}

    try {
      setLoading(true);

const payload = instances.map((inst) => ({
  serialNumber: inst.serialNumber,
  condition: inst.condition,
  location: inst.location,
  hardwareDetails: {
    modelNo: inst.modelNo
  }
}));
      await createAssetInstances({
        assetId,
        instances: payload
      });

      alert("Instances created successfully");
      await fetchData();
      // window.location.href = "/instance-assets";
    } catch (err) {
      console.error(err);
      alert("Error creating instances");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instance-form-page">
      <h2>Create Instances</h2>
    <div className="progress-container">
  <div className="progress-top">
    <span>Instance Creation Progress</span>
    <span>{created} / {total}</span>
  </div>

  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${progress}%` }}
    ></div>
  </div>

  <p className="pending-text">
    Pending: <strong>{pending}</strong>
  </p>
</div>
      {asset && (
        <div className="asset-info">
          <h3>{asset.assetName}</h3>
          <p>{asset.assetCode}</p>
          <span>Pending: {asset.pendingInstances}</span>
        </div>
      )}
<div className="bulk-controls">
  <h4>Bulk Apply</h4>

  <div className="bulk-row">
    {/* LOCATION */}
    <select
      value={bulkValues.location}
      onChange={(e) =>
        setBulkValues({ ...bulkValues, location: e.target.value })
      }
    >
      <option value="">Select Location</option>
      {locations.map((loc) => (
        <option key={loc._id} value={loc._id}>
          {loc.name}
        </option>
      ))}
    </select>

    {/* CONDITION */}
    <select
      value={bulkValues.condition}
      onChange={(e) =>
        setBulkValues({ ...bulkValues, condition: e.target.value })
      }
    >
      <option value="">Condition</option>
      <option value="new">New</option>
      <option value="used">Used</option>
      <option value="damaged">Damaged</option>
    </select>

    {/* MODEL NO */}
    <input
      type="text"
      placeholder="Model No"
      value={bulkValues.modelNo}
      onChange={(e) =>
        setBulkValues({ ...bulkValues, modelNo: e.target.value })
      }
    />

    {/* APPLY BUTTON */}
    <button onClick={applyBulkValues}>
      Apply to All
    </button>
  </div>
</div>
      {/* TABLE */}
      <div className="instance-table">
        <div className="table-header">
          <span>Serial Number</span>
          <span>Condition</span>
          <span>Location</span>
          <span>Model No</span>
          <span>Action</span>
        </div>

        {instances.map((inst, index) => (
          <div className="table-row" key={index}>
<div>
  <input
    type="text"
    placeholder="Serial Number"
    value={inst.serialNumber}
    onChange={(e) =>
      handleChange(index, "serialNumber", e.target.value)
    }
    className={errors[index]?.serialNumber ? "input-error" : ""}
  />
  {errors[index]?.serialNumber && (
    <div className="error-text">
      {errors[index].serialNumber}
    </div>
  )}
</div>

            <select
              value={inst.condition}
              onChange={(e) =>
                handleChange(index, "condition", e.target.value)
              }
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="damaged">Damaged</option>
            </select>

            {/* LOCATION DROPDOWN */}
<div>
  <select
    value={inst.location}
    onChange={(e) =>
      handleChange(index, "location", e.target.value)
    }
    className={errors[index]?.location ? "input-error" : ""}
  >
    <option value="">Select Location</option>
    {locations.map((loc) => (
      <option key={loc._id} value={loc._id}>
        {loc.name}
      </option>
    ))}
  </select>

  {errors[index]?.location && (
    <div className="error-text">
      {errors[index].location}
    </div>
  )}
</div>

            <input
              type="text"
              placeholder="Model No"
              value={inst.modelNo}
              onChange={(e) =>
                handleChange(index, "modelNo", e.target.value)
              }
            />

            <button onClick={() => removeRow(index)}>✕</button>
          </div>
        ))}
      </div>
        
      {/* ACTIONS */}
      <div className="form-actions">
        <button onClick={addRow} disabled={loading}>+ Add Row</button>

<button
  onClick={handleSubmit}
  disabled={loading || pending === 0}
>
  {pending === 0
    ? "All Instances Created"
    : loading
    ? "Saving..."
    : "Create Instances"}
</button>
      </div>
    </div>
  );
};

export default CreateInstances;