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
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bulkValues, setBulkValues] = useState({
  location: "",
  condition: "",
  modelNo: "",
  specifications: "",

  warrantyDate: "",
  installationDate: "",

  insurancePolicyId: "",
  insuranceExpiry: "",

  maintenanceCost: "",
  warrantyRenewalCost: "",
  insuranceCost: ""
});
  const total = asset?.assetQuantity || 0;
  const pending = asset?.pendingInstances || 0;
  const created = total - pending;

  const progress = total > 0 ? (created / total) * 100 : 0;

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

      const rows = Array.from({ length: assetData.pendingInstances || 0 }, () => ({
        serialNumber: "",
        condition: "new",
        location: "",
        modelNo: "",
        specifications: "",

        warrantyDate: "",
        installationDate: "",

        insurancePolicyId: "",
        insuranceExpiry: "",

        maintenanceCost: "",
        warrantyRenewalCost: "",
        insuranceCost: ""
      }));

      setInstances(rows);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...instances];
    updated[index][field] = value;
    setInstances(updated);
  };
  const applyBulkValues = () => {
  const updated = instances.map((inst) => ({
    ...inst,
    location: bulkValues.location || inst.location,
    condition: bulkValues.condition || inst.condition,
    modelNo: bulkValues.modelNo || inst.modelNo,
    specifications: bulkValues.specifications || inst.specifications,

    warrantyDate: bulkValues.warrantyDate || inst.warrantyDate,
    installationDate: bulkValues.installationDate || inst.installationDate,

    insurancePolicyId:
      bulkValues.insurancePolicyId || inst.insurancePolicyId,
    insuranceExpiry:
      bulkValues.insuranceExpiry || inst.insuranceExpiry,

    maintenanceCost:
      bulkValues.maintenanceCost || inst.maintenanceCost,
    warrantyRenewalCost:
      bulkValues.warrantyRenewalCost || inst.warrantyRenewalCost,
    insuranceCost:
      bulkValues.insuranceCost || inst.insuranceCost
  }));

  setInstances(updated);
};
  const toggleExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const validate = () => {
    const newErrors = {};
    const serials = new Set();

    instances.forEach((inst, index) => {
      const rowErrors = {};

      if (!inst.location) rowErrors.location = "Required";

      if (inst.serialNumber) {
        if (serials.has(inst.serialNumber)) {
          rowErrors.serialNumber = "Duplicate";
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

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = instances.map((inst) => ({
        serialNumber: inst.serialNumber,
        condition: inst.condition,
        location: inst.location,

        hardwareDetails: {
          modelNo: inst.modelNo,
          specifications: inst.specifications
        },

        warranty: inst.warrantyDate
          ? { expiryDate: inst.warrantyDate }
          : undefined,

        installationDate: inst.installationDate || undefined,

        insurance: inst.insuranceExpiry
          ? {
              policyId: inst.insurancePolicyId,
              expiryDate: inst.insuranceExpiry
            }
          : undefined,

        costTracking: {
          maintenanceCost: Number(inst.maintenanceCost) || 0,
          warrantyRenewalCost: Number(inst.warrantyRenewalCost) || 0,
          insuranceCost: Number(inst.insuranceCost) || 0
        }
      }));

      await createAssetInstances({ assetId, instances: payload });

      alert("Instances created successfully");
      fetchData();

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
          <span>{created} / {total}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ASSET INFO */}
      {asset && (
        <div className="asset-info">
          <h3>{asset.assetName}</h3>
          <p>{asset.assetCode}</p>
        </div>
      )}
      {/* BULK APPLY */}
<div className="bulk-panel">
  <h4>Bulk Apply</h4>

  <div className="bulk-grid">

    <select
      value={bulkValues.location}
      onChange={(e) =>
        setBulkValues({ ...bulkValues, location: e.target.value })
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
        setBulkValues({ ...bulkValues, condition: e.target.value })
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
        setBulkValues({ ...bulkValues, modelNo: e.target.value })
      }
    />

    <input
      placeholder="Specifications"
      value={bulkValues.specifications}
      onChange={(e) =>
        setBulkValues({ ...bulkValues, specifications: e.target.value })
      }
    />

    <input
      type="date"
      value={bulkValues.warrantyDate}
      onChange={(e) =>
        setBulkValues({ ...bulkValues, warrantyDate: e.target.value })
      }
    />

    <input
      type="date"
      value={bulkValues.installationDate}
      onChange={(e) =>
        setBulkValues({ ...bulkValues, installationDate: e.target.value })
      }
    />

    <input
      placeholder="Insurance Policy"
      value={bulkValues.insurancePolicyId}
      onChange={(e) =>
        setBulkValues({
          ...bulkValues,
          insurancePolicyId: e.target.value
        })
      }
    />

    <input
      type="date"
      value={bulkValues.insuranceExpiry}
      onChange={(e) =>
        setBulkValues({
          ...bulkValues,
          insuranceExpiry: e.target.value
        })
      }
    />

    <input
      type="number"
      placeholder="Maintenance Cost"
      value={bulkValues.maintenanceCost}
      onChange={(e) =>
        setBulkValues({
          ...bulkValues,
          maintenanceCost: e.target.value
        })
      }
    />

    <input
      type="number"
      placeholder="Warranty Renewal"
      value={bulkValues.warrantyRenewalCost}
      onChange={(e) =>
        setBulkValues({
          ...bulkValues,
          warrantyRenewalCost: e.target.value
        })
      }
    />

    <input
      type="number"
      placeholder="Insurance Cost"
      value={bulkValues.insuranceCost}
      onChange={(e) =>
        setBulkValues({
          ...bulkValues,
          insuranceCost: e.target.value
        })
      }
    />

    <button onClick={applyBulkValues}>
      Apply to All
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
          <span>Expand</span>
        </div>

        {instances.map((inst, index) => (
          <div key={index}>

            {/* MAIN ROW */}
            <div className="table-row">

              <input
                value={inst.serialNumber}
                placeholder="Serial"
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
                value={inst.modelNo}
                placeholder="Model"
                onChange={(e) =>
                  handleChange(index, "modelNo", e.target.value)
                }
              />

              <button onClick={() => toggleExpand(index)}>
                {expandedRow === index ? "−" : "+"}
              </button>
            </div>

            {/* EXPANDED PANEL */}
            {expandedRow === index && (
              <div className="expand-panel">

                <textarea
                  placeholder="Specifications"
                  value={inst.specifications}
                  onChange={(e) =>
                    handleChange(index, "specifications", e.target.value)
                  }
                />

                <div className="grid-3">
                  <input
                    type="date"
                    value={inst.warrantyDate}
                    onChange={(e) =>
                      handleChange(index, "warrantyDate", e.target.value)
                    }
                  />

                  <input
                    type="date"
                    value={inst.installationDate}
                    onChange={(e) =>
                      handleChange(index, "installationDate", e.target.value)
                    }
                  />

                  <input
                    placeholder="Insurance Policy"
                    value={inst.insurancePolicyId}
                    onChange={(e) =>
                      handleChange(index, "insurancePolicyId", e.target.value)
                    }
                  />

                  <input
                    type="date"
                    value={inst.insuranceExpiry}
                    onChange={(e) =>
                      handleChange(index, "insuranceExpiry", e.target.value)
                    }
                  />
                </div>

                <div className="grid-3">
                  <input
                    placeholder="Maintenance Cost"
                    type="number"
                    value={inst.maintenanceCost}
                    onChange={(e) =>
                      handleChange(index, "maintenanceCost", e.target.value)
                    }
                  />

                  <input
                    placeholder="Warranty Renewal"
                    type="number"
                    value={inst.warrantyRenewalCost}
                    onChange={(e) =>
                      handleChange(index, "warrantyRenewalCost", e.target.value)
                    }
                  />

                  <input
                    placeholder="Insurance Cost"
                    type="number"
                    value={inst.insuranceCost}
                    onChange={(e) =>
                      handleChange(index, "insuranceCost", e.target.value)
                    }
                  />
                </div>

              </div>
            )}

          </div>
        ))}

      </div>

      {/* ACTIONS */}
      <div className="form-actions">
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Create Instances"}
        </button>
      </div>

    </div>
  );
};

export default CreateInstances;