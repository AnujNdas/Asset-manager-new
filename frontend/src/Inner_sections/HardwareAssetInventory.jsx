// src/Pages/HardwareAssetList.jsx
import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/ListPage.css"; // same CSS as software/core license pages

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Fetch hardware assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch("https://asset-manager-new.onrender.com/api/assets");
        if (!res.ok) throw new Error("Failed to fetch hardware assets");
        const data = await res.json();
        setAssets(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
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
                <strong>From:</strong> {asset.purchaseFrom}
              </p>
              <p>
                <strong>Status:</strong> {asset.assetStatus}
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
                <button
                  className="edit-btn"
                  onClick={() =>
                    Swal.fire("Edit Coming Soon", "Edit modal will open here", "info")
                  }
                >
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
    </div>
  );
};

export default HardwareAssetList;
