// src/pages/InstanceAssets.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Page_styles/AssetInstance.css";
import { getPendingInstances } from "../Services/ApiServices";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";

const InstanceAssets = () => {
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchAssets();
  }, [filter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getPendingInstances(filter);
      console.log("API RESPONSE:", res);
      setAssets(res);
      console.log("API RESPONSE:", res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <Loader / >;
  return (
    <div className="instance-page">
      {/* HEADER */}
      <div className="instance-header">
        <h2>Instances Dashboard</h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          >
          <option value="all">All</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="empty">Loading...</p>
      ) : assets.length === 0 ? (
        <p className="empty">No assets pending instance creation</p>
      ) : (
        <div className="asset-grid">
          {assets.map((asset) => (
            <AssetCard key={asset._id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
};
const AssetCard = ({ asset }) => {
  const navigate = useNavigate();
const progress =
  asset.assetQuantity > 0
    ? (asset.instanceCount / asset.assetQuantity) * 100
    : 0;
const pendingInstances =
  asset.assetQuantity - asset.instanceCount;

const isComplete = pendingInstances === 0;
  return (
    <div className="asset-card">
      <div className="asset-card-header">
        <h3>{asset.assetName}</h3>
        <span className="asset-code">{asset.assetCode}</span>
      </div>

      <div className="asset-meta">
        <p>Category: {asset.assetCategory?.name || "-"}</p>
        <p>Quantity: {asset.assetQuantity}</p>
      </div>

      {/* PROGRESS */}
      <div className="progress-section">
        <div className="progress-top">
          <span>Instances</span>
          <span>
            {asset.instanceCount}/{asset.assetQuantity}
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* STATUS */}
<p className="pending">
  Pending: <strong>{pendingInstances}</strong>
</p>
      {/* BUTTON */}
      <button
        className={`create-btn ${isComplete ? "disabled" : ""}`}
        disabled={isComplete}
        onClick={() => navigate(`/create-instances/${asset._id}`)}
      >
        {isComplete ? "Completed" : "Create Instances"}
      </button>
    </div>
  );
};
export default InstanceAssets;