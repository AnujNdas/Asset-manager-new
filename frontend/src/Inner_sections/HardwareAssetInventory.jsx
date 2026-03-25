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
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 8;

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
        console.log(assetsRes);
      setAssets(assetsRes?.data ?? assetsRes ?? []);
      setCategories(catsRes?.data ?? catsRes ?? []);
      setLocations(locsRes?.data ?? locsRes ?? []);
      setUnits(unitsRes?.data ?? unitsRes ?? []);
      setStatuses(statusesRes?.data ?? statusesRes ?? []);

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

    try {
      await deleteHardwareAsset(id);
      setAssets((prev) => prev.filter((a) => a._id !== id));
      Swal.fire("Deleted", "Asset removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to delete asset", "error");
    }
  };

  const getName = (list, value) => {
    if (!value || !Array.isArray(list)) return "N/A";
    const id = typeof value === "object" ? value._id : value;
    const found = list.find((item) => String(item._id) === String(id));
    return found ? found.name : "N/A";
  };

  const filteredAssets = assets.filter((asset) => {
    const term = searchTerm.toLowerCase();
    return (
      asset.assetName?.toLowerCase().includes(term) ||
      asset.assetCode?.toLowerCase().includes(term)
    );
  });

  const indexOfLast = currentPage * assetsPerPage;
  const currentAssets = filteredAssets.slice(
    indexOfLast - assetsPerPage,
    indexOfLast
  );

  if (loading || loadingRates)
    return <Loader type="inventory" apiDone={apiDone} />;

  return (
    <div className="inventory-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2 className="hardware-title">Hardware Inventory</h2>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Search Hardware..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="inventory-search-input"
          />
        </div>
      </div>

      {/* CARDS */}
      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset) => (
            <motion.div
              key={asset._id}
              className="inventory-card"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>{asset.assetName}</h3>

              <p>
                <strong>Total Cost:</strong>{" "}
                {CURRENCY_SYMBOLS[currency]}{" "}
                {convertFromBase(
                  asset.assetCost?.baseTotalAmount ?? 0
                ).toLocaleString()}
              </p>

              <p>
                <strong>Quantity:</strong> {asset.assetQuantity}
              </p>

              <div className="card-actions">
                <button
                  className="btn-view"
                  onClick={() => setSelectedAsset(asset)}
                >
                  View Instances
                </button>

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(asset._id)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ================= INSTANCE VIEW MODAL ================= */}
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
              className="asset-view-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                Instances — {selectedAsset.assetName}
              </h3>

              {/* 🔥 CORE CHANGE: INSTANCE LOOP */}
              {selectedAsset.instances?.length ? (
                selectedAsset.instances.map((inst) => (
                  <div key={inst._id} className="instance-card">
                    <p><strong>Code:</strong> {inst.instanceCode}</p>
                    <p><strong>Identifier:</strong> {inst.uniqueIdentifier}</p>
                    <p><strong>Status:</strong> {inst.status}</p>
                    <p><strong>Condition:</strong> {inst.condition}</p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {getName(locations, inst.location)}
                    </p>

                    <p>
                      <strong>Model:</strong>{" "}
                      {inst.hardwareDetails?.modelNo}
                    </p>

                    <p>
                      <strong>Specs:</strong>{" "}
                      {inst.hardwareDetails?.specifications}
                    </p>

                    <p>
                      <strong>Warranty:</strong>{" "}
                      {inst.warranty?.expiryDate
                        ? new Date(inst.warranty.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <p>
                      <strong>Insurance:</strong>{" "}
                      {inst.insurance?.policyId}
                    </p>

                    <p>
                      <strong>Installed:</strong>{" "}
                      {inst.installationDate
                        ? new Date(inst.installationDate).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <hr />
                  </div>
                ))
              ) : (
                <p>No instances found</p>
              )}

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