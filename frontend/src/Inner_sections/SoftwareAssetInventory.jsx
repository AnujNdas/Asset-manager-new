// ✅ src/Pages/SoftwareAssetList.jsx
import React, { useEffect, useState , useRef} from "react";
import ThemeSwal from "../utils/swalTheme";
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
  unassignAssetInstance,
  deleteAssetInstance
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
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "../Context/TourContext";
const SoftwareAssetList = () => {
  const { registerTour } = useTour();
  const driverObj = driver({
  showProgress: true,
  animate: true,
  smoothScroll: true,
  allowClose: true,

  overlayColor: "rgba(0,0,0,0.75)",

  popoverClass: "custom-driver-popover",

  steps: [
    {
      element: ".tour-search",
      popover: {
        title: "Search Assets",
        description: "Search and quickly find Software assets.",
        side: "bottom",
        align: "start",
      },
    },

    {
      element: ".tour-card",
      popover: {
        title: "Asset Cards",
        description:
          "Each card represents a Software asset with important details.",
        side: "bottom",
      },
    },

    {
      element: ".tour-view",
      popover: {
        title: "View Instances",
        description: "View all instances of this Software asset.",
        side: "bottom",
      },
    },

    {
      element: ".tour-edit",
      popover: {
        title: "Edit Asset",
        description: "Edit Software details anytime.",
        side: "bottom",
      },
    },

    {
      element: ".tour-assign",
      popover: {
        title: "Assign Asset",
        description: "Assign this Software to Team members.",
        side: "bottom",
      },
    },
  ],
});
    const gridRef = useRef(null);
const CATEGORY_CONFIG = {

  // SOFTWARE
  "Operating System": {
    icon: "🖥️",
  },

  SaaS: {
    icon: "☁️",
  },

  Server: {
    icon: "🗄️",
  },

  "Desktop Applications": {
    icon: "🧩",
  },

  "Enterprise Systems": {
    icon: "🏢",
  },

  "Digital Accessories": {
    icon: "🔗",
  },

  "Storage (Cloud)": {
    icon: "☁️",
  },

  "AI Models": {
    icon: "🧠",
  },

  "Data & Infrastructure": {
    icon: "📊",
  },
};
const getCategoryUI = (categoryName = "") => {
  const normalized = categoryName
    .trim()
    .toLowerCase();

  const normalizedConfig = Object.fromEntries(
    Object.entries(CATEGORY_CONFIG).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  );

  return (
    normalizedConfig[normalized] || {
      icon: "📦",
      color: "gray",
    }
  );
};
  const STATUS_CONFIG = {
  in_stock: {
    label: "Available",
    className: "success",
  },
  fully_in_use: {
    label: "Fully Assigned",
    className: "danger",
  },
  partially_in_use: {
    label: "Partially In Use",
    className: "warning",
  },
  partially_created: {
    label: "Partially Created",
    className: "info",
  },
  not_created: {
    label: "No Instances",
    className: "default",
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
  const [assetsPerPage, setAssetsPerPage] = useState(6);
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const navigate = useNavigate();
  const { currency, convertFromBase, loadingRates } = useCurrency();
useEffect(() => {
  if (!gridRef.current) return;

  const calculate = () => {
    const gridWidth = gridRef.current.clientWidth;

    const MIN_CARD_WIDTH = 320;
    const GAP = 20;

    const columns =
      Math.floor(gridWidth / (MIN_CARD_WIDTH + GAP)) || 1;

    const rows = 2;

    setAssetsPerPage(columns * rows);
  };

  // Initial delayed calculation
  requestAnimationFrame(() => {
    calculate();
  });

  // Observe size changes
  const observer = new ResizeObserver(() => {
    calculate();
  });

  observer.observe(gridRef.current);

  window.addEventListener("resize", calculate);

  return () => {
    observer.disconnect();
    window.removeEventListener("resize", calculate);
  };
}, []);
// useEffect(() => {
//   const seen = localStorage.getItem("inventoryTourSeen");

//   if (!seen) {
//     setTimeout(() => {
//       driverObj.drive();

//       localStorage.setItem(
//         "inventoryTourSeen",
//         "true"
//       );
//     }, 1000);
//   }
// }, []);
// useEffect(() => {
//   registerTour(driverObj);
// }, []);
  useEffect(() => {
    fetchAll();
  }, []);
  const handleDeleteInstance = async (
  instanceId
) => {
  try {
    const result = await ThemeSwal.fire({
      title: "Delete Instance?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    await deleteAssetInstance(instanceId);

    ThemeSwal.fire({
      icon: "success",
      title: "Deleted",
      text: "Instance deleted successfully",
    });

    fetchAll(); // reload list

  } catch (error) {
    ThemeSwal.fire({
      icon: "error",
      title: "Delete Failed",
      text:
        error?.response?.data?.message ||
        "Something went wrong",
    });
  }
};
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

const handleUnassign = async (assignmentId) => {

  try {

    const confirm = await ThemeSwal.fire({
      title: "Unassign Asset?",
      text: "This asset will be moved back to stock.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Unassign"
    });

    if (!confirm.isConfirmed) return;

    await unassignAssetInstance(
      assignmentId
    );
    await fetchAll();

    ThemeSwal.fire( 
      "Success",
      "Asset unassigned successfully",
      "success"
    );


  } catch (err) {

    ThemeSwal.fire(
      "Error",
      err?.response?.data?.message ||
      "Failed to unassign asset",
      "error"
    );
  }
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

  const data = err?.response?.data;

  // 🔥 Special handling for assets in use
  if (data?.code === "ASSET_IN_USE") {

    return ThemeSwal.fire({
      icon: "warning",
      title: "Asset Cannot Be Deleted",
      html: `
        <div style="text-align:left">
          <p style="margin-bottom:10px;">
            ${data.message}
          </p>

          <div style="
            background:#2d333b;
            padding:12px;
            border-radius:10px;
            margin-top:10px;
          ">
            <p><strong>Total Instances:</strong> ${data.errors?.total || 0}</p>
            <p><strong>Currently In Use:</strong> ${data.errors?.inUse || 0}</p>
          </div>

          <p style="margin-top:12px;color:#f1c40f;">
            Please unassign all active instances before deleting this asset.
          </p>
        </div>
      `,
      confirmButtonText: "Understood",
      background: "#222831",
    });
  }

  // 🔥 Default error
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
        category: asset.assetCategory?._id, // ✅ FIX
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
  
const filteredAssets = [...assets]
  .sort(
    (a, b) =>
      new Date(b.createdAt || b.created_at || 0) -
      new Date(a.createdAt || a.created_at || 0)
  )
  .filter((asset) => {
    const term = searchTerm.toLowerCase();

    return (
      asset.assetName?.toLowerCase().includes(term) ||
      asset.assetCode?.toLowerCase().includes(term)
    );
  });
useEffect(() => {
  const total = Math.ceil(
    filteredAssets.length / assetsPerPage
  );

  if (currentPage > total) {
    setCurrentPage(total || 1);
  }
}, [filteredAssets, assetsPerPage, currentPage]);



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
        <div style={{display : "flex" , gap : "5px"}}>
          <input
            type="text"
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search-input tour-search"
          />
{/* <button
  onClick={() => driverObj.drive()}
  className="tour-help-btn"
>
  ❓ Guide
</button> */}
</div>
      </div>
{filteredAssets.length === 0 ? (
  <div className="empty-state">
    <div className="empty-icon">💻</div>

    <h3>No Software Assets Found</h3>

    <p>
      No software assets have been added yet.
      Start by capturing your first software asset.
    </p>

    <button
      className="btn-save"
      onClick={() => navigate("/assetCapture")}
    >
      Go to Capture Page
    </button>
  </div>
) : (
  <>
      {/* CARDS */}
<div className="inventory-grid" ref={gridRef}>
        <AnimatePresence>
          {currentAssets.map((asset , index) => {
            const isFullyAssigned =
    asset.inUse >= asset.assetQuantity;
            return (
            <motion.div
  key={asset._id}
  className="inventory-card tour-card"
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
  const categoryName = asset.assetCategory?.name;
  const category = getCategoryUI(categoryName);

  return (
    <div className="category-badge">
      <span className="category-icon">
        {category.icon}
      </span>

      <span className="category-text">
        {truncateText(categoryName, 14)}
      </span>
    </div>
  );
})()}
  </div>
  <div className="vendor-card">
  <p className="vendor-name">
    🏢 {asset.purchaseDetails?.vendor?.name || "No Vendor"}
  </p>

  <p className="vendor-contact">
    📞 {asset.purchaseDetails?.vendor?.contact || "No Contact"}
  </p>

  <p className="vendor-email">
    ✉️ {asset.purchaseDetails?.vendor?.supportEmail || "No Email"}
  </p>
</div>
  {/* 🔷 BADGE GRID */}
  <div className="badge-grid">

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
  {(asset.financialTracking?.yearlyCost || 0).toFixed(2)}
</p>
    </div>

    <div>
      <p className="label">Monthly Cost</p>
<p>
  {CURRENCY_SYMBOLS[currency]}{" "}
  {(asset.financialTracking?.monthlyCost || 0).toFixed(2)}
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
    <button onClick={() => setSelectedAsset(asset)} className="btn-save tour-view">
      View
    </button>

    <button onClick={() => handleEditOpen(asset)} className="btn-edit tour-edit">
      Edit
    </button>

    <button onClick={() => handleDelete(asset._id)} className="btn-delete">
      Delete
    </button>

<button
  onClick={() => handleAssign(asset)}
  className={`btn-assign tour-assign ${
    isFullyAssigned ? "disabled-btn" : ""
  }`}
  disabled={isFullyAssigned}
  title={
    isFullyAssigned
      ? "All licenses are already assigned"
      : "Assign software"
  }
>
  {isFullyAssigned ? "Assigned" : "Assign"}
</button>
  </div>
</motion.div>
           );
})}
        </AnimatePresence>
      </div>
      <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
</>
      )}

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
  onUnassign={handleUnassign}
  onDelete={handleDeleteInstance}
/>
  );
})
) : (
  <p style={{ color : "#948979"}}>No instances found</p>
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
