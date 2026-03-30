// ✅ src/Pages/SoftwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSoftwareAssets,
  deleteSoftwareAsset,
  updateSoftwareAsset,
  getCategories,
  getStatuses,
  getUnits,
  getLocations,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";
import { useNavigate } from "react-router-dom";
import CurrencyFilter from "../Components/CurrencyFilter";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

const SoftwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 8;

  const navigate = useNavigate();
  const { currency, convertFromBase, loadingRates } = useCurrency();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assetsRes, catRes, statRes, unitRes, locRes] =
        await Promise.all([
          getSoftwareAssets(),
          getCategories(),
          getStatuses(),
          getUnits(),
          getLocations(),
        ]);
        console.log("ASSETS RESPONSE:", assetsRes);
      setAssets(assetsRes?.data ?? assetsRes ?? []);
      setCategories(catRes?.data ?? catRes ?? []);
      setStatuses(statRes?.data ?? statRes ?? []);
      setUnits(unitRes?.data ?? unitRes ?? []);
      setLocations(locRes?.data ?? locRes ?? []);

      setApiDone(true);
      setTimeout(() => setLoading(false), 400);
    } catch (err) {
      Swal.fire("Error", "Failed to load software assets", "error");
      setLoading(false);
    }
  };

  const getName = (list, value) => {
    if (!value || !Array.isArray(list)) return "N/A";
    const id = typeof value === "object" ? value._id : value;
    const found = list.find((i) => String(i._id) === String(id));
    return found ? found.name : "N/A";
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete software asset?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!res.isConfirmed) return;

    await deleteSoftwareAsset(id);
    setAssets((p) => p.filter((a) => a._id !== id));
    Swal.fire("Deleted", "Software asset removed", "success");
  };

  const handleAssign = (asset) => {
    navigate("/assignment", {
      state: {
        categoryId: asset.assetCategory,
        assetId: asset._id,
        assetType: "software",
      },
    });
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
  const assignmentMap = {};

selectedAsset?.assignmentRecords?.forEach(assign => {
  assignmentMap[assign.assetInstanceId] = assign;
});
  if (loading || loadingRates)
    return <Loader type="inventory" apiDone={apiDone} />;
  const renderSoftwareInstance = (inst, assignment) => {
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
          <p className="instance-id">
            {inst.softwareDetails?.licenseNumber || "N/A"}
          </p>
        </div>

        <span
          className={`status-badge ${
            isAssigned ? "assigned" : "available"
          }`}
        >
          {isAssigned ? "Assigned" : "Available"}
        </span>
      </div>

      {/* BASIC */}
      <div className="instance-section">
        <p><b>📍 Location:</b> {inst.location || "N/A"}</p>
        <p><b>⚙ Condition:</b> {inst.condition}</p>
        <p>
          <b>📅 Installed:</b>{" "}
          {inst.installationDate
            ? new Date(inst.installationDate).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* LICENSE INFO */}
      <div className="instance-section">
        <p><b>🔑 License Key:</b> {inst.softwareDetails?.licenseKey}</p>
        <p><b>🏢 Vendor:</b> {inst.softwareDetails?.vendor || "N/A"}</p>

        <p>
          <b>📅 Purchase:</b>{" "}
          {inst.softwareDetails?.purchaseDate
            ? new Date(inst.softwareDetails.purchaseDate).toLocaleDateString()
            : "N/A"}
        </p>

        <p>
          <b>🔄 Renewal:</b>{" "}
          {inst.softwareDetails?.renewalDate
            ? new Date(inst.softwareDetails.renewalDate).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* WARRANTY (LIGHT) */}
      <div className="instance-section">
        <p><b>🛡 Warranty Status:</b> {inst.warranty?.status}</p>
      </div>

      {/* COST */}
      <div className="instance-section cost-box">
        <p><b>💰 Maintenance:</b> {inst.costTracking?.maintenanceCost}</p>
        <p><b>🔄 Renewal Cost:</b> {inst.costTracking?.warrantyRenewalCost}</p>
        <p><b>🛡 Insurance:</b> {inst.costTracking?.insuranceCost}</p>
      </div>

      {/* ASSIGNMENT */}
      {isAssigned && assignment ? (
        <div className="assignment-box">
          <p><b>👤 Employee:</b> {assignment.employee?.name}</p>
          <p><b>🏢 Department:</b> {assignment.department?.name}</p>
          <p><b>📍 Location:</b> {assignment.location}</p>

          <p><b>💻 Device:</b> {assignment.deviceInfo?.deviceName}</p>
          <p><b>🏷 Asset Tag:</b> {assignment.deviceInfo?.assetTag}</p>

          <p>
            <b>📅 Assigned:</b>{" "}
            {new Date(assignment.assignedAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p className="available-text">Available (Not Assigned)</p>
      )}
    </div>
  );
};
  return (
    <div className="inventory-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2 className="hardware-title">Software Inventory</h2>

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

      {/* CARDS */}
      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset) => (
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

  {/* BADGES */}
  <div className="badge-row">
    <span className="badge category">
      {getName(categories, asset.assetCategory)}
    </span>

    <span className="badge status">
      {getName(statuses, asset.assetStatus)}
    </span>

    <span className={`badge type ${asset.type}`}>
      {asset.type}
    </span>
  </div>

  {/* LOCATION */}
  <p className="meta">
    📍 {getName(locations, asset.locationName)}
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
      <p className="label">Usage</p>
      <p>
        {asset.inUse}/{asset.assetQuantity}
      </p>
    </div>

    <div>
      <p className="label">Instances</p>
      <p>{asset.instances?.length || 0}</p>
    </div>
  </div>

  {/* 🔥 SUBSCRIPTION INFO */}
  <div className="subscription-box">
    <p>
      <strong>Plan:</strong> {asset.type}
    </p>

    <p>
      <strong>Expiry:</strong>{" "}
      {asset.renewal?.expiryDate
        ? new Date(asset.renewal.expiryDate).toLocaleDateString()
        : "N/A"}
    </p>
  </div>

  {/* 🚨 ALERT SYSTEM */}
  {(() => {
    const expiry = asset.renewal?.expiryDate
      ? new Date(asset.renewal.expiryDate)
      : null;

    const today = new Date();

    const diffDays = expiry
      ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      : null;

    if (diffDays !== null && diffDays <= 7) {
      return (
        <div className="alert danger">
          ⚠ Expiring in {diffDays} days
        </div>
      );
    }

    if (asset.inUse === asset.assetQuantity) {
      return (
        <div className="alert warning">
          ⚠ All Licenses Used
        </div>
      );
    }

    if (asset.inUse === 0) {
      return (
        <div className="alert info">
          ℹ No Active Usage
        </div>
      );
    }

    return null;
  })()}

  {/* FOOTER */}
  <p className="date">
    Purchased:{" "}
    {asset.purchaseDetails?.purchaseDate
      ? new Date(asset.purchaseDetails.purchaseDate).toLocaleDateString()
      : "N/A"}
  </p>

  <div className="card-actions">
    <button onClick={() => setSelectedAsset(asset)}>
      View
    </button>

    <button onClick={() => handleDelete(asset._id)}>
      Delete
    </button>

    <button onClick={() => handleAssign(asset)}>
      Assign
    </button>
  </div>
</motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ================= VIEW MODAL ================= */}
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
              {/* ================= INSTANCES ================= */}
               <h4>All Instances</h4>

{selectedAsset.instances?.length ? (
  selectedAsset.instances.map((inst) =>
    renderSoftwareInstance(
      inst,
      assignmentMap[inst._id]
    )
  )
) : (
  <p>No instances found</p>
)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoftwareAssetList;
