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
  updateAssetInstance,
  updateHardwareAsset,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import { getErrorMessage } from "../utils/getErrorMessage";
import Loader from "../Components/Loader";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import CurrencyFilter from "../Components/CurrencyFilter";
import { useNavigate } from "react-router-dom";

const HardwareAssetList = () => {
  const navigate = useNavigate();
    const VENDOR_CONFIG = {
  dell: { icon: "💻", color: "blue" },
  hp: { icon: "🖥️", color: "cyan" },
  lenovo: { icon: "📦", color: "red" },
  apple: { icon: "🍎", color: "dark" },
  microsoft: { icon: "🪟", color: "indigo" },
  adobe: { icon: "🅰️", color: "red" },
};
const getVendorUI = (vendorName = "") => {
  if (!vendorName) {
    return {
      icon: "🏢",
      color: "gray",
      label: "Unknown",
      isCustom: false,
    };
  }

  const key = vendorName.toLowerCase();
  const config = VENDOR_CONFIG[key];

  if (config) {
    return {
      ...config,
      label: vendorName,
      isCustom: true,
    };
  }

  // 🔥 Dynamic fallback (unknown vendor)
  return {
    icon: vendorName.charAt(0).toUpperCase(), // first letter
    color: "gray",
    label: vendorName,
    isCustom: false,
  };
};
  const STATUS_CONFIG = {
  in_stock: {
    label: "Available",
    className: "success",
    icon: "🟢"
  },
  fully_in_use: {
    label: "Fully Assigned",
    className: "danger",
    icon: "🔴"
  },
  partially_in_use: {
    label: "Partially In Use",
    className: "warning",
    icon: "🟡"
  },
  partially_created: {
    label: "Partially Created",
    className: "info",
    icon: "🟣"
  },
  not_created: {
    label: "No Instances",
    className: "default",
    icon: "⚪"
  }
};
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [editAsset, setEditAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editInstance, setEditInstance] = useState(null);
const [instanceForm, setInstanceForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);

  const { currency, convertFromBase, loadingRates } = useCurrency();

  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
  if (editAsset) {
    setEditForm({
      assetName: editAsset.assetName,
      assetCategory: editAsset.assetCategory?._id,
      associateUnit: editAsset.associateUnit?._id,
      locationName: editAsset.locationName?._id,
      type: editAsset.type,
      assetQuantity: editAsset.assetQuantity,
      purchaseDetails: {
        purchaseDate: editAsset.purchaseDetails?.purchaseDate?.split("T")[0] || "",
        vendor: {
          name: editAsset.purchaseDetails?.vendor?.name || "",
          contact: editAsset.purchaseDetails?.vendor?.contact || "",
          supportEmail: editAsset.purchaseDetails?.vendor?.supportEmail || "",
        },
      },
    });
  }
}, [editAsset]);
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
  Swal.fire("Error", getErrorMessage(err, "Failed to load data"), "error");
  setLoading(false);
}
  };
