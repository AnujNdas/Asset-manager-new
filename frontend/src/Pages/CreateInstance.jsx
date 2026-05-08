    // src/pages/CreateInstances.jsx

    import React, { useEffect, useState } from "react";
    import "../Page_styles/CreateInstance.css";
    import { useParams , useNavigate } from "react-router-dom";
    import * as XLSX from "xlsx";
    import {
      getLocations,
      createAssetInstances,
      getAssetById,
      bulkUploadInstances
    } from "../Services/ApiServices";
    import Select from "react-select";
    import ThemeSwal from "../utils/SwalTheme";
    import { getErrorMessage } from "../utils/getErrorMessage";
    import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
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
    const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#222831",
    borderColor: state.isFocused ? "#DFD0B8" : "#393E46",
    boxShadow: "none",
    color: "#DFD0B8",
    minHeight: "42px",
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "#222831",
    border: "1px solid #393E46",
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "#393E46"
      : state.isSelected
      ? "#DFD0B8"
      : "#222831",
    color: state.isSelected ? "#000" : "#DFD0B8",
    cursor: "pointer",
  }),

  multiValue: (base) => ({
    ...base,
    backgroundColor: "#393E46",
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: "#DFD0B8",
  }),

  multiValueRemove: (base) => ({
    ...base,
    color: "#DFD0B8",
    ":hover": {
      backgroundColor: "#ff4d4f",
      color: "white",
    },
  }),

  singleValue: (base) => ({
    ...base,
    color: "#DFD0B8",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#888",
  }),
};
    const coverageOptions = [
      { label: "Comprehensive", value: "comprehensive" },
      { label: "Accidental Damage", value: "accidental_damage" },
      { label: "Third Party", value: "third_party" },
      { label: "Theft & Burglary", value: "theft_burglary" },
      { label: "Fire & Lightning", value: "fire_lightning" },
      { label: "Natural Disasters", value: "natural_disasters" },
      { label: "Vandalism", value: "vandalism" },
      { label: "Business Interruption", value: "business_interruption" },
      { label: "Transit / Marine Cargo", value: "transit_marine_cargo" },
      { label: "Cyber-Physical Damage", value: "cyber_physical_damage" },
      { label: "Electrical Surge", value: "electrical_surge" },
      { label: "Mechanical Breakdown", value: "mechanical_breakdown" },
      { label: "Other", value: "other" },
      { label: "None", value: "none" }
    ];
    const CreateInstances = () => {
        const { registerTour } = useTour();
      const downloadTemplate = (type) => {
    let data = [];

  if (type === "hardware") {
    data = [
      {
        deviceName: "Optional",
        location: "Required",
        condition: "new/used/damaged",
        modelNo: "Optional",
        specifications: "Optional",
        purchaseDate: "YYYY-MM-DD",
        installationDate: "YYYY-MM-DD",
        warrantyPurchaseDate: "YYYY-MM-DD",
        warrantyExpiry: "YYYY-MM-DD",
        hasInsurance: "true/false",
        insuranceId: "Optional",
        insurancePurchaseDate: "YYYY-MM-DD",
        insuranceTerm: "6_months / 1_year / 3_years",
        coverageType: "comma separated (e.g. comprehensive,fire_lightning)",
        nextMaintenanceDate: "YYYY-MM-DD",
        purchaseCost: "Number",
        currency: "INR/USD/etc",
        maintenanceCost: "Number",
        warrantyRenewalCost: "Number",
        insuranceCost: "Number",
      },
    ];
  } else {
      data = [
        {
          deviceName: "Optional",
          location: "New York",
          condition: "new",
          licenseKey: "XXXX-YYYY-ZZZZ",
          licenseNumber: "LIC-001",
          purchaseDate: "2026-01-01",
          installationDate: "2026-01-02",
          renewalDate: "2027-01-01",
          lastUsedDate: "2026-04-01",
          purchaseCost: 10000,
          currency: "USD",
          renewalCost: 2000,
        },
      ];
    }

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: Object.keys(data[0]),
  });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      type === "hardware" ? "Hardware Template" : "Software Template"
    );

    XLSX.writeFile(
      workbook,
      type === "hardware"
        ? "hardware_instances_template.xlsx"
        : "software_instances_template.xlsx"
    );
  };
      const { assetId } = useParams();
      const navigate = useNavigate();
      const [asset, setAsset] = useState(null);
      const [locations, setLocations] = useState([]);
      const [instances, setInstances] = useState([]);
      const [expandedRow, setExpandedRow] = useState(null);
      const [loading, setLoading] = useState(false);
      const [errors, setErrors] = useState({});
      const [file, setFile] = useState(null);
      const [bulkValues, setBulkValues] = useState({
        location: "",
        condition: "",
        deviceName: "",
        // shared
        purchaseCost: "",
        currency: "USD",
        vendor: "",
        purchaseDate: "",

        // hardware
        modelNo: "",
        specifications: "",
        warrantyDate: "",
        installationDate: "",
        hasInsurance: false, // ✅ ADD THIS
        insurancePolicyId: "",
        coverageType: ["comprehensive"],
        maintenanceCost: "",
        warrantyRenewalCost: "",
        insuranceCost: "",
        // 🔹 hardware additions

    warrantyPurchaseDate: "",
    insurancePurchaseDate: "",
    insuranceTerm: "1_year", // if you're using term
      nextMaintenanceDate: "", // ✅ ADD THIS
        // ✅ software
        licenseKey: "",
        licenseNumber: "",
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
          console.log("Asset Data:", assetData);
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
              condition: "new",
              location: "",
              deviceName: "",
              modelNo: "",
              specifications: "",

              purchaseCost: "",
              currency: "USD",

              // hardware
              warrantyDate: "",
              installationDate: "",
              hasInsurance: false, // ✅ ADD THIS
              insurancePolicyId: "",
              maintenanceCost: "",
              warrantyRenewalCost: "",
              insuranceCost: "",
              coverageType: ["comprehensive"],
                nextMaintenanceDate: "", // ✅ ADD THIS
              // 🔹 hardware additions
              purchaseDate: "",
    warrantyPurchaseDate: "",
    insurancePurchaseDate: "",
    insuranceTerm: "1_year", // if you're using term
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
        }catch (err) {
  console.error("Fetch error:", err);
  ThemeSwal.fire("Error", getErrorMessage(err, "Failed to load asset data"), "error");
} finally {
          setLoading(false);
        }
      };

      const handleChange = (index, field, value) => {
        const updated = [...instances];
        updated[index][field] = value;
        setInstances(updated);
      };
      const handleFileUpload = (e) => {
      setFile(e.target.files[0]);
    };

      const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
  
      overlayColor: "rgba(0,0,0,0.75)",
  
      popoverClass: "custom-driver-popover",
  
      steps: [
                {
          element: ".tour-progress",
          popover: {
            title: "Progress",
            description:
              "Shows Progress of how many instances created yet.",
            side: "bottom",
          },
        },
        {
          element: ".tour-info",
          popover: {
            title: "Asset Information",
            description: "Contains Main asset Information.",
            side: "bottom",
            align: "start",
          },
        },
  
        {
          element: ".tour-import",
          popover: {
            title: "Import Button",
            description:
              "Import instances for the asset.",
            side: "bottom",
          },
        },
        {
          element: ".tour-template",
          popover: {
            title: "Download template",
            description:
              "Download and see the format before importing ...",
            side: "bottom",
          },
        },

        {
          element: ".tour-bulk",
          popover: {
            title: "Bulk input area",
            description:
              "After filling the input fields click on the apply to all button.",
            side: "bottom",
          },
        },
        {
          element: ".tour-create",
          popover: {
            title: "Create Button",
            description:
              "Click to create instances.",
            side: "bottom",
          },
        },
      ],
    });
  
    useEffect(() => {
      const seen = localStorage.getItem("inventoryTourSeen");
    
      if (!seen) {
        setTimeout(() => {
          driverObj.drive();
    
          localStorage.setItem(
            "inventoryTourSeen",
            "true"
          );
        }, 1000);
      }
    }, []);
    useEffect(() => {
    registerTour(driverObj);
  }, []);


  const handleImport = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    setLoading(true);

    try {
      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "", // prevents undefined
      });

      const payload = jsonData.map((row) => ({
        deviceName: row.deviceName || "",

        location: formatLocation(row.location),

        condition: row.condition || "new",

        ...(isHardware && {
          hardware: {
            modelNo: row.modelNo || "",
            specifications: row.specifications || "",

            purchaseDate: row.purchaseDate || null,
            installationDate: row.installationDate || null,
            
            warrantyPurchaseDate:
              row.warrantyPurchaseDate || null,
            warrantyExpiry: row.warrantyExpiry || null,
...(row.hasInsurance === "true" || row.hasInsurance === true
  ? {
      insuranceId: row.insuranceId || "",
      insurancePurchaseDate: row.insurancePurchaseDate || null,
      insuranceTerm: row.insuranceTerm || "1_year",
      coverageType: row.coverageType
        ? row.coverageType.split(",")
        : ["comprehensive"],
    }
  : {}),
            nextMaintenanceDate:
              row.nextMaintenanceDate || null,

            purchaseCost: row.purchaseCost
              ? {
                  amount: Number(row.purchaseCost),
                  currency: row.currency || "INR",
                }
              : null,

            costs: {
              maintenanceCost:
                Number(row.maintenanceCost) || 0,
              warrantyRenewalCost:
                Number(row.warrantyRenewalCost) || 0,
              insuranceCost:
                Number(row.insuranceCost) || 0,
            },
          },
        }),

        ...(isSoftware && {
          software: {
            licenseKey: row.licenseKey || "",
            licenseNumber: row.licenseNumber || "",

            purchaseDate: row.purchaseDate || null,
            installationDate: row.installationDate || null,
            renewalDate: row.renewalDate || null,
            lastUsedDate: row.lastUsedDate || null,

            purchaseCost: row.purchaseCost
              ? {
                  amount: Number(row.purchaseCost),
                  currency: row.currency || "INR",
                }
              : null,

            costs: {
              renewalCost: Number(row.renewalCost) || 0,
            },
          },
        }),
      }));

      const res = await bulkUploadInstances({
        assetId,
        instances: payload,
      });

