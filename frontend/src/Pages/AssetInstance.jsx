  // src/pages/InstanceAssets.jsx

  import React, { useEffect, useState , useRef } from "react";
  import axios from "axios";
  import "../Page_styles/AssetInstance.css";
  import { getPendingInstances } from "../Services/ApiServices";
  import { useNavigate } from "react-router-dom";
  import Loader from "../Components/Loader";
  import { useLocation } from "react-router-dom";
import Pagination from "../Components/Pagination";
  const InstanceAssets = () => {
    const [assets, setAssets] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const assetsPerPage = 8;
    const location = useLocation();
  const selectedAssetId = location.state?.selectedAssetId;
    useEffect(() => {
      fetchAssets();
    }, [filter]);
    useEffect(() => {
  setCurrentPage(1);
}, [filter]);
useEffect(() => {
  const maxPage = Math.ceil(assets.length / assetsPerPage);
  if (currentPage > maxPage) {
    setCurrentPage(maxPage || 1);
  }
}, [assets]);
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getPendingInstances(filter);
      setAssets(res);

      // 🎯 Set selected asset if passed
      if (selectedAssetId) {
        setSelectedId(selectedAssetId);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const indexOfLast = currentPage * assetsPerPage;
const currentAssets = assets.slice(
  indexOfLast - assetsPerPage,
  indexOfLast
);

const totalPages = Math.ceil(assets.length / assetsPerPage);
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
          <>
          <div className="asset-grid">
{currentAssets.map((asset) => (
    <AssetCard
      key={asset._id}
      asset={asset}
      isSelected={asset._id === selectedId}
    />
  ))}
          </div>
                      <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
</>
        )}

      </div>
    );
  };
const AssetCard = ({ asset, isSelected }) => {
  const navigate = useNavigate();
  const cardRef = useRef();

  const progress =
    asset.assetQuantity > 0
      ? (asset.instanceCount / asset.assetQuantity) * 100
      : 0;

  const pendingInstances =
    asset.assetQuantity - asset.instanceCount;

  const isComplete = pendingInstances === 0;

  // ✅ Scroll when selected
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isSelected]);

  return (
    <div
      ref={cardRef}
      className={`asset-card ${isSelected ? "highlight" : ""}`}
    >
      <div className="asset-card-header">
        <h3>{asset.assetName}</h3>
        <span className="asset-code">{asset.assetCode}</span>
      </div>

      <div className="asset-meta">
        <p>Category: {asset.assetCategory?.name || "-"}</p>
        <p>Quantity: {asset.assetQuantity}</p>
      </div>

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
          />
        </div>
      </div>

      <p className="pending">
        Pending: <strong>{pendingInstances}</strong>
      </p>

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