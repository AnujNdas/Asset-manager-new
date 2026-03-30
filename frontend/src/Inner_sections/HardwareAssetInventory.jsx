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
import CurrencyFilter from "../Components/CurrencyFilter";

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
        console.log("ASSETS RESPONSE:", assetsRes);

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
  const renderInstance = (inst, assignment) => {
  const isAssigned = inst.status === "assigned";

  return (
    <div
      key={inst._id}
      className={`instance-card ${isAssigned ? "assignment" : ""}`}
    >
      {/* HEADER */}
      <div className="instance-header">
        <div>
          <p className="instance-code">{inst.instanceCode}</p>
          <p className="instance-id">{inst.uniqueIdentifier}</p>
        </div>

        <span
          className={`status-badge ${
            isAssigned ? "assigned" : "available"
          }`}
        >
          {isAssigned ? "Assigned" : "Available"}
        </span>
      </div>

      {/* BASIC INFO */}
      <div className="instance-section">
        <p><b>📍 Location:</b> {inst.location}</p>
        <p><b>⚙ Condition:</b> {inst.condition}</p>
        <p>
          <b>📅 Installed:</b>{" "}
          {inst.installationDate
            ? new Date(inst.installationDate).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* TECHNICAL */}
      <div className="instance-section">
        <p><b>💻 Model:</b> {inst.hardwareDetails?.modelNo}</p>
        <p><b>📝 Specs:</b> {inst.hardwareDetails?.specifications}</p>
      </div>

      {/* WARRANTY + INSURANCE */}
      <div className="instance-section">
        <p>
          <b>🛡 Warranty:</b>{" "}
          {inst.warranty?.expiryDate
            ? new Date(inst.warranty.expiryDate).toLocaleDateString()
            : "N/A"}
        </p>

        <p>
          <b>📄 Insurance:</b>{" "}
          {inst.insurance?.policyId || "N/A"}
        </p>

        <p>
          <b>📅 Insurance Exp:</b>{" "}
          {inst.insurance?.expiryDate
            ? new Date(inst.insurance.expiryDate).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* COST TRACKING */}
      <div className="instance-section cost-box">
        <p><b>💰 Maintenance:</b> {inst.costTracking?.maintenanceCost}</p>
        <p><b>🔄 Warranty Renewal:</b> {inst.costTracking?.warrantyRenewalCost}</p>
        <p><b>🛡 Insurance Cost:</b> {inst.costTracking?.insuranceCost}</p>
      </div>

      {/* ASSIGNMENT */}
      {isAssigned && assignment && (
        <div className="assignment-box">
          <p><b>👤 Employee:</b> {assignment.employee?.name}</p>
          <p><b>🏢 Department:</b> {assignment.department?.name}</p>
          <p><b>📍 Assigned Location:</b> {assignment.location}</p>
          <p><b>💻 Device:</b> {assignment.deviceInfo?.deviceName}</p>
        </div>
      )}
    </div>
  );
};
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
  {/* HEADER */}
  <div className="card-header">
    <h3>{asset.assetName}</h3>
    <span className="asset-code">{asset.assetCode}</span>
  </div>

  {/* CATEGORY */}
  <div className="badge-row">
    <span className="badge category">
      {asset.assetCategory?.name}
    </span>

    <span className="badge status">
      {asset.assetStatus?.name}
    </span>

    <span className={`badge type ${asset.type}`}>
      {asset.type}
    </span>
  </div>

  {/* LOCATION */}
  <p className="meta">
    📍 {asset.locationName?.name}
  </p>

  {/* METRICS */}
  <div className="metrics">
    <div>
      <p className="label">Cost</p>
      <p>
        {CURRENCY_SYMBOLS[currency]}{" "}
        {convertFromBase(
          asset.assetCost?.baseTotalAmount ?? 0
        ).toLocaleString()}
      </p>
    </div>

    <div>
      <p className="label">Qty</p>
      <p>
        {asset.inUse}/{asset.assetQuantity}
      </p>
    </div>

    <div>
      <p className="label">Instances</p>
      <p>{asset.instanceCount}</p>
    </div>
  </div>

  {/* ALERTS */}
  {asset.inUse === asset.assetQuantity && (
    <div className="alert warning">
      ⚠ Fully Assigned
    </div>
  )}

  {asset.assetQuantity === 0 && (
    <div className="alert danger">
      ❌ Out of Stock
    </div>
  )}

  {asset.type === "maintenance" && (
    <div className="alert info">
      🛠 Under Maintenance
    </div>
  )}

  {/* FOOTER */}
  <p className="date">
    {formatDate(asset.purchaseDetails?.purchaseDate)}
  </p>

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
                return (
                  <>
<h4>All Instances</h4>

{instances.length === 0 ? (
  <p>No instances found</p>
) : (
  instances.map((inst) =>
    renderInstance(
      inst,
      assignmentMap[String(inst._id)]
    )
  )
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