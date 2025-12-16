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
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";

const SoftwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 6;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [
        assetsRes,
        catRes,
        statRes,
        unitRes,
        locRes,
      ] = await Promise.all([
        getSoftwareAssets(),
        getCategories(),
        getStatuses(),
        getUnits(),
        getLocations(),
      ]);

      setAssets(assetsRes?.data ?? assetsRes ?? []);
      setCategories(catRes ?? []);
      setStatuses(statRes ?? []);
      setUnits(unitRes ?? []);
      setLocations(locRes ?? []);

      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      Swal.fire("Error", "Failed to load software assets", "error");
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */
  const getName = (list, value) => {
    if (!value) return "N/A";
    const id = typeof value === "object" ? value._id : value;
    const found = list.find((i) => String(i._id) === String(id));
    return found ? found.name : "N/A";
  };

  const getInStock = (asset) =>
    Number(asset.assetQuantity || 0) - Number(asset.inUse || 0);

  const getExpiryBadge = (DOE) => {
    if (!DOE) return null;
    const today = new Date();
    const expiry = new Date(DOE);
    const diffDays = Math.ceil(
      (expiry.setHours(0, 0, 0, 0) -
        today.setHours(0, 0, 0, 0)) /
        86400000
    );

    if (diffDays < 0)
      return <span className="badge badge-renew">Expired</span>;
    if (diffDays <= 3)
      return <span className="badge badge-red">{diffDays} days</span>;
    if (diffDays <= 14)
      return <span className="badge badge-yellow">{diffDays} days</span>;

    return <span className="badge badge-green">{diffDays} days</span>;
  };

  /* ================= DELETE ================= */
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

  /* ================= EDIT ================= */
  const startEdit = (asset) => {
    setEditingAsset(asset);
    setEditForm({
      assetName: asset.assetName || "",
      assetCode: asset.assetCode || "",
      assetSpecification: asset.assetSpecification || "",
      assetCategory: asset.assetCategory || "",
      associateUnit: asset.associateUnit || "",
      locationName: asset.locationName || "",
      assetStatus: asset.assetStatus || "",
      purchaseFrom: asset.purchaseFrom || "",
      DOP: asset.DOP || "",
      DOE: asset.DOE || "",
      assetLifetime: asset.assetLifetime || "",
      assetCost: asset.assetCost || "",
      assetQuantity: asset.assetQuantity || 1,
      inUse: asset.inUse || 0,

      licenseKey: asset.licenseKey || "",
      licenseType: asset.licenseType || "",
      licenseModel: asset.licenseModel || "",
      licenseMetric: asset.licenseMetric || "",
      licenseUse: asset.licenseUse || "",
    });
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...editForm,
      assetCost: Number(editForm.assetCost),
      assetQuantity: Number(editForm.assetQuantity),
      inUse: Number(editForm.inUse),
    };

    const updated = await updateSoftwareAsset(editingAsset._id, payload);
    const newAsset = updated?.data ?? updated;

    setAssets((p) =>
      p.map((a) => (a._id === newAsset._id ? newAsset : a))
    );

    setEditingAsset(null);
    Swal.fire("Updated", "Software asset updated", "success");
  };

  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * assetsPerPage;
  const currentAssets = assets.slice(indexOfLast - assetsPerPage, indexOfLast);
  const totalPages = Math.ceil(assets.length / assetsPerPage);

  if (loading) return <Loader type="inventory" apiDone={apiDone} />;

  return (
    <div className="inventory-container">
      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset) => (
            <motion.div
              key={asset._id}
              className="inventory-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-header">
                <h3>{asset.assetName}</h3>
                {getExpiryBadge(asset.DOE)}
              </div>

              <div className="card-info2">
                <p><strong>Version:</strong> {asset.assetSpecification}</p>
                <p><strong>Cost:</strong> ₹{asset.assetCost}</p>
                <p><strong>Quantity:</strong> {asset.assetQuantity}</p>
                <p><strong>In Use:</strong> {asset.inUse}</p>
                <p>
                  <strong>Stock:</strong>{" "}
                  {getInStock(asset) > 0 ? (
                    <span className="stock-green">{getInStock(asset)} Available</span>
                  ) : (
                    <span className="stock-red">Out of Stock</span>
                  )}
                </p>
              </div>

              <div className="card-actions">
                <button className="btn-view" onClick={() => setSelectedAsset(asset)}>View</button>
                <button className="btn-edit" onClick={() => startEdit(asset)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(asset._id)}>Delete</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* VIEW & EDIT MODALS ARE NOW IDENTICAL TO HARDWARE */}
      {/* ================= SOFTWARE VIEW MODAL ================= */}
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
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="asset-view-header">
          <h3 className="asset-view-title">
            {selectedAsset.assetName}
          </h3>

          <div className="asset-view-badges">
            <span className="asset-view-badge category">
              {getName(categories, selectedAsset.assetCategory)}
            </span>
            <span className="asset-view-badge status">
              {getName(statuses, selectedAsset.assetStatus)}
            </span>
          </div>
        </div>

        <h4 className="asset-view-section-title">Software Details</h4>

        <div className="asset-view-grid">
          <div>
            <label>Asset Code</label>
            <p>{selectedAsset.assetCode}</p>
          </div>

          <div>
            <label>Version</label>
            <p>{selectedAsset.assetSpecification}</p>
          </div>

          <div>
            <label>Publisher</label>
            <p>{selectedAsset.purchaseFrom}</p>
          </div>

          <div>
            <label>Installed Location</label>
            <p>{getName(locations, selectedAsset.locationName)}</p>
          </div>

          <div>
            <label>Unit</label>
            <p>{getName(units, selectedAsset.associateUnit)}</p>
          </div>

          <div>
            <label>Purchase Date</label>
            <p>{selectedAsset.DOP || "—"}</p>
          </div>

          <div>
            <label>Expiry Date</label>
            <p>{selectedAsset.DOE || "—"}</p>
          </div>

          <div>
            <label>License Key</label>
            <p>{selectedAsset.licenseKey || "—"}</p>
          </div>

          <div>
            <label>License Type</label>
            <p>{selectedAsset.licenseType || "—"}</p>
          </div>

          <div>
            <label>License Model</label>
            <p>{selectedAsset.licenseModel || "—"}</p>
          </div>

          <div>
            <label>License Metric</label>
            <p>{selectedAsset.licenseMetric || "—"}</p>
          </div>

          <div>
            <label>License Use</label>
            <p>{selectedAsset.licenseUse || "—"}</p>
          </div>

          <div>
            <label>Asset Cost</label>
            <p>₹{selectedAsset.assetCost}</p>
          </div>

          <div>
            <label>Quantity</label>
            <p>{selectedAsset.assetQuantity}</p>
          </div>

          <div>
            <label>In Use</label>
            <p>{selectedAsset.inUse}</p>
          </div>

          <div>
            <label>In Stock</label>
            <p>{getInStock(selectedAsset)}</p>
          </div>

          <div>
            <label>Lifetime</label>
            <p>{selectedAsset.assetLifetime || "—"}</p>
          </div>
        </div>

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

      {/* (Intentionally omitted here to keep answer readable) */}
      {/* ================= SOFTWARE EDIT MODAL ================= */}
{/* ================= SOFTWARE EDIT MODAL ================= */}
<AnimatePresence>
  {editingAsset && (
    <motion.div
      className="asset-edit-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setEditingAsset(null)}
    >
      <motion.div
        className="asset-edit-modal"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="asset-edit-title">
          Edit Software — {editingAsset.assetName}
        </h3>

        <form className="asset-edit-grid" onSubmit={handleEditSubmit}>

          <input name="assetCode" value={editForm.assetCode} onChange={handleEditChange} placeholder="Asset Code" />

          <input name="assetName" value={editForm.assetName} onChange={handleEditChange} placeholder="Software Name" />

          <input name="assetSpecification" value={editForm.assetSpecification} onChange={handleEditChange} placeholder="Version" />

          <input name="purchaseFrom" value={editForm.purchaseFrom} onChange={handleEditChange} placeholder="Publisher" />

          <select name="assetCategory" value={editForm.assetCategory} onChange={handleEditChange}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select name="associateUnit" value={editForm.associateUnit} onChange={handleEditChange}>
            <option value="">Select Unit</option>
            {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>

          <select name="locationName" value={editForm.locationName} onChange={handleEditChange}>
            <option value="">Select Location</option>
            {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>

          <input name="locationAddress" value={editForm.locationAddress} onChange={handleEditChange} placeholder="Location Address" />

          <select name="assetStatus" value={editForm.assetStatus} onChange={handleEditChange}>
            <option value="">Select Status</option>
            {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <input type="date" name="DOP" value={editForm.DOP} onChange={handleEditChange} />
          <input type="date" name="DOE" value={editForm.DOE} onChange={handleEditChange} />

          <input name="assetLifetime" value={editForm.assetLifetime} onChange={handleEditChange} placeholder="Lifetime" />

          <input type="number" name="assetCost" value={editForm.assetCost} onChange={handleEditChange} placeholder="Cost" />
          <input type="number" name="assetQuantity" value={editForm.assetQuantity} onChange={handleEditChange} placeholder="Quantity" />
          <input type="number" name="inUse" value={editForm.inUse} onChange={handleEditChange} placeholder="In Use" />

          <input name="licenseKey" value={editForm.licenseKey} onChange={handleEditChange} placeholder="License Key" />
          <input name="licenseType" value={editForm.licenseType} onChange={handleEditChange} placeholder="License Type" />
          <input name="licenseModel" value={editForm.licenseModel} onChange={handleEditChange} placeholder="License Model" />
          <input name="licenseMetric" value={editForm.licenseMetric} onChange={handleEditChange} placeholder="License Metric" />
          <input name="licenseUse" value={editForm.licenseUse} onChange={handleEditChange} placeholder="License Use" />

          <div className="asset-edit-actions">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" className="btn-cancel" onClick={() => setEditingAsset(null)}>Cancel</button>
          </div>

        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

  );
};

export default SoftwareAssetList;
