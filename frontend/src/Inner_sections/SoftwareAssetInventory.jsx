// ✅ src/Pages/SoftwareAssetList.jsx
import React, { useEffect, useState , useRef} from "react";
import ThemeSwal from "../utils/SwalTheme";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSoftwareAssets,
  deleteSoftwareAsset,
  updateSoftwareAsset,
  getCategories,
  getStatuses,
  getUnits,
  getLocations,
  updateAssetInstance,
} from "../Services/ApiServices";
import "../Page_styles/Inventory.css";
import Pagination from "../Components/Pagination";
import Loader from "../Components/Loader";
import InstanceCard from "../Components/InstanceInventory";
import { useNavigate } from "react-router-dom";
import CurrencyFilter from "../Components/CurrencyFilter";
import { useCurrency } from "../Context/CurrencyContext";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import { getErrorMessage } from "../utils/getErrorMessage";
const SoftwareAssetList = () => {
    const gridRef = useRef(null);
    const cardRef = useRef(null);
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
    icon: "🟢",
  },
  fully_in_use: {
    label: "Fully Assigned",
    className: "danger",
    icon: "🔴",
  },
  partially_in_use: {
    label: "Partially In Use",
    className: "warning",
    icon: "🟡",
  },
  partially_created: {
    label: "Partially Created",
    className: "info",
    icon: "🟣",
  },
  not_created: {
    label: "No Instances",
    className: "default",
    icon: "⚪",
  },
};
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiDone, setApiDone] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editInstance, setEditInstance] = useState(null);
const [instanceForm, setInstanceForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
const [assetsPerPage, setAssetsPerPage] = useState(8);

  const navigate = useNavigate();
  const { currency, convertFromBase, loadingRates } = useCurrency();
useEffect(() => {
  const calculate = () => {
    if (!gridRef.current || !cardRef.current) return;

    const gridWidth = gridRef.current.clientWidth;
    const cardWidth = cardRef.current.offsetWidth;

    const columns = Math.floor(gridWidth / cardWidth) || 1;

    const rows = 2; // 🔥 fixed rows per page (tune this)

    setAssetsPerPage(columns * rows);
  };

  calculate();
  window.addEventListener("resize", calculate);

  return () => window.removeEventListener("resize", calculate);
}, []);
  useEffect(() => {
    fetchAll();
  }, []);
  const handleEditOpen = (asset) => {
  setEditAsset(asset);

  setEditForm({
    assetName: asset.assetName,
    assetCategory: asset.assetCategory?._id || asset.assetCategory,
    associateUnit: asset.associateUnit?._id || asset.associateUnit,
    locationName: asset.locationName?._id || asset.locationName,
    type: asset.type,

    assetQuantity: asset.assetQuantity,


purchaseDetails: {
  purchaseDate: asset.purchaseDetails?.purchaseDate?.split("T")[0] || "",
  vendor: {
    name: asset.purchaseDetails?.vendor?.name || "",
    contact: asset.purchaseDetails?.vendor?.contact || "",
    supportEmail: asset.purchaseDetails?.vendor?.supportEmail || "",
  },
},

  });
};

const formatMoney = (costObj) => {
  if (!costObj || typeof costObj !== "object") return "0";

  return `${CURRENCY_SYMBOLS[currency]} ${convertFromBase(
    Number(costObj.baseAmount || 0)
  ).toLocaleString()}`;
};


const handleInstanceEditOpen = (inst) => {
  console.log("Editing instance:", inst);
  setEditInstance(inst);

  setInstanceForm({
    condition: inst.condition,
    location: inst.location,

    // SOFTWARE ONLY
    licenseKey: inst.software?.licenseKey || "",
    licenseNumber: inst.software?.licenseNumber || "",
  });
};
const getRemainingDays = (date) => {
  if (!date) return "-";

  const today = new Date();
  const target = new Date(date);

  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  return diff > 0 ? diff : "Expired";
};
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };
const handleInstanceUpdate = async () => {
  try {
    await updateAssetInstance(editInstance._id, {
      condition: instanceForm.condition,
      location: instanceForm.location,
      installationDate: instanceForm.installationDate,

      warranty: {
        expiryDate: instanceForm.warrantyExpiry,
      },

      costTracking: {
        maintenanceCost: instanceForm.maintenanceCost,
        warrantyRenewalCost: instanceForm.warrantyRenewalCost,
        insuranceCost: instanceForm.insuranceCost,
      },

      software: editInstance.software
        ? {
            licenseKey: instanceForm.licenseKey,
            licenseNumber: instanceForm.licenseNumber,
            vendor: instanceForm.vendor,
          }
        : undefined,
    });

    ThemeSwal.fire("Updated", "Instance updated", "success");
    setEditInstance(null);
    fetchAll();
} catch (err) {
  ThemeSwal.fire(
    "Error",
    getErrorMessage(err, "Failed to update instance"),
    "error"
  );
}
};
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
  ThemeSwal.fire(
    "Error",
    getErrorMessage(err, "Failed to load software assets"),
    "error"
  );
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
  const res = await ThemeSwal.fire({
    title: "Delete software asset?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
  });

  if (!res.isConfirmed) return;

  try {
    await deleteSoftwareAsset(id);
    setAssets((p) => p.filter((a) => a._id !== id));

    ThemeSwal.fire("Deleted", "Software asset removed", "success");
  } catch (err) {
    ThemeSwal.fire(
      "Error",
      getErrorMessage(err, "Failed to delete asset"),
      "error"
    );
  }
};
  const truncateText = (text = "", maxLength = 18) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
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
  const handleEditSave = async () => {
  try {
await updateSoftwareAsset(editAsset._id, {
  assetName: editForm.assetName,
  assetCategory: editForm.assetCategory,
  associateUnit: editForm.associateUnit,
  locationName: editForm.locationName,
  type: editForm.type,
  assetQuantity: editForm.assetQuantity,

  purchaseDetails: {
    purchaseDate: editForm.purchaseDate,
    vendor: {
      name: editForm.vendorName,
      contact: editForm.vendorContact,
      supportEmail: editForm.vendorEmail,
    },
  },
});

    ThemeSwal.fire("Updated", "Software updated", "success");
    setEditAsset(null);
    fetchAll();
} catch (err) {
  ThemeSwal.fire(
    "Error",
    getErrorMessage(err, "Failed to update software"),
    "error"
  );
}
};
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm , assetsPerPage]);
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
  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);
  const assignmentMap = {};

