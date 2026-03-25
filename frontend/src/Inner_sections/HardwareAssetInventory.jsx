// ✅ src/Pages/HardwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHardwareAssets,
  deleteHardwareAsset,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const { currency, convertFromBase, loadingRates } = useCurrency();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await getHardwareAssets();
      setAssets(res?.data ?? res ?? []);
      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to load data", "error");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const resp = await Swal.fire({
      title: "Delete asset?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!resp.isConfirmed) return;

    await deleteHardwareAsset(id);
    setAssets((prev) => prev.filter((a) => a._id !== id));
  };

  const filteredAssets = assets.filter((asset) => {
    const term = searchTerm.toLowerCase();
    return (
      asset.assetName?.toLowerCase().includes(term) ||
      asset.assetCode?.toLowerCase().includes(term)
    );
  });

  if (loading || loadingRates)
    return <Loader type="inventory" apiDone={apiDone} />;

  return (
    <div className="inventory-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h2 className="hardware-title">Hardware Inventory</h2>

        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="inventory-search-input"
        />
      </div>

      {/* CARDS */}
      <div className="inventory-grid">
        <AnimatePresence>
          {filteredAssets.map((asset) => {
            const available = asset.instanceCount - asset.inUse;

            return (
              <motion.div
                key={asset._id}
                className="inventory-card advanced-card"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >

                {/* TOP */}
                <div className="card-header">
                  <div>
                    <h3>{asset.assetName}</h3>
                    <p className="asset-code">{asset.assetCode}</p>
                  </div>

                  <span className="badge status">
                    {asset.assetStatus?.name}
                  </span>
                </div>

                {/* BADGES */}
                <div className="badge-row">
                  <span className="badge category">
                    {asset.assetCategory?.name}
                  </span>

                  <span className="badge unit">
                    {asset.associateUnit?.name}
                  </span>

                  <span className="badge location">
                    {asset.locationName?.name}
                  </span>
                </div>

                {/* COST BLOCK */}
                <div className="cost-section">
                  <p>Total Cost</p>
                  <h2>
                    {CURRENCY_SYMBOLS[currency]}{" "}
                    {convertFromBase(
                      asset.assetCost?.baseTotalAmount ?? 0
                    ).toLocaleString()}
                  </h2>
                </div>

                {/* INVENTORY METRICS */}
                <div className="metrics-grid">
                  <div>
                    <p>Total</p>
                    <h4>{asset.assetQuantity}</h4>
                  </div>

                  <div>
                    <p>In Use</p>
                    <h4 className="danger">{asset.inUse}</h4>
                  </div>

                  <div>
                    <p>Available</p>
                    <h4 className="success">{available}</h4>
                  </div>
                </div>

                {/* FINANCIAL */}
                <div className="financial-row">
                  <span>
                    Monthly: {CURRENCY_SYMBOLS[currency]}{" "}
                    {convertFromBase(
                      asset.financialTracking?.monthlyCost ?? 0
                    )}
                  </span>

                  <span>
                    Yearly: {CURRENCY_SYMBOLS[currency]}{" "}
                    {convertFromBase(
                      asset.financialTracking?.yearlyCost ?? 0
                    )}
                  </span>
                </div>

                {/* FOOTER */}
                <div className="card-actions">
                  <button
                    className="btn-view"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    View Instances ({asset.instanceCount})
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(asset._id)}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            className="asset-view-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              className="asset-view-modal advanced-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Instances — {selectedAsset.assetName}</h3>

              <div className="instances-grid">
                {selectedAsset.instances?.map((inst) => (
                  <div key={inst._id} className="instance-card modern">

                    <div className="instance-top">
                      <h4>{inst.instanceCode}</h4>
                      <span className="badge status">{inst.status}</span>
                    </div>

                    <p className="identifier">
                      {inst.uniqueIdentifier}
                    </p>

                    <div className="instance-details">
                      <span>Condition: {inst.condition}</span>
                      <span>Model: {inst.hardwareDetails?.modelNo || "N/A"}</span>
                      <span>Location: {inst.location?.name || "N/A"}</span>
                    </div>

                    <div className="instance-dates">
                      <span>
                        Installed:{" "}
                        {inst.installationDate
                          ? new Date(inst.installationDate).toLocaleDateString()
                          : "N/A"}
                      </span>

                      <span>
                        Warranty:{" "}
                        {inst.warranty?.expiryDate
                          ? new Date(inst.warranty.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="instance-footer">
                      <span>
                        Insurance: {inst.insurance?.policyId || "N/A"}
                      </span>
                    </div>

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