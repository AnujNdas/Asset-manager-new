// PART 1 of 4 — Imports, component setup, state, data fetching, pagination logic

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

/**
 * PART 1: Top-level component, states, data fetchers and pagination logic.
 * Paste PART 2, PART 3 and PART 4 immediately after this file content (in order).
 */

const SoftwareAssetList = () => {
  // Data
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Modals / editing / viewing
  const [selectedAsset, setSelectedAsset] = useState(null); // for view modal (object)
  const [editingAsset, setEditingAsset] = useState(null); // for edit modal (object)
  const [editForm, setEditForm] = useState({}); // editable form values (copy of editingAsset)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch assets + dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // getSoftwareAssets() expected to return { data: [...] } as in your code earlier
        const [assetsRes, catsRes, statsRes] = await Promise.all([
          getSoftwareAssets(),
          getCategories(),
          getStatuses(),
        ]);

        // assetsRes may be { data: [...] } or an array directly depending on your API helper.
        // This makes the component robust to both shapes.
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
      }
    };

    fetchData();
  }, []);

  // Helper: refresh asset list (call after update/delete)
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

  // Delete handler (used in Part 2)
  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the software asset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2346ed",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await deleteSoftwareAsset(id);
      // Optimistic update
      setSoftwareAssets((prev) => prev.filter((a) => a._id !== id));
      Swal.fire("Deleted!", "Software asset deleted.", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire("Error", "Failed to delete software asset.", "error");
    }
  };

  // Open edit modal (populates editForm)
  const openEditModal = (asset) => {
    setEditingAsset(asset);
    // Copy values to editForm (keep all simple scalar fields editable)
    setEditForm({
      name: asset.name || "",
      version: asset.version || "",
      publisher: asset.publisher || "",
      category: asset.category || "",
      installLocation: asset.installLocation || "",
      assetTag: asset.assetTag || "",
      // License group
      licenseKey: asset.licenseKey || "",
      licenseType: asset.licenseType || "",
      licenseModel: asset.licenseModel || "",
      licenseMetric: asset.licenseMetric || "",
      licenseUse: asset.licenseUse || "",
      licenseStartDate: asset.licenseStartDate
        ? asset.licenseStartDate.split?.("T")[0] || asset.licenseStartDate
        : "",
      licenseExpiry: asset.licenseExpiry
        ? asset.licenseExpiry.split?.("T")[0] || asset.licenseExpiry
        : "",
      renewalCycle: asset.renewalCycle || "",
      renewalReminder: !!asset.renewalReminder,
      totalLicenses: asset.totalLicenses ?? "",
      licensesAssigned: asset.licensesAssigned ?? "",
      // Financial
      costPerUnit: asset.costPerUnit ?? "",
      totalCost: asset.totalCost ?? "",
      currency: asset.currency || "",
      costCenter: asset.costCenter || "",
      purchaseDate: asset.purchaseDate
        ? asset.purchaseDate.split?.("T")[0] || asset.purchaseDate
        : "",
      purchaseOrder: asset.purchaseOrder || "",
      contractTerm: asset.contractTerm || "",
      // Support
      supportVendor: asset.supportContract?.vendorContact || asset.supportVendor || "",
      supportEmail: asset.supportEmail || "",
      supportPhone: asset.supportPhone || "",
      vendorContactDetails: asset.vendorContactDetails || "",
      // Assignment
      assignedDepartment: asset.assignedDepartment || "",
      // Compliance & Risk
      complianceStatus: asset.complianceStatus || "",
      criticality: asset.criticality || "",
      riskClassification: asset.riskClassification || "",
      authenticationMethod: asset.authenticationMethod || "",
      lastAccess: asset.lastAccess ? asset.lastAccess.split?.("T")[0] || asset.lastAccess : "",
      // misc
      subscriptionId: asset.subscriptionId || "",
    });
  };

  // Submit edited form (updates asset on server)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;

    try {
      // Prepare payload: only send fields that are in editForm
      const payload = {
        ...editForm,
        // Convert numeric fields
        totalLicenses: editForm.totalLicenses === "" ? undefined : Number(editForm.totalLicenses),
        licensesAssigned:
          editForm.licensesAssigned === "" ? undefined : Number(editForm.licensesAssigned),
        costPerUnit: editForm.costPerUnit === "" ? undefined : Number(editForm.costPerUnit),
        totalCost: editForm.totalCost === "" ? undefined : Number(editForm.totalCost),
      };

      const updatedAsset = await updateSoftwareAsset(editingAsset._id, payload);
      // If API returns updated object, replace in client state; otherwise refresh
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

  // Pagination calculations (used by PART 2)
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = softwareAssets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(softwareAssets.length / itemsPerPage));

  // Helper to change page
  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    // optional: scroll into view of grid if desired (keeps layout same)
    const el = document.querySelector(".inventory-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // PART 2 will contain the return(...) jsx including listing, pagination UI,
  // PART 3 will contain the View modal, and PART 4 the Edit modal.
  // Paste Parts 2-4 immediately after this block (in order) to complete the component.
// PART 2 of 4 — Table/List rendering + Pagination UI (continues inside return)

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">Software Inventory</h2>

      {/* Software List Grid */}
      <div className="inventory-grid">
        {currentItems.length === 0 ? (
          <p>No software assets found.</p>
        ) : (
          currentItems.map((asset, index) => (
            <motion.div
              key={asset._id}
              className="inventory-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <h3 className="card-title">
                {asset.name || "Unnamed Software"}{" "}
                <span className="card-version">({asset.version || "N/A"})</span>
              </h3>

              <p><strong>Publisher:</strong> {asset.publisher || "N/A"}</p>
              <p><strong>Category:</strong> {asset.category || "N/A"}</p>
              <p><strong>Status:</strong> {asset.status || "N/A"}</p>
              <p><strong>License Type:</strong> {asset.licenseType || "N/A"}</p>

              {/* Action Buttons */}
              <div className="card-actions">
                <button
                  className="view-btn"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <FontAwesomeIcon icon={faEye} /> View
                </button>

                <button
                  className="edit-btn"
                  onClick={() => openEditModal(asset)}
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(asset._id)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <button
          className="page-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, pageIndex) => {
          const pageNum = pageIndex + 1;
          return (
            <button
              key={pageNum}
              className={`page-number ${currentPage === pageNum ? "active" : ""}`}
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          className="page-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      {/* ====================== VIEW MODAL ====================== */}
      <AnimatePresence>
        {selectedAsset && (
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
              <h3>{selectedAsset.name || "Software"} - Details</h3>

              <div className="view-details-grid">
                <p><strong>Name:</strong> {selectedAsset.name || "N/A"}</p>
                <p><strong>Version:</strong> {selectedAsset.version || "N/A"}</p>
                <p><strong>Publisher:</strong> {selectedAsset.publisher || "N/A"}</p>
                <p><strong>Category:</strong> {selectedAsset.category || "N/A"}</p>
                <p><strong>Status:</strong> {selectedAsset.status || "N/A"}</p>
                <p><strong>License Type:</strong> {selectedAsset.licenseType || "N/A"}</p>
                <p><strong>License Key:</strong> {selectedAsset.licenseKey || "N/A"}</p>
                <p><strong>License Model:</strong> {selectedAsset.licenseModel || "N/A"}</p>
                <p><strong>Licenses Assigned:</strong> {selectedAsset.licensesAssigned || 0}</p>
                <p><strong>Total Licenses:</strong> {selectedAsset.totalLicenses || 0}</p>
                <p><strong>License Expiry:</strong> 
                  {selectedAsset.licenseExpiry ? new Date(selectedAsset.licenseExpiry).toLocaleDateString() : "N/A"}
                </p>
                <p><strong>Purchase Date:</strong> 
                  {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : "N/A"}
                </p>
                <p><strong>Cost Per Unit:</strong> ₹{selectedAsset.costPerUnit || 0}</p>
                <p><strong>Total Cost:</strong> ₹{selectedAsset.totalCost || 0}</p>
                <p><strong>Business Unit:</strong> {selectedAsset.businessUnit || "N/A"}</p>
                <p><strong>Criticality:</strong> {selectedAsset.criticality || "N/A"}</p>
                <p><strong>Risk Classification:</strong> {selectedAsset.riskClassification || "N/A"}</p>
                <p><strong>Authentication Method:</strong> {selectedAsset.authenticationMethod || "N/A"}</p>
                <p><strong>Last Access:</strong> 
                  {selectedAsset.lastAccess ? new Date(selectedAsset.lastAccess).toLocaleDateString() : "N/A"}
                </p>
                <p><strong>Assigned Users:</strong> 
                  {selectedAsset.assignedUsers?.length ? selectedAsset.assignedUsers.join(", ") : "None"}
                </p>
                <p><strong>Linked Devices:</strong> 
                  {selectedAsset.linkedDevices?.length ? selectedAsset.linkedDevices.join(", ") : "None"}
                </p>
                <p><strong>Integration Dependencies:</strong> 
                  {selectedAsset.integrationDependencies?.length ? selectedAsset.integrationDependencies.join(", ") : "None"}
                </p>
                <p><strong>Audit History:</strong> 
                  {selectedAsset.auditHistory?.length ? selectedAsset.auditHistory.join(", ") : "None"}
                </p>
              </div>

              <button className="close-btn" onClick={() => setSelectedAsset(null)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
{/* ====================== EDIT MODAL ====================== */}
<AnimatePresence>
  {editingAsset && (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="overlay-content">
        <h3>Edit {editingAsset.name}</h3>

        <form onSubmit={handleEditSubmit} className="overlay-form">
          {/* ---- Basic Info ---- */}
          <input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
          <input value={editForm.version || ""} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} placeholder="Version" />
          <input value={editForm.publisher || ""} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} placeholder="Publisher" />
          <input value={editForm.assetTag || ""} onChange={(e) => setEditForm({ ...editForm, assetTag: e.target.value })} placeholder="Asset Tag" />
          <input value={editForm.installLocation || ""} onChange={(e) => setEditForm({ ...editForm, installLocation: e.target.value })} placeholder="Install Location" />

          {/* ---- License Info ---- */}
          <input value={editForm.licenseKey || ""} onChange={(e) => setEditForm({ ...editForm, licenseKey: e.target.value })} placeholder="License Key" />
          <input value={editForm.licenseType || ""} onChange={(e) => setEditForm({ ...editForm, licenseType: e.target.value })} placeholder="License Type" />
          <input value={editForm.licenseModel || ""} onChange={(e) => setEditForm({ ...editForm, licenseModel: e.target.value })} placeholder="License Model" />
          <input value={editForm.licenseMetric || ""} onChange={(e) => setEditForm({ ...editForm, licenseMetric: e.target.value })} placeholder="License Metric" />
          <input value={editForm.licenseUse || ""} onChange={(e) => setEditForm({ ...editForm, licenseUse: e.target.value })} placeholder="License Use" />

          <label>License Start Date:</label>
          <input type="date" value={editForm.licenseStartDate ? editForm.licenseStartDate.split("T")[0] : ""} onChange={(e) => setEditForm({ ...editForm, licenseStartDate: e.target.value })} />

          <label>License Expiry:</label>
          <input type="date" value={editForm.licenseExpiry ? editForm.licenseExpiry.split("T")[0] : ""} onChange={(e) => setEditForm({ ...editForm, licenseExpiry: e.target.value })} />

          <input value={editForm.renewalCycle || ""} onChange={(e) => setEditForm({ ...editForm, renewalCycle: e.target.value })} placeholder="Renewal Cycle (Monthly / Yearly)" />

          {/* ---- Financial Info ---- */}
          <label>Purchase Date:</label>
          <input type="date" value={editForm.purchaseDate ? editForm.purchaseDate.split("T")[0] : ""} onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })} />
          <input type="number" value={editForm.costPerUnit || ""} onChange={(e) => setEditForm({ ...editForm, costPerUnit: e.target.value })} placeholder="Cost Per Unit" />
          <input type="number" value={editForm.totalCost || ""} onChange={(e) => setEditForm({ ...editForm, totalCost: e.target.value })} placeholder="Total Cost" />
          <input value={editForm.currency || ""} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} placeholder="Currency" />
          <input value={editForm.costCenter || ""} onChange={(e) => setEditForm({ ...editForm, costCenter: e.target.value })} placeholder="Cost Center" />
          <input value={editForm.purchaseOrder || ""} onChange={(e) => setEditForm({ ...editForm, purchaseOrder: e.target.value })} placeholder="Purchase Order" />

          {/* ---- Assignment & Devices ---- */}
          <input value={editForm.businessUnit || ""} onChange={(e) => setEditForm({ ...editForm, businessUnit: e.target.value })} placeholder="Business Unit" />
          <textarea value={editForm.assignedUsers?.join(", ") || ""} onChange={(e) => setEditForm({ ...editForm, assignedUsers: e.target.value.split(",") })} placeholder="Assigned Users (comma-separated)" />

          {/* ---- Compliance ---- */}
          <input value={editForm.complianceStatus || ""} onChange={(e) => setEditForm({ ...editForm, complianceStatus: e.target.value })} placeholder="Compliance Status" />
          <input value={editForm.criticality || ""} onChange={(e) => setEditForm({ ...editForm, criticality: e.target.value })} placeholder="Criticality" />
          <input value={editForm.riskClassification || ""} onChange={(e) => setEditForm({ ...editForm, riskClassification: e.target.value })} placeholder="Risk Classification" />
          <input value={editForm.authenticationMethod || ""} onChange={(e) => setEditForm({ ...editForm, authenticationMethod: e.target.value })} placeholder="Authentication Method" />

          {/* ---- Vendor & Integration ---- */}
          <input value={editForm.vendorContactDetails || ""} onChange={(e) => setEditForm({ ...editForm, vendorContactDetails: e.target.value })} placeholder="Vendor Contact Details" />
          <textarea value={editForm.integrationDependencies?.join(", ") || ""} onChange={(e) => setEditForm({ ...editForm, integrationDependencies: e.target.value.split(",") })} placeholder="Integration Dependencies (comma-separated)" />

          {/* ---- Buttons ---- */}
          <div className="modal-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="close-btn" onClick={() => setEditingAsset(null)}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </>
  );
};

export default SoftwareAssetList;


export default SoftwareAssetList;
