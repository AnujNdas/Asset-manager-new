import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import '../Page_styles/Inventory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

const Inventory = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [editFormData, setEditFormData] = useState({
    assetName: '',
    assetSpecification: '',
    assetCategory: '',
    locationName: '',
    unit: '',
    assetStatus: '',
    DOP: '',
    DOE: '',
    assetLifetime: '',
    purchaseFrom: '',
    image: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/assets');
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        setAssets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategoriesAndStatuses = async () => {
      try {
        const categoriesResponse = await fetch('http://localhost:5001/api/category');
        const statusesResponse = await fetch('http://localhost:5001/api/status');
        const locationsResponse = await fetch('http://localhost:5001/api/location');
        const unitsResponse = await fetch('http://localhost:5001/api/unit');
        
        if (
          !categoriesResponse.ok ||
          !statusesResponse.ok ||
          !locationsResponse.ok ||
          !unitsResponse.ok
        ) {
          throw new Error('Failed to fetch required data');
        }

        const categoriesData = await categoriesResponse.json();
        const statusesData = await statusesResponse.json();
        const locationsData = await locationsResponse.json();
        const unitsData = await unitsResponse.json();

        setCategories(categoriesData);
        setStatuses(statusesData);
        setLocations(locationsData);
        setUnits(unitsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAssets();
    fetchCategoriesAndStatuses();
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
    setSelectedAsset(asset);
    setEditFormData({
      assetName: asset.assetName || '',
      assetSpecification: asset.assetSpecification || '',
      assetCategory: categories.find(category => category._id === asset.assetCategory)?.name || '',
      locationName: locations.find(location => location._id === asset.locationName)?.name || '',
      unit: units.find(unit => unit._id === asset.unit)?.name || '',
      assetStatus: statuses.find(status => status._id === asset.assetStatus)?.name || '',
      DOP: asset.DOP ? formatDate(asset.DOP) : '',
      DOE: asset.DOE ? formatDate(asset.DOE) : '',
      purchaseFrom: asset.purchaseFrom || '',
      image: asset.image || '',
      assetLifetime: asset.assetLifetime || '',
    });
    setIsEditing(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    // Convert names to IDs
    const updatedData = { ...editFormData };
  
    updatedData.assetCategory = categories.find(
      (category) => category.name === updatedData.assetCategory
    )?._id || '';
    updatedData.locationName = locations.find(
      (location) => location.name === updatedData.locationName
    )?._id || '';
    updatedData.unit = units.find((unit) => unit.name === updatedData.unit)?._id || '';
    updatedData.assetStatus = statuses.find(
      (status) => status.name === updatedData.assetStatus
    )?._id || '';
  
    const formData = new FormData();
    Object.keys(updatedData).forEach((key) => {
      if (key !== 'image') {
        formData.append(key, updatedData[key]);
      }
    });
  
    if (editFormData.image) {
      formData.append('image', editFormData.image);
    }
  
    try {
      const response = await fetch(`http://localhost:5001/api/assets/${selectedAsset._id}`, {
        method: 'PUT',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to update asset');
      }
  
      const updatedAsset = await response.json();
  
      // Convert IDs back to names for UI purposes
      updatedAsset.assetCategory = categories.find(
        (category) => category._id === updatedAsset.assetCategory
      )?.name || '';
      updatedAsset.locationName = locations.find(
        (location) => location._id === updatedAsset.locationName
      )?.name || '';
      updatedAsset.unit = units.find((unit) => unit._id === updatedAsset.unit)?.name || '';
      updatedAsset.assetStatus = statuses.find(
        (status) => status._id === updatedAsset.assetStatus
      )?.name || '';
  
      // Now update the assets state by mapping over it, replacing the updated asset
      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset._id === updatedAsset._id ? updatedAsset : asset
        ),

      );
      const fetchAssets = async () => {
        try {
          const response = await fetch('http://localhost:5001/api/assets');
          if (!response.ok) {
            throw new Error('Failed to fetch assets');
          }
          const data = await response.json();
          setAssets(data);  // Update the assets state with the latest data
        } catch (err) {
          setError(err.message);
        }
      };
            
  
      // Reset the form and close the editing state
      fetchAssets();
      setEditFormData(updatedAsset);
      setIsEditing(false);
  
      alert('Asset updated successfully!');
    } catch (err) {
      setError(err.message);
      alert('Error updating asset');
    }
  };
  

  // Handle Delete Asset
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this asset?');
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:5001/api/assets/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete asset');
        }

        // Remove the deleted asset from the state
        setAssets(assets.filter((asset) => asset._id !== id));

        alert('Asset deleted successfully!');
      } catch (err) {
        setError(err.message);
        alert('Error deleting asset');
      }
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
        <table className='inventory-table'>
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
                <td>{categories.find(category => category._id === asset.assetCategory)?.name}</td>
                <td>{locations.find(location => location._id === asset.locationName)?.name}</td>
                <td>{statuses.find(status => status._id === asset.assetStatus)?.name}</td>
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
            <form onSubmit={handleEditSubmit} className="edit-form">
              {/* Other form fields here */}
              <div className="edit-entry">
                <label>Asset Name:</label>
                <input
                  type="text"
                  value={editFormData.assetName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assetName: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Asset Specification:</label>
                <input
                  type="text"
                  value={editFormData.assetSpecification || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, assetSpecification: e.target.value })}
                />
              </div>
              <div className="edit-entry">
                <label>Asset Category:</label>
                <select
                  className="edit-dropdown"
                  value={editFormData.assetCategory || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, assetCategory: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-entry">
                <label>Location:</label>
                <select
                  className="edit-dropdown"
                  value={editFormData.locationName || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, locationName: e.target.value })
                  }
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-entry">
                <label>Unit:</label>
                <select
                  className="edit-dropdown"
                  value={editFormData.unit || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, unit: e.target.value })
                  }
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit._id} value={unit.name}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-entry">
                <label>Status:</label>
                <select
                  className="edit-dropdown"
                  value={editFormData.assetStatus || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, assetStatus: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status._id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
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
                <label>Purchase From:</label>
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
                  onChange={(e) => setEditFormData({ ...editFormData, image: e.target.files[0] })}
                />
              </div>
              <button type="submit" className="submit-btn">
                Save Changes
              </button>
            </form>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
