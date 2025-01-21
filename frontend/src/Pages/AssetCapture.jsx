import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Page_styles/AssetCapture.css';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

const AssetCapture = () => {
  const generateAssetCode = async () => {
    const response = await fetch('http://localhost:5001/api/assets/asset-code'); // Your backend URL
    const data = await response.json();
    return data.assetCode;
  };
  const generateUniqueBarcode = async () => {
    const response = await fetch('http://localhost:5001/api/assets/generate-barcode'); // Your backend URL
    const data = await response.json();
    return data.barcodeNumber;
  };
  const defaultFormData = {
    assetCode: '',
    assetCategory: '',
    barcodeNumber: '',
    assetName: '',
    associateUnit: '',
    locationName: '',
    assetSpecification: '',
    assetStatus: '',
    DOP: null, // Initialize as null, can be changed to a default date like new Date()
    DOE: null, // Initialize as null, same as above
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

  // Handle Date Change
  const handleDateChange = (date, name) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: date };

      // If both DOP and DOE are present, calculate lifetime
      if (updatedData.DOP && updatedData.DOE) {
        const lifetime = calculateLifetime(updatedData.DOP, updatedData.DOE);
        updatedData.assetLifetime = lifetime;
      }

      return updatedData;
    });
  };

  // Function to calculate asset lifetime in days
  const calculateLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return '';

    // Ensure DOP and DOE are Date objects
    const startDate = new Date(DOP);
    const endDate = new Date(DOE);

    // Calculate difference in milliseconds
    const diffTime = endDate - startDate;

    // Convert milliseconds to days
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return `${diffDays} days`; // Return the lifetime in days with " days" appended
  };

  // Save asset to database
  const saveAssetToDatabase = async (data) => {
    try {
      const response = await fetch('http://localhost:5001/api/assets', {
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
    const newAssetCode = await generateAssetCode();
    const newBarcode = await generateUniqueBarcode();

    const updatedFormData = {
      ...formData,
      assetCode: newAssetCode,
      barcodeNumber: newBarcode,
  };
    // Validation check (optional)
    if (!formData.assetName || !formData.locationName) {
      alert('Please fill in all required fields.');
      return;
    }

    const isSuccess = await saveAssetToDatabase(updatedFormData);
    if (isSuccess) {
      console.log(isSuccess)
      // navigate('/Inventory'); // Navigate to inventory page
    }
  };

  // Handle form submission for "Add Another"
  const handleAddAnother = async (e) => {
    e.preventDefault();

    const newAssetCode = await generateAssetCode();
    const newBarcode = await generateUniqueBarcode();

    const updatedFormData = {
      ...formData,
      assetCode: newAssetCode,
      barcodeNumber: newBarcode,
  };
    // Validation check (optional)
    if (!formData.assetName || !formData.locationName) {
      alert('Please fill in all required fields.');
      return;
    }

    const isSuccess = await saveAssetToDatabase(updatedFormData);
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
            {/* <div className="form-entry">
              <p> Asset Code :-</p>
              <input
                name='assetCode'
                type="text"
                value={formData.assetCode}
                onChange={handleChange}
                placeholder='Code'
                disabled
              />
            </div> */}
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
            {/* <div className="form-entry">
              <p> Barcode Number :-</p>
              <input
                name='barcodeNumber'
                type="text"
                value={formData.barcodeNumber}
                onChange={handleChange}
                placeholder='Barcode'
                disabled
              />
            </div> */}
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
              <DatePicker
                name="DOP"
                value={formData.DOP}
                onChange={(date) => handleDateChange(date, 'DOP')}
                dateFormat="MMMM d, yyyy"
                className='custom-DatePicker'
              />
            </div>
            <div className="form-entry">
              <p> Date of Expiry :-</p>
              <DatePicker
                name="DOE"
                value={formData.DOE}
                onChange={(date) => handleDateChange(date, 'DOE')}
                dateFormat="MMMM d, yyyy"
                className='custom-DatePicker'
              />
            </div>
            <div className="form-entry">
              <p> Asset Lifetime :-</p>
              <input
                name='assetLifetime'
                type="text"
                value={formData.assetLifetime}
                onChange={handleChange}
                placeholder='Lifetime (in days)'
                disabled
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
