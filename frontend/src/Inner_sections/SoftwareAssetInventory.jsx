// src/Pages/SoftwareAssetList.jsx
import React, { useEffect, useState } from "react";
import "../Page_styles/InventoryCards.css";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSoftwareAssets,
  deleteSoftwareAsset,
  updateSoftwareAsset,
  getCategories,
  getStatuses,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Loader from "../Components/Loader";

const SoftwareAssetList = () => {
  /* ===================== STATE ===================== */
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ===================== FETCH ===================== */
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assetsRes, catRes, statRes] = await Promise.all([
        getSoftwareAssets(),
        getCategories(),
        getStatuses(),
      ]);

      setSoftwareAssets(Array.isArray(assetsRes?.data) ? assetsRes.data : assetsRes || []);
      setCategories(catRes || []);
      setStatuses(statRes || []);

      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch {
      Swal.fire("Error", "Failed to load software assets", "error");
      setLoading(false);
    }
  };

  /* ===================== HELPERS ===================== */
  const getCategoryName = (id) =>
    categories.find((c) => c._id === id)?.categoryName || "N/A";

  const getStatusName = (id) =>
    statuses.find((s) => s._id === id)?.statusName || "N/A";

  const getExpiryBadge = (date) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
    if (diff < 0) return <span className="badge badge-red">Expired</span>;
    if (diff <= 7) return <span className="badge badge-yellow">{diff} days</span>;
    return <span className="badge badge-green">{diff} days</span>;
  };

  /* ===================== DELETE ===================== */
  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete software asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!res.isConfirmed) return;

    await deleteSoftwareAsset(id);
    setSoftwareAssets((p) => p.filter((a) => a._id !== id));
    Swal.fire("Deleted", "Software asset removed", "success");
  };

  /* ===================== EDIT ===================== */
  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setEditForm({
      assetName: asset.assetName || "",
      assetCategory: asset.assetCategory || "",
      assetStatus: asset.assetStatus || "",
      version: asset.version || "",
      publisher: asset.publisher || "",
      licenseKey: asset.licenseKey || "",
      licenseType: asset.licenseType || "",
      licenseModel: asset.licenseModel || "",
      licenseMetric: asset.licenseMetric || "",
      licenseUse: asset.licenseUse || "",
      licenseStartDate: asset.licenseStartDate?.split("T")[0] || "",
      licenseExpiry: asset.licenseExpiry?.split("T")[0] || "",
      purchaseDate: asset.purchaseDate?.split("T")[0] || "",
      costPerUnit: asset.costPerUnit || "",
      totalCost: asset.totalCost || "",
      assignedUsers: asset.assignedUsers?.join(", ") || "",
      linkedDevices: asset.linkedDevices?.join(", ") || "",
      supportVendor: asset.supportVendor || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...editForm,
      assignedUsers: editForm.assignedUsers.split(",").map((x) => x.trim()).filter(Boolean),
      linkedDevices: editForm.linkedDevices.split(",").map((x) => x.trim()).filter(Boolean),
    };

    const res = await updateSoftwareAsset(editingAsset._id, payload);
    const updated = res?.data || res;

    setSoftwareAssets((p) => p.map((a) => (a._id === updated._id ? updated : a)));
    setEditingAsset(null);

    Swal.fire("Updated", "Software asset updated", "success");
  };

  /* ===================== PAGINATION ===================== */
  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = softwareAssets.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(softwareAssets.length / itemsPerPage));

  /* ===================== RENDER ===================== */
  return (
    <div className="inventory-container">
      {loading ? (
        <Loader type="inventory" apiDone={apiDone} />
      ) : (
        <div className="inventory-grid">
          {currentItems.map((asset, i) => (
            <motion.div key={asset._id} className="inventory-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card-header">
                <h3>{asset.assetName}</h3>
                {getExpiryBadge(asset.licenseExpiry)}
              </div>

              <div className="card-info2">
                <p><strong>Category:</strong> {getCategoryName(asset.assetCategory)}</p>
                <p><strong>Status:</strong> {getStatusName(asset.assetStatus)}</p>
                <p><strong>License:</strong> {asset.licenseType || "N/A"}</p>
              </div>

              <div className="card-actions">
                <button onClick={() => setSelectedAsset(asset)}><FontAwesomeIcon icon={faEye} /> View</button>
                <button onClick={() => openEditModal(asset)}><FontAwesomeIcon icon={faEdit} /> Edit</button>
                <button onClick={() => handleDelete(asset._id)}><FontAwesomeIcon icon={faTrash} /> Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===================== VIEW MODAL ===================== */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div className="swv-overlay" onClick={() => setSelectedAsset(null)}>
            <motion.div className="swv-modal" onClick={(e) => e.stopPropagation()}>
              <button className="swv-close-btn" onClick={() => setSelectedAsset(null)}>✕</button>

              <div className="swv-info-grid">
                <p><span>Name:</span> {selectedAsset.assetName}</p>
                <p><span>Version:</span> {selectedAsset.version || "N/A"}</p>
                <p><span>Publisher:</span> {selectedAsset.publisher || "N/A"}</p>
                <p><span>Category:</span> {getCategoryName(selectedAsset.assetCategory)}</p>
                <p><span>Status:</span> {getStatusName(selectedAsset.assetStatus)}</p>
                <p><span>License Key:</span> {selectedAsset.licenseKey || "N/A"}</p>
                <p><span>License Type:</span> {selectedAsset.licenseType || "N/A"}</p>
                <p><span>Start Date:</span> {selectedAsset.licenseStartDate?.split("T")[0] || "N/A"}</p>
                <p><span>Expiry:</span> {selectedAsset.licenseExpiry?.split("T")[0] || "N/A"}</p>
                <p><span>Cost:</span> ₹{selectedAsset.totalCost || "0"}</p>
                <p><span>Users:</span> {selectedAsset.assignedUsers?.join(", ") || "None"}</p>
                <p><span>Devices:</span> {selectedAsset.linkedDevices?.join(", ") || "None"}</p>
                <p><span>Support Vendor:</span> {selectedAsset.supportVendor || "N/A"}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== EDIT MODAL ===================== */}
      <AnimatePresence>
        {editingAsset && (
          <motion.div className="sw-edit-overlay" onClick={() => setEditingAsset(null)}>
            <motion.form className="sw-edit-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleEditSubmit}>
              <h2>Edit Software Asset</h2>

              <input value={editForm.assetName} onChange={(e) => setEditForm({ ...editForm, assetName: e.target.value })} placeholder="Software Name" />
              <input value={editForm.version} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} placeholder="Version" />
              <input value={editForm.publisher} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} placeholder="Publisher" />
              <input value={editForm.licenseKey} onChange={(e) => setEditForm({ ...editForm, licenseKey: e.target.value })} placeholder="License Key" />

              <input type="date" value={editForm.licenseStartDate} onChange={(e) => setEditForm({ ...editForm, licenseStartDate: e.target.value })} />
              <input type="date" value={editForm.licenseExpiry} onChange={(e) => setEditForm({ ...editForm, licenseExpiry: e.target.value })} />

              <input value={editForm.assignedUsers} onChange={(e) => setEditForm({ ...editForm, assignedUsers: e.target.value })} placeholder="Assigned Users" />
              <input value={editForm.linkedDevices} onChange={(e) => setEditForm({ ...editForm, linkedDevices: e.target.value })} placeholder="Linked Devices" />

              <div className="sw-edit-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingAsset(null)}>Cancel</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoftwareAssetList;
