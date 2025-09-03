
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getSoftwareAssets,
  deleteSoftwareAsset,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/ListPage.css";

const SoftwareAssetList = () => {
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // Fetch assets
useEffect(() => {
  const fetchAssets = async () => {
    try {
      const res = await getSoftwareAssets();
      if (res.success && Array.isArray(res.data)) {
        setSoftwareAssets(res.data); // ✅ save only the array
      } else {
        setSoftwareAssets([]);
      }
    } catch (err) {
      console.error("Error fetching software assets:", err);
      setSoftwareAssets([]);
    }
  };
  fetchAssets();
}, []);
  // Delete asset
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the software asset!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSoftwareAsset(id);
          setSoftwareAssets(softwareAssets.filter((asset) => asset._id !== id));
          Swal.fire("Deleted!", "Software asset has been deleted.", "success");
        } catch {
          Swal.fire("Error", "Failed to delete software asset.", "error");
        }
      }
    });
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = Array.isArray(softwareAssets)
  ? softwareAssets.slice(indexOfFirst, indexOfLast)
  : [];
  const totalPages = Math.ceil(softwareAssets.length / itemsPerPage);

  return (
    <div className="list-container">
      <h2 className="list-title">📦 Software Assets</h2>

      <div className="asset-grid">
        {currentItems.map((asset) => (
          <div key={asset._id} className="asset-card">
            <h3>{asset.name}</h3>
            <p>
              <strong>Version:</strong> {asset.version || "N/A"}
            </p>
            <p>
              <strong>Publisher:</strong> {asset.publisher || "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {asset.category || "N/A"}
            </p>
            <p>
              <strong>Licenses:</strong>{" "}
              {asset.licensesAssigned}/{asset.totalLicenses}
            </p>

            <div className="card-actions">
              <button
                className="view-btn"
                onClick={() => navigate(`/software-assets/${asset._id}`)}
              >
                <FontAwesomeIcon icon={faEye} /> View
              </button>
              <button
                className="edit-btn"
                onClick={() => navigate(`/software-assets/edit/${asset._id}`)}
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
    </div>
  );
};

export default SoftwareAssetList;
