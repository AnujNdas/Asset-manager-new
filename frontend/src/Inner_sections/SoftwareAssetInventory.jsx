// ✅ src/Pages/SoftwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSoftwareAssets,
  deleteSoftwareAsset,
  updateSoftwareAsset,
  getCategories,
  getStatuses,
  getUnits,
  getLocations,
  updateAssetInstance,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";
import { useNavigate } from "react-router-dom";
import CurrencyFilter from "../Components/CurrencyFilter";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

const SoftwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editInstance, setEditInstance] = useState(null);
const [instanceForm, setInstanceForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 8;

  const navigate = useNavigate();
  const { currency, convertFromBase, loadingRates } = useCurrency();

  useEffect(() => {
    fetchAll();
  }, []);
  const handleEditOpen = (asset) => {
  setEditAsset(asset);

  setEditForm({
    assetName: asset.assetName,
    assetCategory: asset.assetCategory?._id || asset.assetCategory,
    associateUnit: asset.associateUnit?._id || asset.associateUnit,
    locationName: asset.locationName?._id || asset.locationName,
    assetStatus: asset.assetStatus?._id || asset.assetStatus,
    type: asset.type,

    assetQuantity: asset.assetQuantity,

    assetCost: {
      totalAmount: asset.assetCost?.totalAmount || 0,
      currency: asset.assetCost?.currency || "USD",
    },

    purchaseDate: asset.purchaseDetails?.purchaseDate?.slice(0, 10),

    // SOFTWARE ONLY
    expiryDate: asset.renewal?.expiryDate?.slice(0, 10),
  });
};
const handleInstanceEditOpen = (inst) => {
  setEditInstance(inst);

  setInstanceForm({
    condition: inst.condition,
    location: inst.location,
    installationDate: inst.installationDate?.slice(0, 10),

    // COST
    maintenanceCost: inst.costTracking?.maintenanceCost || 0,
    warrantyRenewalCost: inst.costTracking?.warrantyRenewalCost || 0,
    insuranceCost: inst.costTracking?.insuranceCost || 0,

    // WARRANTY
    warrantyExpiry: inst.warranty?.expiryDate?.slice(0, 10),

    // SOFTWARE ONLY
    licenseKey: inst.software?.licenseKey || "",
    licenseNumber: inst.software?.licenseNumber || "",
    vendor: inst.software?.vendor || "",
  });
};
const getRemainingDays = (date) => {
  if (!date) return "-";

  const today = new Date();
  const target = new Date(date);

  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  return diff > 0 ? diff : "Expired";
};
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };
const handleInstanceUpdate = async () => {
  try {
    await updateAssetInstance(editInstance._id, {
      condition: instanceForm.condition,
      location: instanceForm.location,
      installationDate: instanceForm.installationDate,

      warranty: {
        expiryDate: instanceForm.warrantyExpiry,
      },

      costTracking: {
        maintenanceCost: instanceForm.maintenanceCost,
        warrantyRenewalCost: instanceForm.warrantyRenewalCost,
        insuranceCost: instanceForm.insuranceCost,
      },

      software: editInstance.software
        ? {
            licenseKey: instanceForm.licenseKey,
            licenseNumber: instanceForm.licenseNumber,
            vendor: instanceForm.vendor,
          }
        : undefined,
    });

    Swal.fire("Updated", "Instance updated", "success");
    setEditInstance(null);
    fetchAll();
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};
  const fetchAll = async () => {
    try {
      const [assetsRes, catRes, statRes, unitRes, locRes] =
        await Promise.all([
          getSoftwareAssets(),
          getCategories(),
          getStatuses(),
          getUnits(),
          getLocations(),
        ]);
        console.log("ASSETS RESPONSE:", assetsRes);
      setAssets(assetsRes?.data ?? assetsRes ?? []);
      setCategories(catRes?.data ?? catRes ?? []);
      setStatuses(statRes?.data ?? statRes ?? []);
      setUnits(unitRes?.data ?? unitRes ?? []);
      setLocations(locRes?.data ?? locRes ?? []);

      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      Swal.fire("Error", "Failed to load software assets", "error");
      setLoading(false);
    }
  };

  const getName = (list, value) => {
    if (!value || !Array.isArray(list)) return "N/A";
    const id = typeof value === "object" ? value._id : value;
    const found = list.find((i) => String(i._id) === String(id));
    return found ? found.name : "N/A";
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete software asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!res.isConfirmed) return;

    await deleteSoftwareAsset(id);
    setAssets((p) => p.filter((a) => a._id !== id));
    Swal.fire("Deleted", "Software asset removed", "success");
  };

  const handleAssign = (asset) => {
    navigate("/assignment", {
      state: {
        categoryId: asset.assetCategory,
        assetId: asset._id,
        assetType: "software",
      },
    });
  };
  const handleEditSave = async () => {
  try {
    await updateSoftwareAsset(editAsset._id, {
      assetName: editForm.assetName,
      assetCategory: editForm.assetCategory,
      associateUnit: editForm.associateUnit,
      locationName: editForm.locationName,
      assetStatus: editForm.assetStatus,
      type: editForm.type,

      assetQuantity: editForm.assetQuantity,

      assetCost: {
        totalAmount: editForm.assetCost.totalAmount,
        currency: editForm.assetCost.currency,
      },

      purchaseDate: editForm.purchaseDate,
      expiryDate: editForm.expiryDate,
    });

    Swal.fire("Updated", "Software updated", "success");
    setEditAsset(null);
    fetchAll();
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};
  const filteredAssets = assets.filter((asset) => {
    const term = searchTerm.toLowerCase();
    return (
      asset.assetName?.toLowerCase().includes(term) ||
      asset.assetCode?.toLowerCase().includes(term)
    );
  });

  const indexOfLast = currentPage * assetsPerPage;
  const currentAssets = filteredAssets.slice(
    indexOfLast - assetsPerPage,
    indexOfLast
  );
  const assignmentMap = {};

selectedAsset?.assignmentRecords?.forEach(assign => {
  assignmentMap[assign.assetInstanceId] = assign;
});
  if (loading || loadingRates)
    return <Loader type="inventory" apiDone={apiDone} />;
  const renderSoftwareInstance = (inst, assignment) => {
  const isAssigned = inst.status === "in_use";

  return (
   <div className={`instance-card ${isAssigned ? "assigned" : ""}`}>
  
  {/* HEADER */}
  <div className="instance-header">
    <div>
      <p className="instance-code">{inst.instanceCode}</p>
      <p className="instance-id">
        {inst.software?.licenseNumber || "N/A"}
      </p>
    </div>

    <span className="status-badge">
      {isAssigned ? "Assigned" : "Available"}
    </span>
  </div>

  {/* BASIC */}
  <div className="instance-section">
    <p><span className="label">Location</span> {inst.location}</p>
    <p><span className="label">Condition</span> {inst.condition}</p>
    <p>
      <span className="label">Installed</span>{" "}
      {formatDate(inst.installationDate)}
    </p>
  </div>

  {/* LICENSE */}
  <div className="instance-section">
    <p><span className="label">License Key</span> {inst.software?.licenseKey}</p>
    <p><span className="label">Vendor</span> {inst.software?.vendor}</p>
  </div>

  {/* COST */}
  <div className="instance-section cost-box">
    <p><span className="label">Maintenance</span> {inst.costTracking?.maintenanceCost}</p>
    <p><span className="label">Renewal</span> {inst.costTracking?.warrantyRenewalCost}</p>
  </div>

  {/* ASSIGNMENT */}
  {isAssigned && assignment ? (
    <div className="assignment-box">
      <p><span className="label">Employee</span> {assignment.employee?.name}</p>
      <p><span className="label">Department</span> {assignment.department?.name}</p>
      <p><span className="label">Location</span> {assignment.location}</p>
    </div>
  ) : (
    <div className="available-box">Available</div>
  )}

  <div className="instance-actions">
    <button onClick={() => handleInstanceEditOpen(inst)}>
      Edit
    </button>
  </div>
</div>
  );
};
  return (
    <div className="inventory-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2 className="hardware-title">Software Inventory</h2>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search-input"
          />

          <CurrencyFilter />
        </div>
      </div>

      {/* CARDS */}
      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset) => (
            <motion.div
  key={asset._id}
  className="inventory-card"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* 🔷 HEADER */}
  <div className="card-header">
    <div>
      <h3>{asset.assetName}</h3>
      <p className="asset-code">{asset.assetCode}</p>
    </div>

    <div className="expiry">
      ⏳ {getRemainingDays(asset.renewal?.expiryDate)} days left
    </div>
  </div>

  {/* 🔷 BADGE GRID */}
  <div className="badge-grid">
    <span className="badge">
      {getName(categories, asset.assetCategory)}
    </span>

    <span className="badge">
      {getName(locations, asset.locationName)}
    </span>

    <span className="badge">
      {getName(units, asset.associateUnit)}
    </span>

    <span className="badge status">
      {getName(statuses, asset.assetStatus)}
    </span>
  </div>

  {/* 🔷 FINANCIAL */}
  <div className="financial">
    <div>
      <p className="label">Total Cost</p>
      <p>
        {CURRENCY_SYMBOLS[currency]}{" "}
        {convertFromBase(asset.assetCost?.baseTotalAmount || 0)}
      </p>
    </div>

    <div>
      <p className="label">Unit Cost</p>
      <p>
        {CURRENCY_SYMBOLS[currency]}{" "}
        {convertFromBase(asset.assetCost?.unitAmount || 0)}
      </p>
    </div>
  </div>

  {/* 🔷 DATES */}
  <div className="dates">
    <p>
      📅 {formatDate(asset.purchaseDetails?.purchaseDate)}
    </p>

    <p>
      ⏰ {formatDate(asset.renewal?.expiryDate)}
    </p>
  </div>

  {/* 🔷 META */}
  <div className="meta-grid">
    <p>
      💻 {asset.inUse}/{asset.assetQuantity} used
    </p>

    <p>
      🏢 {asset.purchaseDetails?.vendor?.name || "N/A"}
    </p>
  </div>

  {/* 🔷 PLAN */}
  <div className="plan-box">
    📦 {asset.type} plan
  </div>

  {/* 🔷 ALERT SYSTEM */}
  {(() => {
    const expiry = asset.renewal?.expiryDate
      ? new Date(asset.renewal.expiryDate)
      : null;

    const today = new Date();
    const diffDays = expiry
      ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      : null;

    if (diffDays !== null && diffDays <= 7) {
      return (
        <div className="alert danger">
          ⚠ Expiring in {diffDays} days
        </div>
      );
    }

    if (asset.inUse === asset.assetQuantity) {
      return (
        <div className="alert warning">
          ⚠ All Licenses Used
        </div>
      );
    }

    if (asset.inUse === 0) {
      return (
        <div className="alert info">
          ℹ No Active Usage
        </div>
      );
    }

    return null;
  })()}

  {/* 🔷 ACTIONS */}
  <div className="card-actions">
    <button onClick={() => setSelectedAsset(asset)}>
      View
    </button>

    <button onClick={() => handleEditOpen(asset)}>
      Edit
    </button>

    <button onClick={() => handleDelete(asset._id)}>
      Delete
    </button>

    <button onClick={() => handleAssign(asset)}>
      Assign
    </button>
  </div>
</motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ================= VIEW MODAL ================= */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            className="asset-view-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              className="asset-view-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ================= INSTANCES ================= */}
               <h4>All Instances</h4>