const getCost = (costObj) => {
  return convertFromBase(Number(costObj?.baseAmount || 0));
};
 const getAssetTotals = (asset) => {
    const instances = asset.instances || [];

    const totalPurchase = instances.reduce(
      (sum, inst) =>
        sum + Number(inst.hardware?.purchaseCost?.baseAmount || 0),
      0
    );

    const totalMaintenance = instances.reduce(
      (sum, inst) =>
        sum +
        Number(inst.hardware?.costs?.maintenanceCost?.baseAmount || 0),
      0
    );

    return {
      totalPurchase: convertFromBase(totalPurchase),
      totalMaintenance: convertFromBase(totalMaintenance),
    };
  };  
  const getRemainingDays = (expiryDate) => {
  if (!expiryDate) return "-";

  const today = new Date();
  const expiry = new Date(expiryDate);

  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  return diff > 0 ? diff : "Expired";
};
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const truncateText = (text = "", maxLength = 18) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};
const handleUpdate = async () => {
  try {
    await updateHardwareAsset(editAsset._id, editForm);

    await Swal.fire("Success", "Asset updated", "success");

    setEditAsset(null);
    fetchAll();
} catch (err) {
  Swal.fire("Error", getErrorMessage(err, "Failed to update asset"), "error");
}
};
  const handleAssign = (asset) => {
    navigate("/assignment", {
      state: {
        categoryId: asset.assetCategory,
        assetId: asset._id,
        assetType: "hardware",
      },
    });
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
  Swal.fire("Error", getErrorMessage(err, "Failed to delete asset"), "error");
}
  };
  const handleInstanceUpdate = async () => {
  try {
    await updateAssetInstance(editInstance._id, instanceForm);

    Swal.fire("Updated", "Instance updated", "success");

    setEditInstance(null);
    fetchAll(); // refresh
} catch (err) {
  Swal.fire("Error", getErrorMessage(err, "Failed to update instance"), "error");
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
  const isAssigned = !!assignment;
  const hw = inst.hardware || {};

  // ✅ Safe QR fallback
  const qrUrl = inst.qrCode?.url || hw.qrCode?.url;

  // ✅ Safe cost helper
  const getCost = (costObj) => {
    return convertFromBase(Number(costObj?.baseAmount || 0));
  };

  return (
<div className={`instance-card-modern ${isAssigned ? "assigned" : ""}`}>

  {/* 🔷 HEADER */}
  <div className="instance-header-modern">
    <div>
      <h4 className="instance-title">{inst.instanceCode}</h4>
      <p className="instance-sub">{inst.serialNumber || "No Serial"}</p>
    </div>

    <span className={`status-pill ${isAssigned ? "assigned" : "available"}`}>
      {isAssigned ? "🔴 Assigned" : "🟢 Available"}
    </span>
  </div>

  {/* 🔷 MAIN SPLIT */}
  <div className="instance-body">

    {/* LEFT SIDE */}
    <div className="instance-left">

      {/* QUICK */}
      <div className="instance-quick-grid">
        <div>📍 {inst.location || "N/A"}</div>
        <div>⚙ {inst.condition}</div>
        <div>
          📅{" "}
          {hw.installationDate
            ? new Date(hw.installationDate).toLocaleDateString()
            : "N/A"}
        </div>
      </div>

      {/* TECH */}
      <div className="instance-section">
        <p className="section-title">Technical</p>
        <div className="grid-2">
          <p><span>Model</span>{hw.modelNo || "N/A"}</p>
          <p><span>Specs</span>{hw.specifications || "N/A"}</p>
        </div>
      </div>

      {/* LIFECYCLE */}
      <div className="instance-section">
        <p className="section-title">Lifecycle</p>
        <div className="grid-2">
          <p><span>Purchase</span>{hw.purchaseDate ? new Date(hw.purchaseDate).toLocaleDateString() : "N/A"}</p>
          <p><span>Maintenance</span>{hw.nextMaintenanceDate ? new Date(hw.nextMaintenanceDate).toLocaleDateString() : "N/A"}</p>
          <p><span>Warranty</span>{hw.warrantyExpiry ? new Date(hw.warrantyExpiry).toLocaleDateString() : "N/A"}</p>
          <p><span>Insurance</span>{hw.insuranceExpiry ? new Date(hw.insuranceExpiry).toLocaleDateString() : "N/A"}</p>
        </div>
      </div>

      {/* COST */}
      <div className="instance-section">
        <p className="section-title">Cost</p>
        <div className="grid-2">
          <p><span>Purchase</span>{CURRENCY_SYMBOLS[currency]} {getCost(hw.purchaseCost)}</p>
          <p><span>Maintenance</span>{CURRENCY_SYMBOLS[currency]} {getCost(hw.costs?.maintenanceCost)}</p>
          <p><span>Warranty</span>{CURRENCY_SYMBOLS[currency]} {getCost(hw.costs?.warrantyRenewalCost)}</p>
          <p><span>Insurance</span>{CURRENCY_SYMBOLS[currency]} {getCost(hw.costs?.insuranceCost)}</p>
        </div>
      </div>

    </div>

    {/* RIGHT SIDE */}
    <div className="instance-right">

      {/* QR */}
      {qrUrl && (
        <div className="instance-section qr-box">
          <p className="section-title">QR Code</p>

          <img src={qrUrl} alt="QR" className="qr-image-modern" />

          <div className="qr-actions">
            <a href={qrUrl} download className="btn-small">Download</a>

            {inst.trackingUrl && (
              <a href={inst.trackingUrl} target="_blank" rel="noreferrer" className="btn-small btn-blue">
                Open
              </a>
            )}
          </div>
        </div>
      )}

      {/* ASSIGNMENT */}
      {isAssigned && (
        <div className="instance-section assignment-box">
          <p className="section-title">Assignment</p>
          <p>{assignment.employee?.name}</p>
          <p>{assignment.department?.name}</p>
          <p>{assignment.location}</p>
        </div>
      )}

    </div>
  </div>

  {/* ACTION */}
  <button
  className="btn-edit modern"
  onClick={() => {
    setEditInstance(inst);

    setInstanceForm({
      location: inst.location || "",
      condition: inst.condition || "new",
      serialNumber:
        inst.hardware?.serialNumber ||
        inst.software?.licenseNumber ||
        "",
      assetType: inst.assetType,
    });
  }}
>
  ✏ Edit
</button>
</div>
  );
};

  return (
    <div className="inventory-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Hardware Inventory</h2>

          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search-input"
          />

      </div>

      {/* GRID */}
      <div className="inventory-grid">
        <AnimatePresence>
      {filteredAssets.map((asset) => {
        const totals = getAssetTotals(asset);
  const statusConfig = STATUS_CONFIG[asset.status] || {
    label: asset.status || "Unknown",
    className: "default",
    icon: "❓"
  };

  return (
    <motion.div
      key={asset._id}
      className="inventory-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 🔷 HEADER */}
      <div className="card-header">
<div>
  <h3 title={asset.assetName}>
    {truncateText(asset.assetName, 18)}
  </h3>
  <p className="asset-code">{asset.assetCode}</p>
</div>  

{(() => {
  const vendorName = asset.purchaseDetails?.vendor?.name;
  const vendor = getVendorUI(vendorName);

  return (
    <div className={`vendor-badge ${vendor.color}`}>
      <span className={`vendor-icon ${!vendor.isCustom ? "avatar" : ""}`}>
        {vendor.icon}
      </span>
      <span className="vendor-text">{vendor.label}</span>
    </div>
  );
})()}
      </div>

      {/* 🔷 BADGE GRID */}
      <div className="badge-grid">
        <span className="badge">{asset.assetCategory?.name}</span>
        <span className="badge">{asset.locationName?.name}</span>
        <span className="badge">{asset.associateUnit?.name}</span>

        {/* ✅ FIXED STATUS BADGE */}
        <span className={`badge status ${statusConfig.className}`}>
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>

      {/* 🔷 DATES */}
      <div className="dates">
        <div>
          <p className="label"> Purchase Date</p>
          <p>📅 {formatDate(asset.purchaseDetails?.purchaseDate)}</p>
        </div>
    <div>
      <p className="label">Usage</p>
    <p>
      💻 {asset.inUse}/{asset.assetQuantity} used
    </p>
    </div>
      </div>

     {/* 🔷 FINANCIAL INSIGHTS (COMPACT) */}
<div className="financial-grid-compact">

  {/* TOP ROW (IMPORTANT) */}
  <div className="financial-card primary">
    <p className="label">Total Purchase Cost</p>
               <p>
                  💰 {CURRENCY_SYMBOLS[currency]}{" "}
                  {totals.totalPurchase.toLocaleString()}
                </p>
  </div>

  <div className="financial-card primary-alt">
    <p className="label">Maintenance</p>
                <p>
                  🛠 {CURRENCY_SYMBOLS[currency]}{" "}
                  {totals.totalMaintenance.toLocaleString()}
                </p>

  </div>

  {/* BOTTOM ROW (LESS IMPORTANT) */}
  {/* <div className="financial-card small">
    <p className="label">Yearly</p>
    <p>
      📅 {asset.financialTracking?.currency}{" "}
     {CURRENCY_SYMBOLS[currency]}{" "}
{convertFromBase(
  Number(asset.financialTracking?.yearlyMaintenanceCost?.baseAmount || 0)
).toLocaleString()}
    </p>
  </div> */}

  {/* <div className="financial-card small">
    <p className="label">Monthly</p>
    <p>
      📊 {asset.financialTracking?.currency}{" "}
      {asset.financialTracking?.monthlyMaintenanceCost?.toFixed(2) || 0}
    </p>
  </div> */}

</div>
      {/* 🔷 ACTIONS */}
      <div className="card-actions">
        <button
          onClick={() => setSelectedAsset(asset)}
          className="btn-save"
        >
          View
        </button>
        <button
          onClick={() => setEditAsset(asset)}
          className="btn-edit"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(asset._id)}
          className="btn-delete"
        >
          Delete
        </button>
            <button onClick={() => handleAssign(asset)} className="btn-assign">
      Assign
    </button>
      </div>
    </motion.div>
  );
})}
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
              <AnimatePresence>
{editInstance && (
  <motion.div
    className="asset-view-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setEditInstance(null)}
  >
    <motion.div
      className="asset-view-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Edit Instance</h3>

      <div className="grid-2">
        {/* LOCATION */}
        <div className="input-group">
          <label>Location</label>
          <input
            value={instanceForm.location}
            onChange={(e) =>
              setInstanceForm({
                ...instanceForm,
                location: e.target.value,
              })
            }
          />
        </div>

        {/* CONDITION */}
        <div className="input-group">
          <label>Condition</label>
          <select
            value={instanceForm.condition}
            onChange={(e) =>
              setInstanceForm({
                ...instanceForm,
                condition: e.target.value,
              })
            }
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* SERIAL NUMBER */}
      <div className="grid-2">
        <div className="input-group">
          <label>
            {instanceForm.assetType === "hardware"
              ? "Serial Number"
              : "License Number"}
          </label>
          <input
            value={instanceForm.serialNumber || ""}
            onChange={(e) =>
              setInstanceForm({
                ...instanceForm,
                serialNumber: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* INFO MESSAGE */}
      <p className="info-text">
        💡 Financial, warranty, and technical details are managed via upgrade or lifecycle actions.
      </p>

      {/* ACTIONS */}
      <div className="modal-actions">
        <button
          className="btn-save"
          onClick={handleInstanceUpdate}
        >
          Save
        </button>

        <button
          className="btn-cancel"
          onClick={() => setEditInstance(null)}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </motion.div>
)}
</AnimatePresence>

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
      <AnimatePresence>
 {editAsset && (
  <motion.div
    className="asset-view-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setEditAsset(null)}
  >
    <motion.div
      className="asset-view-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Edit Asset</h3>

      {/* BASIC INFO */}
      <div className="grid-2">
        <div className="input-group">
          <label>Asset Name</label>
          <input
            value={editForm.assetName}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetName: e.target.value,
              })
            }
          />
        </div>

        <div className="input-group">
          <label>Category</label>
          <select
            value={editForm.assetCategory}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetCategory: e.target.value,
              })
            }
          >
            {categories.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUANTITY */}
      <div className="grid-2">
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="number"
            value={editForm.assetQuantity}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetQuantity: e.target.value,
              })
            }
          />
          <p className="warning-text">
            ⚠ Changing quantity will add/remove instances automatically.
          </p>
        </div>
      </div>

      {/* UNIT + LOCATION */}
      <div className="grid-2">
        <div className="input-group">
          <label>Unit</label>
          <select
            value={editForm.associateUnit}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                associateUnit: e.target.value,
              })
            }
          >
            {units.map(u => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Location</label>
          <select
            value={editForm.locationName}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                locationName: e.target.value,
              })
            }
          >
            {locations.map(l => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STATUS + TYPE */}
      <div className="grid-2">
        {/* <div className="input-group">
          <label>Status</label>
          <select
            value={editForm.assetStatus}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetStatus: e.target.value,
              })
            }
          >
            {statuses.map(s => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div> */}

        <div className="input-group">
          <label>Type</label>
          <select
            value={editForm.type}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                type: e.target.value,
              })
            }
          >
            <option value="one_time">One-Time</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* PURCHASE DATE */}
      <div className="grid-2">
        <div className="input-group">
          <label>Purchase Date</label>
          <input
            type="date"
            value={editForm.purchaseDate || ""}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                purchaseDate: e.target.value,
              })
            }
          />
        </div>
      </div>
      {/* 🔷 VENDOR DETAILS */}
