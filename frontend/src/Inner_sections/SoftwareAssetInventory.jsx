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
              <div className="card-header">
                <h3>{asset.assetName}</h3>
                <span>{getName(statuses, asset.assetStatus)}</span>
              </div>

              <p>
                <strong>Total Cost:</strong> {CURRENCY_SYMBOLS[currency]}{" "}
                {convertFromBase(
                  asset.assetCost?.baseTotalAmount ?? 0
                ).toLocaleString()}
              </p>

              <p>
                <strong>Quantity:</strong> {asset.assetQuantity}
              </p>

              <p>
                <strong>In Use:</strong> {asset.inUse}
              </p>

              <p>
                <strong>Instances:</strong> {asset.instances?.length || 0}
              </p>

              <div className="card-actions">
                <button
                  className="btn-view"
                  onClick={() => setSelectedAsset(asset)}
                >
                  View
                </button>

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(asset._id)}
                >
                  Delete
                </button>

                <button
                  className="btn-assign"
                  onClick={() => handleAssign(asset)}
                >
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
              <h4>Instances</h4>

              {selectedAsset.instances?.length ? (
selectedAsset.instances.map((inst) => {
  const assignment = assignmentMap[inst._id];

  return (
    <div key={inst._id} className="instance-card">

      {/* BASIC */}
      <p><strong>Instance Code:</strong> {inst.instanceCode}</p>

      <p>
        <strong>License Key:</strong>{" "}
        {inst.softwareDetails?.licenseKey || "N/A"}
      </p>

      {/* STATUS */}
      <p>
        <strong>Status:</strong>{" "}
        <span style={{
          color: inst.status === "assigned" ? "#dc2626" : "#16a34a",
          fontWeight: 600
        }}>
          {inst.status}
        </span>
      </p>

      {/* LOCATION */}
      <p>
        <strong>Location:</strong> {inst.location || "N/A"}
      </p>

      {/* INSTALL DATE */}
      <p>
        <strong>Installed:</strong>{" "}
        {inst.installationDate
          ? new Date(inst.installationDate).toLocaleDateString()
          : "N/A"}
      </p>

      {/* 🔥 ASSIGNMENT INFO */}
      {assignment ? (
        <div className="assignment-box">
          <p><strong>Assigned To:</strong> {assignment.employee?.name}</p>
          <p><strong>Department:</strong> {assignment.department?.name}</p>
          <p><strong>Assigned Location:</strong> {assignment.location}</p>

          <p><strong>Device:</strong> {assignment.deviceInfo?.deviceName}</p>
          <p><strong>Asset Tag:</strong> {assignment.deviceInfo?.assetTag}</p>

          <p>
            <strong>Assigned On:</strong>{" "}
            {new Date(assignment.assignedAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p style={{ color: "#6b7280" }}>Available (Not Assigned)</p>
      )}

      <hr />
    </div>
  );
})
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

export default SoftwareAssetList;
