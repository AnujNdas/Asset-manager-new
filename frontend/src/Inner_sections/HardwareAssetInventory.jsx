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

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 8;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assetsRes, catsRes, locsRes, unitsRes, statusesRes] = await Promise.all([
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
    }
  };

  const indexOfLast = currentPage * assetsPerPage;
  const indexOfFirst = indexOfLast - assetsPerPage;
  const currentAssets = assets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assets.length / assetsPerPage);

  // ✅ Safer name resolver (handles both IDs and objects)
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

  // ✅ Normalize fields for editing
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
      purchaseDate: asset.DOP
        ? new Date(asset.DOP).toISOString().split("T")[0]
        : "",
      expiryDate: asset.DOE
        ? new Date(asset.DOE).toISOString().split("T")[0]
        : "",
      purchaseFrom: asset.purchaseFrom || "",
      assetLifetime: asset.assetLifetime || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;
    try {
      const payload = { ...editForm };
      const updated = await updateHardwareAsset(editingAsset._id, payload);
      const updatedAsset = updated?.data ?? updated;

      setAssets((prev) => prev.map((a) => (a._id === updatedAsset._id ? updatedAsset : a)));
      setEditingAsset(null);
      setEditForm({});
      Swal.fire("Updated", "Asset updated successfully.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update asset", "error");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="inventory-container">
      <h2 className="inventory-title"> Hardware Assets</h2>

      {/* Grid */}
      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset) => {
            const categoryName = getName(categories, asset.assetCategory);
            const locationName = getName(locations, asset.locationName);
            const unitName = getName(units, asset.associateUnit);
            const statusName = getName(statuses, asset.assetStatus);

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
                  <h3 className="card-title">{asset.assetName || asset.assetCode}</h3>
                  <span className="status-badge">{statusName}</span>
                </div>

                <div className="card-info2">
                  <p><strong>Category:</strong> {categoryName}</p>
                  <p><strong>Location:</strong> {locationName}</p>
                  <p><strong>Unit:</strong> {unitName}</p>
                  <p><strong>Purchase Date:</strong> {asset.DOP ? new Date(asset.DOP).toLocaleDateString() : "N/A"}</p>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {/* ✅ View Modal */}
<AnimatePresence>
  {selectedAsset && (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedAsset(null)}
    >
      <motion.div
        className="overlay-content"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={selectedAsset.image} alt="Asset Image"/>
        <h3>{selectedAsset.assetName || selectedAsset.assetCode}</h3>

        <div style={{ marginTop: 8, maxHeight: "60vh", overflowY: "auto" }}>
          <p>
            <strong>Asset Code:</strong> {selectedAsset.assetCode || "—"}
          </p>
          <p>
            <strong>Specification:</strong> {selectedAsset.assetSpecification || "—"}
          </p>
          <p>
            <strong>Category:</strong>{" "}
            {getName(categories, selectedAsset.assetCategory)}
          </p>
          <p>
            <strong>Location:</strong>{" "}
            {getName(locations, selectedAsset.locationName)}
          </p>
          <p>
            <strong>Unit:</strong>{" "}
            {getName(units, selectedAsset.associateUnit)}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {getName(statuses, selectedAsset.assetStatus)}
          </p>
          <p>
            <strong>Purchase Date:</strong>{" "}
            {selectedAsset.DOP
              ? new Date(selectedAsset.DOP).toLocaleDateString()
              : selectedAsset.purchaseDate
              ? new Date(selectedAsset.purchaseDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Expiry:</strong>{" "}
            {selectedAsset.DOE
              ? new Date(selectedAsset.DOE).toLocaleDateString()
              : selectedAsset.expiryDate
              ? new Date(selectedAsset.expiryDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Purchase From:</strong> {selectedAsset.purchaseFrom || "N/A"}
          </p>
          <p>
            <strong>Lifetime:</strong> {selectedAsset.assetLifetime || "N/A"}
          </p>
        </div>

        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button className="close-btn" onClick={() => setSelectedAsset(null)}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingAsset && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingAsset(null)}>
            <motion.div className="overlay-content" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
              <h3>Edit Asset — {editingAsset.assetName || editingAsset.assetCode}</h3>

              <form className="overlay-form" onSubmit={handleEditSubmit}>
                <input name="assetName" placeholder="Asset Name" value={editForm.assetName || ""} onChange={handleEditChange} />
                <input name="assetCode" placeholder="Asset Code" value={editForm.assetCode || ""} onChange={handleEditChange} />
                <input name="assetSpecification" placeholder="Specification" value={editForm.assetSpecification || ""} onChange={handleEditChange} />

                <select name="assetCategory" value={editForm.assetCategory || ""} onChange={handleEditChange}>
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>

                <select name="locationName" value={editForm.locationName || ""} onChange={handleEditChange}>
                  <option value="">Select Location</option>
                  {locations.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>

                <select name="associateUnit" value={editForm.associateUnit || ""} onChange={handleEditChange}>
                  <option value="">Select Unit</option>
                  {units.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>

                <select name="assetStatus" value={editForm.assetStatus || ""} onChange={handleEditChange}>
                  <option value="">Select Status</option>
                  {statuses.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>

                <label>Purchase Date
                  <input name="purchaseDate" type="date" value={editForm.purchaseDate || ""} onChange={handleEditChange} />
                </label>

                <label>Expiry Date
                  <input name="expiryDate" type="date" value={editForm.expiryDate || ""} onChange={handleEditChange} />
                </label>

                <input name="purchaseFrom" placeholder="Purchase From" value={editForm.purchaseFrom || ""} onChange={handleEditChange} />
                <input name="assetLifetime" placeholder="Asset Lifetime" value={editForm.assetLifetime || ""} onChange={handleEditChange} />

                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button type="button" className="close-btn" onClick={() => setEditingAsset(null)}>Cancel</button>
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
