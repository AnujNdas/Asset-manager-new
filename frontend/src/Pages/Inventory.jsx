import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import '../Page_styles/Inventory.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

const Inventory = () => {
  const barcodeconfig = {
      width: 1.5,
      height: 20,
      format: "CODE128",
      displayValue: true,
      fontOptions: "",
      font: "monospace",
      textAlign: "center",
      // textPosition: "bottom",
      // textMargin: 2,
      fontSize: 18,
      background: "transparent",
      lineColor: "#000000",
      // margin: 10,
      marginTop: undefined,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      id: undefined,
      className: undefined
  }
  // Function to format dates to yyyy-mm-dd
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ensure month is 2 digits
    const day = ('0' + date.getDate()).slice(-2); // Ensure day is 2 digits
    return `${year}-${month}-${day}`; // yyyy-mm-dd format
  };

  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [assetsPerPage] = useState(10); // Number of assets per page
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
    associateUnit: '',
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
        const response = await fetch('https://asset-manager-new.onrender.com/api/assets');
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
        const categoriesResponse = await fetch('https://asset-manager-new.onrender.com/api/category');
        const statusesResponse = await fetch('https://asset-manager-new.onrender.com/api/status');
        const locationsResponse = await fetch('https://asset-manager-new.onrender.com/api/location');
        const unitsResponse = await fetch('https://asset-manager-new.onrender.com/api/unit');
        
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
      associateUnit: units.find(unit => unit._id === asset.associateUnit)?.name || '',
      assetStatus: statuses.find(status => status._id === asset.assetStatus)?.name || '',
      DOP: asset.DOP ? formatDateForInput(asset.DOP) : '',
      DOE: asset.DOE ? formatDateForInput(asset.DOE) : '',
      purchaseFrom: asset.purchaseFrom || '',
      image: asset.image || '',
      assetLifetime: asset.assetLifetime || '',
    });
    setIsEditing(true);
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
    updatedData.associateUnit = units.find((unit) => unit.name === updatedData.associateUnit)?._id || '';
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
      const response = await fetch(`https://asset-manager-new.onrender.com/api/assets/${selectedAsset._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const updatedAsset = await response.json();

      updatedAsset.assetCategory = categories.find(
        (category) => category._id === updatedAsset.assetCategory
      )?.name || '';
      updatedAsset.locationName = locations.find(
        (location) => location._id === updatedAsset.locationName
      )?.name || '';
      updatedAsset.associateUnit = units.find((unit) => unit._id === updatedAsset.associateUnit)?.name || '';
      updatedAsset.assetStatus = statuses.find(
        (status) => status._id === updatedAsset.assetStatus
      )?.name || '';

      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset._id === updatedAsset._id ? updatedAsset : asset
        )
      );

      alert('Asset updated successfully!');
      setIsEditing(false);
      setSelectedAsset(null); // Close the modal after successful update
    } catch (err) {
      setError(err.message);
      alert('Error updating asset');
    }
    const fetchAssets = async () => {
      try {
        const response = await fetch('https://asset-manager-new.onrender.com/api/assets');
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
    fetchAssets()
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this asset?');
    if (confirmDelete) {
      try {
        const response = await fetch(`https://asset-manager-new.onrender.com/api/assets/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete asset');
        }

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

    // Pagination Logic
    const indexOfLastAsset = currentPage * assetsPerPage;
    const indexOfFirstAsset = indexOfLastAsset - assetsPerPage;
    const currentAssets = assets.slice(indexOfFirstAsset, indexOfLastAsset);
  
    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
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
              <th>Unit</th>
              <th>Date of Purchase</th>
              <th>Details</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentAssets.map((asset) => (
              <tr key={asset._id}>
                <td>{asset.assetName}</td>
                <td>{asset.assetCode}</td>
                <td>{categories.find(category => category._id === asset.assetCategory)?.name || 'Loading'}</td>
                <td>{locations.find(location => location._id === asset.locationName)?.name || 'Loading'}</td>
                <td>{statuses.find(status => status._id === asset.assetStatus)?.name || 'Loading'}</td>
                <td>{units.find(unit => unit._id === asset.associateUnit)?.name || 'Loading'}</td>
                <td>{formatDateForInput(asset.DOP)}</td>
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

       {/* Pagination Controls */}
      <div className="pages">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className='pagination'>
          Previous
        </button>

        {/* Page Number Buttons */}
        {Array.from({ length: Math.ceil(assets.length / assetsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
            style={{
              padding : "5px",
              border: "1px solid #565656"
            }}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(assets.length / assetsPerPage)}
          className='pagination'
        >
          Next
        </button>
      </div>
       {showOverlay && selectedAsset && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Asset Details</h3>
            {selectedAsset.image && (
        <div className="asset-image">
          <img
            src={`https://asset-manager-new.onrender.com${selectedAsset.image}`}
            alt={`Asset Image: ${selectedAsset.assetName}`}
            style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }}
          />
        </div>
      )}
            {/* <p><strong>Asset Code:</strong> {selectedAsset.assetCode}</p>
            <p><strong>Category:</strong> {categories.find(category => category._id === selectedAsset.assetCategory)?.name}</p>
            <p><strong>Location:</strong> {locations.find(location => location._id === selectedAsset.locationName)?.name}</p>
            <p><strong>Status:</strong> {statuses.find(status => status._id === selectedAsset.assetStatus)?.name}</p>
            <p><strong>Unit:</strong> {units.find(unit => unit._id === selectedAsset.associateUnit)?.name}</p> */}
            <div className="view">
            <div className="view-container"><p><strong>Asset Name:</strong> {selectedAsset.assetName}</p></div>
            <div className="view-container"><p><strong>Asset Specification:</strong> {selectedAsset.assetSpecification}</p></div>
            <div className="view-container"><strong>Date of Purchase:</strong><p> {formatDateForInput(selectedAsset.DOP)}</p></div>
            
            <div className="view-container"><strong>Date of Expiry:</strong><p> {formatDateForInput(selectedAsset.DOE)}</p></div>
            <div className="view-container"><strong>Purchase From:</strong><p> {selectedAsset.purchaseFrom}</p></div>
            <div className="view-container"><strong>Lifetime:</strong><p> {selectedAsset.assetLifetime}</p></div>
            <div className="view-container">
              <strong>Barcode:</strong>
              <Barcode value={selectedAsset.barcodeNumber} {...barcodeconfig}/>
            </div>
       
            <div className="buttons">
              <button onClick={closeOverlay} className='close-btn'>Close</button>
            </div>
          </div>
        </div>
            </div>
           
      )}
      {/* Edit Form */}
      {isEditing && selectedAsset && (
        <div className="edit-overlay">
          <div className="edit-overlay-content">
            <h3>Edit Asset</h3>
            <form onSubmit={handleEditSubmit} className='edit-form'>
              <div className="edit-entry">
                  <label>
                    Asset Name:
                    </label>
                    <input
                      type="text"
                      value={editFormData.assetName}
                      onChange={(e) => setEditFormData({ ...editFormData, assetName: e.target.value })}
                    />
                 
              </div>
              <div className="edit-entry">
                <label>
                  Asset Specification:
                  </label>
                  <input
                    type="text"
                    value={editFormData.assetSpecification}
                    onChange={(e) => setEditFormData({ ...editFormData, assetSpecification: e.target.value })}
                  />
                
              </div>
              <div className="edit-entry">

              <label>
                Asset Category:
                </label>
                <select
                className='option-select'
                  value={editFormData.assetCategory}
                  onChange={(e) => setEditFormData({ ...editFormData, assetCategory: e.target.value })}
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              
              </div>
              <div className="edit-entry">
                <label>
                  Location Name:
                  </label>
                  <select
                  className='option-select'
                    value={editFormData.locationName}
                    onChange={(e) => setEditFormData({ ...editFormData, locationName: e.target.value })}
                  >
                    {locations.map((location) => (
                      <option key={location._id} value={location.name}>
                        {location.name}
                      </option>
                    ))}
                  </select>
              
              </div>
              <div className="edit-entry">
                <label>
                  Unit:
                  </label>
                  <select
                  className='option-select'
                    value={editFormData.associateUnit}
                    onChange={(e) => setEditFormData({ ...editFormData, associateUnit: e.target.value })}
                  >
                    {units.map((unit) => (
                      <option key={unit._id} value={unit.name}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                
              </div>
              <div className="edit-entry">
                <label>
                  Asset Status:
                  </label>
                  <select
                  className='option-select'
                    value={editFormData.assetStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, assetStatus: e.target.value })}
                  >
                    {statuses.map((status) => (
                      <option key={status._id} value={status.name}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                
              </div>
              <div className="edit-entry">
                <label>
                  Date of Purchase:
                  </label>
                  <input
                    type="date"
                    value={editFormData.DOP}
                    onChange={(e) => setEditFormData({ ...editFormData, DOP: e.target.value })}
                  />
                
              </div>
              <div className="edit-entry">

              <label>
                Date of Expiry:
                </label>
                <input
                  type="date"
                  value={editFormData.DOE}
                  onChange={(e) => setEditFormData({ ...editFormData, DOE: e.target.value })}
                />
              
              </div>
              <div className="edit-entry">

              <label>
                Purchase From:
                </label>
                <input
                  type="text"
                  value={editFormData.purchaseFrom}
                  onChange={(e) => setEditFormData({ ...editFormData, purchaseFrom: e.target.value })}
                />
              
              </div>
              <div className="edit-entry">

              <label>
                Image:
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditFormData({ ...editFormData, image: e.target.files[0] })}
                />
              
              </div>
              {/* <div className="edit-entry">

              <label>
                Lifetime:
                <input
                  type="text"
                  value={editFormData.assetLifetime}
                  onChange={(e) => setEditFormData({ ...editFormData, assetLifetime: e.target.value })}
                />
              </label>
              </div> */}
              <div className="edit-entry">
                  <button type="submit">Save Changes</button>
              </div>
              <div className="edit-entry">
                <button type="button" onClick={() => setIsEditing(false)}>
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

export default Inventory;
