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

      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to load data", "error");
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const handleDelete = async (id) => {
    const resp = await Swal.fire({
      title: "Delete asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!resp.isConfirmed) return;

    try {
      await deleteHardwareAsset(id);
      setAssets((prev) => prev.filter((a) => a._id !== id));
      Swal.fire("Deleted", "Asset removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.message || "Failed", "error");
    }
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
        <h2>Hardware Inventory</h2>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search-input"
          />

          <CurrencyFilter />
        </div>
      </div>

      {/* GRID */}
      <div className="inventory-grid">
        <AnimatePresence>
          {filteredAssets.map((asset) => (
            <motion.div
              key={asset._id}
              className="inventory-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>{asset.assetName}</h3>

              <p>
                Cost: {CURRENCY_SYMBOLS[currency]}{" "}
                {convertFromBase(
                  asset.assetCost?.baseTotalAmount ?? 0
                ).toLocaleString()}
              </p>

              <p>Qty: {asset.assetQuantity}</p>
              <p>Date: {formatDate(asset.purchaseDetails?.purchaseDate)}</p>

              <div className="card-actions">
                <button onClick={() => setSelectedAsset(asset)}>
                  View
                </button>

                <button onClick={() => handleDelete(asset._id)}>
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL */}
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
              <h3>Instances — {selectedAsset.assetName}</h3>

              {/* 🔥 DATA PREP */}
              {(() => {
                const instances = selectedAsset.instances || [];

                const assignmentMap = {};
                selectedAsset.assignmentRecords?.forEach((a) => {
                  assignmentMap[String(a.assetInstanceId)] = a;
                });

                const assignedOnly = instances.filter(
                  (i) => i.status === "assigned"
                );

                const availableOnly = instances.filter(
                  (i) => i.status === "in_stock"
                );

                return (
                  <>
                    {/* AVAILABLE */}
                    <h4>Available</h4>
                    {availableOnly.length === 0 ? (
                      <p>No available instances</p>
                    ) : (
                      availableOnly.map((inst) => (
                        <div key={inst._id} className="instance-card">
                          <p><b>{inst.instanceCode}</b></p>
                          <p>{inst.uniqueIdentifier}</p>
                          <span style={{ color: "green" }}>
                            Available
                          </span>
                        </div>
                      ))
                    )}

                    {/* ASSIGNED */}
                    <h4 style={{ marginTop: 20 }}>Assigned</h4>
                    {assignedOnly.length === 0 ? (
                      <p>No assigned instances</p>
                    ) : (
                      assignedOnly.map((inst) => {
                        const assignment =
                          assignmentMap[String(inst._id)];

                        return (
                          <div
                            key={inst._id}
                            className="instance-card assignment"
                          >
                            <p><b>{inst.instanceCode}</b></p>
                            <p>{inst.uniqueIdentifier}</p>

                            <span style={{ color: "red" }}>
                              Assigned
                            </span>

                            {assignment && (
                              <div className="assignment-box">
                                <p>
                                  <b>Employee:</b>{" "}
                                  {assignment.employee?.name}
                                </p>
                                <p>
                                  <b>Department:</b>{" "}
                                  {assignment.department?.name}
                                </p>
                                <p>
                                  <b>Location:</b>{" "}
                                  {assignment.location}
                                </p>
                                <p>
                                  <b>Device:</b>{" "}
                                  {assignment.deviceInfo?.deviceName}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </>
                );
              })()}

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