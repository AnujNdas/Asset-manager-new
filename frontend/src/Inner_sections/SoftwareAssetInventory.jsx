import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSoftwareAssets,
  deleteSoftwareAsset,
  updateSoftwareAsset,
  getCategories,
  getStatuses,
} from "../Services/ApiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../Page_styles/InventoryCards.css";

const SoftwareAssetList = () => {
  const [softwareAssets, setSoftwareAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");

  // ✅ Fetch all data when component loads
  useEffect(() => {
    fetchAssets();
    fetchDropdowns();
  }, []);

  const fetchAssets = async () => {
    try {
      const assets = await getSoftwareAssets();
      setSoftwareAssets(assets || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load software assets.", "error");
    }
  };

  const fetchDropdowns = async () => {
    try {
      setCategories(await getCategories());
      setStatuses(await getStatuses());
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Get Category / Status Names
  const getCategoryName = (id) => {
    const found = categories.find((c) => c._id === id);
    return found ? found.name : "N/A";
  };

  const getStatusName = (id) => {
    const found = statuses.find((s) => s._id === id);
    return found ? found.name : "N/A";
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This software asset will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      await deleteSoftwareAsset(id);
      fetchAssets();
    }
  };

  // ✅ Search Filter
  const filteredAssets = softwareAssets.filter((asset) =>
    asset.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Format Date
  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "—";
  };

  return (
    <div className="inventory-container">
      <h2>Software Inventory</h2>

      {/* ✅ Search Bar */}
      <input
        type="text"
        placeholder="Search Software by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {/* ✅ Card Display Grid */}
      <div className="card-grid">
        <AnimatePresence>
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset) => (
              <motion.div
                className="card"
                key={asset._id}
                whileHover={{ scale: 1.02 }}
                layout
              >
                <h3>{asset.name}</h3>
                <p><strong>Version:</strong> {asset.version || "N/A"}</p>
                <p><strong>Publisher:</strong> {asset.publisher || "N/A"}</p>
                <p><strong>Category:</strong> {getCategoryName(asset.category)}</p>
                <p><strong>Business Unit:</strong> {asset.businessUnit || "—"}</p>
                <p><strong>License Type:</strong> {asset.licenseType || "—"}</p>
                <p><strong>Expiry:</strong> {formatDate(asset.licenseExpiry)}</p>
                <p><strong>Cost:</strong> {asset.totalCost ? `${asset.totalCost} ${asset.currency}` : "—"}</p>

                {/* ✅ Card Action Buttons */}
                <div className="card-actions">
                  <button onClick={() => setSelectedAsset(asset)}>
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button onClick={() => setEditingAsset(asset)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => handleDelete(asset._id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p>No software found.</p>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ View Details Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2>{selectedAsset.name}</h2>
              <div className="modal-grid">
                <p><strong>Version:</strong> {selectedAsset.version}</p>
                <p><strong>Publisher:</strong> {selectedAsset.publisher}</p>
                <p><strong>Category:</strong> {getCategoryName(selectedAsset.category)}</p>
                <p><strong>Business Unit:</strong> {selectedAsset.businessUnit}</p>
                <p><strong>Installation Location:</strong> {selectedAsset.installationLocation}</p>
                <p><strong>License Type:</strong> {selectedAsset.licenseType}</p>
                <p><strong>License Key:</strong> {selectedAsset.licenseKey}</p>
                <p><strong>License Expiry:</strong> {formatDate(selectedAsset.licenseExpiry)}</p>
                <p><strong>Total Cost:</strong> {selectedAsset.totalCost} {selectedAsset.currency}</p>
                <p><strong>Purchase Date:</strong> {formatDate(selectedAsset.purchaseDate)}</p>
                <p><strong>Assigned Users:</strong> {(selectedAsset.assignedTo || []).join(", ")}</p>
                <p><strong>Linked Devices:</strong> {(selectedAsset.linkedDevices || []).join(", ")}</p>
                <p><strong>Compliance Status:</strong> {getStatusName(selectedAsset.complianceStatus)}</p>
                <p><strong>Criticality:</strong> {selectedAsset.criticality}</p>
                <p><strong>Risk:</strong> {selectedAsset.riskClassification}</p>
                <p><strong>Support Vendor:</strong> {selectedAsset.supportVendor}</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedAsset(null)}>
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
