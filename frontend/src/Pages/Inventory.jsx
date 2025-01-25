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
  const [editFormData, setEditFormData] = useState({
    assetName: '',
    assetSpecification: '',
    assetCategory: '',
    locationName: '',
    assetStatus: '',
    DOP: '',
    DOE:'',
    assetLifetime:'',
    purchaseFrom:'',
    image:'',
  });
  const [isEditing, setIsEditing] = useState(false);

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
  const handleEditClick = (asset) => {
    // Ensure all values in `asset` have a fallback to avoid `undefined` or `null` values
    setSelectedAsset(asset);
    setEditFormData({
      assetName: asset.assetName || '', // Fallback to empty string if undefined or null
      assetSpecification: asset.assetSpecification || '', // Ensure no undefined or null values
      assetCategory: asset.assetCategory || '',
      locationName: asset.locationName || '',
      assetStatus: asset.assetStatus || '',
      DOP: asset.DOP || '', // Date of Purchase (ensure it's a string or default)
      DOE: asset.DOE || '', // Date of Expiry (ensure it's a string or default)
      purchaseFrom: asset.purchaseFrom || '',
      image: asset.image || '', // Ensure there's a fallback for image
      assetLifetime: asset.assetLifetime || '', // Ensure assetLifetime is defined
    });
    setIsEditing(true);
  };
  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();  // Use FormData for file uploads
  
    // Append regular form fields (don't send the image field as string or object, send it separately)
    Object.keys(editFormData).forEach((key) => {
      if (key !== 'image') {  // Don't append the image directly to the form data
        formData.append(key, editFormData[key]);
      }
    });
  
    // If there's an image, append the file object
    if (editFormData.image) {
      formData.append('image', editFormData.image);
    }
  
    try {
      const response = await fetch(`https://asset-manager-new.onrender.com/api/assets/${selectedAsset._id}`, {
        method: 'PUT',
        body: formData,  // Send the form data with the image
      });
  
      if (!response.ok) {
        throw new Error('Failed to update asset');
      }
  
      const updatedAsset = await response.json();
      setAssets(assets.map((asset) => (asset._id === updatedAsset._id ? updatedAsset : asset)));
      alert('Asset updated successfully!');
      setIsEditing(false);  // Close the edit form
    } catch (err) {
      setError(err.message);
      alert('Error updating asset');
    }
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
        setAssets(assets.filter((asset) => asset._id !== assetId));
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
                  <button className="edit-btn" onClick={() => handleEditClick(asset)}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(asset._id)}>
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
                <img 
                  src={selectedAsset.image ? `https://asset-manager-new.onrender.com${selectedAsset.image}` : 'not loaded'} 
                  alt={selectedAsset.assetName} 
                  width="100" 
                />
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
            <button onClick={closeOverlay} className="close-btn">Close</button>
          </div>
        </div>
      )}

      {/* Apply blur to the background when overlay is visible */}
      {showOverlay && <div className="overlay-background"></div>}

      {/* Edit Asset Form */}
      {isEditing && (
        <div className="edit-overlay">
          <div className="edit-overlay-content">
            <h3>Edit Asset</h3>
            <form onSubmit={handleEditSubmit} className='edit-form'>
              <div className='edit-entry'>
                <label>Asset Name:</label>
                <input
                  type="text"
                  value={editFormData.assetName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assetName: e.target.value })}
                />
              </div>
              <div className='edit-entry'>
                <label>Asset Specification:</label>
                <input
                    type="text"
                    value={editFormData.assetSpecification || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, assetSpecification: e.target.value })}
                  />
              </div>
              <div className="edit-entry">
                <label>Asset Category:</label>
                <input
                  type="text"
                  value={editFormData.assetCategory || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assetCategory: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Location:</label>
                <input
                  type="text"
                  value={editFormData.locationName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, locationName: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Status:</label>
                <input
                  type="text"
                  value={editFormData.assetStatus || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assetStatus: e.target.value })}
                />
              </div>

              <div className="edit-entry">
                <label>Date of Purchase:</label>
                <input
                  type="date"
                  value={editFormData.DOP}
                  onChange={(e) => setEditFormData({ ...editFormData, DOP: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Date of Expire:</label>
                <input
                  type="date"
                  value={editFormData.DOE || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, DOE: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Asset Lifetime :</label>
                <input
                  type="date"
                  value={editFormData.assetLifetime || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assetLifetime: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Purchase From :</label>
                <input
                  type="text"
                  value={editFormData.purchaseFrom || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, purchaseFrom: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Image:</label>
                <input
                  type="file"
                  onChange={(e) => setEditFormData({ ...editFormData, image: e.target.files[0] })}  // Store the file object
                />
              </div>

             
              {/* Add other fields as needed */}
              <button type="submit" className='submit-btn'>Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className='close-btn'>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
