// src/Pages/HardwareAssetList.jsx
import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/ListPage.css";
import { 
  getCategories, 
  getLocations, 
  getUnits, 
  getStatuses 
} from "../Services/ApiServices";


const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
    const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Fetch hardware assets
useEffect(() => {
  const fetchMetaData = async () => {
    try {
      const [cats, locs, unitsList, statusesList] = await Promise.all([
        getCategories(),
        getLocations(),
        getUnits(),
        getStatuses()
      ]);
      setCategories(cats);
      setLocations(locs);
      setUnits(unitsList);
      setStatuses(statusesList);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch("https://asset-manager-new.onrender.com/api/assets");
      if (!res.ok) throw new Error("Failed to fetch hardware assets");
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  fetchAssets();
  fetchMetaData();
  console.log(statuses)
}, []);


  // Delete asset
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the asset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`https://asset-manager-new.onrender.com/api/assets/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete asset");
        setAssets(assets.filter((a) => a._id !== id));
        Swal.fire("Deleted!", "Asset has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };
//edit overlay function 
 const handleEdit = (asset) => {
  console.log("Opening edit overlay for:", asset); // debug log
  setEditingAsset(asset);
  setEditForm({ ...asset });
};


  // Save Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
      });

      const res = await fetch(
        `https://asset-manager-new.onrender.com/api/assets/${editingAsset._id}`,
        {
          method: "PUT",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to update asset");
      const updated = await res.json();

      setAssets((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
      Swal.fire("Updated!", "Asset updated successfully.", "success");
      setEditingAsset(null);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = assets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assets.length / itemsPerPage);

  if (loading) return <p>Loading assets...</p>;

  return (
    <div className="list-container">
      <h2 className="list-title">💻 Hardware Assets</h2>

      <div className="asset-grid">
        {currentItems.length === 0 ? (
          <p>No hardware assets found.</p>
        ) : (
          currentItems.map((asset) => (
            <div key={asset._id} className="asset-card">
              {asset.image && (
                <img
                  src={`https://asset-manager-new.onrender.com${asset.image}`}
                  alt={asset.assetName}
                  className="asset-img"
                />
              )}
              <h3>{asset.assetName}</h3>
              <p>
                <strong>Code:</strong> {asset.assetCode}
              </p>
              <p>
                <strong>Specification:</strong> {asset.assetSpecification}
              </p>
              <p>
                <strong>Purchase:</strong>{" "}
                {new Date(asset.DOP).toLocaleDateString()}
              </p>
              <p>
                <strong>Expiry:</strong>{" "}
                {asset.DOE ? new Date(asset.DOE).toLocaleDateString() : "N/A"}
              </p>
             <p>
  <strong>Status:</strong> {statuses.find(s => s._id === asset.assetStatus)?.name || "N/A"}
</p>
              <div className="barcode-box">
                <Barcode value={asset.barcodeNumber} width={1.5} height={40} />
              </div>

              <div className="card-actions">
                <button
                  className="view-btn"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <FontAwesomeIcon icon={faEye} /> View
                </button>
                <button className="edit-btn" onClick={() => handleEdit(asset)}>
                  <FontAwesomeIcon icon={faPenToSquare} /> Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(asset._id)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
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
            <h3>{selectedAsset.assetName} - Details</h3>
            {selectedAsset.image && (
              <img
                src={`https://asset-manager-new.onrender.com${selectedAsset.image}`}
                alt={selectedAsset.assetName}
                className="overlay-img"
              />
            )}
            <p><strong>Asset Code:</strong> {selectedAsset.assetCode}</p>
            <p><strong>Specification:</strong> {selectedAsset.assetSpecification}</p>
            <p><strong>Date of Purchase:</strong> {new Date(selectedAsset.DOP).toLocaleDateString()}</p>
            <p><strong>Date of Expiry:</strong> {selectedAsset.DOE ? new Date(selectedAsset.DOE).toLocaleDateString() : "N/A"}</p>
            <p><strong>Purchase From:</strong> {selectedAsset.purchaseFrom}</p>
            <p><strong>Lifetime:</strong> {selectedAsset.assetLifetime}</p>
            <div className="barcode-box">
              <Barcode value={selectedAsset.barcodeNumber} width={2} height={60} />
            </div>
            <button className="close-btn" onClick={() => setSelectedAsset(null)}>
              Close
            </button>
          </div>
        </div>
      )}

{/* Edit Overlay */}
{editingAsset && (
  <div className="overlay">
    <div className="overlay-card">
      <h2 className="overlay-title">Edit Asset - {editingAsset.assetName}</h2>
      <form onSubmit={handleEditSubmit} className="overlay-form">

        {/* Asset Name */}
        <div className="form-group">
          <label>Asset Name</label>
          <input
            type="text"
            value={editForm.assetName || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, assetName: e.target.value })
            }
          />
        </div>

        {/* Specification */}
        <div className="form-group">
          <label>Specification</label>
          <input
            type="text"
            value={editForm.assetSpecification || ""}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetSpecification: e.target.value,
              })
            }
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Category</label>
          <select
            value={editForm.assetCategory || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, assetCategory: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="form-group">
          <label>Location</label>
          <select
            value={editForm.locationName || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, locationName: e.target.value })
            }
          >
            <option value="">Select Location</option>
            {locations.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div className="form-group">
          <label>Unit</label>
          <select
            value={editForm.associateUnit || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, associateUnit: e.target.value })
            }
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="form-group">
          <label>Status</label>
          <select
            value={editForm.assetStatus || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, assetStatus: e.target.value })
            }
          >
            <option value="">Select Status</option>
            {statuses.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date of Purchase */}
        <div className="form-group">
          <label>Date of Purchase</label>
          <input
            type="date"
            value={
              editForm.DOP
                ? new Date(editForm.DOP).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setEditForm({ ...editForm, DOP: e.target.value })
            }
          />
        </div>

        {/* Date of Expiry */}
        <div className="form-group">
          <label>Date of Expiry</label>
          <input
            type="date"
            value={
              editForm.DOE
                ? new Date(editForm.DOE).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setEditForm({ ...editForm, DOE: e.target.value })
            }
          />
        </div>

        {/* Purchase From */}
        <div className="form-group">
          <label>Purchase From</label>
          <input
            type="text"
            value={editForm.purchaseFrom || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, purchaseFrom: e.target.value })
            }
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Upload Image</label>
          <input
            type="file"
            onChange={(e) =>
              setEditForm({ ...editForm, image: e.target.files[0] })
            }
          />
        </div>

        {/* Actions */}
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
  </div>
)}

    </div>
  );
};

export default HardwareAssetList;
