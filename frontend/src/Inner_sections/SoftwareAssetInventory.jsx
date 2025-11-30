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
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import Loader from "../components/Loader";

/**
 * SoftwareAssetList
 * - Compact cards (no images)
 * - Robust pagination (same logic as hardware)
 * - View modal: left = icon, right = details
 * - Edit modal (inline form)
 */

const SoftwareAssetList = () => {
  // Data
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Modals / editing / viewing
  const [selectedAsset, setSelectedAsset] = useState(null); // view modal
  const [editingAsset, setEditingAsset] = useState(null); // edit modal
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assetsRes, catsRes, statsRes] = await Promise.all([
        getSoftwareAssets(),
        getCategories(),
        getStatuses(),
      ]);

      const assetsArray =
        assetsRes && Array.isArray(assetsRes)
          ? assetsRes
          : assetsRes && assetsRes.data && Array.isArray(assetsRes.data)
          ? assetsRes.data
          : [];

      setSoftwareAssets(assetsArray);
      setCategories(catsRes || []);
      setStatuses(statsRes || []);
    } catch (err) {
      console.error("Failed to fetch inventory data:", err);
      Swal.fire("Error", err.message || "Failed to load data", "error");
    } finally {
    setLoading(false);
  }
  };
  // Convert ID → Category Name
const getCategoryName = (categoryId) => {
  if (!categoryId) return "N/A";
  const cat = categories.find((c) => c._id === categoryId);
  return cat ? cat.categoryName : categoryId;
};

