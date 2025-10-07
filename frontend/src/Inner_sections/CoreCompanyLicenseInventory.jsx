import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  getCoreLicenses,
  getStatuses,
  deleteCoreLicense,
  updateCoreLicense,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/InventoryCards.css";

const CoreCompanyLicenseList = () => {
  const [licenses, setLicenses] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 📡 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, licenseRes] = await Promise.all([
          getStatuses(),
          getCoreLicenses(),
        ]);

        setStatuses(statusRes);

        if (licenseRes.success && Array.isArray(licenseRes.data)) {
          setLicenses(licenseRes.data);
        } else {
          console.error("Unexpected response:", licenseRes);
        }
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    };
    fetchData();
  }, []);

  // 🧭 Pagination helpers
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = licenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(licenses.length / itemsPerPage);

  // 🗑️ Delete License
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete License?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });
    if (confirm.isConfirmed) {
      try {
        await deleteCoreLicense(id);
        setLicenses((prev) => prev.filter((l) => l._id !== id));
        Swal.fire("Deleted!", "License removed successfully.", "success");
      } catch (err) {
        Swal.fire("Error", "Could not delete license.", "error");
      }
    }
  };

  // ✏️ Start Editing
  const startEditing = (license) => {
    setEditing(license);
    setEditForm({
      ...license,
      expiryDate: license.expiryDate
        ? new Date(license.expiryDate).toISOString().split("T")[0]
        : "",
      issueDate: license.issueDate
        ? new Date(license.issueDate).toISOString().split("T")[0]
        : "",
    });
  };

  // 💾 Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateCoreLicense(editing._id, editForm);
      setLicenses((prev) =>
        prev.map((l) => (l._id === updated._id ? updated : l))
      );
      Swal.fire("Updated!", "License updated successfully.", "success");
      setEditing(null);
    } catch (err) {
      Swal.fire("Error", "Failed to update license.", "error");
    }
  };

  // 📝 Handle Form Changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="inventory-container">
      <h2 className="inventory-title"> Core Company Licenses</h2>

      {/* 🧊 Card Grid */}
      <div className="inventory-grid">
        <AnimatePresence>
          {currentItems.map((license) => (
            <motion.div
              key={license._id}
              className="inventory-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ y: -5, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
              transition={{ duration: 0.25 }}
            >
              <div className="card-header">
                <h3 className="card-title">{license.licenseHolder}</h3>
                <span className={`status-badge`}>
                  {statuses.find((s) => s._id === license.status)?.name || "N/A"}
                </span>
              </div>

              <div className="card-info2">
                <p><strong>Document:</strong> {license.documentType}</p>
                <p><strong>License No:</strong> {license.licenseNumber}</p>
                <p><strong>Authority:</strong> {license.issuingAuthority}</p>
                <p><strong>Expiry:</strong> {new Date(license.expiryDate).toLocaleDateString()}</p>
              </div>

              <div className="card-actions">
                <button onClick={() => setSelected(license)} className="btn-view">
                  <FontAwesomeIcon icon={faEye} /> View
                </button>
                <button onClick={() => startEditing(license)} className="btn-edit">
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button onClick={() => handleDelete(license._id)} className="btn-delete">
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* 👁️ View Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="overlay-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>{selected.licenseHolder} — Details</h3>
              {Object.entries(selected).map(([key, val]) => {
                if (["_id", "__v", "createdAt", "updatedAt"].includes(key)) return null;
                return (
                  <p key={key}>
                    <strong>{key}:</strong> {val?.toString()}
                  </p>
                );
              })}
              <button className="close-btn" onClick={() => setSelected(null)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✏️ Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="overlay-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3>Edit License – {editing.licenseHolder}</h3>
              <form onSubmit={handleEditSubmit} className="overlay-form">
                <input
                  type="text"
                  name="documentType"
                  value={editForm.documentType || ""}
                  onChange={handleFormChange}
                  placeholder="Document Type"
                />
                <input
                  type="text"
                  name="licenseNumber"
                  value={editForm.licenseNumber || ""}
                  onChange={handleFormChange}
                  placeholder="License Number"
                />
                <input
                  type="text"
                  name="issuingAuthority"
                  value={editForm.issuingAuthority || ""}
                  onChange={handleFormChange}
                  placeholder="Issuing Authority"
                />
                <input
                  type="date"
                  name="issueDate"
                  value={editForm.issueDate || ""}
                  onChange={handleFormChange}
                />
                <input
                  type="date"
                  name="expiryDate"
                  value={editForm.expiryDate || ""}
                  onChange={handleFormChange}
                />
                <input
                  type="text"
                  name="businessActivity"
                  value={editForm.businessActivity || ""}
                  onChange={handleFormChange}
                  placeholder="Business Activity"
                />
                <input
                  type="text"
                  name="renewalCycle"
                  value={editForm.renewalCycle || ""}
                  onChange={handleFormChange}
                  placeholder="Renewal Cycle"
                />
                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button
                    type="button"
                    className="close-btn"
                    onClick={() => setEditing(null)}
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

export default CoreCompanyLicenseList;