if (res.success) {
  const inserted = res.inserted ?? res.data?.inserted ?? 0;
  const skipped = res.skipped ?? res.data?.skipped ?? 0;

  // ✅ update progress instantly
  setAsset((prev) => ({
    ...prev,
    pendingInstances: Math.max(
      0,
      (prev?.pendingInstances || 0) - inserted
    ),
  }));

  // ✅ remove created rows from UI
  setInstances((prev) =>
    prev.slice(inserted)
  );

  ThemeSwal.fire(
    "Success",
    `✅ ${inserted} imported, ${skipped} skipped`,
    "success"
  );
} else {
  ThemeSwal.fire("Error", res.message || "Import failed", "error");
}
    } catch (err) {
  console.error("Import error:", err);
  ThemeSwal.fire("Error", getErrorMessage(err, "Failed to import Excel file"), "error");
} finally {
      setLoading(false);
    }
  };
      const applyBulkValues = () => {
        const updated = instances.map((inst) => ({
          ...inst,
          location: bulkValues.location || inst.location,
          condition: bulkValues.condition || inst.condition,
          modelNo: bulkValues.modelNo || inst.modelNo,
          specifications: bulkValues.specifications || inst.specifications,
          deviceName: bulkValues.deviceName || inst.deviceName,
          purchaseCost: bulkValues.purchaseCost || inst.purchaseCost,
          currency: bulkValues.currency || inst.currency,
          vendor: bulkValues.vendor || inst.vendor,

        ...(isHardware && {
          purchaseDate: bulkValues.purchaseDate || inst.purchaseDate,
      warrantyDate: bulkValues.warrantyDate || inst.warrantyDate,
      warrantyPurchaseDate:
        bulkValues.warrantyPurchaseDate || inst.warrantyPurchaseDate,

      installationDate: bulkValues.installationDate || inst.installationDate,
      hasInsurance:
  bulkValues.hasInsurance ?? inst.hasInsurance,
         coverageType: inst.coverageType || ["comprehensive"],
      insurancePolicyId:
        bulkValues.insurancePolicyId || inst.insurancePolicyId,

      insurancePurchaseDate:
        bulkValues.insurancePurchaseDate || inst.insurancePurchaseDate,

      insuranceTerm:
        bulkValues.insuranceTerm || inst.insuranceTerm,

      maintenanceCost: bulkValues.maintenanceCost || inst.maintenanceCost,
        nextMaintenanceDate:
        bulkValues.nextMaintenanceDate || inst.nextMaintenanceDate, // ✅ ADD
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

if (!inst.purchaseCost || isNaN(Number(inst.purchaseCost))) {
  rowErrors.purchaseCost = "Valid cost required";
}

if (isSoftware && !inst.licenseNumber) {
  rowErrors.licenseNumber = "License number required";
}
                      if (asset?.assetPurchaseDate) {
                        if (inst.purchaseDate && inst.purchaseDate < asset.assetPurchaseDate) {
                          rowErrors.purchaseDate = "Before asset purchase date";
                        }
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
                location: formatLocation(inst.location),
                deviceName: inst.deviceName || "",
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
              condition: inst.condition || "new",
              location: formatLocation(inst.location),
              deviceName: inst.deviceName || "",
              hardware: {
                modelNo: inst.modelNo || "",
                specifications: inst.specifications || "",

                purchaseDate: inst.purchaseDate || null,
                installationDate: inst.installationDate || null,
                vendor: inst.vendor || "",
                hasInsurance: inst.hasInsurance,
                warrantyPurchaseDate: inst.warrantyPurchaseDate || null,
    warrantyExpiry: inst.warrantyDate || null,
    coverageType: inst.coverageType?.length
                  ? inst.coverageType
                  : ["comprehensive"],
    insurancePurchaseDate: inst.insurancePurchaseDate || null,
    insuranceTerm: inst.insuranceTerm || "1_year",

    // ❌ DO NOT send insuranceExpiry anymore if backend calculates
                insuranceId: inst.insurancePolicyId || "",
                  nextMaintenanceDate: inst.nextMaintenanceDate || null, // ✅ ADD
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
          console.log("Created instances:", payload);

          ThemeSwal.fire("Success", "Instances created successfully", "success");
          fetchData();
          navigate("/inventory")
        } catch (err) {
  console.error("Create instances error:", err);
  ThemeSwal.fire("Error", getErrorMessage(err, "Failed to create instances"), "error");
}finally {
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
            <div className="progress-bar  tour-progress">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* ASSET INFO */}
          {asset && (
            <div className="asset-info tour-info">
              <div className="details-box">
              <h3>
                {asset.assetName}{" "}
              </h3>
                <span className="type-badge">{asset.locationName.name.toUpperCase()}</span>
                <span className="type-badge">{asset.assetType.toUpperCase()}</span>
              </div>
              <div className="details-box">
              <p>{asset.assetCode}</p>
                <span className="type-badge">{formatDate(asset.purchaseDetails.purchaseDate)}</span>
              </div>
            </div>
          )}
  <div className="import-section">
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={handleFileUpload}
    />
    <div className="import-actions">
    <button onClick={handleImport} className="btn-save tour-import">
      Import Excel
    </button>

    <div>
      {isHardware && (
        <button onClick={() => downloadTemplate("hardware")} className="btn-save tour-template">
          Download Hardware Template
        </button>
      )}

      {isSoftware && (
        <button onClick={() => downloadTemplate("software")} className="btn-save tour-template">
          Download Software Template
        </button>
      )}
      </div>
    </div>
  </div>
          {/* BULK APPLY */}
          <div className="bulk-panel tour-bulk">
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
    <label>Device Name</label>
    <input
      value={bulkValues.deviceName}
      onChange={(e) =>
        setBulkValues({
          ...bulkValues,
          deviceName: e.target.value,
        })
      }
    />
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
      <label>Purchase Date</label>
      <input
        type="date"
        value={bulkValues.purchaseDate}
        min={asset?.assetPurchaseDate || undefined}
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
      <label>Next Maintenance Date</label>
      <input
        type="date"
        value={bulkValues.nextMaintenanceDate}
        min={asset?.assetPurchaseDate || undefined}
        max={asset?.assetDOE || undefined}
        onChange={(e) =>
          setBulkValues({
            ...bulkValues,
            nextMaintenanceDate: e.target.value,
          })
        }
      />
    </div>
                                <div className="form-group">
      <label>Warranty Purchase Date</label>
      <input
        type="date"
        value={bulkValues.warrantyPurchaseDate}
        min={asset?.assetPurchaseDate || undefined}
        max={asset?.assetDOE || undefined}
        onChange={(e) =>
          setBulkValues({
            ...bulkValues,
            warrantyPurchaseDate: e.target.value,
          })
        }
      />
    </div>
                
            <div className="form-group">
                  <label>Warranty Expiry Date</label>
                  <input
                    type="date"
                    value={bulkValues.warrantyDate}
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
    <label>Has Insurance</label>
    <select
      value={bulkValues.hasInsurance}
      onChange={(e) =>
        setBulkValues({
          ...bulkValues,
          hasInsurance: e.target.value === "true",
        })
      }
    >
      <option value="false">No</option>
      <option value="true">Yes</option>
    </select>
  </div>
  {bulkValues.hasInsurance && (
    <>
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
                                            <label>Coverage Type</label>
    <Select
      isMulti
      styles={customSelectStyles}
      className="react-select-container"
      classNamePrefix="react-select"
      options={coverageOptions}
      value={coverageOptions.filter(opt =>
        (bulkValues.coverageType || []).includes(opt.value)
      )}
    onChange={(selected, actionMeta) => {
      let values = selected ? selected.map(s => s.value) : [];

      const lastSelected = actionMeta?.option?.value;

      if (lastSelected === "none") {
        values = ["none"];
      } else {
        values = values.filter(v => v !== "none");
      }

      setBulkValues({
        ...bulkValues,
        coverageType: values,
      });
    }}
    />
    </div>
                  <div className="form-group">
      <label>Insurance Purchase Date</label>
      <input
        type="date"
        value={bulkValues.insurancePurchaseDate}
        min={asset?.assetPurchaseDate || undefined}
        max={asset?.assetDOE || undefined}
        onChange={(e) =>
          setBulkValues({
            ...bulkValues,
            insurancePurchaseDate: e.target.value,
          })
        }
      />
    </div>
    <div className="form-group">
      <label>Insurance Term</label>
      <select
        value={bulkValues.insuranceTerm}
        onChange={(e) =>
          setBulkValues({
            ...bulkValues,
            insuranceTerm: e.target.value,
          })
        }
      >
        <option value="6_months">6 Months</option>
        <option value="1_year">1 Year</option>
        <option value="3_years">3 Years</option>
      </select>
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
    </>)}
                                {/* <div className="form-group">
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
                  </div> */}
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
              <span>Device Name</span>
              <span>Condition</span>
              <span>Location</span>
              <span>{fieldLabels.modelNo}</span>
              <span>Expand</span>
            </div>

            {instances.map((inst, index) => (
              <div key={index}>
                <h2 style={{ color: "#DFD0B8", fontSize: "12px", padding: "5px" , padding : "0px 14px"}}>
                  {" "}
                  Instance {index + 1}{" "}
                </h2>
                <div className="table-row">
<div className="input-group">
  <input
    value={inst.deviceName || ""}
    placeholder="Device Name"
    onChange={(e) =>
      handleChange(index, "deviceName", e.target.value)
    }
  />
  </div>
  <div className="input-group">
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
</div>
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
                    <div>
                      <label>Specifications</label>
                    <textarea
                      placeholder={fieldLabels.specifications}
                      value={inst.specifications}
                      onChange={(e) =>
                        handleChange(index, "specifications", e.target.value)
                      }
                    />
                    </div>
                      <div>
                        <label>Device Name</label>
                        <input
                          value={inst.deviceName || ""}
                          onChange={(e) =>
                            handleChange(index, "deviceName", e.target.value)
                          }
                        />
                      </div>
                    {isHardware && (
                      <>
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
    </div>
    <div>
      <label>Next Maintenance Date</label>
      <input
        type="date"
        value={inst.nextMaintenanceDate}
        min={asset?.assetPurchaseDate || undefined}
        max={asset?.assetDOE || undefined}
        onChange={(e) =>
          handleChange(index, "nextMaintenanceDate", e.target.value)
        }
      />
    </div>
                          <div>
      <label>Warranty Purchase Date</label>
      <input
        type="date"
        value={inst.warrantyPurchaseDate}
        min={asset?.assetPurchaseDate || undefined}
        max={asset?.assetDOE || undefined}
        onChange={(e) =>
          handleChange(index, "warrantyPurchaseDate", e.target.value)
        }
      />
    </div>
                          <div>
                            <label>Warranty Expiry Date</label>
                            <input
                              type="date"
                              value={inst.warrantyDate}
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
    <label>Has Insurance</label>
    <select
      value={inst.hasInsurance}
      onChange={(e) =>
        handleChange(index, "hasInsurance", e.target.value === "true")
      }
    >
      <option value="false">No</option>
      <option value="true">Yes</option>
    </select>
  </div>
  {inst.hasInsurance && (
    <>
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
                                <label>Coverage Type</label>
    <Select
      isMulti
      className="react-select-container"
      classNamePrefix="react-select"
      options={coverageOptions}
      value={coverageOptions.filter(opt =>
        inst.coverageType?.includes(opt.value)
      )}
    onChange={(selected, actionMeta) => {
      let values = selected ? selected.map(s => s.value) : [];

      const lastSelected = actionMeta?.option?.value;

      if (lastSelected === "none") {
        // If user clicked "None" → override everything
        values = ["none"];
      } else {
        // If user selected anything else → remove "none"
        values = values.filter(v => v !== "none");
      }

      handleChange(index, "coverageType", values);
    }}
    />
    </div>
                              <div>
      <label>Insurance Purchase Date</label>
      <input
        type="date"
        value={inst.insurancePurchaseDate}
        min={asset?.assetPurchaseDate || undefined}
        max={asset?.assetDOE || undefined}
        onChange={(e) =>
          handleChange(index, "insurancePurchaseDate", e.target.value)
        }
      />
    </div>
    <div>
      <label>Insurance Term</label>
      <select
        value={inst.insuranceTerm}
        onChange={(e) =>
          handleChange(index, "insuranceTerm", e.target.value)
        }
      >
        <option value="6_months">6 Months</option>
        <option value="1_year">1 Year</option>
        <option value="3_years">3 Years</option>
      </select>
    </div>
                          {/* <div>
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
                          </div> */}
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
                          </>
  )}

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

                            <div>
                              <label>Purchase Cost</label>
                            <input
                            type="number"
                            placeholder="Purchase Cost"
                            value={inst.purchaseCost}
                            onChange={(e) =>
                              handleChange(index, "purchaseCost", e.target.value)
                            }
                          />
                          </div>
                          <div>
                            <label>Currency</label>
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
                          </div>
                            <div>
                              <label>Renewal Cost</label>
                          <input
                            type="number"
                            placeholder="Renewal Cost"
                            value={inst.renewalCost}
                            onChange={(e) =>
                              handleChange(index, "renewalCost", e.target.value)
                            }
                          />
                            </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button onClick={handleSubmit} disabled={loading} className="tour-create">
              {loading ? "Saving..." : "Create Instances"}
            </button>
          </div>
        </div>
      );
    };

    export default CreateInstances;
