// ✅ src/Pages/HardwareAssetList.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence, color } from "framer-motion";
import {
  getHardwareAssets,
  deleteHardwareAsset,
  updateHardwareAsset,
  getCategories,
  getLocations,
  getUnits,
  getStatuses,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Loader from "../Components/Loader";
import { useNavigate } from "react-router-dom";
import CurrencyFilter from "../Components/CurrencyFilter";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";

const HardwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedAssignmentAsset, setSelectedAssignmentAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 8;

  const navigate = useNavigate();
const { currency, convertFromBase, loadingRates } = useCurrency();

  const handleAssign = (asset) => {
    navigate("/assignment", {
      state: {
        categoryId: asset.assetCategory,
        assetId: asset._id,
        assetType: asset.assetType || "hardware", // safe fallback
      },
    });
  };
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


    // ✅ SIGNAL LOADER COMPLETION
    setApiDone(true);

    // ✅ allow progress to hit 100%
    setTimeout(() => {
      setLoading(false);
    }, 400);

  } catch (err) {
    Swal.fire("Error", err.message || "Failed to load data", "error");
    setLoading(false);
  }
};

const isOutOfStock = (asset) =>
  Number(asset.assetQuantity || 0) - Number(asset.inUse || 0) <= 0;

  const indexOfLast = currentPage * assetsPerPage;
  const indexOfFirst = indexOfLast - assetsPerPage;
const filteredAssets = assets.filter((asset) => {
  const term = searchTerm.toLowerCase();

  return (
    asset.assetName?.toLowerCase().includes(term) ||
    asset.assetCode?.toLowerCase().includes(term) ||
    asset.modelNo?.toLowerCase().includes(term) ||
    asset.barcodeNumber?.toLowerCase().includes(term)
  );
});

const currentAssets = filteredAssets.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);

const getName = (list, value) => {
  if (!value) return "N/A";
  if (!Array.isArray(list)) return "N/A";

  const id = typeof value === "object" ? value._id : value;

  const found = list.find(
    (item) => String(item._id) === String(id)
  );

  return found ? found.name : "N/A";
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

  // Normalize fields for editing
    const startEdit = (asset) => {
      setEditingAsset(asset);
setEditForm({
  assetName: asset.assetName || "",
  assetCode: asset.assetCode || "",
  barcodeNumber: asset.barcodeNumber || "",
  modelNo: asset.modelNo || "",
  type: asset.type || "one_time",
  locationAddress: asset.locationAddress || "",
  assetSpecification: asset.assetSpecification || "",
  maintenanceTerm: asset.maintenanceTerm || "",
  PMD: asset.PMD || "",

  assetCategory: asset.assetCategory?._id || asset.assetCategory || "",
  locationName: asset.locationName?._id || asset.locationName || "",
  associateUnit: asset.associateUnit?._id || asset.associateUnit || "",
  assetStatus: asset.assetStatus?._id || asset.assetStatus || "",

  DOP: asset.DOP ? new Date(asset.DOP).toISOString().split("T")[0] : "",
  DOE: asset.DOE ? new Date(asset.DOE).toISOString().split("T")[0] : "",

  purchaseFrom: asset.purchaseFrom || "",
  assetLifetime: asset.assetLifetime || "",

  assetCost: {
    totalAmount: asset.assetCost?.totalAmount || 0,
    currency: asset.assetCost?.currency || "INR",
  },

  insurance: {
    insuranceId: asset.insurance?.insuranceId || "",
    insuranceName: asset.insurance?.insuranceName || "",
    purchaseDate: asset.insurance?.purchaseDate
      ? new Date(asset.insurance.purchaseDate).toISOString().split("T")[0]
      : "",
    expiryDate: asset.insurance?.expiryDate
      ? new Date(asset.insurance.expiryDate).toISOString().split("T")[0]
      : "",
  },

  warranty: {
    warrantyId: asset.warranty?.warrantyId || "",
    expiryDate: asset.warranty?.expiryDate
      ? new Date(asset.warranty.expiryDate).toISOString().split("T")[0]
      : "",
  },

  assetQuantity: asset.assetQuantity || 1,
  inUse: asset.inUse || 0,
});
    };

const handleEditSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      ...editForm,
assetCost: {
  totalAmount: Number(editForm.assetCost.totalAmount),
  currency: editForm.assetCost.currency,
},

      assetQuantity: Number(editForm.assetQuantity),
      inUse: Number(editForm.inUse),
    };

    const updated = await updateHardwareAsset(editingAsset._id, payload);
    const newAsset = updated?.data ?? updated;

    setAssets((prev) =>
      prev.map((a) => (a._id === newAsset._id ? newAsset : a))
    );

    setEditingAsset(null);
    setEditForm({});
    Swal.fire("Updated", "Asset updated successfully.", "success");
  } catch (err) {
    Swal.fire("Error", err.message || "Update failed", "error");
  }
};

