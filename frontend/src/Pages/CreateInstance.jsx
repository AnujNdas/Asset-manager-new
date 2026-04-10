// src/pages/CreateInstances.jsx

import React, { useEffect, useState } from "react";
import "../Page_styles/CreateInstance.css";
import { useParams } from "react-router-dom";
import {
  getLocations,
  createAssetInstances,
  getAssetById,
} from "../Services/ApiServices";
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
  "CNY",
];
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

    // shared
    purchaseCost: "",
    currency: "INR",
    vendor: "",

    // hardware
    modelNo: "",
    specifications: "",
    warrantyDate: "",
    installationDate: "",
    insurancePolicyId: "",
    insuranceExpiry: "",
    maintenanceCost: "",
    warrantyRenewalCost: "",
    insuranceCost: "",

    // ✅ software
    licenseKey: "",
    licenseNumber: "",
    purchaseDate: "",
    renewalDate: "",
    lastUsedDate: "",
    renewalCost: "",
  });

  const isHardware = asset?.assetType === "hardware";
  const isSoftware = asset?.assetType === "software";

  const fieldLabels = {
    modelNo: isHardware ? "Model No" : "License Key",
    specifications: isHardware ? "Specifications" : "Version & Details",
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
        getLocations(),
      ]);

      setAsset(assetData);
      const assetDOE = assetData?.DOE ? assetData.DOE.split("T")[0] : null;

      const assetPurchaseDate = assetData?.purchaseDetails?.purchaseDate
        ? assetData.purchaseDetails.purchaseDate.split("T")[0]
        : null;
      setAsset({
        ...assetData,
        assetDOE,
        assetPurchaseDate,
      });
      setLocations(locationData.data);

      const rows = Array.from(
        { length: assetData.pendingInstances || 0 },
        () => ({
          serialNumber: "",
          condition: "new",
          location: "",

          modelNo: "",
          specifications: "",

          purchaseCost: "",
          currency: "INR",

          // hardware
          warrantyDate: "",
          installationDate: "",
          insurancePolicyId: "",
          insuranceExpiry: "",
          maintenanceCost: "",
          warrantyRenewalCost: "",
          insuranceCost: "",

          // ✅ software (FULL INIT)
          licenseKey: "",
          licenseNumber: "",
          vendor: "",
          purchaseDate: "",
          installationDate: "",
          renewalDate: "",
          lastUsedDate: "",
          renewalCost: "",
        }),
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
        installationDate: bulkValues.installationDate || inst.installationDate,
        insurancePolicyId:
          bulkValues.insurancePolicyId || inst.insurancePolicyId,
        insuranceExpiry: bulkValues.insuranceExpiry || inst.insuranceExpiry,
        maintenanceCost: bulkValues.maintenanceCost || inst.maintenanceCost,
        warrantyRenewalCost:
          bulkValues.warrantyRenewalCost || inst.warrantyRenewalCost,
        insuranceCost: bulkValues.insuranceCost || inst.insuranceCost,
      }),
      ...(isSoftware && {
        licenseKey: bulkValues.licenseKey || inst.licenseKey,
        licenseNumber: bulkValues.licenseNumber || inst.licenseNumber,
        vendor: bulkValues.vendor || inst.vendor,

        purchaseDate: bulkValues.purchaseDate || inst.purchaseDate,
        installationDate: bulkValues.installationDate || inst.installationDate,
        renewalDate: bulkValues.renewalDate || inst.renewalDate,
        lastUsedDate: bulkValues.lastUsedDate || inst.lastUsedDate,

        renewalCost: bulkValues.renewalCost || inst.renewalCost,
      }),
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
      if (asset?.assetDOE) {
        if (inst.renewalDate && inst.renewalDate > asset.assetDOE) {
          rowErrors.renewalDate = "Exceeds asset expiry";
        }

        if (inst.warrantyDate && inst.warrantyDate > asset.assetDOE) {
          rowErrors.warrantyDate = "Exceeds asset expiry";
        }

        if (inst.insuranceExpiry && inst.insuranceExpiry > asset.assetDOE) {
          rowErrors.insuranceExpiry = "Exceeds asset expiry";
        }

        if (Object.keys(rowErrors).length > 0) {
          newErrors[index] = rowErrors;
        }
      }

      if (asset?.assetPurchaseDate) {
        if (inst.purchaseDate && inst.purchaseDate < asset.assetPurchaseDate) {
          rowErrors.purchaseDate = "Before asset purchase date";
        }
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
            location: formatLocation(inst.location),

            software: {
              licenseKey: inst.licenseKey || "",
              licenseNumber: inst.licenseNumber || "",
              vendor: inst.vendor || "",

              purchaseDate: inst.purchaseDate || null,
              installationDate: inst.installationDate || null,
              renewalDate: inst.renewalDate || null,
              lastUsedDate: inst.lastUsedDate || null,

              purchaseCost: inst.purchaseCost
                ? {
                    amount: Number(inst.purchaseCost),
                    currency: inst.currency || "INR",
                  }
                : null,

              costs: {
                renewalCost: Number(inst.renewalCost) || 0,
              },
            },
          };
        }

        return {
          serialNumber: inst.serialNumber || undefined,
          condition: inst.condition || "new",
          location: formatLocation(inst.location),

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
                  currency: inst.currency || "INR",
                }
              : null,

            costs: {
              maintenanceCost: Number(inst.maintenanceCost) || 0,
              warrantyRenewalCost: Number(inst.warrantyRenewalCost) || 0,
              insuranceCost: Number(inst.insuranceCost) || 0,
            },
          },
        };
      });

      await createAssetInstances({
        assetId,
        instances: payload,
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
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ASSET INFO */}
      {asset && (
        <div className="asset-info">
          <h3>
            {asset.assetName}{" "}
            <span className="type-badge">{asset.assetType.toUpperCase()}</span>
          </h3>
          <p>{asset.assetCode}</p>
        </div>
      )}

      {/* BULK APPLY */}
      <div className="bulk-panel">
        <h4>Bulk Apply</h4>

        <div className="bulk-grid">
          <div className="form-group">
            <label>Location</label>
          <input
            value={bulkValues.location}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                location: e.target.value,
              })
            }
          />
          </div>
          <div className="form-group">
            <label>Condition</label>
          <select
            value={bulkValues.condition}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                condition: e.target.value,
              })
            }
          >
            <option value="">Condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
          </select>
          </div>

          <div className="form-group">
            <label>Purchase Cost</label>
          <input
            type="number"
            placeholder="Purchase Cost"
            value={bulkValues.purchaseCost}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                purchaseCost: e.target.value,
              })
            }
          />
          </div>

         
          <div className="form-group">
            <label>Specification</label>
          <input
            placeholder={fieldLabels.specifications}
            value={bulkValues.specifications}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                specifications: e.target.value,
              })
            }
          />
          </div>
            <div className="form-group">
              <label>Currency</label>
           <select
            value={bulkValues.currency}
            onChange={(e) =>
              setBulkValues({
                ...bulkValues,
                currency: e.target.value,
              })
            }
          >
            {currencyOptions.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
          </div>

          {isHardware && (
            <>
                          <div className="form-group">
            
              <label>Warranty Date</label>
              <input
                type="date"
                value={bulkValues.warrantyDate}
                max={asset?.assetDOE || undefined}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    warrantyDate: e.target.value,
                  })
                }
              />
              </div>
                            <div className="form-group">
              <label>Installation Date</label>
              <input
                type="date"
                value={bulkValues.installationDate}
                min={asset?.assetDOP || undefined}
                max={asset?.assetDOE || undefined}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    installationDate: e.target.value,
                  })
                }
              />
              </div>
                            <div className="form-group">
                              <label>Insurance Policy ID</label>
              <input
                placeholder="Insurance Policy"
                value={bulkValues.insurancePolicyId}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    insurancePolicyId: e.target.value,
                  })
                }
              />
              </div>
                            <div className="form-group">
              <label>Insurance Expiry</label>
              <input
                type="date"
                value={bulkValues.insuranceExpiry}
                max={asset?.assetDOE || undefined}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    insuranceExpiry: e.target.value,
                  })
                }
              />
              </div>
              <div className="form-group">
                <label>Maintenance Cost</label>
              <input
                type="number"
                placeholder="Maintenance Cost"
                value={bulkValues.maintenanceCost}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    maintenanceCost: e.target.value,
                  })
                }
              />
              </div>
              <div className="form-group">
                <label>Warranty Renewal Cost</label>
              <input
                type="number"
                placeholder="Warranty Renewal"
                value={bulkValues.warrantyRenewalCost}
                max={asset?.assetDOE || undefined}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    warrantyRenewalCost: e.target.value,
                  })
                }
              />
              </div>
              <div className="form-group">
              <label>Insurance Cost</label>
              <input
                type="number"
                placeholder="Insurance Cost"
                value={bulkValues.insuranceCost}
                onChange={(e) =>
                  setBulkValues({
                    ...bulkValues,
                    insuranceCost: e.target.value,
                  })
                }
              />
              </div>
            </>
          )}
          {isSoftware && (
            <>
              {/* <div className="form-group">
      <label>License Key</label>
      <input
        value={bulkValues.licenseKey}
        onChange={(e) =>
          setBulkValues({ ...bulkValues, licenseKey: e.target.value })
        }
      />
    </div> */}

              <div className="form-group">
                <label>License Number</label>
                <input
                  value={bulkValues.licenseNumber}
                  onChange={(e) =>
                    setBulkValues({
                      ...bulkValues,
                      licenseNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  value={bulkValues.purchaseDate}
                  min={asset?.assetDOP || undefined}
                  max={asset?.assetDOE || undefined}
                  onChange={(e) =>
                    setBulkValues({
                      ...bulkValues,
                      purchaseDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Installation Date</label>
                <input
                  type="date"
                  value={bulkValues.installationDate}
                  max={asset?.assetDOE || undefined}
                  onChange={(e) =>
                    setBulkValues({
                      ...bulkValues,
                      installationDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Renewal Date</label>
                <input
                  type="date"
                  value={bulkValues.renewalDate}
                  max={asset?.assetDOE || undefined}
                  onChange={(e) =>
                    setBulkValues({
                      ...bulkValues,
                      renewalDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Last Used Date</label>
                <input
                  type="date"
                  value={bulkValues.lastUsedDate}
                  max={asset?.assetDOE || undefined}
                  onChange={(e) =>
                    setBulkValues({
                      ...bulkValues,
                      lastUsedDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Renewal Cost</label>
                <input
                  type="number"
                  value={bulkValues.renewalCost}
                  onChange={(e) =>
                    setBulkValues({
                      ...bulkValues,
                      renewalCost: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}
          <button onClick={applyBulkValues}>Apply to All</button>
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
            <h2 style={{ color: "#2563eb", fontSize: "12px", padding: "5px" }}>
              {" "}
              Instance {index + 1}{" "}
            </h2>
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

              <input
                placeholder={fieldLabels.modelNo}
                value={isSoftware ? inst.licenseKey : inst.modelNo}
                onChange={(e) =>
                  handleChange(
                    index,
                    isSoftware ? "licenseKey" : "modelNo",
                    e.target.value,
                  )
                }
              />

              <button onClick={() => toggleExpand(index)}>
                {expandedRow === index ? "−" : "+"}
              </button>
            </div>

            {expandedRow === index && (
              <div className="expand-panel">
                {(asset?.assetPurchaseDate || asset?.assetDOE) && (
                  <p className="hint" style={{ color: "red" }}>
                    Dates must be between {asset?.assetPurchaseDate || "—"} and{" "}
                    {asset?.assetDOE || "—"}
                  </p>
                )}
                <textarea
                  placeholder={fieldLabels.specifications}
                  value={inst.specifications}
                  onChange={(e) =>
                    handleChange(index, "specifications", e.target.value)
                  }
                />

                {isHardware && (
                  <>
                    <div className="grid-3">
                      <div>
                        <label>Warranty Date</label>
                        <input
                          type="date"
                          value={inst.warrantyDate}
                          max={asset?.assetDOE || undefined}
                          onChange={(e) =>
                            handleChange(index, "warrantyDate", e.target.value)
                          }
                        />
                        {errors[index]?.warrantyDate && (
                          <span className="error">
                            {errors[index].warrantyDate}
                          </span>
                        )}
                      </div>
                      <div>
                        <label>Purchase Cost</label>
                      <input
                        type="number"
                        value={inst.purchaseCost}
                        onChange={(e) =>
                          handleChange(index, "purchaseCost", e.target.value)
                        }
                      />
                      {errors[index]?.purchaseCost && (
                        <span className="error">
                          {errors[index].purchaseCost}
                        </span>
                      )}
                      </div>
                      <div>
                        <label>Currency</label>
                      <select
                        value={inst.currency}
                        onChange={(e) =>
                          handleChange(index, "currency", e.target.value)
                        }
                      >
                        {currencyOptions.map((cur) => (
                          <option key={cur} value={cur}>
                            {cur}
                          </option>
                        ))}
                      </select>
                      </div>
                      <div>
                        <label>Installation Date</label>

                        <input
                          type="date"
                          value={inst.installationDate}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "installationDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                          <div>
                            <label>Insurance Id</label>
                      <input
                        value={inst.insurancePolicyId}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "insurancePolicyId",
                            e.target.value,
                          )
                        }
                      />
                          </div>
                      <div>
                        <label>Insurance Expiry</label>
                        <input
                          type="date"
                          value={inst.insuranceExpiry}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "insuranceExpiry",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid-3">
                      <div>
                        <label>Maintenance Cost</label>
                      <input
                        type="number"
                        value={inst.maintenanceCost}
                        onChange={(e) =>
                          handleChange(index, "maintenanceCost", e.target.value)
                        }
                      />
                      </div>
                      <div>
                        <label>Warranty Renewal Cost</label>
                      <input
                        type="number"
                        value={inst.warrantyRenewalCost}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "warrantyRenewalCost",
                            e.target.value,
                          )
                        }
                      />
                      </div>
                        <div>
                          <label>Insurance Cost</label>
                      <input
                        type="number"
                        value={inst.insuranceCost}
                        onChange={(e) =>
                          handleChange(index, "insuranceCost", e.target.value)
                        }
                      />
                        </div>
                    </div>
                  </>
                )}
                {isSoftware && (
                  <>
                    <div className="grid-3">
                      <div>
                        <label>License Number</label>
                      <input
                        placeholder="License Number"
                        value={inst.licenseNumber || ""}
                        onChange={(e) =>
                          handleChange(index, "licenseNumber", e.target.value)
                        }
                      />
                      </div>
                    </div>

                    <div className="grid-3">
                      <div>
                        <label>Purchase Date</label>
                        <input
                          type="date"
                          value={inst.purchaseDate}
                          min={asset?.assetPurchaseDate || undefined}
                          max={asset?.assetDOE || undefined}
                          onChange={(e) =>
                            handleChange(index, "purchaseDate", e.target.value)
                          }
                        />
                        {errors[index]?.purchaseDate && (
                          <span className="error">
                            {errors[index].purchaseDate}
                          </span>
                        )}
                      </div>
                      <div>
                        <label>Installation Date</label>
                        <input
                          type="date"
                          value={inst.installationDate}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "installationDate",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label>Renewal Date</label>
                        <input
                          type="date"
                          value={inst.renewalDate}
                          max={asset?.assetDOE || undefined}
                          min={asset?.assetPurchaseDate || undefined}
                          onChange={(e) =>
                            handleChange(index, "renewalDate", e.target.value)
                          }
                        />
                        {errors[index]?.renewalDate && (
                          <span className="error">
                            {errors[index].renewalDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid-3">
                      <div>
                        <label>Last Used Date</label>
                        <input
                          type="date"
                          value={inst.lastUsedDate}
                          onChange={(e) =>
                            handleChange(index, "lastUsedDate", e.target.value)
                          }
                        />
                      </div>

                      <input
                        type="number"
                        placeholder="Purchase Cost"
                        value={inst.purchaseCost}
                        onChange={(e) =>
                          handleChange(index, "purchaseCost", e.target.value)
                        }
                      />
                      <select
                        className="dropdown-select"
                        value={inst.currency}
                        onChange={(e) =>
                          handleChange(index, "currency", e.target.value)
                        }
                      >
                        {currencyOptions.map((cur) => (
                          <option key={cur} value={cur}>
                            {cur}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Renewal Cost"
                        value={inst.renewalCost}
                        onChange={(e) =>
                          handleChange(index, "renewalCost", e.target.value)
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
