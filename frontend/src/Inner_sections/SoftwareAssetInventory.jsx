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
import { convertFromBase , CURRENCY_SYMBOLS } from "../utils/currency";

const SoftwareAssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const assetsPerPage = 8;

const navigate = useNavigate();
  const { currency } = useCurrency();
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
      const [
        assetsRes,
        catRes,
        statRes,
        unitRes,
        locRes,
      ] = await Promise.all([
        getSoftwareAssets(),
        getCategories(),
        getStatuses(),
        getUnits(),
        getLocations(),
      ]);

      setAssets(assetsRes?.data ?? assetsRes ?? []);
      console.log('Fetched software assets:', assetsRes);
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

  /* ================= HELPERS ================= */
const getName = (list, value) => {
  if (!value) return "N/A";
  if (!Array.isArray(list)) return "N/A";

  const id = typeof value === "object" ? value._id : value;

  const found = list.find(
    (i) => String(i._id) === String(id)
  );

  return found ? found.name : "N/A";
};


  const getInStock = (asset) =>
    Number(asset.assetQuantity || 0) - Number(asset.inUse || 0);

  const getExpiryBadge = (DOE) => {
    if (!DOE) return null;
    const today = new Date();
    const expiry = new Date(DOE);
    const diffDays = Math.ceil(
      (expiry.setHours(0, 0, 0, 0) -
        today.setHours(0, 0, 0, 0)) /
        86400000
    );

    if (diffDays < 0)
      return <span className="badge badge-renew">Expired</span>;
    if (diffDays <= 3)
      return <span className="badge badge-red">{diffDays} days</span>;
    if (diffDays <= 14)
      return <span className="badge badge-yellow">{diffDays} days</span>;

    return <span className="badge badge-green">{diffDays} days</span>;
  };

  /* ================= DELETE ================= */
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

  /* ================= EDIT ================= */
  const startEdit = (asset) => {
    setEditingAsset(asset);
    setEditForm({
      assetName: asset.assetName || "",
      assetCode: asset.assetCode || "",
      assetSpecification: asset.assetSpecification || "",
      assetCategory: asset.assetCategory || "",
      associateUnit: asset.associateUnit || "",
      locationName: asset.locationName || "",
      assetStatus: asset.assetStatus || "",
      purchaseFrom: asset.purchaseFrom || "",
      DOP: asset.DOP || "",
      DOE: asset.DOE || "",
      assetLifetime: asset.assetLifetime || "",
assetCost: {
  totalAmount: asset.assetCost?.totalAmount || 0,
  unitAmount: asset.assetCost?.unitAmount || 0,
  currency: asset.assetCost?.currency || "USD",
  baseTotalAmount: asset.assetCost?.baseTotalAmount || 0,
},


      assetQuantity: asset.assetQuantity || 1,
      inUse: asset.inUse || 0,

      licenseKey: asset.licenseKey || "",
      licenseType: asset.licenseType || "",
      licenseModel: asset.licenseModel || "",
      licenseMetric: asset.licenseMetric || "",
      licenseUse: asset.licenseUse || "",
    });
  };
const isOutOfStock = (asset) =>
  Number(asset.assetQuantity || 0) - Number(asset.inUse || 0) <= 0;

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSubmit = async (e) => {
    e.preventDefault();

const payload = {
  ...editForm,
  assetCost: {
    totalAmount: Number(editForm.assetCost.totalAmount),
    currency: editForm.assetCost.currency,
  },
  assetQuantity: Number(editForm.assetQuantity),
  inUse: Number(editForm.inUse),
};



    const updated = await updateSoftwareAsset(editingAsset._id, payload);
    const newAsset = updated?.data ?? updated;

    setAssets((p) =>
      p.map((a) => (a._id === newAsset._id ? newAsset : a))
    );

    setEditingAsset(null);
    Swal.fire("Updated", "Software asset updated", "success");
  };
