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

  purchaseCost: "",
  currency: "INR",
  vendor: "",

  warrantyDate: "",
  installationDate: "",
  insurancePolicyId: "",
  insuranceExpiry: "",
  maintenanceCost: "",
  warrantyRenewalCost: "",
  insuranceCost: ""
});

  const isHardware = asset?.assetType === "hardware";
  const isSoftware = asset?.assetType === "software";

  const fieldLabels = {
    modelNo: isHardware ? "Model No" : "License No",
    specifications: isHardware ? "Specifications" : "Version & Details"
  };

  const total = asset?.assetQuantity || 0;
  const pending = asset?.pendingInstances || 0;
  const created = total - pending;
  const progress = total > 0 ? (created / total) * 100 : 0;

  useEffect(() => {
    fetchData();
  }, []);
  const formatLocation = (loc) =>
  loc.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  const fetchData = async () => {
    try {
      setLoading(true);

      const [assetData, locationData] = await Promise.all([
        getAssetById(assetId),
        getLocations()
      ]);

      setAsset(assetData);
      setLocations(locationData.data);

     const rows = Array.from(
  { length: assetData.pendingInstances || 0 },
  () => ({
    serialNumber: "",
    condition: "new",
    location: "",

    modelNo: "",
    specifications: "",

    // 🔥 NEW
    purchaseCost: "",
    currency: "INR",

    warrantyDate: "",
    installationDate: "",
    insurancePolicyId: "",
    insuranceExpiry: "",

    maintenanceCost: "",
    warrantyRenewalCost: "",
    insuranceCost: "",

    // software
    renewalDate: "",
    vendor: ""
  })
);

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

    purchaseCost: bulkValues.purchaseCost || inst.purchaseCost,
    currency: bulkValues.currency || inst.currency,
    vendor: bulkValues.vendor || inst.vendor,

    ...(isHardware && {
      warrantyDate: bulkValues.warrantyDate || inst.warrantyDate,
      installationDate:
        bulkValues.installationDate || inst.installationDate,
      insurancePolicyId:
        bulkValues.insurancePolicyId || inst.insurancePolicyId,
      insuranceExpiry:
        bulkValues.insuranceExpiry || inst.insuranceExpiry,
      maintenanceCost:
        bulkValues.maintenanceCost || inst.maintenanceCost,
      warrantyRenewalCost:
        bulkValues.warrantyRenewalCost ||
        inst.warrantyRenewalCost,
      insuranceCost:
        bulkValues.insuranceCost || inst.insuranceCost
    })
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

    if (!inst.location || !inst.location.trim()) {
      rowErrors.location = "Location is required";
    }

    if (!inst.purchaseCost) {
      rowErrors.purchaseCost = "Cost required";
    }

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

const payload = instances.map((inst) => {
  if (isSoftware) {
    return {
      location: normalizeLocation(inst.location),

      software: {
        licenseKey: inst.modelNo || "",
        licenseNumber: inst.modelNo || "",
        vendor: inst.vendor || "",

        purchaseDate: null,
        installationDate: null,
        renewalDate: inst.renewalDate || null,

        purchaseCost: inst.purchaseCost
          ? {
              amount: Number(inst.purchaseCost),
              currency: inst.currency || "INR"
            }
          : null,

        costs: {
          renewalCost: Number(inst.renewalCost) || 0
        }
      }
    };
  }

  return {
    serialNumber: inst.serialNumber || undefined,
    condition: inst.condition || "new",
    location: normalizeLocation(inst.location),

    hardware: {
      modelNo: inst.modelNo || "",
      specifications: inst.specifications || "",

      purchaseDate: null,
      installationDate: inst.installationDate || null,
      vendor: inst.vendor || "",

      warrantyExpiry: inst.warrantyDate || null,
      insuranceExpiry: inst.insuranceExpiry || null,
      insuranceId: inst.insurancePolicyId || "",

      purchaseCost: inst.purchaseCost
        ? {
            amount: Number(inst.purchaseCost),
            currency: inst.currency || "INR"
          }
        : null,

      costs: {
        maintenanceCost: Number(inst.maintenanceCost) || 0,
        warrantyRenewalCost:
          Number(inst.warrantyRenewalCost) || 0,
        insuranceCost: Number(inst.insuranceCost) || 0
      }
    }
  };
});

      await createAssetInstances({
        assetId,
        instances: payload
      });

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
          <span>
            {created} / {total}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ASSET INFO */}
      {asset && (
        <div className="asset-info">
          <h3>
            {asset.assetName}{" "}
            <span className="type-badge">
              {asset.assetType.toUpperCase()}
            </span>
          </h3>
          <p>{asset.assetCode}</p>
        </div>
      )}

      {/* BULK APPLY */}
      <div className="bulk-panel">
        <h4>Bulk Apply</h4>

        <div className="bulk-grid">
<div className="input-group">
  <input
    type="text"
    placeholder="Enter location"
    value={inst.location}
    onChange={(e) =>
      handleChange(index, "location", e.target.value)
    }
  />

  {errors[index]?.location && (
    <span className="error">{errors[index].location}</span>
  )}
</div>  
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
            placeholder={fieldLabels.modelNo}
            value={bulkValues.modelNo}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                modelNo: e.target.value
              })
            }
          />

          <input
            placeholder={fieldLabels.specifications}
            value={bulkValues.specifications}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                specifications: e.target.value
              })
            }
          />

          {isHardware && (
            <>
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

              <input
                type="date"
                value={bulkValues.installationDate}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    installationDate: e.target.value
                  })
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
            </>
          )}

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
          <span>{fieldLabels.modelNo}</span>
          <span>Expand</span>
        </div>

        {instances.map((inst, index) => (
          <div key={index}>
            <div className="table-row">
              <input
                value={inst.serialNumber}
                placeholder="Serial"
                onChange={(e) =>
                  handleChange(
                    index,
                    "serialNumber",
                    e.target.value
                  )
                }
              />

              <select
                value={inst.condition}
                onChange={(e) =>
                  handleChange(
                    index,
                    "condition",
                    e.target.value
                  )
                }
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="damaged">Damaged</option>
              </select>

              <input
  type="text"
  placeholder="Enter location"
  value={inst.location}
  onChange={(e) =>
    handleChange(index, "location", e.target.value)
  }
/>

              <input
                value={inst.modelNo}
                placeholder={fieldLabels.modelNo}
                onChange={(e) =>
                  handleChange(
                    index,
                    "modelNo",
                    e.target.value
                  )
                }
              />

              <button onClick={() => toggleExpand(index)}>
                {expandedRow === index ? "−" : "+"}
              </button>
            </div>

            {expandedRow === index && (
              <div className="expand-panel">
                <textarea
                  placeholder={fieldLabels.specifications}
                  value={inst.specifications}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "specifications",
                      e.target.value
                    )
                  }
                />

                {isHardware && (
                  <>
                    <div className="grid-3">
                      <input  
                        type="date"
                        value={inst.warrantyDate}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "warrantyDate",
                            e.target.value
                          )
                        }
                      />
                    <input
  type="number"
  placeholder="Purchase Cost"
  value={inst.purchaseCost}
  onChange={(e) =>
    handleChange(index, "purchaseCost", e.target.value)
  }
/>
{errors[index]?.purchaseCost && (
  <span className="error">{errors[index].purchaseCost}</span>
)}

<select
  value={inst.currency}
  onChange={(e) =>
    handleChange(index, "currency", e.target.value)
  }
>
  <option value="INR">INR</option>
  <option value="USD">USD</option>
</select>
                      <input
                        type="date"
                        value={inst.installationDate}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "installationDate",
                            e.target.value
                          )
                        }
                      />

                      <input
                        placeholder="Insurance Policy"
                        value={inst.insurancePolicyId}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "insurancePolicyId",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="date"
                        value={inst.insuranceExpiry}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "insuranceExpiry",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="grid-3">
                      <input
                        type="number"
                        placeholder="Maintenance Cost"
                        value={inst.maintenanceCost}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "maintenanceCost",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="number"
                        placeholder="Warranty Renewal"
                        value={inst.warrantyRenewalCost}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "warrantyRenewalCost",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="number"
                        placeholder="Insurance Cost"
                        value={inst.insuranceCost}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "insuranceCost",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Create Instances"}
        </button>
      </div>
    </div>
  );
};

export default CreateInstances;