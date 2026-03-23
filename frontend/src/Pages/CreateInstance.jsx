// src/pages/CreateInstances.jsx

import React, { useEffect, useState } from "react";
import "../Page_styles/CreateInstance.css";
import { useParams } from "react-router-dom";
import {
  getLocations,
  createAssetInstances,
  getAssetById
} from "../Services/ApiServices";

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
    modelNo: "",
    warrantyDate: "",
    softwareExpiry: "",
    seats: ""
  });

  const total = asset?.assetQuantity || 0;
  const pending = asset?.pendingInstances || 0;
  const created = total - pending;
  const progress = total > 0 ? (created / total) * 100 : 0;

  // ================= FETCH =================
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
      setLocations(locationData.data);

      const pending = assetData.pendingInstances || 0;

      const rows = Array.from({ length: pending }, () => ({
        serialNumber: "",
        condition: "new",
        location: "",
        modelNo: assetData?.hardwareDetails?.modelNo || "",
        warrantyDate: "",
        softwareExpiry: "",
        seats: ""
      }));

      setInstances(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= CHANGE =================
  const handleChange = (index, field, value) => {
    const updated = [...instances];
    updated[index][field] = value;
    setInstances(updated);

    // clear error
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];

      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index];
      }

      setErrors(newErrors);
    }
  };

  // ================= BULK APPLY =================
  const applyBulkValues = () => {
    const updated = instances.map((inst) => ({
      ...inst,
      location: bulkValues.location || inst.location,
      condition: bulkValues.condition || inst.condition,
      modelNo: bulkValues.modelNo || inst.modelNo,
      warrantyDate: bulkValues.warrantyDate || inst.warrantyDate,
      softwareExpiry:
        bulkValues.softwareExpiry || inst.softwareExpiry,
      seats: bulkValues.seats || inst.seats
    }));

    setInstances(updated);
  };

  // ================= ADD / REMOVE =================
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
        warrantyDate: "",
        softwareExpiry: "",
        seats: ""
      }
    ]);
  };

  const removeRow = (index) => {
    const updated = instances.filter((_, i) => i !== index);

    const newErrors = { ...errors };
    delete newErrors[index];

    setInstances(updated);
    setErrors(newErrors);
  };

  // ================= VALIDATION =================
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

      if (
        inst.warrantyDate &&
        new Date(inst.warrantyDate) < new Date()
      ) {
        rowErrors.warrantyDate = "Warranty already expired";
      }

      if (Object.keys(rowErrors).length > 0) {
        newErrors[index] = rowErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!validate()) {
      const firstErrorIndex = parseInt(Object.keys(errors)[0]);
      const element =
        document.querySelectorAll(".table-row")[firstErrorIndex];
      element?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
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
        },

        warranty: inst.warrantyDate
          ? { expiryDate: inst.warrantyDate }
          : undefined,

        softwareDetails:
          asset?.assetType === "software"
            ? {
                expiryDate: inst.softwareExpiry,
                seats: Number(inst.seats) || 0
              }
            : undefined
      }));

      await createAssetInstances({
        assetId,
        instances: payload
      });

      alert("Instances created successfully");
      await fetchData();
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

      {/* PROGRESS */}
      <div className="progress-container">
        <div className="progress-top">
          <span>Progress</span>
          <span>{created} / {total}</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="pending-text">
          Pending: <strong>{pending}</strong>
        </p>
      </div>

      {/* ASSET INFO */}
      {asset && (
        <div className="asset-info">
          <h3>{asset.assetName}</h3>
          <p>{asset.assetCode}</p>
        </div>
      )}

      {/* BULK */}
      <div className="bulk-controls">
        <h4>Bulk Apply</h4>

        <div className="bulk-row">
          <select
            value={bulkValues.location}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                location: e.target.value
              })
            }
          >
            <option value="">Location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={bulkValues.condition}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                condition: e.target.value
              })
            }
          >
            <option value="">Condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
          </select>

          <input
            placeholder="Model No"
            value={bulkValues.modelNo}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                modelNo: e.target.value
              })
            }
          />

          <input
            type="date"
            value={bulkValues.warrantyDate}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                warrantyDate: e.target.value
              })
            }
          />

          {asset?.assetType === "software" && (
            <>
              <input
                type="date"
                value={bulkValues.softwareExpiry}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    softwareExpiry: e.target.value
                  })
                }
              />

              <input
                type="number"
                placeholder="Seats"
                value={bulkValues.seats}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    seats: e.target.value
                  })
                }
              />
            </>
          )}

          <button onClick={applyBulkValues}>
            Apply
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="instance-table">
        <div className="table-header">
          <span>Serial</span>
          <span>Condition</span>
          <span>Location</span>
          <span>Model</span>
          <span>Warranty</span>
          {asset?.assetType === "software" && (
            <>
              <span>Expiry</span>
              <span>Seats</span>
            </>
          )}
          <span>Action</span>
        </div>

        {instances.map((inst, index) => (
          <div className="table-row" key={index}>
            <input
              placeholder="Serial"
              value={inst.serialNumber}
              onChange={(e) =>
                handleChange(index, "serialNumber", e.target.value)
              }
            />

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

            <select
              value={inst.location}
              onChange={(e) =>
                handleChange(index, "location", e.target.value)
              }
            >
              <option value="">Location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Model"
              value={inst.modelNo}
              onChange={(e) =>
                handleChange(index, "modelNo", e.target.value)
              }
            />

            <input
              type="date"
              value={inst.warrantyDate}
              onChange={(e) =>
                handleChange(index, "warrantyDate", e.target.value)
              }
            />

            {asset?.assetType === "software" && (
              <>
                <input
                  type="date"
                  value={inst.softwareExpiry}
                  onChange={(e) =>
                    handleChange(index, "softwareExpiry", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={inst.seats}
                  onChange={(e) =>
                    handleChange(index, "seats", e.target.value)
                  }
                />
              </>
            )}

            <button onClick={() => removeRow(index)}>✕</button>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="form-actions">
        <button onClick={addRow}>+ Add</button>
        <button
          onClick={handleSubmit}
          disabled={loading || pending === 0}
        >
          {loading ? "Saving..." : "Create Instances"}
        </button>
      </div>
    </div>
  );
};

export default CreateInstances;