{selectedAsset.instances?.length ? (
  selectedAsset.instances.map((inst) =>
    renderSoftwareInstance(
      inst,
      assignmentMap[inst._id]
    )
  )
) : (
  <p>No instances found</p>
)}
<AnimatePresence>
  {editInstance && (
    <motion.div
      className="asset-view-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setEditInstance(null)}
    >
      <motion.div
        className="asset-view-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Edit Instance</h3>

        <div className="grid-2">
          {/* CONDITION */}
          <div className="input-group">
            <label>Condition</label>
            <select
              value={instanceForm.condition}
              onChange={(e) =>
                setInstanceForm({
                  ...instanceForm,
                  condition: e.target.value,
                })
              }
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          {/* LOCATION */}
          <div className="input-group">
            <label>Location</label>
            <input
              value={instanceForm.location}
              onChange={(e) =>
                setInstanceForm({
                  ...instanceForm,
                  location: e.target.value,
                })
              }
            />
          </div>

          {/* INSTALL DATE */}
          <div className="input-group">
            <label>Installation Date</label>
            <input
              type="date"
              value={instanceForm.installationDate}
              onChange={(e) =>
                setInstanceForm({
                  ...instanceForm,
                  installationDate: e.target.value,
                })
              }
            />
          </div>

          {/* WARRANTY */}
          <div className="input-group">
            <label>Warranty Expiry</label>
            <input
              type="date"
              value={instanceForm.warrantyExpiry}
              onChange={(e) =>
                setInstanceForm({
                  ...instanceForm,
                  warrantyExpiry: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* COST TRACKING */}
        <h4>Cost Tracking</h4>
        <div className="grid-2">
          <div className="input-group">
          <input
            type="number"
            placeholder="Maintenance"
            value={instanceForm.maintenanceCost}
            onChange={(e) =>
              setInstanceForm({
                ...instanceForm,
                maintenanceCost: Number(e.target.value),
              })
            }
          />
          </div>
<div className="input-group">
          <input
            type="number"
            placeholder="Warranty Renewal"
            value={instanceForm.warrantyRenewalCost}
            onChange={(e) =>
              setInstanceForm({
                ...instanceForm,
                warrantyRenewalCost: Number(e.target.value),
              })
            }
          />
          </div>
<div className="input-group">
          <input
            type="number"
            placeholder="Insurance"
            value={instanceForm.insuranceCost}
            onChange={(e) =>
              setInstanceForm({
                ...instanceForm,
                insuranceCost: Number(e.target.value),
              })
            }
          />
          </div>
        </div>

        {/* SOFTWARE ONLY */}
        {editInstance.software && (
          <>
            <h4>Software Details</h4>
            <div className="grid-2">
              <div className="input-group">
              <input
                placeholder="License Key"
                value={instanceForm.licenseKey}
                onChange={(e) =>
                  setInstanceForm({
                    ...instanceForm,
                    licenseKey: e.target.value,
                  })
                }
              />
</div>
<div className="input-group">
              <input
                placeholder="License Number"
                value={instanceForm.licenseNumber}
                onChange={(e) =>
                  setInstanceForm({
                    ...instanceForm,
                    licenseNumber: e.target.value,
                  })
                }
              />
              </div>
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn-save" onClick={handleInstanceUpdate}>
            Save
          </button>
          <button
            className="btn-cancel"
            onClick={() => setEditInstance(null)}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
  {editAsset && (
    <motion.div
      className="asset-view-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setEditAsset(null)}
    >
      <motion.div
        className="asset-view-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Edit Asset</h3>
<div className="grid-2">
  {/* CATEGORY */}
  <div className="input-group">
    <label>Category</label>
    <select
      value={editForm.assetCategory}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          assetCategory: e.target.value,
        })
      }
    >
      {categories.map(c => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </select>
  </div>

  {/* UNIT */}
  <div className="input-group">
    <label>Unit</label>
    <select
      value={editForm.associateUnit}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          associateUnit: e.target.value,
        })
      }
    >
      {units.map(u => (
        <option key={u._id} value={u._id}>
          {u.name}
        </option>
      ))}
    </select>
  </div>
</div>
<div className="grid-2">
  {/* LOCATION */}
  <div className="input-group">
    <label>Location</label>
    <select
      value={editForm.locationName}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          locationName: e.target.value,
        })
      }
    >
      {locations.map(l => (
        <option key={l._id} value={l._id}>
          {l.name}
        </option>
      ))}
    </select>
  </div>

  {/* STATUS */}
  <div className="input-group">
    <label>Status</label>
    <select
      value={editForm.assetStatus}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          assetStatus: e.target.value,
        })
      }
    >
      {statuses.map(s => (
        <option key={s._id} value={s._id}>
          {s.name}
        </option>
      ))}
    </select>
  </div>