const renderDepartmentBadges = (asset) => {
  if (!asset.assignedDepartments?.length) {
    return <span className="dept-muted">Not Assigned</span>;
  }

  return asset.assignedDepartments.map((item) => (
    <span
      key={item.department._id}
      className="dept-badge clickable"
      onClick={() => setSelectedAssignmentAsset(asset)}
    >
      {item.department.name}
      {item.quantity ? ` (${item.quantity})` : ""}
    </span>
  ));
};


const getInStock = (asset) =>
  Number(asset.assetQuantity || 0) - Number(asset.inUse || 0);


const handleEditChange = (e) => {
  const { name, value } = e.target;

  // 🔹 assetCost fields
  if (name.startsWith("assetCost.")) {
    const field = name.split(".")[1];

    setEditForm((prev) => ({
      ...prev,
      assetCost: {
        ...prev.assetCost,
        [field]:
          field === "amount" ? Number(value) || "" : value,
      },
    }));
    return;
  }

  // 🔹 inUse safety
  if (name === "inUse") {
    const total = Number(editForm.assetQuantity || 0);
    const inUseVal = Math.min(Number(value), total);
    setEditForm((prev) => ({ ...prev, inUse: inUseVal }));
    return;
  }
  if (name.startsWith("insurance.")) {
  const field = name.split(".")[1];
  setEditForm(prev => ({
    ...prev,
    insurance: {
      ...prev.insurance,
      [field]: value,
    },
  }));
  return;
}

if (name.startsWith("warranty.")) {
  const field = name.split(".")[1];
  setEditForm(prev => ({
    ...prev,
    warranty: {
      ...prev.warranty,
      [field]: value,
    },
  }));
  return;
}

  setEditForm((prev) => ({ ...prev, [name]: value }));
};


  const getExpiryBadge = (DOE) => {
    if (!DOE) return null;
    const today = new Date();
    const expiry = new Date(DOE);
    const diffMS =
      expiry.setHours(0, 0, 0, 0) -
      new Date(today).setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(diffMS / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="badge badge-renew">Maintenence</span>;
    }
    if (diffDays <= 3) return <span className="badge badge-red">{diffDays} days left</span>;
    if (diffDays <= 14) return <span className="badge badge-yellow">{diffDays} days left</span>;

    return <span className="badge badge-green">{diffDays} days left</span>;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const visibleRange = 1;

    pages.push(
      <button
        key={1}
        className={currentPage === 1 ? "active" : ""}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
    );

    const left = Math.max(2, currentPage - visibleRange);
    const right = Math.min(totalPages - 1, currentPage + visibleRange);

    if (left > 2) pages.push(<span key="leftdots" className="dots">...</span>);

    for (let i = left; i <= right; i++) {
      pages.push(
        <button
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (right < totalPages - 1) pages.push(<span key="rightdots" className="dots">...</span>);

    pages.push(
      <button
        key={totalPages}
        className={currentPage === totalPages ? "active" : ""}
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </button>
    );

    return (
      <div className="pagination">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {pages}

        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

if (loading || loadingRates)
  return <Loader type="inventory" apiDone={apiDone} />;
const Field = ({ label, value }) => (
  <div>
    <label>{label}</label>
    <p>{value || "N/A"}</p>
  </div>
);
  return (
    <div className="inventory-container">
<div className="dashboard-header">
  <h2 className="hardware-title">Hardware Inventory</h2>

  <div className="header-actions">
    <input
      type="text"
      placeholder="Search Hardware..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // reset page when searching
      }}
      className="inventory-search-input"
    />

    <CurrencyFilter />
  </div>
</div>

      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset) => {
            const unitName = getName(units, asset.associateUnit);
            return (
              <motion.div
                key={asset._id}
                className="inventory-card"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ y: -5, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.25 }}
              >
                <div className="card-header">
                  <h3 className="card-title">
                    {asset.assetName || asset.assetCode}
                  </h3>
                  <div className="badge-wrap">
                    {getExpiryBadge(asset.DOE)}
                  </div>
                </div>

                <div className="card-info2">
                  <p>
  <strong>Spec:</strong>{" "}
  <span
    style={{
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      wordBreak: "break-word",
      width : "50%"
      // flex: 1
    }}
  >
    {asset.assetSpecification || "N/A"}
  </span>
</p>
  <p style={{ color: "red" }}>
<strong>Total Cost:</strong>{" "}
{CURRENCY_SYMBOLS[currency]}{" "}
{convertFromBase(
  asset.assetCost?.baseTotalAmount ?? 0,
)
.toLocaleString()}

</p>

{/* <p>
  <strong>Base Cost (INR):</strong>{" "}
  {asset.assetCost?.baseAmount
    ? `₹${asset.assetCost.baseAmount.toLocaleString("en-IN")}`
    : "N/A"}
</p> */}

<p>
  <strong>Unit Cost:</strong>{" "}
  {CURRENCY_SYMBOLS[currency]}{" "}
  {asset.assetQuantity
    ? convertFromBase(
  asset.assetCost?.baseTotalAmount
    ? asset.assetCost.baseTotalAmount / asset.assetQuantity
    : 0,
)
.toLocaleString()
    : "N/A"}

</p>
  <p><strong>In Use:</strong> {asset.inUse || "0"}</p>
    <div className="dept-badge-wrapper">
        {renderDepartmentBadges(asset)}
          </div>
                  <p>
                      <strong>Stock:</strong>{" "}
                    {getInStock(asset) > 0 ? (
                      <span className="stock-green">
                        {getInStock(asset)} Available
                      </span>
                    ) : (
                      <span className="stock-red">Out of Stock</span>
                    )}
                  </p>
                </div>
                <div className="card-actions">
                  <button className="btn-view" onClick={() => setSelectedAsset(asset)}>View</button>
                  <button className="btn-edit" onClick={() => startEdit(asset)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(asset._id)}>Delete</button>
                  <button
  className="btn-assign"
  disabled={isOutOfStock(asset)}
  onClick={() => handleAssign(asset)}
  title={isOutOfStock(asset) ? "No stock available to assign" : "Assign asset"}
>
  Assign
</button>

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {renderPagination()}

{/* VIEW MODAL – NEW UI */}
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
  initial={{ scale: 0.95 }}
  animate={{ scale: 1 }}
  exit={{ scale: 0.95 }}
  onClick={(e) => e.stopPropagation()}
>
  {/* ================= HEADER ================= */}
  <div className="asset-view-header">
    <div>
      <h3 className="asset-view-title">
        {selectedAsset.assetName || selectedAsset.assetCode}
      </h3>
      <p className="asset-view-subtitle">
        {selectedAsset.assetCode}
      </p>
    </div>

    <div className="asset-view-badges">
      <span className="asset-view-badge category">
        {getName(categories, selectedAsset.assetCategory) || "N/A"}
      </span>
      <span className="asset-view-badge status">
        {getName(statuses, selectedAsset.assetStatus) || "N/A"}
      </span>
    </div>
  </div>

  {/* ================= BASIC INFO ================= */}
  <h4 className="asset-view-section-title">Basic Information</h4>
  <div className="asset-view-grid">
    <Field label="Type" value={selectedAsset.type} />
    <Field label="Model No" value={selectedAsset.modelNo} />
    <Field label="Barcode" value={selectedAsset.barcodeNumber} />
    <Field
      label="Location"
      value={getName(locations, selectedAsset.locationName)}
    />
    <Field label="Location Address" value={selectedAsset.locationAddress} />
    <Field
      label="Unit"
      value={getName(units, selectedAsset.associateUnit)}
    />
    <Field label="Purchase From" value={selectedAsset.purchaseFrom} />
    <Field label="Specification" value={selectedAsset.assetSpecification} />
  </div>

  {/* ================= FINANCIAL DETAILS ================= */}
  <h4 className="asset-view-section-title">Financial Details</h4>
  <div className="asset-view-grid">
    <Field
      label="Original Currency"
      value={selectedAsset.assetCost?.currency}
    />
    <Field
      label="Original Total"
      value={
        selectedAsset.assetCost?.totalAmount
          ? `${selectedAsset.assetCost.currency} ${selectedAsset.assetCost.totalAmount.toLocaleString()}`
          : null
      }
    />
    <Field
      label="Original Unit Cost"
      value={
        selectedAsset.assetCost?.unitAmount
          ? `${selectedAsset.assetCost.currency} ${selectedAsset.assetCost.unitAmount.toLocaleString()}`
          : null
      }
    />
    {/* <Field
      label="Base Total"
      value={
        selectedAsset.assetCost?.baseTotalAmount
          ? `₹ ${selectedAsset.assetCost.baseTotalAmount.toLocaleString()}`
          : null
      }
    /> */}
  </div>

  {/* ================= INVENTORY ================= */}
  <h4 className="asset-view-section-title">Inventory</h4>
  <div className="asset-view-grid">
    <Field label="Quantity" value={selectedAsset.assetQuantity} />
    <Field label="In Use" value={selectedAsset.inUse} />
    <Field label="In Stock" value={selectedAsset.inStock} />
  </div>

  {/* ================= MAINTENANCE & WARRANTY ================= */}
  <h4 className="asset-view-section-title">Maintenance & Warranty</h4>
  <div className="asset-view-grid">
    <Field
      label="Purchase Date"
      value={
        selectedAsset.DOP
          ? new Date(selectedAsset.DOP).toLocaleDateString()
          : null
      }
    />
    <Field
      label="Maintenance Date"
      value={
        selectedAsset.DOE
          ? new Date(selectedAsset.DOE).toLocaleDateString()
          : null
      }
    />
    <Field label="Asset Lifetime" value={selectedAsset.assetLifetime} />
    <Field label="PMD" value={selectedAsset.PMD} />
    <Field label="Maintenance Term" value={selectedAsset.maintenanceTerm} />
    <Field
      label="Warranty ID"
      value={selectedAsset.warranty?.warrantyId}
    />
    <Field
      label="Warranty Expiry"
      value={
        selectedAsset.warranty?.expiryDate
          ? new Date(selectedAsset.warranty.expiryDate).toLocaleDateString()
          : null
      }
    />
    <Field
      label="Warranty Lifetime"
      value={selectedAsset.warrantyLifetime}
    />
  </div>

  {/* ================= INSURANCE ================= */}
  <h4 className="asset-view-section-title">Insurance</h4>
  <div className="asset-view-grid">
    <Field
      label="Insurance ID"
      value={selectedAsset.insurance?.insuranceId}
    />
    <Field
      label="Insurance Name"
      value={selectedAsset.insurance?.insuranceName}
    />
    <Field
      label="Purchase Date"
      value={
        selectedAsset.insurance?.purchaseDate
          ? new Date(selectedAsset.insurance.purchaseDate).toLocaleDateString()
          : null
      }
    />
    <Field
      label="Expiry Date"
      value={
        selectedAsset.insurance?.expiryDate
          ? new Date(selectedAsset.insurance.expiryDate).toLocaleDateString()
          : null
      }
    />
  </div>

  {/* ================= AUDIT ================= */}
  <h4 className="asset-view-section-title">Audit Information</h4>
  <div className="asset-view-grid">
    <Field label="Asset ID" value={selectedAsset._id} />
    <Field
      label="Created At"
      value={
        selectedAsset.createdAt
          ? new Date(selectedAsset.createdAt).toLocaleString()
          : null
      }
    />
    <Field
      label="Last Updated"
      value={
        selectedAsset.updatedAt
          ? new Date(selectedAsset.updatedAt).toLocaleString()
          : null
      }
    />
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


{/* EDIT MODAL – NEW UI */}
<AnimatePresence>
  {editingAsset && (
    <motion.div
      className="asset-edit-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setEditingAsset(null)}
    >
      <motion.div
        className="asset-edit-modal"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="asset-edit-title">
          Edit Asset — {editingAsset.assetName || editingAsset.assetCode}
        </h3>

       <form className="asset-edit-form" onSubmit={handleEditSubmit}>

  {/* ================= BASIC INFO ================= */}
  <div className="form-section">
    <h4 className="section-title">Basic Information</h4>

    <div className="asset-edit-grid">
      <div>
        <label>Asset Name</label>
        <input
          name="assetName"
          className="asset-edit-input"
          value={editForm.assetName || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Specification</label>
        <input
          name="assetSpecification"
          className="asset-edit-input"
          value={editForm.assetSpecification || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Model No</label>
        <input
          name="modelNo"
          className="asset-edit-input"
          value={editForm.modelNo || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Location Address</label>
        <input
          name="locationAddress"
          className="asset-edit-input"
          value={editForm.locationAddress || ""}
          onChange={handleEditChange}
        />
      </div>
    </div>
  </div>

  {/* ================= CLASSIFICATION ================= */}
  <div className="form-section">
    <h4 className="section-title">Classification</h4>

    <div className="asset-edit-grid">
      <div>
        <label>Category</label>
        <select
          name="assetCategory"
          className="asset-edit-input"
          value={editForm.assetCategory || ""}
          onChange={handleEditChange}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Location</label>
        <select
          name="locationName"
          className="asset-edit-input"
          value={editForm.locationName || ""}
          onChange={handleEditChange}
        >
          <option value="">Select Location</option>
          {locations.map((l) => (
            <option key={l._id} value={l._id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Unit</label>
        <select
          name="associateUnit"
          className="asset-edit-input"
          value={editForm.associateUnit || ""}
          onChange={handleEditChange}
        >
          <option value="">Select Unit</option>
          {units.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Status</label>
        <select
          name="assetStatus"
          className="asset-edit-input"
          value={editForm.assetStatus || ""}
          onChange={handleEditChange}
        >
          <option value="">Select Status</option>
          {statuses.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  </div>

  {/* ================= PURCHASE & COST ================= */}
  <div className="form-section">
    <h4 className="section-title">Purchase & Cost</h4>

    <div className="asset-edit-grid">
      <div>
        <label>Date Of Purchase</label>
        <input
          type="date"
          name="DOP"
          className="asset-edit-input"
          value={editForm.DOP || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Maintenence Date</label>
        <input
          type="date"
          name="DOE"
          className="asset-edit-input"
          value={editForm.DOE || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Purchase From</label>
        <input
          name="purchaseFrom"
          className="asset-edit-input"
          value={editForm.purchaseFrom || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Currency</label>
        <select
          name="assetCost.currency"
          className="asset-edit-input"
          value={editForm.assetCost?.currency || "INR"}
          onChange={handleEditChange}
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <div>
        <label>Total Cost</label>
        <input
          type="number"
          name="assetCost.totalAmount"
          className="asset-edit-input"
          value={editForm.assetCost?.totalAmount}
          onChange={handleEditChange}
        />
      </div>
    </div>
  </div>

  {/* ================= STOCK ================= */}
  <div className="form-section">
    <h4 className="section-title">Stock & Usage</h4>

    <div className="asset-edit-grid">
      <div>
        <label>Quantity</label>
        <input
          type="number"
          name="assetQuantity"
          className="asset-edit-input"
          value={editForm.assetQuantity || ""}
          onChange={handleEditChange}
        />
      </div>

      {/* <div>
        <label>In Use</label>
        <input
          type="number"
          name="inUse"
          className="asset-edit-input"
          value={editForm.inUse || 0}
          onChange={handleEditChange}
        />
      </div> */}
    </div>
  </div>

  {/* ================= WARRANTY ================= */}
  <div className="form-section">
    <h4 className="section-title">Warranty</h4>

    <div className="asset-edit-grid">
      <div>
        <label>Warranty ID</label>
        <input
          name="warranty.warrantyId"
          className="asset-edit-input"
          value={editForm.warranty?.warrantyId || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Warranty Expiry</label>
        <input
          type="date"
          name="warranty.expiryDate"
          className="asset-edit-input"
          value={editForm.warranty?.expiryDate || ""}
          onChange={handleEditChange}
        />
      </div>
    </div>
  </div>

  {/* ================= INSURANCE ================= */}
  <div className="form-section">
    <h4 className="section-title">Insurance</h4>

    <div className="asset-edit-grid">
      <div>
        <label>Insurance ID</label>
        <input
          name="insurance.insuranceId"
          className="asset-edit-input"
          value={editForm.insurance?.insuranceId || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Insurance Name</label>
        <input
          name="insurance.insuranceName"
          className="asset-edit-input"
          value={editForm.insurance?.insuranceName || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Purchase Date</label>
        <input
          type="date"
          name="insurance.purchaseDate"
          className="asset-edit-input"
          value={editForm.insurance?.purchaseDate || ""}
          onChange={handleEditChange}
        />
      </div>

      <div>
        <label>Expiry Date</label>
        <input
          type="date"
          name="insurance.expiryDate"
          className="asset-edit-input"
          value={editForm.insurance?.expiryDate || ""}
          onChange={handleEditChange}
        />
      </div>
    </div>
  </div>

  {/* ================= ACTIONS ================= */}
  <div className="asset-edit-actions">
    <button type="submit" className="asset-edit-save-btn">Save</button>
    <button
      type="button"
      className="asset-edit-cancel-btn"
      onClick={() => setEditingAsset(null)}
    >
      Cancel
    </button>
  </div>

</form>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {selectedAssignmentAsset && (
    <motion.div
      className="asset-view-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedAssignmentAsset(null)}
    >
      <motion.div
        className="asset-view-modal"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Assignment Details</h3>

        {selectedAssignmentAsset.assignmentRecords?.length ? (
          selectedAssignmentAsset.assignmentRecords.map((record) => (
            <div key={record._id} className="assignment-row">
              <p><strong>Employee:</strong> {record.employee?.name}</p>
              {/* <p><strong>Email:</strong> {record.employee?.email}</p> */}
              <p><strong>Department:</strong> {record.department?.name}</p>
              <p><strong>Location:</strong> {record.assignLocation}</p>
              <p><strong>Quantity:</strong> {record.quantity}</p>
              <p>
                <strong>Assigned At:</strong>{" "}
                {new Date(record.assignedAt).toLocaleDateString()}
              </p>
              <hr />
            </div>
          ))
        ) : (
          <p>No active assignments</p>
        )}

        <button
          className="asset-view-close-btn"
          onClick={() => setSelectedAssignmentAsset(null)}
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
