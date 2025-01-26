import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnits, getLocations, getCategories, getStatuses } from '../Services/ApiServices';  // Import your API services
import '../Page_styles/AssetCapture.css';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

const AssetCapture = () => {
  // Function to generate asset code
  const generateAssetCode = async () => {
    const response = await fetch('https://asset-manager-new.onrender.com/api/assets/asset-code');
    const data = await response.json();
    return data.assetCode;
  };

  // Function to generate unique barcode
  const generateUniqueBarcode = async () => {
    const response = await fetch('https://asset-manager-new.onrender.com/api/assets/generate-barcode');
    const data = await response.json();
    return data.barcodeNumber;
  };

  // Default form data state
  const defaultFormData = {
    assetCode: '',
    assetCategory: '',
    barcodeNumber: '',
    assetName: '',
    associateUnit: '',
    locationName: '',
    assetSpecification: '',
    assetStatus: '',
    DOP: null,
    DOE: null,
    assetLifetime: '',
    purchaseFrom: '',
    PMD: '',
    image: '',
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [imagePreview, setImagePreview] = useState(null);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);  // State to store asset statuses
  const navigate = useNavigate();

  // Fetch data for units, locations, categories, and statuses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsData, locationsData, categoriesData, statusesData] = await Promise.all([
          getUnits(),
          getLocations(),
          getCategories(),
          getStatuses(),  // Fetch the asset statuses
        ]);
        setUnits(unitsData);
        setLocations(locationsData);
        setCategories(categoriesData);
        setStatuses(statusesData);  // Set the statuses
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const selectedFile = files[0];
      setFormData((prevData) => ({
        ...prevData,
        image: selectedFile,
      }));

      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setImagePreview(fileReader.result);
      };
      if (selectedFile) {
        fileReader.readAsDataURL(selectedFile);
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle date change for DOP and DOE
  const handleDateChange = (date, name) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: date };

      if (updatedData.DOP && updatedData.DOE) {
        const lifetime = calculateLifetime(updatedData.DOP, updatedData.DOE);
        updatedData.assetLifetime = lifetime;
      }

      return updatedData;
    });
  };

  // Calculate lifetime based on DOP and DOE
  const calculateLifetime = (DOP, DOE) => {
    if (!DOP || !DOE) return '';
    const startDate = new Date(DOP);
    const endDate = new Date(DOE);
    const diffTime = endDate - startDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return `${diffDays} days`;
  };

  // Save asset to the database
  const saveAssetToDatabase = async (data) => {
    const formData = new FormData();
    for (let key in data) {
      if (key !== 'image') {
        formData.append(key, data[key]);
      }
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    try {
      const response = await fetch('https://asset-manager-new.onrender.com/api/assets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Error response:", error);
        alert(`Error: ${error}`);
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

  // Handle adding asset
  const handleAddAsset = async (e) => {
    e.preventDefault();
    const newAssetCode = await generateAssetCode();
    const newBarcode = await generateUniqueBarcode();

    const updatedFormData = {
      ...formData,
      assetCode: newAssetCode,
      barcodeNumber: newBarcode,
    };

    if (!formData.assetName || !formData.locationName || !formData.assetCategory || !formData.associateUnit || !formData.assetStatus) {
      alert('Please fill in all required fields.');
      return;
    }

    const unit = units.find(unit => unit._id === formData.associateUnit);
    const location = locations.find(location => location._id === formData.locationName);
    const category = categories.find(category => category._id === formData.assetCategory);
    const status = statuses.find(status => status._id === formData.assetStatus);  // Get selected status

    const assetData = {
      ...updatedFormData,
      associateUnit: unit ? unit._id : '',  // Save the ID
      locationName: location ? location._id : '',  // Save the ID
      assetCategory: category ? category._id : '',  // Save the ID
      assetStatus: status ? status._id : '',  // Save the ID
    };

    const isSuccess = await saveAssetToDatabase(assetData);
    if (isSuccess) {
      navigate('/Inventory');
    }
  };

  // Handle adding another asset
  const handleAddAnother = async (e) => {
    e.preventDefault();

    const newAssetCode = await generateAssetCode();
    const newBarcode = await generateUniqueBarcode();

    const updatedFormData = {
      ...formData,
      assetCode: newAssetCode,
      barcodeNumber: newBarcode,
    };

    if (!formData.assetName || !formData.locationName || !formData.assetCategory || !formData.associateUnit || !formData.assetStatus) {
      alert('Please fill in all required fields.');
      return;
    }

    const unit = units.find(unit => unit._id === formData.associateUnit);
    const location = locations.find(location => location._id === formData.locationName);
    const category = categories.find(category => category._id === formData.assetCategory);
    const status = statuses.find(status => status._id === formData.assetStatus);  // Get selected status

    const assetData = {
      ...updatedFormData,
      associateUnit: unit ? unit._id : '',  // Save the ID
      locationName: location ? location._id : '',  // Save the ID
      assetCategory: category ? category._id : '',  // Save the ID
      assetStatus: status ? status._id : '',  // Save the ID
    };

    const isSuccess = await saveAssetToDatabase(assetData);
    if (isSuccess) {
      setFormData(defaultFormData);  // Reset the form for adding another asset
      setImagePreview(null);
    }
  };

  return (
    <div className="asset-container">
      <div className="asset-form">
        <div className="asset-heading">New Asset</div>
        <form className="capture-form">
          <div className="input-area">
            {/* Asset Name */}
            <div className="form-entry">
              <p>Asset Name:</p>
              <input
                name="assetName"
                type="text"
                value={formData.assetName}
                onChange={handleChange}
                />
            </div>
            {/* Asset Category */}
            <div className="form-entry">
              <p>Asset Category:</p>
              <select
                name="assetCategory"
                value={formData.assetCategory}
                onChange={handleChange}
                className="option-box"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}  {/* Show the name, store the _id */}
                  </option>
                ))}
              </select>
            </div>



            {/* Asset Specification */}
            <div className="form-entry">
              <p>Asset Specifications:</p>
              <input
                name="assetSpecification"
                type="text"
                value={formData.assetSpecification}
                onChange={handleChange}
              />
            </div>

            {/* Associate Unit */}
            <div className="form-entry">
              <p>Associate Unit:</p>
              <select
                name="associateUnit"
                value={formData.associateUnit}
                onChange={handleChange}
                className="option-box"
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.name}  {/* Show the name, store the _id */}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Name */}
            <div className="form-entry">
              <p>Location Name:</p>
              <select
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                className="option-box"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name}  {/* Show the name, store the _id */}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Status */}
            <div className="form-entry">
              <p>Asset Status:</p>
              <select
                name="assetStatus"
                value={formData.assetStatus}
                onChange={handleChange}
                className="option-box"
              >
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.name}  {/* Show the name, store the _id */}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Purchase (DOP) */}
            <div className="form-entry">
              <p>Date of Purchase:</p>
              <DatePicker
                onChange={(date) => handleDateChange(date, 'DOP')}
                value={formData.DOP}
              />
            </div>

            {/* Date of Expiry (DOE) */}
            <div className="form-entry">
              <p>Date of Expiry:</p>
              <DatePicker
                onChange={(date) => handleDateChange(date, 'DOE')}
                value={formData.DOE}
              />
            </div>

            {/* Purchased From */}
            <div className="form-entry">
              <p>Purchased From:</p>
              <input
                name="purchaseFrom"
                type="text"
                value={formData.purchaseFrom}
                onChange={handleChange}
              />
            </div>
            
            {/* Asset Lifetime */}
            <div className="form-entry">
              <p>Asset Lifetime:</p>
              <input
                name="assetLifetime"
                type="text"
                value={formData.assetLifetime}
                onChange={handleChange}
                placeholder="Lifetime (in days)"
                disabled
              />
            </div>


            {/* Preventive Maintenance Date (PMD) */}
            <div className="form-entry">
              <p>Preventive Maintenance Date:</p>
              <input
                name="PMD"
                type="text"
                value={formData.PMD}
                onChange={handleChange}
              />
            </div>

            {/* Image Upload */}
            <div className="form-entry">
              <p>Upload Image:</p>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Asset Preview" height={100}/>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-heading">
            <button className="asset-btn" onClick={handleAddAsset}>
              Add Asset
            </button>
            <button className="asset-btn" onClick={handleAddAnother}>
              Add Another
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetCapture;
