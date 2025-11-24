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
  const assetsPerPage = 6;

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

  // Safer name resolver (handles both IDs and objects)
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
  });
};


const handleEditSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  // Append normal fields (except preview, file AND image)
  Object.entries(editForm).forEach(([key, value]) => {
    if (key !== "imagePreview" && key !== "imageFile" && key !== "image") {
      formData.append(key, value);
    }
  });

  // Append file only if chosen
  if (editForm.imageFile) {
    formData.append("image", editForm.imageFile);
  }

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

  // ===== expiry badge logic (Option A: color tiers) =====
  const getExpiryBadge = (DOE) => {
    if (!DOE) return null;
    const today = new Date();
    const expiry = new Date(DOE);
    // Normalize date-only expiry (ignore time zone)
    const diffMS = expiry.setHours(0,0,0,0) - new Date(today).setHours(0,0,0,0);
    const diffDays = Math.ceil(diffMS / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // expired
      return <span className="badge badge-renew">Renewable</span>;
    }
    // coloring: red if <=3, yellow if <=14, green otherwise
    if (diffDays <= 3) {
      return <span className="badge badge-red">{diffDays} days left</span>;
    }
    if (diffDays <= 14) {
      return <span className="badge badge-yellow">{diffDays} days left</span>;
    }
    return <span className="badge badge-green">{diffDays} days left</span>;
  };

  // ===== pagination renderer (compact, works for many pages) =====
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const visibleRange = 1; // how many pages left/right of current to show

    // always show first page
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

    if (left > 2) {
      pages.push(<span key="leftdots" className="dots">...</span>);
    }

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

    if (right < totalPages - 1) {
      pages.push(<span key="rightdots" className="dots">...</span>);
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          className={currentPage === totalPages ? "active" : ""}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

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
  }
  return (
    <div className="inventory-container">
      {/* <h2 className="inventory-title"> Hardware Assets</h2> */}

      {/* Grid */}
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
                  <h3 className="card-title">{asset.assetName || asset.assetCode}</h3>
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

      {/* Pagination */}
      {renderPagination()}

      {/* View Modal: image left, details right */}
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
              className="overlay-content view-modal"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="view-left">
                <img
                  src={selectedAsset.image}
                  alt="Asset"
                  className="view-image"
                />
              </div>

              <div className="view-right">
                <h3 className="view-title">{selectedAsset.assetName || selectedAsset.assetCode}</h3>

                <div className="view-details">
                  <p><strong>Asset Code:</strong> {selectedAsset.assetCode || "—"}</p>
                  <p><strong>Specification:</strong> {selectedAsset.assetSpecification || "—"}</p>
                  <p><strong>Category:</strong> {getName(categories, selectedAsset.assetCategory)}</p>
                  <p><strong>Location:</strong> {getName(locations, selectedAsset.locationName)}</p>
                  <p><strong>Unit:</strong> {getName(units, selectedAsset.associateUnit)}</p>
                  <p><strong>Status:</strong> {getName(statuses, selectedAsset.assetStatus)}</p>
                  <p><strong>Purchase Date:</strong> {selectedAsset.DOP ? new Date(selectedAsset.DOP).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Expiry Date:</strong> {selectedAsset.DOE ? new Date(selectedAsset.DOE).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Purchase From:</strong> {selectedAsset.purchaseFrom || "N/A"}</p>
                  <p><strong>Lifetime:</strong> {selectedAsset.assetLifetime || "N/A"}</p>
                </div>

                <div className="modal-actions" style={{ marginTop: 12 }}>
                  <button className="close-btn" onClick={() => setSelectedAsset(null)}>Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal (unchanged) */}
      {/* ========================= EDIT MODAL ========================= */}
<AnimatePresence>
 {/* EDIT ASSET MODAL */}
{editingAsset && (
  <motion.div
    className="overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setEditingAsset(null)}
  >
    <motion.div
      className="overlay-content edit-modal"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* LEFT SIDE - IMAGE */}
      <div className="edit-left">
        <img
          src={editForm.imagePreview || editingAsset.image}
          alt="Asset"
          className="edit-image"
        />

        <label className="upload-label">
          Update Image
          <input
            type="file"
            name="image"
            accept="image/*"
            className="file-input"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  setEditForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: reader.result,
                  }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="edit-right">
        <h3 className="modal-title">
          Edit Asset — {editingAsset.assetName || editingAsset.assetCode}
        </h3>

       <form className="edit-grid" onSubmit={handleEditSubmit}>

          <input
            name="assetName"
            placeholder="Asset Name"
            value={editForm.assetName || ""}
            onChange={handleEditChange}
          />

          <input
            name="assetSpecification"
            placeholder="Specification"
            value={editForm.assetSpecification || ""}
            onChange={handleEditChange}
          />

          {/* CATEGORY */}
          <select
            name="assetCategory"
            value={editForm.assetCategory || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* LOCATION */}
          <select
            name="locationName"
            value={editForm.locationName || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Location</option>
            {locations.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* UNIT */}
          <select
            name="associateUnit"
            value={editForm.associateUnit || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* STATUS */}
          <select
            name="assetStatus"
            value={editForm.assetStatus || ""}
            onChange={handleEditChange}
          >
            <option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* DATES */}
<input
  type="date"
  name="DOP"
  value={editForm.DOP || ""}
  onChange={handleEditChange}
/>

<input
  type="date"
  name="DOE"
  value={editForm.DOE || ""}
  onChange={handleEditChange}
/>


          {/* EXTRA FIELDS */}
          <input
            name="purchaseFrom"
            placeholder="Purchase From"
            value={editForm.purchaseFrom || ""}
            onChange={handleEditChange}
          />

          <input
            name="assetLifetime"
            placeholder="Asset Lifetime"
            value={editForm.assetLifetime || ""}
            onChange={handleEditChange}
          />

          {/* ACTION BUTTONS */}
          <div className="modal-actions">
            <button type="submit" className="save-btn">
              Save
            </button>

            <button
              type="button"
              className="close-btn"
              onClick={() => setEditingAsset(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  </motion.div>
)}

</AnimatePresence>

    </div>
  );
};

export default HardwareAssetList;