selectedAsset?.assignmentRecords?.forEach(assign => {
  assignmentMap[assign.assetInstanceId] = assign;
});
  if (loading || loadingRates)
    return <Loader type="inventory" apiDone={apiDone} />;
const mapInstanceData = (inst, assignment) => {
  const isHardware = inst.assetType === "hardware";
  const hw = inst.hardware || {};
  const sw = inst.software || {};

  return {
    id: inst._id,
    code: inst.instanceCode,
    status: assignment ? "assigned" : "available",

    quick: {
      location: inst.location,
      condition: inst.condition,
      date: isHardware
        ? hw.installationDate
        : sw.installationDate
    },

    details: isHardware
      ? [
          { label: "Model", value: hw.modelNo },
          { label: "Specs", value: hw.specifications }
        ]
      : [
          { label: "License Key", value: sw.licenseKey },
          { label: "License No", value: sw.licenseNumber }
        ],

    lifecycle: isHardware
      ? [
          { label: "Purchase", value: hw.purchaseDate },
          { label: "Warranty", value: hw.warrantyExpiry },
          { label: "Maintenance", value: hw.nextMaintenanceDate }
        ]
      : [
          { label: "Expiry", value: sw.renewalDate },
          { label: "Last Used", value: sw.lastUsedDate }
        ],

    costs: isHardware
      ? [
          { label: "Purchase", value: hw.purchaseCost },
          { label: "Maintenance", value: hw.costs?.maintenanceCost },
          { label: "Warranty", value: hw.costs?.warrantyRenewalCost },
          { label: "Insurance", value: hw.costs?.insuranceCost }
        ]
      : [
          { label: "Purchase", value: sw.purchaseCost },
          { label: "Renewal", value: sw.costs?.renewalCost }
        ],

    qr: hw.qrCode?.url || null,

    assignment: assignment
      ? {
          name: assignment.employee?.name,
          dept: assignment.department?.name,
          location: assignment.location
        }
      : null
  };
};
  return (
    <div className="inventory-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2 className="hardware-title">Software Inventory</h2>

          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search-input"
          />
      </div>

      {/* CARDS */}
      <div className="inventory-grid">
        <AnimatePresence>
          {currentAssets.map((asset , index) => (
            <motion.div
  key={asset._id}
  ref={index === 0 ? cardRef : null}
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
      <span className="vendor-text">{truncateText(vendor.label, 10)}</span>
    </div>
  );
})()}
  </div>

  {/* 🔷 BADGE GRID */}
  <div className="badge-grid">
    <span className="badge">
      {getName(categories, asset.assetCategory)}
    </span>

    <span className="badge">
      {getName(locations, asset.locationName)}
    </span>

    <span className="badge">
      {getName(units, asset.associateUnit)}
    </span>

