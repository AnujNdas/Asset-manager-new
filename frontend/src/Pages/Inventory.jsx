import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import '../Page_styles/Inventory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

const Inventory = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('https://asset-manager-new.onrender.com/api/assets');
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        setAssets(data); // Store fetched assets in the state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setSelectedAsset(null);
  };

  const handleDelete = async (assetId) => {
    try {
      // Confirm the deletion with the user
      const confirmDelete = window.confirm('Are you sure you want to delete this asset?');
      if (!confirmDelete) return;

      // Make the DELETE request to the backend API
      const response = await fetch(`https://asset-manager-new.onrender.com/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If the deletion is successful, update the state to remove the asset from the list
        setAssets(assets.filter(asset => asset._id !== assetId));
        alert('Asset deleted successfully!');
      } else {
        throw new Error('Failed to delete asset');
      }
    } catch (err) {
      setError(err.message);
      alert('Error deleting asset');
    }
  };

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="table-container">
      <h4>Asset Details</h4>

      {assets.length === 0 ? (
        <p>No assets available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Asset Code</th>
              <th>Asset Category</th>
              <th>Location</th>
              <th>Asset Status</th>
              <th>Date of Purchase</th>
              <th>Details</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset._id}>
                <td>{asset.assetName}</td>
                <td>{asset.assetCode}</td>
                <td>{asset.assetCategory}</td>
                <td>{asset.locationName}</td>
                <td>{asset.assetStatus}</td>
                <td>{asset.DOP}</td>
                <td>
                  <button onClick={() => handleAssetClick(asset)} className="view-btn">
                    View Details
                  </button>
                </td>
                <td>
                  <button className="edit-btn">
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(asset._id)} // Pass assetId to delete
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Overlay Card */}
      {showOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Asset Details</h3>
            {selectedAsset && (
              <>
                <img src={`https://asset-manager-new.onrender.com${selectedAsset.image}`} alt={selectedAsset.assetName} width="100" />
                <p><strong>Expected Date of Expiry:</strong> {selectedAsset.DOE}</p>
                <p><strong>Asset Lifetime:</strong> {selectedAsset.assetLifetime}</p>
                <p><strong>Purchased From:</strong> {selectedAsset.purchaseFrom}</p>
                <p><strong>Preventive Maintenance Date:</strong> {selectedAsset.PMD}</p>
                <p>
                  <strong>Barcode:</strong> 
                  <Barcode value={selectedAsset.barcodeNumber} height={30} width={1.5} />
                </p>
              </>
            )}
            <button onClick={closeOverlay} className="close-btn">Close</button> {/* Close Button */}
          </div>
        </div>
      )}

      {/* Apply blur to the background when overlay is visible */}
      {showOverlay && <div className="overlay-background"></div>}
    </div>
  );
};

export default Inventory;