const renderDepartmentBadges = (asset) => {
  if (!asset.assignedDepartments || asset.assignedDepartments.length === 0) {
    return <span className="dept-muted">Not Assigned</span>;
  }

  return asset.assignedDepartments.map((item) => (
    <span key={item.department._id} className="dept-badge">
      {item.department.name}
      {item.quantity ? ` (${item.quantity})` : ""}
    </span>
  ));
};

  /* ================= PAGINATION LOGIC (FIXED) ================= */
  const totalPages = Math.ceil(assets.length / assetsPerPage);

  const indexOfLast = currentPage * assetsPerPage;
  const indexOfFirst = indexOfLast - assetsPerPage;
  const currentAssets = assets.slice(indexOfFirst, indexOfLast);

  /* Auto-fix page when deleting last item on page */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [assets.length]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };
  if (loading) return <Loader type="inventory" apiDone={apiDone} />;
  const Field = ({ label, value }) => (
  <div>
    <label>{label}</label>
    <p>{value || "N/A"}</p>
  </div>
);
  return (
    <div className="inventory-container">
      <div className="dashboard-header">
  <h2 className="hardware-title">Software Inventory</h2>
  <CurrencyFilter />
</div>
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
                <h3 className="card-title">{asset.assetName}</h3>
                {getExpiryBadge(asset.DOE)}
              </div>  

              <div className="card-info2">
                <p><strong>Version:</strong> {asset.assetSpecification}</p>
<p style={{ color: "red" }}>
  <strong>Total Cost:</strong>{" "}
  {CURRENCY_SYMBOLS[currency]}{" "}
  {convertFromBase(
  asset.assetCost?.baseTotalAmount ?? 0,
  currency
)
.toLocaleString()}
</p>

<p>
  <strong>Unit Cost:</strong>{" "}
  {CURRENCY_SYMBOLS[currency]}{" "}
  {convertFromBase(
    asset.assetCost?.baseTotalAmount / asset.assetQuantity,
    currency
  ).toLocaleString()}
</p>



                  
                  {/* <p>
                    <strong>Base Cost (INR):</strong>{" "}
                    {asset.assetCost?.baseAmount
                      ? `₹${asset.assetCost.baseAmount.toLocaleString("en-IN")}`
                      : "N/A"}
                  </p> */}
                  
                  {/* <p>
                    <strong>Total Value (INR):</strong>{" "}
                  {CURRENCY_SYMBOLS[currency]}{" "}
                  {convertFromBase(
                    (asset.assetCost?.baseAmount ?? 0) * (asset.assetQuantity ?? 0),
                    currency
                  ).toLocaleString()}
                  
                  </p> */}

                <p><strong>Quantity:</strong> {asset.assetQuantity}</p>
                <p><strong>In Use:</strong> {asset.inUse}</p>
                <div className="dept-badge-wrapper">
    {renderDepartmentBadges(asset)}

  </div>
                <p>
                  <strong>Stock:</strong>{" "}
                  {getInStock(asset) > 0 ? (
                    <span className="stock-green">{getInStock(asset)} Available</span>
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
          ))}
        </AnimatePresence>
      </div>
          {renderPagination()}
      {/* VIEW & EDIT MODALS ARE NOW IDENTICAL TO HARDWARE */}
      {/* ================= SOFTWARE VIEW MODAL ================= */}
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
              {selectedAsset.assetName}
            </h3>
            <p className="asset-view-subtitle">
              {selectedAsset.assetCode}
            </p>
          </div>

          <div className="asset-view-badges">
            <span className="asset-view-badge category">
              {getName(categories, selectedAsset.assetCategory)}
            </span>
            <span className="asset-view-badge status">
              {getName(statuses, selectedAsset.assetStatus)}
            </span>
          </div>
        </div>

        {/* ================= BASIC INFORMATION ================= */}
        <h4 className="asset-view-section-title">Basic Information</h4>
        <div className="asset-view-grid">
          <Field label="License Type" value={selectedAsset.licenseType} />
          <Field label="License Model" value={selectedAsset.licenseModel} />
          <Field label="License Metric" value={selectedAsset.licenseMetric} />
          <Field label="License Use" value={selectedAsset.licenseUse} />
          <Field label="Version" value={selectedAsset.assetSpecification} />
          <Field label="Publisher" value={selectedAsset.purchaseFrom} />
          <Field label="Billing Type" value={selectedAsset.type} />
          <Field
            label="Installed Location"
            value={getName(locations, selectedAsset.locationName)}
          />
          <Field label="Location Address" value={selectedAsset.locationAddress} />
          <Field
            label="Unit"
            value={getName(units, selectedAsset.associateUnit)}
          />
        </div>

        {/* ================= FINANCIAL DETAILS ================= */}
        <h4 className="asset-view-section-title">Financial Details</h4>
        <div className="asset-view-grid">
          <Field
            label="Billing Currency"
            value={selectedAsset.assetCost?.currency}
          />

          <Field
            label="Billing Cost (Per Cycle)"
            value={
              selectedAsset.assetCost?.totalAmount
                ? `${selectedAsset.assetCost.currency} ${selectedAsset.assetCost.totalAmount.toLocaleString()}`
                : null
            }
          />

          <Field
            label="Overall Contract Cost"
            value={
              selectedAsset.overallCost?.totalAmount
                ? `${selectedAsset.overallCost.currency} ${selectedAsset.overallCost.totalAmount.toLocaleString()}`
                : null
            }
          />

          <Field
            label="Base Billing Cost"
            value={
              selectedAsset.assetCost?.baseTotalAmount
                ? `₹ ${selectedAsset.assetCost.baseTotalAmount.toLocaleString()}`
                : null
            }
          />

          <Field
            label="Base Overall Cost"
            value={
              selectedAsset.overallCost?.baseTotalAmount
                ? `₹ ${selectedAsset.overallCost.baseTotalAmount.toLocaleString()}`
                : null
            }
          />
        </div>

        {/* ================= LICENSE & DURATION ================= */}
        <h4 className="asset-view-section-title">License Duration</h4>
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
            label="Expiry Date"
            value={
              selectedAsset.DOE
                ? new Date(selectedAsset.DOE).toLocaleDateString()
                : "One Time License"
            }
          />

          <Field
            label="Lifetime"
            value={selectedAsset.assetLifetime}
          />
        </div>

        {/* ================= DISTRIBUTION ================= */}
        <h4 className="asset-view-section-title">Distribution</h4>
        <div className="asset-view-grid">
          <Field label="Total Licenses" value={selectedAsset.assetQuantity} />
          <Field label="In Use" value={selectedAsset.inUse} />
          <Field label="Available" value={selectedAsset.inStock} />
        </div>

        {/* ================= AUDIT ================= */}
        <h4 className="asset-view-section-title">Audit Information</h4>
        <div className="asset-view-grid">
          <Field label="Asset ID" value={selectedAsset._id} />
          <Field label="Organization ID" value={selectedAsset.organizationId} />

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

        {/* ================= AUDIT HISTORY ================= */}
        {selectedAsset.auditHistory?.length > 0 && (
          <>
            <h4 className="asset-view-section-title">Audit History</h4>
            <div className="asset-view-audit">
              {selectedAsset.auditHistory.slice(-5).reverse().map((log, i) => (
                <div key={i} className="audit-entry">
                  <strong>{log.action}</strong> —
                  {new Date(log.date).toLocaleString()}
                  {log.notes && <p>{log.notes}</p>}
                </div>
              ))}
            </div>
          </>
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

      {/* (Intentionally omitted here to keep answer readable) */}
      {/* ================= SOFTWARE EDIT MODAL ================= */}
{/* ================= SOFTWARE EDIT MODAL ================= */}
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
          Edit Software — {editingAsset.assetName}
        </h3>

        <form className="asset-edit-grid" onSubmit={handleEditSubmit}>
          <div>
            <label>Asset Code</label>
          <input name="assetCode" value={editForm.assetCode} onChange={handleEditChange} placeholder="Asset Code" className="asset-edit-input"/>
          </div>
          <div>
            <label>Software Name</label>
          <input name="assetName" value={editForm.assetName} onChange={handleEditChange} placeholder="Software Name" className="asset-edit-input"/>
          </div>
            <div>
            <label>Version</label>
          <input name="assetSpecification" value={editForm.assetSpecification} onChange={handleEditChange} placeholder="Version" className="asset-edit-input"/>
            </div>
          <div>
            <label>Publisher</label>
          <input name="purchaseFrom" value={editForm.purchaseFrom} onChange={handleEditChange} placeholder="Publisher" className="asset-edit-input"/>
          </div>
            <div>
            <label>Category</label>
          <select name="assetCategory" className="asset-edit-input" value={editForm.assetCategory} onChange={handleEditChange}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
            </div>
          <div>
              <label>Unit</label>
          <select name="associateUnit" className="asset-edit-input" value={editForm.associateUnit} onChange={handleEditChange}>
            <option value="">Select Unit</option>
            {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          </div>
        <div>
          <label>Location</label>
          <select name="locationName" className="asset-edit-input" value={editForm.locationName} onChange={handleEditChange}>
            <option value="">Select Location</option>
            {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label>Location Address</label>
          <input name="locationAddress" value={editForm.locationAddress} onChange={handleEditChange} placeholder="Location Address" className="asset-edit-input"/>
        </div>
        <div>
          <label>Asset Status</label>
          <select name="assetStatus" className="asset-edit-input" value={editForm.assetStatus} onChange={handleEditChange}>
            <option value="">Select Status</option>
            {statuses.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          </div>  
        <div>
          <label>Purchase Date</label>
          <input type="date" name="DOP" value={editForm.DOP} onChange={handleEditChange} className="asset-edit-input"/>
        </div>
        <div>
          <label>Expiry Date</label>
          <input type="date" name="DOE" value={editForm.DOE} onChange={handleEditChange} className="asset-edit-input"/>
        </div>
        <div>
          <label>Asset Lifetime</label>
          <input name="assetLifetime" value={editForm.assetLifetime} onChange={handleEditChange} placeholder="Lifetime" className="asset-edit-input"/>
        </div>
<div>
  <label>Total Cost</label>
<input
  type="number"
  placeholder="Total Software Cost"
  className="asset-edit-input"
  value={editForm.assetCost?.totalAmount || ""}
  onChange={(e) =>
    setEditForm((prev) => {
      const total = Number(e.target.value);
      const qty = Number(prev.assetQuantity || 1);

      return {
        ...prev,
        assetCost: {
          ...prev.assetCost,
          totalAmount: total,
          unitAmount: qty ? total / qty : 0,
        },
      };
    })
  }
/>
</div>
<div>
  <label>Currency</label>
<select
  className="asset-edit-input"
  value={editForm.assetCost?.currency || "USD"}
  onChange={(e) =>
    setEditForm((prev) => ({
      ...prev,
      assetCost: {
        ...prev.assetCost,
        currency: e.target.value,
      },
    }))
  }
>
  <option value="USD">USD</option>
  <option value="INR">INR</option>
  <option value="EUR">EUR</option>
</select>
</div>
<div>
  <label>Quantity</label>
          <input type="number" name="assetQuantity" value={editForm.assetQuantity} onChange={handleEditChange} placeholder="Quantity" className="asset-edit-input"/>
</div>
<div>
  <label>In Use</label>
          <input type="number" name="inUse" value={editForm.inUse} onChange={handleEditChange} placeholder="In Use" className="asset-edit-input"/>
</div>
<div>
  <label>License Key</label>
          <input name="licenseKey" value={editForm.licenseKey} onChange={handleEditChange} placeholder="License Key" className="asset-edit-input"/>
</div>
{/* <div>
  <label>License Type</label>
          <input name="licenseType" value={editForm.licenseType} onChange={handleEditChange} placeholder="License Type" className="asset-edit-input"/>
</div> */}
<div>
  <label>License Model</label>
          <input name="licenseModel" value={editForm.licenseModel} onChange={handleEditChange} placeholder="License Model" className="asset-edit-input"/>
</div>
<div>
  <label>License Metric</label>
          <input name="licenseMetric" value={editForm.licenseMetric} onChange={handleEditChange} placeholder="License Metric" className="asset-edit-input"/>
</div>
<div>
  <label>License Use</label>
          <input name="licenseUse" value={editForm.licenseUse} onChange={handleEditChange} placeholder="License Use" className="asset-edit-input"/>
</div>

          <div className="asset-edit-actions">
            <button type="submit" className="asset-edit-save-btn">Save</button>
            <button type="button" className="asset-edit-cancel-btn" onClick={() => setEditingAsset(null)}>Cancel</button>
          </div>

        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default SoftwareAssetList;
