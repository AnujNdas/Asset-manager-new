import React, { useEffect, useState } from "react";
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
import "../Page_styles/InventoryCards.css";

const SoftwareAssetList = () => {
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ Fetch on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, cats, stats] = await Promise.all([
          getSoftwareAssets(),
          getCategories(),
          getStatuses(),
        ]);
        setSoftwareAssets(assetsRes.data || []);
        setCategories(cats);
        setStatuses(stats);
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    };
    fetchData();
  }, []);

  // ✅ Delete Asset
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the software asset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2346ed",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSoftwareAsset(id);
          setSoftwareAssets((prev) => prev.filter((a) => a._id !== id));
          Swal.fire("Deleted!", "Software asset deleted.", "success");
        } catch {
          Swal.fire("Error", "Failed to delete software asset.", "error");
        }
      }
    });
  };

  // ✅ Open Edit Modal
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setEditForm({ ...asset });
  };

  // ✅ Submit Edited Asset
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedAsset = await updateSoftwareAsset(
        editingAsset._id,
        editForm
      );
      setSoftwareAssets((prev) =>
        prev.map((a) => (a._id === updatedAsset._id ? updatedAsset : a))
      );
      Swal.fire("Updated!", "Software asset updated successfully.", "success");
      setEditingAsset(null);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ✅ Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = softwareAssets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(softwareAssets.length / itemsPerPage);

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">Software Inventory</h2>

      {/* 📦 CARD GRID */}
      <div className="inventory-grid">
        <AnimatePresence>
          {currentItems.map((asset) => {
            const categoryName =
              categories.find((c) => c._id === asset.category)?.name || "N/A";
            const statusName =
              statuses.find((s) => s._id === asset.complianceStatus)?.name ||
              "N/A";

            return (
              <motion.div
                key={asset._id}
                className="inventory-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ y: -5, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.25 }}
              >
                {/* 🧭 Header */}
                <div className="card-header">
                  <h3 className="card-title">{asset.name}</h3>
                  <span
                    className={`status-badge status-${statusName
                      .toLowerCase()
                      .replace(/\s/g, "-")}`}
                  >
                    {statusName}
                  </span>
                </div>

                {/* 📑 Info */}
                <div className="card-info2">
                  <p>
                    <strong>Version:</strong> {asset.version || "N/A"}
                  </p>
                  <p>
                    <strong>Category:</strong> {categoryName}
                  </p>
                  <p>
                    <strong>Licenses:</strong> {asset.licensesAssigned || 0}/
                    {asset.totalLicenses || 0}
                  </p>
                  <p>
                    <strong>License Type:</strong> {asset.licenseType || "N/A"}
                  </p>
                  <p>
                    <strong>Expiry:</strong>{" "}
                    {asset.licenseExpiry
                      ? new Date(asset.licenseExpiry).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                {/* 🔘 Actions */}
                <div className="card-actions">
                  <button
                    className="btn-view"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <FontAwesomeIcon icon={faEye} /> View
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(asset)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(asset._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 📌 Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages).keys()].map((n) => (
            <button
              key={n}
              className={currentPage === n + 1 ? "active" : ""}
              onClick={() => setCurrentPage(n + 1)}
            >
              {n + 1}
            </button>
          ))}
        </div>
      )}

      {/* 👁 VIEW MODAL */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="overlay-content">
              <h3>{selectedAsset.name} - Details</h3>
              <div className="card-info2">
                <p>
                  <strong>Publisher:</strong> {selectedAsset.publisher || "N/A"}
                </p>
                <p>
                  <strong>Category:</strong>
                  {categories.find((c) => c._id === selectedAsset.category)
                    ?.name || "N/A"}
                </p>
                <p>
                  <strong>Version:</strong> {selectedAsset.version || "N/A"}
                </p>
                <p>
                  <strong>License Key:</strong>{" "}
                  {selectedAsset.licenseKey || "N/A"}
                </p>
                <p>
                  <strong>License Type:</strong>{" "}
                  {selectedAsset.licenseType || "N/A"}
                </p>
                <p>
                  <strong>License Model:</strong>{" "}
                  {selectedAsset.licenseModel || "N/A"}
                </p>
                <p>
                  <strong>Licenses Assigned:</strong>{" "}
                  {selectedAsset.licensesAssigned || 0}
                </p>
                <p>
                  <strong>Total Licenses:</strong>{" "}
                  {selectedAsset.totalLicenses || 0}
                </p>
                <p>
                  <strong>License Use:</strong>{" "}
                  {selectedAsset.licenseUse || "N/A"}
                </p>
                <p>
                  <strong>License Expiry:</strong>{" "}
                  {selectedAsset.licenseExpiry
                    ? new Date(
                        selectedAsset.licenseExpiry
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Purchase Date:</strong>{" "}
                  {selectedAsset.purchaseDate
                    ? new Date(
                        selectedAsset.purchaseDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Cost Per Unit:</strong> ₹
                  {selectedAsset.costPerUnit || 0}
                </p>
                <p>
                  <strong>Total Cost:</strong> ₹
                  {selectedAsset.totalCost || 0}
                </p>
                <p>
                  <strong>Business Unit:</strong>{" "}
                  {selectedAsset.businessUnit || "N/A"}
                </p>
                <p>
                  <strong>Criticality:</strong>{" "}
                  {selectedAsset.criticality || "N/A"}
                </p>
                <p>
                  <strong>Risk Classification:</strong>{" "}
                  {selectedAsset.riskClassification || "N/A"}
                </p>
                <p>
                  <strong>Authentication Method:</strong>{" "}
                  {selectedAsset.authenticationMethod || "N/A"}
                </p>
                <p>
                  <strong>Last Access:</strong>{" "}
                  {selectedAsset.lastAccess
                    ? new Date(selectedAsset.lastAccess).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <button className="close-btn" onClick={() => setSelectedAsset(null)}>
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✍️ EDIT MODAL */}
      <AnimatePresence>
        {editingAsset && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="overlay-content">
              <h3>Edit {editingAsset.name}</h3>
              <form onSubmit={handleEditSubmit} className="overlay-form">
                <input
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Name"
                />
                <input
                  value={editForm.version || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, version: e.target.value })
                  }
                  placeholder="Version"
                />
                <input
                  value={editForm.publisher || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, publisher: e.target.value })
                  }
                  placeholder="Publisher"
                />
                <input
                  value={editForm.licenseKey || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, licenseKey: e.target.value })
                  }
                  placeholder="License Key"
                />
                <input
                  value={editForm.licenseType || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, licenseType: e.target.value })
                  }
                  placeholder="License Type"
                />
                <input
                  value={editForm.licenseModel || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, licenseModel: e.target.value })
                  }
                  placeholder="License Model"
                />
                <input
                  type="number"
                  value={editForm.totalLicenses || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      totalLicenses: e.target.value,
                    })
                  }
                  placeholder="Total Licenses"
                />
                <input
                  type="number"
                  value={editForm.licensesAssigned || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      licensesAssigned: e.target.value,
                    })
                  }
                  placeholder="Licenses Assigned"
                />
                <input
                  type="date"
                  value={
                    editForm.licenseExpiry
                      ? editForm.licenseExpiry.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      licenseExpiry: e.target.value,
                    })
                  }
                  placeholder="License Expiry"
                />
                <input
                  type="number"
                  value={editForm.costPerUnit || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, costPerUnit: e.target.value })
                  }
                  placeholder="Cost Per Unit"
                />
                <input
                  type="number"
                  value={editForm.totalCost || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, totalCost: e.target.value })
                  }
                  placeholder="Total Cost"
                />
                <input
                  value={editForm.businessUnit || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      businessUnit: e.target.value,
                    })
                  }
                  placeholder="Business Unit"
                />
                <input
                  value={editForm.criticality || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      criticality: e.target.value,
                    })
                  }
                  placeholder="Criticality"
                />
                <input
                  value={editForm.riskClassification || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      riskClassification: e.target.value,
                    })
                  }
                  placeholder="Risk Classification"
                />

                {/* Buttons */}
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoftwareAssetList;
