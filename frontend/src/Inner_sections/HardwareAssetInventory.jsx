// ✅ src/Pages/HardwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHardwareAssets,
  deleteHardwareAsset,
  getCategories,
  getLocations,
  getUnits,
  getStatuses,
  getAssetInstances // ✅ NEW API
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [instances, setInstances] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { currency, convertFromBase, loadingRates } = useCurrency();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assetsRes, catsRes, locsRes, unitsRes, statusesRes] =
        await Promise.all([
          getHardwareAssets(),
          getCategories(),
          getLocations(),
          getUnits(),
          getStatuses(),
        ]);

      setAssets(assetsRes?.data ?? assetsRes ?? []);
      setCategories(catsRes?.data ?? catsRes ?? []);
      setLocations(locsRes?.data ?? locsRes ?? []);
      setUnits(unitsRes?.data ?? unitsRes ?? []);
      setStatuses(statusesRes?.data ?? statusesRes ?? []);

      setLoading(false);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
      setLoading(false);
    }
  };

  // 🔹 Load instances when viewing asset
  const handleView = async (asset) => {
    try {
      setSelectedAsset(asset);
      const res = await getAssetInstances(asset._id);
      setInstances(res?.data ?? res ?? []);
    } catch (err) {
      Swal.fire("Error", "Failed to load instances", "error");
    }
  };

  const getName = (list, value) => {
    if (!value) return "N/A";
    const id = typeof value === "object" ? value._id : value;
    const found = list.find((item) => String(item._id) === String(id));
    return found ? found.name : "N/A";
  };

  const getStock = (asset) =>
    Number(asset.assetQuantity || 0) - Number(asset.inUse || 0);

  const filteredAssets = assets.filter((a) =>
    a.assetName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingRates) return <Loader />;

  return (
    <div className="inventory-container">

      {/* 🔹 HEADER */}
      <div className="dashboard-header">
        <h2>Hardware Inventory</h2>

        <input
          type="text"
          placeholder="Search..."
          className="inventory-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🔹 GRID */}
      <div className="inventory-grid">
        {filteredAssets.map((asset) => (
          <div key={asset._id} className="inventory-card">

            {/* TOP */}
            <div className="card-header">
              <h3>{asset.assetName}</h3>
              <span className="badge">
                {getName(statuses, asset.assetStatus)}
              </span>
            </div>

            {/* BASIC INFO */}
            <div className="card-info">
              <p><strong>Code:</strong> {asset.assetCode}</p>
              <p><strong>Category:</strong> {getName(categories, asset.assetCategory)}</p>
              <p><strong>Location:</strong> {getName(locations, asset.locationName)}</p>
              <p><strong>Unit:</strong> {getName(units, asset.associateUnit)}</p>

              <p>
                <strong>Total Cost:</strong>{" "}
                {CURRENCY_SYMBOLS[currency]}{" "}
                {convertFromBase(asset.assetCost?.baseTotalAmount || 0).toLocaleString()}
              </p>

              <p><strong>Qty:</strong> {asset.assetQuantity}</p>
              <p><strong>In Use:</strong> {asset.inUse}</p>

              <p>
                <strong>Stock:</strong>{" "}
                {getStock(asset) > 0 ? (
                  <span className="stock-green">{getStock(asset)} Available</span>
                ) : (
                  <span className="stock-red">Out of Stock</span>
                )}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="card-actions">
              <button onClick={() => handleView(asset)}>View More</button>
              <button onClick={() => navigate("/assignment")}>Assign</button>
            </div>

          </div>
        ))}
      </div>

      {/* 🔥 VIEW MODAL WITH INSTANCES */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            className="asset-view-overlay"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              className="asset-view-modal large"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🔹 ASSET SUMMARY */}
              <h3>{selectedAsset.assetName}</h3>

              <div className="asset-summary">
                <p><strong>Code:</strong> {selectedAsset.assetCode}</p>
                <p><strong>Total Qty:</strong> {selectedAsset.assetQuantity}</p>
                <p><strong>In Use:</strong> {selectedAsset.inUse}</p>
                <p><strong>Stock:</strong> {getStock(selectedAsset)}</p>
              </div>

              {/* 🔥 INSTANCES */}
              <h4 className="section-title">Instances</h4>

              <div className="instance-grid">
                {instances.map((inst) => (
                  <div key={inst._id} className="instance-card">

                    <h4>{inst.uniqueIdentifier}</h4>

                    <p><strong>Status:</strong> {inst.status}</p>
                    <p><strong>Condition:</strong> {inst.condition}</p>

                    <p><strong>Model:</strong> {inst.hardwareDetails?.modelNo}</p>

                    <p>
                      <strong>Warranty:</strong>{" "}
                      {inst.warranty?.expiryDate
                        ? new Date(inst.warranty.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <p>
                      <strong>Insurance:</strong>{" "}
                      {inst.insurance?.policyId || "N/A"}
                    </p>

                    <p>
                      <strong>Maintenance Cost:</strong>{" "}
                      {inst.costTracking?.maintenanceCost || 0}
                    </p>

                  </div>
                ))}
              </div>

              <button
                className="asset-view-close-btn"
                onClick={() => setSelectedAsset(null)}
              >
                Close
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HardwareAssetList;