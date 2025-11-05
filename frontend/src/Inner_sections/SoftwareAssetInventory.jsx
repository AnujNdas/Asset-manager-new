// ✅ SoftwareInventory.jsx
import React, { useState, useEffect } from "react";
import { getSoftwareAssets, updateSoftwareAsset, deleteSoftwareAsset } from "../Services/ApiServices";
import Swal from "sweetalert2";
import "../Page_styles/InventoryCards.css"; // ✅ Your existing styles

const SoftwareInventory = () => {
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [editData, setEditData] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  // ✅ Fetch all software assets
  const fetchSoftwareData = async () => {
    try {
      const response = await getSoftwareAssets();
      if (response.success && response.data) {
        setSoftwareAssets(response.data);
      }
    } catch (error) {
      console.error("Error fetching software assets:", error);
    }
  };

  useEffect(() => {
    fetchSoftwareData();
  }, []);

  // ✅ VIEW modal handler
  const handleView = (software) => {
    setSelectedSoftware(software);
    setViewModalOpen(true);
  };

  // ✅ EDIT modal handler
  const handleEdit = (software) => {
    setEditData({ ...software });
    setEditModalOpen(true);
  };

  // ✅ DELETE handler
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await deleteSoftwareAsset(id);
        if (res.success) {
          Swal.fire("Deleted!", "Software asset removed.", "success");
          fetchSoftwareData();
        }
      } catch (err) {
        Swal.fire("Error", "Failed to delete asset.", "error");
      }
    }
  };

  // ✅ Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateSoftwareAsset(editData._id, editData);
      if (res.success) {
        Swal.fire("Updated!", "Software asset updated successfully.", "success");
        setEditModalOpen(false);
        fetchSoftwareData();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update asset.", "error");
    }
  };

  // ✅ Handle input change in Edit Modal
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  // Pagination calculations
  const indexOfLast = currentPage * itemsPerPage; 
  const indexOfFirst = indexOfLast - itemsPerPage; 
  const currentItems = softwareAssets.slice(indexOfFirst, indexOfLast); 
  const totalPages = Math.ceil(softwareAssets.length / itemsPerPage);

  return (
    <div className="software-inventory-container">
      <h2 className="page-title">Software Inventory</h2>

      {/* ✅ Software Table / Card Layout */}
      <div className="inventory-grid">
        {softwareAssets.map((software) => (
          <div className="inventory-card" key={software._id}>
            <h3>{software.name} ({software.version})</h3>
            <p><strong>Publisher:</strong> {software.publisher}</p>
            <p><strong>Category:</strong> {software.category?.name || "N/A"}</p>
            <p><strong>License Type:</strong> {software.licenseType}</p>
            <p><strong>Expiry:</strong> {software.licenseExpiry ? software.licenseExpiry.split("T")[0] : "N/A"}</p>

            <div className="inventory-actions">
              <button className="view-btn" onClick={() => handleView(software)}>👁 View</button>
              <button className="edit-btn" onClick={() => handleEdit(software)}>✏ Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(software._id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ VIEW MODAL */}
      {viewModalOpen && selectedSoftware && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Software Details</h3>
            <table className="details-table">
              <tbody>
                <tr><th>Name</th><td>{selectedSoftware.name}</td></tr>
                <tr><th>Version</th><td>{selectedSoftware.version}</td></tr>
                <tr><th>Category</th><td>{selectedSoftware.category?.name || "N/A"}</td></tr>
                <tr><th>Publisher</th><td>{selectedSoftware.publisher}</td></tr>
                <tr><th>License Key</th><td>{selectedSoftware.licenseKey}</td></tr>
                <tr><th>License Expiry</th><td>{selectedSoftware.licenseExpiry?.split("T")[0]}</td></tr>
                <tr><th>Business Unit</th><td>{selectedSoftware.businessUnit}</td></tr>
                <tr><th>Assigned To</th><td>{selectedSoftware.assignedTo?.join(", ") || "N/A"}</td></tr>
                <tr><th>Devices</th><td>{selectedSoftware.linkedDevices?.join(", ") || "N/A"}</td></tr>
                <tr><th>Total Cost</th><td>{selectedSoftware.totalCost} {selectedSoftware.currency}</td></tr>
                <tr><th>Compliance</th><td>{selectedSoftware.complianceStatus}</td></tr>
                <tr><th>Criticality</th><td>{selectedSoftware.criticality}</td></tr>
                <tr><th>Risk Level</th><td>{selectedSoftware.riskClassification}</td></tr>
                <tr><th>Support Vendor</th><td>{selectedSoftware.supportVendor}</td></tr>
              </tbody>
            </table>
            <button className="close-btn" onClick={() => setViewModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {/* 📌 Pagination */} {totalPages > 1 && ( <div className="pagination"> {[...Array(totalPages).keys()].map((n) => ( <button key={n} className={currentPage === n + 1 ? "active" : ""} onClick={() => setCurrentPage(n + 1)} > {n + 1} </button> ))} </div> )}
      {/* ✅ EDIT MODAL */}
      {editModalOpen && editData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Software</h3>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <label>Name</label>
              <input type="text" name="name" value={editData.name} onChange={handleEditChange} />

              <label>Version</label>
              <input type="text" name="version" value={editData.version} onChange={handleEditChange} />

              <label>Publisher</label>
              <input type="text" name="publisher" value={editData.publisher} onChange={handleEditChange} />

              <label>License Key</label>
              <input type="text" name="licenseKey" value={editData.licenseKey} onChange={handleEditChange} />

              <label>License Expiry</label>
              <input type="date" name="licenseExpiry" value={editData.licenseExpiry?.split("T")[0]} onChange={handleEditChange} />

              <label>Total Cost</label>
              <input type="number" name="totalCost" value={editData.totalCost || ""} onChange={handleEditChange} />

              <label>Currency</label>
              <input type="text" name="currency" value={editData.currency || ""} onChange={handleEditChange} />

              <div className="modal-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SoftwareInventory;
