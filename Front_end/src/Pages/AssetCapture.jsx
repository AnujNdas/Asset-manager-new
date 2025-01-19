import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Page_styles/AssetCapture.css';

const AssetCapture = () => {
  const defaultFormData = {
    assetCode: '',
    assetCategory: '',
    barcodeNumber: '',
    assetName: '',
    associateUnit: '',
    locationName: '',
    assetSpecification: '',
    assetStatus: '',
    DOP: '',
    DOE: '',
    assetLifetime: '',
    purchaseFrom: '',
    PMD: '',
    remarks: '',
  };

  const [formData, setFormData] = useState(defaultFormData);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Save asset to database
  const saveAssetToDatabase = async (data) => {
    try {
      // const apiurl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch('https://asset-manager-backend-v2no.onrender.com/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add asset'}`);
        return false;
      }
      const dataResponse = await response.json();
      console.log('Asset added:', dataResponse);
      alert('Asset added successfully!');
      return true;
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the asset.');
      return false;
    }
  };

  // Handle form submission for "Add Asset"
  const handleAddAsset = async (e) => {
    e.preventDefault();

    // Validation check (optional)
    if (!formData.assetCode || !formData.assetName || !formData.locationName) {
      alert('Please fill in all required fields.');
      return;
    }

    const isSuccess = await saveAssetToDatabase(formData);
    if (isSuccess) {
      navigate('/Inventory'); // Navigate to inventory page
    }
  };

  // Handle form submission for "Add Another"
  const handleAddAnother = async (e) => {
    e.preventDefault();

    // Validation check (optional)
    if (!formData.assetCode || !formData.assetName || !formData.locationName) {
      alert('Please fill in all required fields.');
      return;
    }

    const isSuccess = await saveAssetToDatabase(formData);
    if (isSuccess) {
      setFormData(defaultFormData); // Clear the form for adding another asset
    }
  };

  return (
    <div className='asset-container'>
      <div className="asset-form">
        <div className="asset-heading">
          New Asset
        </div>
        <form className='capture-form'>
          <div className="input-area">
            <div className="form-entry">
              <p> Asset Code :-</p>
              <input
                name='assetCode'
                type="text"
                value={formData.assetCode}
                onChange={handleChange}
                placeholder='Code'
              />
            </div>
            <div className="form-entry">
              <p> Asset Category :-</p>
              <input
                name='assetCategory'
                type="text"
                value={formData.assetCategory}
                onChange={handleChange}
                placeholder='Category'
              />
            </div>
            <div className="form-entry">
              <p> Barcode Number :-</p>
              <input
                name='barcodeNumber'
                type="text"
                value={formData.barcodeNumber}
                onChange={handleChange}
                placeholder='Barcode'
              />
            </div>
            <div className="form-entry">
              <p> Asset Name :-</p>
              <input
                name='assetName'
                type="text"
                value={formData.assetName}
                onChange={handleChange}
                placeholder='Asset Name'
              />
            </div>
            <div className="form-entry">
              <p> Associate Unit :-</p>
              <input
                name='associateUnit'
                type="text"
                value={formData.associateUnit}
                onChange={handleChange}
                placeholder='Unit'
              />
            </div>
            <div className="form-entry">
              <p> Location Name :-</p>
              <input
                name='locationName'
                type="text"
                value={formData.locationName}
                onChange={handleChange}
                placeholder='Location'
              />
            </div>
            <div className="form-entry">
              <p> Asset Specifications :-</p>
              <input
                name='assetSpecification'
                type="text"
                value={formData.assetSpecification}
                onChange={handleChange}
                placeholder='Specifications'
              />
            </div>
            <div className="form-entry">
              <p> Asset Status :-</p>
              <input
                name='assetStatus'
                type="text"
                value={formData.assetStatus}
                onChange={handleChange}
                placeholder='Status'
              />
            </div>
            <div className="form-entry">
              <p> Date of Purchase :-</p>
              <input
                name='DOP'
                type="text"
                value={formData.DOP}
                onChange={handleChange}
                placeholder='D-O-P'
              />
            </div>
            <div className="form-entry">
              <p> Date of Expiry :-</p>
              <input
                name='DOE'
                type="text"
                value={formData.DOE}
                onChange={handleChange}
                placeholder='D-O-E'
              />
            </div>
            <div className="form-entry">
              <p> Asset Lifetime :-</p>
              <input
                name='assetLifetime'
                type="text"
                value={formData.assetLifetime}
                onChange={handleChange}
                placeholder='Lifetime'
              />
            </div>
            <div className="form-entry">
              <p> Purchased From :-</p>
              <input
                name='purchaseFrom'
                type="text"
                value={formData.purchaseFrom}
                onChange={handleChange}
                placeholder='Purchased From'
              />
            </div>
            <div className="form-entry">
              <p> Preventive Maintenance Date :-</p>
              <input
                name='PMD'
                type="text"
                value={formData.PMD}
                onChange={handleChange}
                placeholder='P-M-D'
              />
            </div>
            <div className="form-entry">
              <p> Remarks :-</p>
              <input
                name='remarks'
                type="text"
                value={formData.remarks}
                onChange={handleChange}
                placeholder='Remarks'
              />
            </div>
          </div>
          <div className="form-heading">
            <button type='button' className='asset-btn' onClick={handleAddAsset}>
              Add Asset
            </button>
            <button type='button' className='asset-btn' onClick={handleAddAnother}>
              Add Another
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetCapture;