// Convert ID → Status Name
const getStatusName = (statusId) => {
  if (!statusId) return "N/A";
  const stat = statuses.find((s) => s._id === statusId);
  return stat ? stat.statusName : statusId;
};

  const refreshAssets = async () => {
    try {
      const assetsRes = await getSoftwareAssets();
      const assetsArray =
        assetsRes && Array.isArray(assetsRes)
          ? assetsRes
          : assetsRes && assetsRes.data && Array.isArray(assetsRes.data)
          ? assetsRes.data
          : [];
      setSoftwareAssets(assetsArray);
    } catch (err) {
      console.error("Failed to refresh assets:", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the software asset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteSoftwareAsset(id);
      setSoftwareAssets((prev) => prev.filter((a) => a._id !== id));
      Swal.fire("Deleted!", "Software asset deleted.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire("Error", "Failed to delete software asset.", "error");
    }
  };

  // Open edit modal and populate form
  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setEditForm({
      name: asset.name || "",
      version: asset.version || "",
      publisher: asset.publisher || "",
      category: asset.category || "",
      installLocation: asset.installLocation || "",
      assetTag: asset.assetTag || "",
      licenseKey: asset.licenseKey || "",
      licenseType: asset.licenseType || "",
      licenseModel: asset.licenseModel || "",
      licenseMetric: asset.licenseMetric || "",
      licenseUse: asset.licenseUse || "",
      licenseStartDate: asset.licenseStartDate
        ? new Date(asset.licenseStartDate).toISOString().split("T")[0]
        : "",
      licenseExpiry: asset.licenseExpiry
        ? new Date(asset.licenseExpiry).toISOString().split("T")[0]
        : "",
      renewalCycle: asset.renewalCycle || "",
      renewalReminder: !!asset.renewalReminder,
      totalLicenses: asset.totalLicenses ?? "",
      licensesAssigned: asset.licensesAssigned ?? "",
      purchaseDate: asset.purchaseDate
        ? new Date(asset.purchaseDate).toISOString().split("T")[0]
        : "",
      costPerUnit: asset.costPerUnit ?? "",
      totalCost: asset.totalCost ?? "",
      currency: asset.currency || "",
      costCenter: asset.costCenter || "",
      purchaseOrder: asset.purchaseOrder || "",
      assignedUsers: asset.assignedUsers?.join(", ") || "",
      linkedDevices: (asset.linkedDevices || []).join(", "),
      integrationDependencies: (asset.integrationDependencies || []).join(", "),
      complianceStatus: asset.complianceStatus || "",
      criticality: asset.criticality || "",
      riskClassification: asset.riskClassification || "",
      authenticationMethod: asset.authenticationMethod || "",
      lastAccess: asset.lastAccess
        ? new Date(asset.lastAccess).toISOString().split("T")[0]
        : "",
      subscriptionId: asset.subscriptionId || "",
      supportVendor: asset.supportContract?.vendorContact || asset.supportVendor || "",
      vendorContactDetails: asset.vendorContactDetails || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      const payload = {
        ...editForm,
        totalLicenses:
          editForm.totalLicenses === "" ? undefined : Number(editForm.totalLicenses),
        licensesAssigned:
          editForm.licensesAssigned === "" ? undefined : Number(editForm.licensesAssigned),
        costPerUnit: editForm.costPerUnit === "" ? undefined : Number(editForm.costPerUnit),
        totalCost: editForm.totalCost === "" ? undefined : Number(editForm.totalCost),
        assignedUsers: editForm.assignedUsers ? editForm.assignedUsers.split(",").map(s => s.trim()).filter(Boolean) : [],
        linkedDevices: editForm.linkedDevices ? editForm.linkedDevices.split(",").map(s => s.trim()).filter(Boolean) : [],
        integrationDependencies: editForm.integrationDependencies ? editForm.integrationDependencies.split(",").map(s => s.trim()).filter(Boolean) : [],
      };

      const updated = await updateSoftwareAsset(editingAsset._id, payload);
      const updatedAsset = updated?.data ?? updated;
      if (updatedAsset && updatedAsset._id) {
        setSoftwareAssets((prev) => prev.map((a) => (a._id === updatedAsset._id ? updatedAsset : a)));
      } else {
        await refreshAssets();
      }

      Swal.fire("Updated!", "Software asset updated successfully.", "success");
      setEditingAsset(null);
      setEditForm({});
    } catch (err) {
      console.error("Update failed:", err);
      Swal.fire("Error", err.message || "Failed to update asset", "error");
    }
  };

  // Pagination calculations & helpers (same robust logic as hardware)
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = softwareAssets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(softwareAssets.length / itemsPerPage));

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    const el = document.querySelector(".inventory-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Expiry badge logic (licenseExpiry)
  const getExpiryBadge = (licenseExpiry) => {
    if (!licenseExpiry) return null;
    const today = new Date();
    const expiry = new Date(licenseExpiry);
    const diffMS = expiry.setHours(0,0,0,0) - new Date(today).setHours(0,0,0,0);
    const diffDays = Math.ceil(diffMS / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="badge badge-renew">Renewable</span>;
    }
    if (diffDays <= 3) {
      return <span className="badge badge-red">{diffDays} days left</span>;
    }
    if (diffDays <= 14) {
      return <span className="badge badge-yellow">{diffDays} days left</span>;
    }
    return <span className="badge badge-green">{diffDays} days left</span>;
  };

  // Pagination renderer (compact)
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const visibleRange = 1; // pages to left/right of current

    pages.push(
      <button key={1} className={currentPage === 1 ? "active" : ""} onClick={() => goToPage(1)}>
        1
      </button>
    );

    const left = Math.max(2, currentPage - visibleRange);
    const right = Math.min(totalPages - 1, currentPage + visibleRange);

    if (left > 2) pages.push(<span key="leftdots" className="dots">...</span>);

    for (let i = left; i <= right; i++) {
      pages.push(
        <button key={i} className={currentPage === i ? "active" : ""} onClick={() => goToPage(i)}>
          {i}
        </button>
      );
    }

    if (right < totalPages - 1) pages.push(<span key="rightdots" className="dots">...</span>);

    if (totalPages > 1) {
      pages.push(
        <button key={totalPages} className={currentPage === totalPages ? "active" : ""} onClick={() => goToPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          Prev
        </button>

        {pages}

        <button onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    );
  };

  // Helper: avatar initials for software name
  const initialsFor = (name) => {
    if (!name) return "S";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="inventory-container">
      {/* <h2 className="inventory-title">Software Inventory</h2> */}

      <div className="inventory-grid">
  {loading ? (
    <Loader />
  ) : currentItems.length === 0 ? (
    <p>No software assets found.</p>
  ) : (

          currentItems.map((asset, idx) => (
            <motion.div
              key={asset._id}
              className="inventory-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="card-header">
                {/* <div className="card-avatar">{initialsFor(asset.name)}</div> */}
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <h3 className="card-title">{asset.name || "Unnamed"}</h3>
                  <div className="card-sub">{asset.publisher || "—"} • {asset.version || "v—"}</div>
                </div>

                <div className="badge-wrap">{getExpiryBadge(asset.licenseExpiry)}</div>
              </div>

              <div className="card-info2">
                <p><strong>Category:</strong> {getCategoryName(asset.category)}</p>
                <p><strong>License:</strong> {asset.licenseType || "N/A"}</p>
                <p><strong>Assigned:</strong> {asset.assignedUsers?.length ?? 0}</p>
                <p><strong>Expiry:</strong> {asset.licenseExpiry ? new Date(asset.licenseExpiry).toLocaleDateString() : "N/A"}</p>
              </div>

              <div className="card-actions">
                <button className="btn-view" onClick={() => setSelectedAsset(asset)}>
                  <FontAwesomeIcon icon={faEye} /> View
                </button>
                <button className="btn-edit" onClick={() => openEditModal(asset)}>
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(asset._id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {renderPagination()}

      {/* View Modal (left = icon, right = details) */}
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
        className="software-modal"
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE BUTTON (Column 3) */}
        <button className="software-close-btn" onClick={() => setSelectedAsset(null)}>✕</button>

        {/* COLUMN 1: ICON */}
        <div className="software-col icon-col">
          <div className="software-icon-box">
            {initialsFor(selectedAsset.name)}
            <h3 className="software-title">{selectedAsset.name || "Software"}</h3>
          </div>
        </div>

        {/* COLUMN 2: DATA */}
        <div className="software-col data-col">

          <div className="software-data-grid">
            <p><strong>Version:</strong> {selectedAsset.version || "N/A"}</p>
            <p><strong>Publisher:</strong> {selectedAsset.publisher || "N/A"}</p>
            <p><strong>Category:</strong> {getCategoryName(selectedAsset.category)}</p>
            <p><strong>License Type:</strong> {selectedAsset.licenseType || "N/A"}</p>
            <p><strong>License Key:</strong> {selectedAsset.licenseKey || "N/A"}</p>
            <p><strong>Start:</strong> {selectedAsset.licenseStartDate ? new Date(selectedAsset.licenseStartDate).toLocaleDateString() : "N/A"}</p>
            <p><strong>Expiry:</strong> {selectedAsset.licenseExpiry ? new Date(selectedAsset.licenseExpiry).toLocaleDateString() : "N/A"}</p>
            <p><strong>Total Licenses:</strong> {selectedAsset.totalLicenses ?? "0"}</p>
            <p><strong>Assigned:</strong> {selectedAsset.licensesAssigned ?? "0"}</p>
            <p><strong>Purchase:</strong> {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : "N/A"}</p>
            <p><strong>Cost Per Unit:</strong> {selectedAsset.costPerUnit ? `₹${selectedAsset.costPerUnit}` : "N/A"}</p>
            <p><strong>Total Cost:</strong> {selectedAsset.totalCost ? `₹${selectedAsset.totalCost}` : "N/A"}</p>
            <p><strong>Users:</strong> {selectedAsset.assignedUsers?.length ? selectedAsset.assignedUsers.join(", ") : "None"}</p>
            <p><strong>Devices:</strong> {selectedAsset.linkedDevices?.length ? selectedAsset.linkedDevices.join(", ") : "None"}</p>
            <p><strong>Support:</strong> {selectedAsset.supportVendor || "N/A"}</p>
            <p><strong>Last Access:</strong> {selectedAsset.lastAccess ? new Date(selectedAsset.lastAccess).toLocaleDateString() : "N/A"}</p>
          </div>
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
              <h3>Edit {editingAsset.name || "Software"}</h3>

              <form onSubmit={handleEditSubmit} className="overlay-form">
                <input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                <input value={editForm.version || ""} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} placeholder="Version" />
                <input value={editForm.publisher || ""} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} placeholder="Publisher" />
                <input value={editForm.assetTag || ""} onChange={(e) => setEditForm({ ...editForm, assetTag: e.target.value })} placeholder="Asset Tag" />
                <input value={editForm.installLocation || ""} onChange={(e) => setEditForm({ ...editForm, installLocation: e.target.value })} placeholder="Install Location" />

                <input value={editForm.licenseKey || ""} onChange={(e) => setEditForm({ ...editForm, licenseKey: e.target.value })} placeholder="License Key" />
                <input value={editForm.licenseType || ""} onChange={(e) => setEditForm({ ...editForm, licenseType: e.target.value })} placeholder="License Type" />
                <input value={editForm.licenseModel || ""} onChange={(e) => setEditForm({ ...editForm, licenseModel: e.target.value })} placeholder="License Model" />

                <label>License Start Date:</label>
                <input type="date" value={editForm.licenseStartDate || ""} onChange={(e) => setEditForm({ ...editForm, licenseStartDate: e.target.value })} />

                <label>License Expiry:</label>
                <input type="date" value={editForm.licenseExpiry || ""} onChange={(e) => setEditForm({ ...editForm, licenseExpiry: e.target.value })} />

                <label>Purchase Date:</label>
                <input type="date" value={editForm.purchaseDate || ""} onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })} />

                <input value={editForm.costPerUnit || ""} onChange={(e) => setEditForm({ ...editForm, costPerUnit: e.target.value })} placeholder="Cost Per Unit" />
                <input value={editForm.totalCost || ""} onChange={(e) => setEditForm({ ...editForm, totalCost: e.target.value })} placeholder="Total Cost" />

                <input value={editForm.assignedUsers || ""} onChange={(e) => setEditForm({ ...editForm, assignedUsers: e.target.value })} placeholder="Assigned Users (comma-separated)" />
                <input value={editForm.linkedDevices || ""} onChange={(e) => setEditForm({ ...editForm, linkedDevices: e.target.value })} placeholder="Linked Devices (comma-separated)" />
                <input value={editForm.integrationDependencies || ""} onChange={(e) => setEditForm({ ...editForm, integrationDependencies: e.target.value })} placeholder="Integration Dependencies (comma-separated)" />

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

export default SoftwareAssetList;