{(() => {
  const statusConfig =
    STATUS_CONFIG[asset.status] || {
      label: "Unknown",
      className: "default",
      icon: "❓",
    };

  return (
    <span className={`badge status ${statusConfig.className}`}>
      {statusConfig.icon} {statusConfig.label}
    </span>
  );
})()}
  </div>

  {/* 🔷 FINANCIAL */}
  <div className="financial">
    <div>
      <p className="label">Yearly Cost</p>
      <p>
        {CURRENCY_SYMBOLS[currency]}{" "}
        {convertFromBase(asset.financialTracking?.yearlyCost || 0)}
      </p>
    </div>

    <div>
      <p className="label">Monthly Cost</p>
      <p>
        {CURRENCY_SYMBOLS[currency]}{" "}
        {convertFromBase(asset.financialTracking?.monthlyCost || 0)}
      </p>
    </div>
  </div>

  {/* 🔷 DATES */}
  <div className="dates">
    <div>
      <p className="label"> Purchase Date</p>
    <p>
      📅 {formatDate(asset.purchaseDetails?.purchaseDate)}
    </p>
    </div>
    <div>
      <p className="label">Usage</p>
    <p>
      💻 {asset.inUse}/{asset.assetQuantity} used
    </p>
    </div>
  </div>


  {/* 🔷 PLAN */}
  <div className="plan-box">
    📦 {asset.type} plan
  </div>

  {/* 🔷 ALERT SYSTEM */}
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

  {/* 🔷 ACTIONS */}
  <div className="card-actions">
    <button onClick={() => setSelectedAsset(asset)} className="btn-save">
      View
    </button>

    <button onClick={() => handleEditOpen(asset)} className="btn-edit">
      Edit
    </button>

    <button onClick={() => handleDelete(asset._id)} className="btn-delete">
      Delete
    </button>

    <button onClick={() => handleAssign(asset)} className="btn-assign">
      Assign
    </button>
  </div>
</motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

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
  selectedAsset.instances.map((inst) => {
  const assignment = assignmentMap[inst._id];

  return (
<InstanceCard
  key={inst._id}
  inst={inst}
  convertFromBase={convertFromBase}
  assignment={assignmentMap[String(inst._id)]}
     // ✅ correct prop name
  onEdit={handleInstanceEditOpen}
/>
  );
})
) : (
  <p>No instances found</p>
)}
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
            <option value="good">Good</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>

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

      </div>

      {/* HARDWARE ONLY */}
      {editInstance.assetType === "hardware" && (
        <>
          <h4>Hardware Details</h4>

          <div className="grid-2">
            <div className="input-group">
              <label>Model No</label>
              <input
                value={instanceForm.modelNo || ""}
                onChange={(e) =>
                  setInstanceForm({
                    ...instanceForm,
                    modelNo: e.target.value,
                  })
                }
              />
            </div>

            <div className="input-group">
              <label>Specifications</label>
              <input
                value={instanceForm.specifications || ""}
                onChange={(e) =>
                  setInstanceForm({
                    ...instanceForm,
                    specifications: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </>
      )}

      {/* SOFTWARE ONLY */}
      {editInstance.assetType === "software" && (
        <>
          <h3>Software Details</h3>

          <div className="grid-2">
            <div className="input-group">
              <label>License Key</label>
              <input
                value={instanceForm.licenseKey || ""}
                onChange={(e) =>
                  setInstanceForm({
                    ...instanceForm,
                    licenseKey: e.target.value,
                  })
                }
              />
            </div>

            <div className="input-group">
              <label>License Number</label>
              <input
                value={instanceForm.licenseNumber || ""}
                onChange={(e) =>
                  setInstanceForm({
                    ...instanceForm,
                    licenseNumber: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </>
      )}

      <div className="modal-actions">
        <button className="btn-save" onClick={handleInstanceUpdate}>
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

      {/* CATEGORY + UNIT */}
            {/* NAME + QUANTITY */}
      <div className="grid-2">
        <div className="input-group">
          <label>Name</label>
          <input
            value={editForm.assetName}
            onChange={(e) =>
              setEditForm({ ...editForm, assetName: e.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Quantity</label>
          <input
            type="number"
            value={editForm.assetQuantity}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                assetQuantity: Number(e.target.value),
              })
            }
          />
          <p className="warning-text">
            ⚠ Changing quantity will add/remove instances automatically.
          </p>
        </div>
      </div>
      <div className="grid-2">
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
      </div>

      {/* LOCATION + STATUS */}
      <div className="grid-2">
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
  <div className="input-group">
    <label>Vendor Name</label>
    <input
      type="text"
      placeholder="e.g. Dell, Microsoft"
      value={editForm.vendorName || ""}
      onChange={(e) =>
        setEditForm({ ...editForm, vendorName: e.target.value })
      }
    />
  </div>

  {/* Contact */}
  <div className="input-group">
    <label>Contact Number</label>
    <input
      type="text"
      placeholder="+91 9876543210"
      value={editForm.vendorContact || ""}
      onChange={(e) =>
        setEditForm({ ...editForm, vendorContact: e.target.value })
      }
    />
  </div>
</div>

<div className="grid-2">
  {/* Support Email */}
  <div className="input-group">
    <label>Support Email</label>
    <input
      type="email"
      placeholder="support@vendor.com"
      value={editForm.vendorEmail || ""}
      onChange={(e) =>
        setEditForm({ ...editForm, vendorEmail: e.target.value })
      }
    />
  </div>
</div>

      {/* INFO */}
      <p className="info-text">
        💡 Cost and financial data are managed at instance level.
      </p>

      {/* ACTIONS */}
      <div className="modal-actions">
        <button onClick={handleEditSave} className="btn-save">
          Save
        </button>
        <button onClick={() => setEditAsset(null)} className="btn-cancel">
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

export default SoftwareAssetList;
