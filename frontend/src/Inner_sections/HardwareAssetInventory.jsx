// ✅ src/Pages/HardwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHardwareAssets,
  deleteHardwareAsset,
  updateHardwareAsset,
  getCategories,
  getLocations,
  getUnits,
  getStatuses,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 6;

  useEffect(() => {
    fetchAll();
  }, []);

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

      setAssets(assetsRes?.data ?? assetsRes ?? []);
      setCategories(catsRes ?? []);
      setLocations(locsRes ?? []);
      setUnits(unitsRes ?? []);
      setStatuses(statusesRes ?? []);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLast = currentPage * assetsPerPage;
  const indexOfFirst = indexOfLast - assetsPerPage;
  const currentAssets = assets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assets.length / assetsPerPage);

  const getName = (list, value) => {
    if (!value) return "N/A";
    const id = typeof value === "object" ? value._id : value;
    const found = list.find((item) => String(item._id) === String(id));
    return found ? found.name : "N/A";
  };

  const handleDelete = async (id) => {
    const resp = await Swal.fire({
      title: "Delete asset?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!resp.isConfirmed) return;

    try {
      await deleteHardwareAsset(id);
      setAssets((prev) => prev.filter((a) => a._id !== id));
      Swal.fire("Deleted", "Asset removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to delete asset", "error");
    }
  };

  // Normalize fields for editing
  const startEdit = (asset) => {
    setEditingAsset(asset);
setEditForm({
  assetName: asset.assetName || "",
  assetCode: asset.assetCode || "",
  assetSpecification: asset.assetSpecification || "",
  assetCategory: asset.assetCategory?._id || asset.assetCategory || "",
  locationName: asset.locationName?._id || asset.locationName || "",
  associateUnit: asset.associateUnit?._id || asset.associateUnit || "",
  assetStatus: asset.assetStatus?._id || asset.assetStatus || "",
  DOP: asset.DOP ? new Date(asset.DOP).toISOString().split("T")[0] : "",
  DOE: asset.DOE ? new Date(asset.DOE).toISOString().split("T")[0] : "",
  purchaseFrom: asset.purchaseFrom || "",
  assetLifetime: asset.assetLifetime || "",

  // NEW FIELDS
  assetCost: asset.assetCost || "",
  assetQuantity: asset.assetQuantity || "",
});

  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const updated = await updateHardwareAsset(editingAsset._id, formData);
      const newAsset = updated?.data ?? updated;

      setAssets((prev) =>
        prev.map((a) => (a._id === newAsset._id ? newAsset : a))
      );

      setEditingAsset(null);
      setEditForm({});
      Swal.fire("Updated", "Asset updated successfully.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Update failed", "error");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const getExpiryBadge = (DOE) => {
    if (!DOE) return null;
    const today = new Date();
    const expiry = new Date(DOE);
    const diffMS =
      expiry.setHours(0, 0, 0, 0) -
      new Date(today).setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(diffMS / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="badge badge-renew">Renewable</span>;
    }
    if (diffDays <= 3) return <span className="badge badge-red">{diffDays} days left</span>;
    if (diffDays <= 14) return <span className="badge badge-yellow">{diffDays} days left</span>;

    return <span className="badge badge-green">{diffDays} days left</span>;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const visibleRange = 1;

    pages.push(
      <button
        key={1}
        className={currentPage === 1 ? "active" : ""}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
    );

    const left = Math.max(2, currentPage - visibleRange);
    const right = Math.min(totalPages - 1, currentPage + visibleRange);

    if (left > 2) pages.push(<span key="leftdots" className="dots">...</span>);

    for (let i = left; i <= right; i++) {
      pages.push(
        <button
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (right < totalPages - 1) pages.push(<span key="rightdots" className="dots">...</span>);

    pages.push(
      <button
        key={totalPages}
        className={currentPage === totalPages ? "active" : ""}
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </button>
    );

    return (
      <div className="pagination">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {pages}

        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) return <Loader type="inventory"/>;

  return (
    <div className="inventory-container">
      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset) => {
            const unitName = getName(units, asset.associateUnit);
            return (
              <motion.div
                key={asset._id}
                className="inventory-card"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ y: -5, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.25 }}
              >
                <div className="card-header">
                  <h3 className="card-title">
                    {asset.assetName || asset.assetCode}
                  </h3>
                  <div className="badge-wrap">
                    {getExpiryBadge(asset.DOE)}
                  </div>
                </div>

                <div className="card-info2">
                  <p><strong>Code:</strong> {asset.assetCode || "—"}</p>
                  <p><strong>Spec:</strong> {asset.assetSpecification || "N/A"}</p>
                  <p><strong>Unit:</strong> {unitName}</p>
                  <p><strong>Purchase:</strong> {asset.DOP ? new Date(asset.DOP).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Expiry:</strong> {asset.DOE ? new Date(asset.DOE).toLocaleDateString() : "N/A"}</p>
                </div>

                <div className="card-actions">
                  <button className="btn-view" onClick={() => setSelectedAsset(asset)}>View</button>
                  <button className="btn-edit" onClick={() => startEdit(asset)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(asset._id)}>Delete</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {renderPagination()}

{/* VIEW MODAL – NEW UI */}
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
            {selectedAsset.assetName || selectedAsset.assetCode}
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

        <h4 className="asset-view-section-title">Asset Details</h4>

        <div className="asset-view-grid">
          <div>
            <label>Asset Code</label>
            <p>{selectedAsset.assetCode || "—"}</p>
          </div>

          <div>
            <label>Specification</label>
            <p>{selectedAsset.assetSpecification || "—"}</p>
          </div>

          <div>
            <label>Location</label>
            <p>{getName(locations, selectedAsset.locationName)}</p>
          </div>

          <div>
            <label>Unit</label>
            <p>{getName(units, selectedAsset.associateUnit)}</p>
          </div>

          <div>
            <label>Purchase Date</label>
            <p>
              {selectedAsset.DOP
                ? new Date(selectedAsset.DOP).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div>
            <label>Expiry Date</label>
            <p>
              {selectedAsset.DOE
                ? new Date(selectedAsset.DOE).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
  <label>Asset Cost</label>
  <p>₹{selectedAsset.assetCost || "0"}</p>
</div>

<div>
  <label>Quantity</label>
  <p>{selectedAsset.assetQuantity || "1"}</p>
</div>

<div>
  <label>Total Value</label>
  <p>₹{(selectedAsset.assetCost || 0) * (selectedAsset.assetQuantity || 1)}</p>
</div>

          <div>
            <label>Purchase From</label>
            <p>{selectedAsset.purchaseFrom || "N/A"}</p>
          </div>

          <div>
            <label>Lifetime</label>
            <p>{selectedAsset.assetLifetime || "N/A"}</p>
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


{/* EDIT MODAL – NEW UI */}
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
          Edit Asset — {editingAsset.assetName || editingAsset.assetCode}
        </h3>

        <form className="asset-edit-grid" onSubmit={handleEditSubmit}>
          <input
            name="assetName"
            placeholder="Asset Name"
            className="asset-edit-input"
            value={editForm.assetName || ""}
            onChange={handleEditChange}
          />

          <input
            name="assetSpecification"
            placeholder="Specification"
            className="asset-edit-input"
            value={editForm.assetSpecification || ""}
            onChange={handleEditChange}
          />

          <select
            name="assetCategory"
            className="asset-edit-input"
            value={editForm.assetCategory || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            name="locationName"
            className="asset-edit-input"
            value={editForm.locationName || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Location</option>
            {locations.map((l) => (
              <option key={l._id} value={l._id}>{l.name}</option>
            ))}
          </select>

          <select
            name="associateUnit"
            className="asset-edit-input"
            value={editForm.associateUnit || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>

          <select
            name="assetStatus"
            className="asset-edit-input"
            value={editForm.assetStatus || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <input
            type="date"
            name="DOP"
            className="asset-edit-input"
            value={editForm.DOP || ""}
            onChange={handleEditChange}
          />

          <input
            type="date"
            name="DOE"
            className="asset-edit-input"
            value={editForm.DOE || ""}
            onChange={handleEditChange}
          />

          <input
            name="purchaseFrom"
            placeholder="Purchase From"
            className="asset-edit-input"
            value={editForm.purchaseFrom || ""}
            onChange={handleEditChange}
          />
          <input
  type="number"
  name="assetCost"
  placeholder="Asset Cost (₹)"
  className="asset-edit-input"
  value={editForm.assetCost || ""}
  onChange={handleEditChange}
/>

<input
  type="number"
  name="assetQuantity"
  placeholder="Asset Quantity"
  className="asset-edit-input"
  value={editForm.assetQuantity || ""}
  onChange={handleEditChange}
/>

          <input
            name="assetLifetime"
            placeholder="Asset Lifetime"
            className="asset-edit-input"
            value={editForm.assetLifetime || ""}
            onChange={handleEditChange}
          />

          <div className="asset-edit-actions">
            <button type="submit" className="asset-edit-save-btn">Save</button>
            <button
              type="button"
              className="asset-edit-cancel-btn"
              onClick={() => setEditingAsset(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default HardwareAssetList;