<div className="grid-2">
  <div className="input-group">
    <label>Vendor Name</label>
    <input
      value={editForm.purchaseDetails?.vendor?.name || ""}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          purchaseDetails: {
            ...editForm.purchaseDetails,
            vendor: {
              ...editForm.purchaseDetails.vendor,
              name: e.target.value,
            },
          },
        })
      }
    />
  </div>

  <div className="input-group">
    <label>Vendor Contact</label>
    <input
      value={editForm.purchaseDetails?.vendor?.contact || ""}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          purchaseDetails: {
            ...editForm.purchaseDetails,
            vendor: {
              ...editForm.purchaseDetails.vendor,
              contact: e.target.value,
            },
          },
        })
      }
    />
  </div>
</div>

<div className="grid-2">
  <div className="input-group">
    <label>Support Email</label>
    <input
      type="email"
      value={editForm.purchaseDetails?.vendor?.supportEmail || ""}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          purchaseDetails: {
            ...editForm.purchaseDetails,
            vendor: {
              ...editForm.purchaseDetails.vendor,
              supportEmail: e.target.value,
            },
          },
        })
      }
    />
  </div>
</div>

      {/* ACTIONS */}
      <div className="modal-actions">
        <button onClick={handleUpdate} className="btn-save">
          Save
        </button>
        <button
          onClick={() => setEditAsset(null)}
          className="btn-cancel"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </motion.div>
)}
</AnimatePresence>
    </div>
  );
};

export default HardwareAssetList;