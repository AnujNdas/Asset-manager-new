// ✅ src/Pages/HardwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHardwareAssets,
  deleteHardwareAsset,
  getCategories,
  getLocations,
  getUnits,
  getStatuses,
  updateAssetInstance,
  updateHardwareAsset,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import CurrencyFilter from "../Components/CurrencyFilter";

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [editAsset, setEditAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editInstance, setEditInstance] = useState(null);
const [instanceForm, setInstanceForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const { currency, convertFromBase, loadingRates } = useCurrency();

  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
  if (editAsset) {
    setEditForm({
      assetName: editAsset.assetName,
      assetCategory: editAsset.assetCategory?._id,
      associateUnit: editAsset.associateUnit?._id,
      locationName: editAsset.locationName?._id,
      assetStatus: editAsset.assetStatus?._id,
      type: editAsset.type,
      assetQuantity: editAsset.assetQuantity,
    });
  }
}, [editAsset]);
  const fetchAll = async () => {
    try {
      const [assetsRes, catsRes, locsRes, unitsRes, statusesRes] =
        await Promise.all([
          getHardwareAssets(),
          getCategories(),
          getLocations(),
          getUnits(),
          getStatuses(),
        ]);
        console.log("ASSETS RESPONSE:", assetsRes);

      setAssets(assetsRes?.data ?? assetsRes ?? []);
      setCategories(catsRes?.data ?? catsRes ?? []);
      setLocations(locsRes?.data ?? locsRes ?? []);
      setUnits(unitsRes?.data ?? unitsRes ?? []);
      setStatuses(statusesRes?.data ?? statusesRes ?? []);

      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to load data", "error");
      setLoading(false);
    }
  };
  const getRemainingDays = (expiryDate) => {
  if (!expiryDate) return "-";

  const today = new Date();
  const expiry = new Date(expiryDate);

  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  return diff > 0 ? diff : "Expired";
};
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };
const handleUpdate = async () => {
  try {
    await updateHardwareAsset(editAsset._id, editForm);

    await Swal.fire("Success", "Asset updated", "success");

    setEditAsset(null);
    fetchAll();
  } catch (err) {
    Swal.fire("Error", err.message || "Failed", "error");
  }
};
  const handleDelete = async (id) => {
    const resp = await Swal.fire({
      title: "Delete asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!resp.isConfirmed) return;

    try {
      await deleteHardwareAsset(id);
      setAssets((prev) => prev.filter((a) => a._id !== id));
      Swal.fire("Deleted", "Asset removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Failed", "error");
    }
  };
  const handleInstanceUpdate = async () => {
  try {
    await updateAssetInstance(editInstance._id, instanceForm);

    Swal.fire("Updated", "Instance updated", "success");

    setEditInstance(null);
    fetchAll(); // refresh
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

  if (loading || loadingRates)
    return <Loader type="inventory" apiDone={apiDone} />;
 const renderInstance = (inst, assignment) => {
  const isAssigned = !!assignment;

  const hw = inst.hardware || {};

  return (
    <div className={`instance-card ${isAssigned ? "assigned-card" : ""}`}>
      
      {/* HEADER */}
      <div className="instance-header">
        <div>
          <p className="instance-title">{inst.instanceCode}</p>
          <p className="instance-sub">{inst.serialNumber || "No Serial"}</p>
        </div>

        <span className={`status-pill ${isAssigned ? "assigned" : "available"}`}>
          {isAssigned ? "Assigned" : "Available"}
        </span>
      </div>

      {/* BASIC INFO */}
      <div className="instance-block">
        <p><span>Location</span>{inst.location || "N/A"}</p>
        <p><span>Condition</span>{inst.condition}</p>
        <p>
          <span>Installed</span>
          {hw.installationDate
            ? new Date(hw.installationDate).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* TECH DETAILS */}
      <div className="instance-block">
        <p><span>Model</span>{hw.modelNo || "N/A"}</p>
        <p><span>Specs</span>{hw.specifications || "N/A"}</p>
      </div>

      {/* WARRANTY */}
      <div className="instance-block">
        <p>
          <span>Warranty Expiry</span>
          {hw.warrantyExpiry
            ? new Date(hw.warrantyExpiry).toLocaleDateString()
            : "N/A"}
        </p>

        <p><span>Insurance ID</span>{hw.insuranceId || "N/A"}</p>

        <p>
          <span>Insurance Expiry</span>
          {hw.insuranceExpiry
            ? new Date(hw.insuranceExpiry).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* COST */}
      <div className="instance-block cost">
        <p><span>Maintenance</span>{hw.costs?.maintenanceCost || 0}</p>
        <p><span>Warranty Renewal</span>{hw.costs?.warrantyRenewalCost || 0}</p>
        <p><span>Insurance Cost</span>{hw.costs?.insuranceCost || 0}</p>
      </div>

      {/* ASSIGNMENT */}
      {isAssigned && assignment && (
        <div className="assignment-box">
          <p><span>Employee :-</span>{assignment.employee?.name}</p>
          <p><span>Department :-</span>{assignment.department?.name}</p>
          <p><span>Assigned Location :-</span>{assignment.location}</p>
          <p><span>Device :-</span>{assignment.deviceInfo?.deviceName || "N/A"}</p>
        </div>
      )}

      <button
        className="btn-edit"
        onClick={() => {
          setEditInstance(inst);

          setInstanceForm({
            location: inst.location,
            condition: inst.condition,

            hardware: {
              modelNo: hw.modelNo || "",
              specifications: hw.specifications || "",
            },
          });
        }}
      >
        Edit Instance
      </button>
    </div>
  );
};
  return (
    <div className="inventory-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Hardware Inventory</h2>

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

      {/* GRID */}
      <div className="inventory-grid">
        <AnimatePresence>
          {filteredAssets.map((asset) => (
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
      ⏳ {getRemainingDays(asset.DOE)} days left
    </div>
  </div>

  {/* 🔷 BADGE GRID */}
  <div className="badge-grid">
    <span className="badge">{asset.assetCategory?.name}</span>
    <span className="badge">{asset.locationName?.name}</span>
    <span className="badge">{asset.associateUnit?.name}</span>
    <span className="badge status">{asset.assetStatus?.name}</span>
  </div>

  {/* 🔷 FINANCIAL */}
  {/* <div className="financial">
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
  </div> */}

  {/* 🔷 DATES */}
  <div className="dates">
    <div>
    <p className="label"> Purchase Date</p>
    <p>📅 {formatDate(asset.purchaseDetails?.purchaseDate)}</p>
    </div>
    <div>
    <p className="label"> Maintanence Date</p>
    <p>⏰ {formatDate(asset.DOE)}</p>
    </div>
  </div>

  {/* 🔷 META */}
  <div className="meta-grid">
    <div>
      <p className="label">Instance Count</p>
    <p>📦 {asset.instanceCount} instances</p>
    </div>
    <div>
      <p className="label">Vendor</p>
    <p>🏢 {asset.purchaseDetails?.vendor?.name || "N/A"}</p>
    </div>
  </div>

  {/* 🔷 ALERTS */}
  {asset.inUse === asset.assetQuantity && (
    <div className="alert warning">⚠ Fully Assigned</div>
  )}

  {asset.assetQuantity === 0 && (
    <div className="alert danger">❌ Out of Stock</div>
  )}

  {asset.type === "maintenance" && (
    <div className="alert info">🛠 Under Maintenance</div>
  )}

  {/* 🔷 ACTIONS */}
  <div className="card-actions">
    <button onClick={() => setSelectedAsset(asset)} className="btn-save">View</button>
    <button onClick={() => setEditAsset(asset)} className="btn-edit">Edit</button>
    <button onClick={() => handleDelete(asset._id)} className="btn-delete">Delete</button>
  </div>
</motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL */}
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
              <h3>Instances — {selectedAsset.assetName}</h3>

              {/* 🔥 DATA PREP */}
              {(() => {
                const instances = selectedAsset.instances || [];

                const assignmentMap = {};
                selectedAsset.assignmentRecords?.forEach((a) => {
                  assignmentMap[String(a.assetInstanceId)] = a;
                });
                return (
                  <>
<h4>All Instances</h4>

{instances.length === 0 ? (
  <p>No instances found</p>
) : (
  instances.map((inst) =>
    renderInstance(
      inst,
      assignmentMap[String(inst._id)]
    )
  )
)}
                  </>
                );
              })()}
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
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* SERIAL NUMBER */}
      <div className="grid-2">
        <div className="input-group">
          <label>
            {instanceForm.assetType === "hardware"
              ? "Serial Number"
              : "License Number"}
          </label>
          <input
            value={instanceForm.serialNumber || ""}
            onChange={(e) =>
              setInstanceForm({
                ...instanceForm,
                serialNumber: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* INFO MESSAGE */}
      <p className="info-text">
        💡 Financial, warranty, and technical details are managed via upgrade or lifecycle actions.
      </p>

      {/* ACTIONS */}
      <div className="modal-actions">
        <button
          className="btn-save"
          onClick={handleInstanceUpdate}
        >
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

              <button
                className="asset-view-close-btn"
                onClick={() => setSelectedAsset(null)}
              >
                Close
              </button>
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

      {/* BASIC INFO */}
      <div className="grid-2">
        <div className="input-group">
          <label>Asset Name</label>
          <input
            value={editForm.assetName}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetName: e.target.value,
              })
            }
          />
        </div>

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
      </div>

      {/* QUANTITY */}
      <div className="grid-2">
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="number"
            value={editForm.assetQuantity}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetQuantity: e.target.value,
              })
            }
          />
          <p className="warning-text">
            ⚠ Changing quantity will add/remove instances automatically.
          </p>
        </div>
      </div>

      {/* UNIT + LOCATION */}
      <div className="grid-2">
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
      </div>

      {/* STATUS + TYPE */}
      <div className="grid-2">
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

        <div className="input-group">
          <label>Type</label>
          <select
            value={editForm.type}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                type: e.target.value,
              })
            }
          >
            <option value="one_time">One-Time</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* PURCHASE DATE */}
      <div className="grid-2">
        <div className="input-group">
          <label>Purchase Date</label>
          <input
            type="date"
            value={editForm.purchaseDate || ""}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                purchaseDate: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="modal-actions">
        <button onClick={handleUpdate} className="btn-save">
          Save
        </button>
        <button
          onClick={() => setEditAsset(null)}
          className="btn-cancel"
        >
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

export default HardwareAssetList;