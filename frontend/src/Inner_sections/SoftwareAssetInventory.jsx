// src/Pages/SoftwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getSoftwareAssets,
  deleteSoftwareAsset,
  updateSoftwareAsset,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/ListPage.css";
import { 
  getCategories, 
  getLocations, 
  getStatuses 
} from "../Services/ApiServices";

const SoftwareAssetList = () => {
  const [softwareAssets, setSoftwareAssets] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  
    const [selectedAsset, setSelectedAsset] = useState(null);

  // Fetch assets
  useEffect(() => {
    const fetchMetaData = async () => {
        try {
          const [cats, locs, statusesList] = await Promise.all([
            getCategories(),
            getLocations(),
            getStatuses()
          ]);
          setCategories(cats);
          setLocations(locs);
          setStatuses(statusesList);
        } catch (err) {
          Swal.fire("Error", err.message, "error");
        }
      };
    const fetchAssets = async () => {
      try {
        const res = await getSoftwareAssets();
        
    console.log(res)
        if (res.success && Array.isArray(res.data)) {
          setSoftwareAssets(res.data);
        } else {
          setSoftwareAssets([]);
        }
      } catch (err) {
        console.error("Error fetching software assets:", err);
        setSoftwareAssets([]);
      }
    };
    fetchAssets();
    fetchMetaData();
    console.log(statuses)
  }, []);

  // Delete asset
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the software asset!",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSoftwareAsset(id);
          setSoftwareAssets(softwareAssets.filter((a) => a._id !== id));
          Swal.fire("Deleted!", "Software asset deleted.", "success");
        } catch {
          Swal.fire("Error", "Failed to delete software asset.", "error");
        }
      }
    });
  };

  // Edit overlay
  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setEditForm({ ...asset });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateSoftwareAsset(editingAsset._id, editForm);
      setSoftwareAssets((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
      Swal.fire("Updated!", "Software asset updated successfully.", "success");
      setEditingAsset(null);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = softwareAssets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(softwareAssets.length / itemsPerPage);

  return (
    <div className="list-container">
      <h2 className="list-title">📦 Software Assets</h2>

      <div className="asset-grid">
        {currentItems.map((asset) => (
          <div key={asset._id} className="asset-card">
            <h3>{asset.name}</h3>
            <p><strong>Version:</strong> {asset.version || "N/A"}</p>
            <p><strong>Publisher:</strong> {asset.publisher || "N/A"}</p>
            <p><strong>Category:</strong> {categories.find(c => c._id === asset.category)?.name || "N/A"}</p>
            <p><strong>Licenses:</strong> {asset.licensesAssigned}/{asset.totalLicenses}</p>
            <p><strong>complianceStatus:</strong>{statuses.find(s => s._id === asset.complianceStatus)?.name || "N/A"}</p>
            <p><strong>Model:</strong> {asset.licenseModel}</p>
            <p><strong>Location:</strong> {asset.installLocation}</p>

            <div className="card-actions">
              <button
                              className="view-btn"
                              onClick={() => setSelectedAsset(asset)}
                            >
                              <FontAwesomeIcon icon={faEye} /> View
                            </button>
              <button className="edit-btn" onClick={() => handleEdit(asset)}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(asset._id)}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
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


        {/* View Overlay */}
      {selectedAsset && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>{selectedAsset.name} - Details</h3>
            <p>
              <strong>Assigned To :</strong> {selectedAsset.assignedTo}
            </p>
            <p>
              <strong>License Type:</strong> {selectedAsset.licenseType}
            </p>
            <p>
              <strong>Date of Issue:</strong>{" "}
              {new Date(selectedAsset.purchaseDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Date of Expiry:</strong>{" "}
              {new Date(selectedAsset.licenseExpiry).toLocaleDateString()}
            </p>
            <p>
              <strong>License Use:</strong> {selectedAsset.licenseUse}
            </p>

            <button
              className="close-btn"
              onClick={() => setSelectedAsset(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Edit Overlay */}
      {editingAsset && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="overlay-title">Edit Software - {editingAsset.name}</h2>
            <form onSubmit={handleEditSubmit} className="overlay-form">
              <div className="form-group">
                <label>Name</label>
                <input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Version</label>
                <input value={editForm.version || ""} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input value={editForm.publisher || ""} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input value={editForm.category || ""} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Total Licenses</label>
                <input type="number" value={editForm.totalLicenses || ""} onChange={(e) => setEditForm({ ...editForm, totalLicenses: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assigned Licenses</label>
                <input type="number" value={editForm.licensesAssigned || ""} onChange={(e) => setEditForm({ ...editForm, licensesAssigned: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="close-btn" onClick={() => setEditingAsset(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoftwareAssetList;
