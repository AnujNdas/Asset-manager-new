import React, { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import '../Page_styles/Inventory.css'

const Inventory = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('https://asset-manager-backend-v2no.onrender.com/api/assets');
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

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='table-container'>
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
              <th>Remarks</th>
              <th>Date of Purchase</th>
              <th>Expected Date of Expiry</th>
              <th>Asset Lifetime</th>
              <th>Purchased From</th>
              <th>Preventive Maintenance Date</th>
              <th>Barcode</th>
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
                <td>{asset.remarks}</td>
                <td>{asset.DOP}</td>
                <td>{asset.DOE}</td>
                <td>{asset.assetLifetime}</td>
                <td>{asset.purchaseFrom}</td>
                <td>{asset.PMD}</td>
                <td>
                  <Barcode value={asset.barcodeNumber} height={30} width={1.5}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Inventory;
