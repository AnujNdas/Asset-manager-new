// src/Pages/AssetCapture.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnits, getLocations, getCategories, getStatuses } from '../Services/ApiServices';
import Swal from 'sweetalert2';
import '../Page_styles/CaptureForm.css';

const API_URL = 'https://asset-manager-new.onrender.com/api';

const AssetCapture = () => {
  const navigate = useNavigate();

  const defaultFormData = {
    assetCode: '',
    assetCategory: '',
    assetName: '',
    associateUnit: '',
    locationName: '',
    assetSpecification: '',
    assetStatus: '',
    DOP: '',
    DOE: '',
    assetLifetime: '',
    purchaseFrom: '',
    image: '',
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [imagePreview, setImagePreview] = useState(null);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // ---- Helpers from your message (now using API_URL) ----
  const generateAssetCode = async () => {
    const res = await fetch(`${API_URL}/assets/asset-code`);
    console.log(res)
    if (!res.ok) throw new Error('Failed to generate asset code');
    const data = await res.json();
    return data.assetCode;
  };

  // const generateUniqueBarcode = async () => {
  //   const res = await fetch(`${API_URL}/assets/generate-barcode`);
  //   if (!res.ok) throw new Error('Failed to generate barcode');
  //   const data = await res.json();
  //   return data.barcodeNumber;
  // };

  // ---- Load classifications ----
  useEffect(() => {
    (async () => {
      try {
        const [u, l, c, s] = await Promise.all([
          getUnits(),
          getLocations(),
          getCategories(),
          getStatuses(),
        ]);
        setUnits(u || []);
        setLocations(l || []);
        setCategories(c || []);
        setStatuses(s || []);
      } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Failed to load classifications', 'error');
      }
    })();
  }, []);

  // ---- Change handlers ----
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files?.[0];
      setFormData((prev) => ({ ...prev, image: file || '' }));

      if (file) {
        const r = new FileReader();
        r.onloadend = () => setImagePreview(r.result);
        r.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // auto-calc lifetime when both dates present
      if (name === 'DOP' || name === 'DOE') {
        const { DOP, DOE } = updated;
        if (DOP && DOE) {
          const start = new Date(DOP);
          const end = new Date(DOE);
          const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
          updated.assetLifetime = Number.isFinite(days) && days >= 0 ? `${days} days` : 'Invalid';
        } else {
          updated.assetLifetime = '';
        }
      }
      return updated;
    });
  };

  // ---- Save to backend ----
  const saveAssetToDatabase = async (data) => {
    const token = sessionStorage.getItem('token');
    const payload = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') payload.append(k, v);
    });

    const res = await fetch(`${API_URL}/assets`, {
      method: 'POST',
      body: payload,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to save asset');
    }
  };

  const validateRequired = () => {
    const required = ['assetName', 'assetCategory', 'associateUnit', 'locationName', 'assetStatus'];
    const missing = required.filter((k) => !formData[k]);
    if (missing.length) {
      Swal.fire('Error', 'Please fill in all required fields.', 'error');
      return false;
    }
    return true;
  };

  // ---- Actions ----
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!validateRequired()) return;

    try {
      const [assetCode] = await Promise.all([
        generateAssetCode(),
      ]);

      const payload = { ...formData, assetCode };
      await saveAssetToDatabase(payload);

      Swal.fire('Success', 'Asset added successfully!', 'success');
      navigate('/inventory');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'Failed to add asset.', 'error');
    }
  };


return (
      <div className="capture-container">
        <h2 className='capture-title'>New Hardware Asset</h2>

        <form className="capture-form">
            <input name="assetName" value={formData.assetName} onChange={handleChange} placeholder='Asset Name' required />
          

            <select name="assetCategory" value={formData.assetCategory} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <input name="assetSpecification" value={formData.assetSpecification} onChange={handleChange} placeholder='Specification' />
          

          
            <select name="locationName" value={formData.locationName} onChange={handleChange} required>
              <option value="">Select Location</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))}
            </select>
          

          
            <select name="associateUnit" value={formData.associateUnit} onChange={handleChange} required>
              <option value="">Select Unit</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          

          
            <select name="assetStatus" value={formData.assetStatus} onChange={handleChange} required>
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          

          
            <input type="date" name="DOP" value={formData.DOP} onChange={handleChange} />
          

        
            <input type="date" name="DOE" value={formData.DOE} onChange={handleChange} />
          

          
            <input name="purchaseFrom" value={formData.purchaseFrom} onChange={handleChange} placeholder='Purcahsed From' />
          

          
            <input name="assetLifetime" value={formData.assetLifetime} placeholder='Lifetime' disabled />
          
            
{/* Camera Capture Button */}
<label className="file-btn">
  Open Camera
  <input
    type="file"
    accept="image/*"
    capture="environment"
    onChange={handleChange}
    style={{ display: "none" }}
  />
</label>

{/* Upload from Device Button */}
<label className="file-btn">
  Upload from Device
  <input
    type="file"
    accept="image/*"
    onChange={handleChange}
    style={{ display: "none" }}
  />
</label>

{/* Preview Image */}
{imagePreview && <img src={imagePreview} alt="Preview" height={100} />}

            

        <button type="submit" className="btn-primary">Save Hardware Asset</button>
          
        </form>
      </div>
    );
};

export default AssetCapture;