</div>
        <div className="grid-2">

          <div className="input-group">
            <label>Name</label>
            <input
              value={editForm.assetName}
              onChange={(e) =>
                setEditForm({ ...editForm, assetName: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Quantity</label>
            <input
              type="number"
              value={editForm.assetQuantity}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  assetQuantity: Number(e.target.value),
                })
              }
            />
            <p className="warning-text">
              ⚠ Changing quantity will add/remove instances automatically.
            </p>
          </div>

          <div className="input-group">
            <label>Total Cost</label>
            <input
              type="number"
              value={editForm.assetCost.totalAmount}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  assetCost: {
                    ...editForm.assetCost,
                    totalAmount: Number(e.target.value),
                  },
                })
              }
            />
          </div>

          <div className="input-group">
            <label>Currency</label>
            <select
              value={editForm.assetCost.currency}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  assetCost: {
                    ...editForm.assetCost,
                    currency: e.target.value,
                  },
                })
              }
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>

          <div className="input-group">
            <label>Purchase Date</label>
            <input
              type="date"
              value={editForm.purchaseDate}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  purchaseDate: e.target.value,
                })
              }
            />
          </div>

          {/* SOFTWARE ONLY */}
          {editForm.expiryDate !== undefined && (
            <div className="input-group">
              <label>Expiry Date</label>
              <input
                type="date"
                value={editForm.expiryDate}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    expiryDate: e.target.value,
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={handleEditSave} className="btn-save">
            Save
          </button>
          <button onClick={() => setEditAsset(null)} className="btn-cancel">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default SoftwareAssetList;
