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
import { useOrganization } from "../Context/OrganizationContext";
const SoftwareAssetList = ({ highlightAsset }) => {
  const { organization } = useOrganization();
  const currency = organization?.currency;
  const { registerTour } = useTour();

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
  if (loading)
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
  //     <div className="inventory-container">
  //       {/* HEADER */}
  //       <div className="dashboard-header">
  //         <h2 className="hardware-title">Software Inventory</h2>
  //         <div style={{display : "flex" , gap : "5px"}}>
  //           <input
  //             type="text"
  //             placeholder="Search software..."
  //             value={searchTerm}
  //             onChange={(e) => setSearchTerm(e.target.value)}
  //             className="inventory-search-input tour-search"
  //           />
  // {/* <button
  //   onClick={() => driverObj.drive()}
  //   className="tour-help-btn"
  // >
  //   ❓ Guide
  // </button> */}
  // </div>
  //       </div>
  // {filteredAssets.length === 0 ? (
  //   <div className="empty-state">
  //     <div className="empty-icon">💻</div>

  //     <h3>No Software Assets Found</h3>

  //     <p>
  //       No software assets have been added yet.
  //       Start by capturing your first software asset.
  //     </p>

  //     <button
  //       className="btn-save"
  //       onClick={() => navigate("/assetCapture")}
  //     >
  //       Go to Capture Page
  //     </button>
  //   </div>
  // ) : (
  //   <>
  //       {/* CARDS */}
  // <div className="inventory-grid" ref={gridRef}>
  //         <AnimatePresence>
  //           {currentAssets.map((asset , index) => {
  //             const isFullyAssigned =
  //     asset.inUse >= asset.assetQuantity;
  //             return (
  //             <motion.div
  //   key={asset._id}
  //   className={`inventory-card tour-card ${highlightAsset === asset._id ? "highlight" : ""}`}
  //   initial={{ opacity: 0, y: 20 }}
  //   animate={{ opacity: 1, y: 0 }}
  // >
  //   {/* 🔷 HEADER */}
  //   <div className="card-header">
  // <div>
  //   <h3 title={asset.assetName}>
  //     {truncateText(asset.assetName, 18)}
  //   </h3>
  //   <p className="asset-code">{asset.assetCode}</p>
  // </div>
  // {(() => {
  //   const categoryName = asset.assetCategory?.name;
  //   const category = getCategoryUI(categoryName);

  //   return (
  //     <div className="category-badge">
  //       <span className="category-icon">
  //         {category.icon}
  //       </span>

  //       <span className="category-text">
  //         {truncateText(categoryName, 14)}
  //       </span>
  //     </div>
  //   );
  // })()}
  //   </div>
  //   <div className="vendor-card">
  //   <p className="vendor-name">
  //     🏢 {asset.purchaseDetails?.vendor?.name || "No Vendor"}
  //   </p>

  //   <p className="vendor-contact">
  //     📞 {asset.purchaseDetails?.vendor?.contact || "No Contact"}
  //   </p>

  //   <p className="vendor-email">
  //     ✉️ {asset.purchaseDetails?.vendor?.supportEmail || "No Email"}
  //   </p>
  // </div>
  //   {/* 🔷 BADGE GRID */}
  //   <div className="badge-grid">

  //     <span className="badge">
  //       {getName(locations, asset.locationName)}
  //     </span>

  //     <span className="badge">
  //       {getName(units, asset.associateUnit)}
  //     </span>

  // {(() => {
  //   const statusConfig =
  //     STATUS_CONFIG[asset.status] || {
  //       label: "Unknown",
  //       className: "default",
  //       icon: "❓",
  //     };

  //   return (
  //     <span className={`badge status ${statusConfig.className}`}>
  //       {statusConfig.icon} {statusConfig.label}
  //     </span>
  //   );
  // })()}
  //   </div>

  //   {/* 🔷 FINANCIAL */}
  //   <div className="financial">
  //     <div>
  //       <p className="label">Yearly Cost</p>
  // <p>
  //   {CURRENCY_SYMBOLS[currency]}{" "}
  //   {(asset.financialTracking?.yearlyCost || 0).toFixed(2)}
  // </p>
  //     </div>

  //     <div>
  //       <p className="label">Monthly Cost</p>
  // <p>
  //   {CURRENCY_SYMBOLS[currency]}{" "}
  //   {(asset.financialTracking?.monthlyCost || 0).toFixed(2)}
  // </p>
  //     </div>
  //   </div>

  //   {/* 🔷 DATES */}
  //   <div className="dates">
  //     <div>
  //       <p className="label"> Purchase Date</p>
  //     <p>
  //       📅 {formatDate(asset.purchaseDetails?.purchaseDate)}
  //     </p>
  //     </div>
  //     <div>
  //       <p className="label">Usage</p>
  //     <p>
  //       💻 {asset.inUse}/{asset.assetQuantity} used
  //     </p>
  //     </div>
  //   </div>


  //   {/* 🔷 PLAN */}
  //   <div className="plan-box">
  //     📦 {asset.type} plan
  //   </div>

  //   {/* 🔷 ALERT SYSTEM */}
  //   {(() => {
  //     const expiry = asset.renewal?.expiryDate
  //       ? new Date(asset.renewal.expiryDate)
  //       : null;

  //     const today = new Date();
  //     const diffDays = expiry
  //       ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  //       : null;

  //     if (diffDays !== null && diffDays <= 7) {
  //       return (
  //         <div className="alert danger">
  //           ⚠ Expiring in {diffDays} days
  //         </div>
  //       );
  //     }

  //     if (asset.inUse === asset.assetQuantity) {
  //       return (
  //         <div className="alert warning">
  //           ⚠ All Licenses Used
  //         </div>
  //       );
  //     }

  //     if (asset.inUse === 0) {
  //       return (
  //         <div className="alert info">
  //           ℹ No Active Usage
  //         </div>
  //       );
  //     }

  //     return null;
  //   })()}

  //   {/* 🔷 ACTIONS */}
  //   <div className="card-actions">
  //     <button onClick={() => setSelectedAsset(asset)} className="btn-save tour-view">
  //       View
  //     </button>

  //     <button onClick={() => handleEditOpen(asset)} className="btn-edit tour-edit">
  //       Edit
  //     </button>

  //     <button onClick={() => handleDelete(asset._id)} className="btn-delete">
  //       Delete
  //     </button>

  // <button
  //   onClick={() => handleAssign(asset)}
  //   className={`btn-assign tour-assign ${
  //     isFullyAssigned ? "disabled-btn" : ""
  //   }`}
  //   disabled={isFullyAssigned}
  //   title={
  //     isFullyAssigned
  //       ? "All licenses are already assigned"
  //       : "Assign software"
  //   }
  // >
  //   {isFullyAssigned ? "Assigned" : "Assign"}
  // </button>
  //   </div>
  // </motion.div>
  //           );
  // })}
  //         </AnimatePresence>
  //       </div>
  //       <Pagination
  //   currentPage={currentPage}
  //   totalPages={totalPages}
  //   onPageChange={setCurrentPage}
  // />
  // </>
  //       )}

  //       {/* ================= VIEW MODAL ================= */}
  //       <AnimatePresence>
  //         {selectedAsset && (
  //           <motion.div
  //             className="asset-view-overlay"
  //             initial={{ opacity: 0 }}
  //             animate={{ opacity: 1 }}
  //             exit={{ opacity: 0 }}
  //             onClick={() => setSelectedAsset(null)}
  //           >
  //             <motion.div
  //               className="asset-view-modal"
  //               onClick={(e) => e.stopPropagation()}
  //             >
  //               {/* ================= INSTANCES ================= */}
  //               <h4>All Instances</h4>

  // {selectedAsset.instances?.length ? (
  //   selectedAsset.instances.map((inst) => {
  //   const assignment = assignmentMap[inst._id];

  //   return (
  // <InstanceCard
  //   key={inst._id}
  //   inst={inst}
  //   assignment={assignmentMap[String(inst._id)]}
  //     // ✅ correct prop name
  //   onEdit={handleInstanceEditOpen}
  //   onUnassign={handleUnassign}
  //   onDelete={handleDeleteInstance}
  // />
  //   );
  // })
  // ) : (
  //   <p style={{ color : "#948979"}}>No instances found</p>
  // )}
  // <AnimatePresence>
  //   {editInstance && (
  //   <motion.div
  //     className="asset-view-overlay"
  //     initial={{ opacity: 0 }}
  //     animate={{ opacity: 1 }}
  //     exit={{ opacity: 0 }}
  //     onClick={() => setEditInstance(null)}
  //   >
  //     <motion.div
  //       className="asset-view-modal"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       <h3>Edit Instance</h3>

  //       <div className="grid-2">

  //         {/* CONDITION */}
  //         <div className="input-group">
  //           <label>Condition</label>
  //           <select
  //             value={instanceForm.condition}
  //             onChange={(e) =>
  //               setInstanceForm({
  //                 ...instanceForm,
  //                 condition: e.target.value,
  //               })
  //             }
  //           >
  //             <option value="new">New</option>
  //             <option value="good">Good</option>
  //             <option value="damaged">Damaged</option>
  //           </select>
  //         </div>

  //         {/* LOCATION */}
  //         <div className="input-group">
  //           <label>Location</label>
  //           <input
  //             value={instanceForm.location}
  //             onChange={(e) =>
  //               setInstanceForm({
  //                 ...instanceForm,
  //                 location: e.target.value,
  //               })
  //             }
  //           />
  //         </div>

  //       </div>

  //       {/* HARDWARE ONLY */}
  //       {editInstance.assetType === "hardware" && (
  //         <>
  //           <h4>Hardware Details</h4>

  //           <div className="grid-2">
  //             <div className="input-group">
  //               <label>Model No</label>
  //               <input
  //                 value={instanceForm.modelNo || ""}
  //                 onChange={(e) =>
  //                   setInstanceForm({
  //                     ...instanceForm,
  //                     modelNo: e.target.value,
  //                   })
  //                 }
  //               />
  //             </div>

  //             <div className="input-group">
  //               <label>Specifications</label>
  //               <input
  //                 value={instanceForm.specifications || ""}
  //                 onChange={(e) =>
  //                   setInstanceForm({
  //                     ...instanceForm,
  //                     specifications: e.target.value,
  //                   })
  //                 }
  //               />
  //             </div>
  //           </div>
  //         </>
  //       )}

  //       {/* SOFTWARE ONLY */}
  //       {editInstance.assetType === "software" && (
  //         <>
  //           <h3>Software Details</h3>

  //           <div className="grid-2">
  //             <div className="input-group">
  //               <label>License Key</label>
  //               <input
  //                 value={instanceForm.licenseKey || ""}
  //                 onChange={(e) =>
  //                   setInstanceForm({
  //                     ...instanceForm,
  //                     licenseKey: e.target.value,
  //                   })
  //                 }
  //               />
  //             </div>

  //             <div className="input-group">
  //               <label>License Number</label>
  //               <input
  //                 value={instanceForm.licenseNumber || ""}
  //                 onChange={(e) =>
  //                   setInstanceForm({
  //                     ...instanceForm,
  //                     licenseNumber: e.target.value,
  //                   })
  //                 }
  //               />
  //             </div>
  //           </div>
  //         </>
  //       )}

  //       <div className="modal-actions">
  //         <button className="btn-save" onClick={handleInstanceUpdate}>
  //           Save
  //         </button>
  //         <button
  //           className="btn-cancel"
  //           onClick={() => setEditInstance(null)}
  //         >
  //           Cancel
  //         </button>
  //       </div>
  //     </motion.div>
  //   </motion.div>
  // )}
  // </AnimatePresence>
  //             </motion.div>
  //           </motion.div>
  //         )}
  //       </AnimatePresence>
  //       <AnimatePresence>
  //   {editAsset && (
  //   <motion.div
  //     className="asset-view-overlay"
  //     initial={{ opacity: 0 }}
  //     animate={{ opacity: 1 }}
  //     exit={{ opacity: 0 }}
  //     onClick={() => setEditAsset(null)}
  //   >
  //     <motion.div
  //       className="asset-view-modal"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       <h3>Edit Asset</h3>

  //       {/* CATEGORY + UNIT */}
  //             {/* NAME + QUANTITY */}
  //       <div className="grid-2">
  //         <div className="input-group">
  //           <label>Name</label>
  //           <input
  //             value={editForm.assetName}
  //             onChange={(e) =>
  //               setEditForm({ ...editForm, assetName: e.target.value })
  //             }
  //           />
  //         </div>

  //         <div className="input-group">
  //           <label>Quantity</label>
  //           <input
  //             type="number"
  //             value={editForm.assetQuantity}
  //             onChange={(e) =>
  //               setEditForm({
  //                 ...editForm,
  //                 assetQuantity: Number(e.target.value),
  //               })
  //             }
  //           />
  //           <p className="warning-text">
  //             ⚠ Changing quantity will add/remove instances automatically.
  //           </p>
  //         </div>
  //       </div>
  //       <div className="grid-2">
  //         <div className="input-group">
  //           <label>Category</label>
  //           <select
  //             value={editForm.assetCategory}
  //             onChange={(e) =>
  //               setEditForm({
  //                 ...editForm,
  //                 assetCategory: e.target.value,
  //               })
  //             }
  //           >
  //             {categories.map(c => (
  //               <option key={c._id} value={c._id}>
  //                 {c.name}
  //               </option>
  //             ))}
  //           </select>
  //         </div>

  //         <div className="input-group">
  //           <label>Unit</label>
  //           <select
  //             value={editForm.associateUnit}
  //             onChange={(e) =>
  //               setEditForm({
  //                 ...editForm,
  //                 associateUnit: e.target.value,
  //               })
  //             }
  //           >
  //             {units.map(u => (
  //               <option key={u._id} value={u._id}>
  //                 {u.name}
  //               </option>
  //             ))}
  //           </select>
  //         </div>
  //       </div>

  //       {/* LOCATION + STATUS */}
  //       <div className="grid-2">
  //         <div className="input-group">
  //           <label>Location</label>
  //           <select
  //             value={editForm.locationName}
  //             onChange={(e) =>
  //               setEditForm({
  //                 ...editForm,
  //                 locationName: e.target.value,
  //               })
  //             }
  //           >
  //             {locations.map(l => (
  //               <option key={l._id} value={l._id}>
  //                 {l.name}
  //               </option>
  //             ))}
  //           </select>
  //         </div>  
  //       </div>



  //       {/* PURCHASE DATE */}
  //       <div className="grid-2">
  //         <div className="input-group">
  //           <label>Purchase Date</label>
  //           <input
  //             type="date"
  //             value={editForm.purchaseDate || ""}
  //             onChange={(e) =>
  //               setEditForm({
  //                 ...editForm,
  //                 purchaseDate: e.target.value,
  //               })
  //             }
  //           />
  //         </div>
  //   <div className="input-group">
  //     <label>Vendor Name</label>
  //     <input
  //       type="text"
  //       placeholder="e.g. Dell, Microsoft"
  //       value={editForm.vendorName || ""}
  //       onChange={(e) =>
  //         setEditForm({ ...editForm, vendorName: e.target.value })
  //       }
  //     />
  //   </div>

  //   {/* Contact */}
  //   <div className="input-group">
  //     <label>Contact Number</label>
  //     <input
  //       type="text"
  //       placeholder="+91 9876543210"
  //       value={editForm.vendorContact || ""}
  //       onChange={(e) =>
  //         setEditForm({ ...editForm, vendorContact: e.target.value })
  //       }
  //     />
  //   </div>
  // </div>

  // <div className="grid-2">
  //   {/* Support Email */}
  //   <div className="input-group">
  //     <label>Support Email</label>
  //     <input
  //       type="email"
  //       placeholder="support@vendor.com"
  //       value={editForm.vendorEmail || ""}
  //       onChange={(e) =>
  //         setEditForm({ ...editForm, vendorEmail: e.target.value })
  //       }
  //     />
  //   </div>
  // </div>

  //       {/* INFO */}
  //       <p className="info-text">
  //         💡 Cost and financial data are managed at instance level.
  //       </p>

  //       {/* ACTIONS */}
  //       <div className="modal-actions">
  //         <button onClick={handleEditSave} className="btn-save">
  //           Save
  //         </button>
  //         <button onClick={() => setEditAsset(null)} className="btn-cancel">
  //           Cancel
  //         </button>
  //       </div>
  //     </motion.div>
  //   </motion.div>
  // )}
  // </AnimatePresence>
  //     </div>

  <div className="inventory-page">

  {/* =========================================================
      PAGE HEADER
  ========================================================= */}
  <div className="inventory-page-header">
    <div className="inventory-title-block">
      <span className="inventory-eyebrow">INVENTORY</span>

      <h1>Software Inventory</h1>

      <p>
        Monitor software licenses, utilization, billing costs,
        assignments, and renewal information.
      </p>
    </div>

    <div className="inventory-header-actions">
      <div className="inventory-search">
        <span className="search-icon">⌕</span>

        <input
          type="text"
          placeholder="Search software..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="inventory-search-input tour-search"
        />

        {searchTerm && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <button
        type="button"
        className="inventory-capture-btn"
        onClick={() => navigate("/assetCapture")}
      >
        <span>+</span>
        Add Software
      </button>
    </div>
  </div>


  {/* =========================================================
      TOOLBAR
  ========================================================= */}
  {filteredAssets.length > 0 && (
    <div className="inventory-toolbar">
      <div className="inventory-result-count">
        <span className="result-dot"></span>

        <span>
          <strong>{filteredAssets.length}</strong>{" "}
          {filteredAssets.length === 1 ? "asset" : "assets"}
        </span>
      </div>

      <div className="inventory-toolbar-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )}


  {/* =========================================================
      EMPTY STATE
  ========================================================= */}
  {filteredAssets.length === 0 ? (
    <div className="inventory-empty-state">
      <div className="empty-state-icon">
        <span>□</span>
      </div>

      <span className="empty-eyebrow">
        {searchTerm ? "NO RESULTS" : "INVENTORY EMPTY"}
      </span>

      <h3>
        {searchTerm
          ? "No matching software found"
          : "No software assets yet"}
      </h3>

      <p>
        {searchTerm
          ? `We couldn't find any software matching "${searchTerm}".`
          : "Start building your software inventory by capturing your first software asset."}
      </p>

      {searchTerm ? (
        <button
          type="button"
          className="empty-secondary-btn"
          onClick={() => setSearchTerm("")}
        >
          Clear Search
        </button>
      ) : (
        <button
          type="button"
          className="empty-primary-btn"
          onClick={() => navigate("/assetCapture")}
        >
          <span>+</span>
          Capture Software
        </button>
      )}
    </div>
  ) : (
    <>
      {/* =====================================================
          SOFTWARE GRID
      ===================================================== */}
      <div className="inventory-grid" ref={gridRef}>
        <AnimatePresence>
          {currentAssets.map((asset, index) => {

            const isFullyAssigned =
              asset.assetQuantity > 0 &&
              asset.inUse >= asset.assetQuantity;

            const statusConfig =
              STATUS_CONFIG[asset.status] || {
                label: asset.status || "Unknown",
                className: "default",
                icon: "•",
              };

            const categoryName =
              asset.assetCategory?.name || "Uncategorized";

            const category = getCategoryUI(categoryName);

            const usagePercentage =
              asset.assetQuantity > 0
                ? Math.min(
                    (asset.inUse / asset.assetQuantity) * 100,
                    100
                  )
                : 0;


            /* ===============================================
               EXPIRY CALCULATION
            =============================================== */
            const expiry = asset.renewal?.expiryDate
              ? new Date(asset.renewal.expiryDate)
              : null;

            const today = new Date();

            const diffDays = expiry
              ? Math.ceil(
                  (expiry - today) /
                    (1000 * 60 * 60 * 24)
                )
              : null;


            return (
              <motion.article
                key={asset._id}
                className={`inventory-card tour-card ${
                  highlightAsset === asset._id
                    ? "highlight"
                    : ""
                }`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.03,
                }}
              >

                {/* =========================================
                    CARD HEADER
                ========================================= */}
                <div className="inventory-card-header">

                  <div className="asset-identity">
                    <div className="asset-category-icon">
                      {category.icon}
                    </div>

                    <div className="asset-title">
                      <h3 title={asset.assetName}>
                        {truncateText(
                          asset.assetName,
                          24
                        )}
                      </h3>

                      <span>{asset.assetCode}</span>
                    </div>
                  </div>


                  <span
                    className={`inventory-status ${statusConfig.className}`}
                  >
                    <span className="status-dot"></span>

                    {statusConfig.label}
                  </span>

                </div>


                {/* =========================================
                    CATEGORY / LOCATION / UNIT
                ========================================= */}
                <div className="asset-meta-row">

                  <span className="asset-meta-item">
                    <span className="meta-label">
                      Category
                    </span>

                    <strong title={categoryName}>
                      {truncateText(
                        categoryName,
                        16
                      )}
                    </strong>
                  </span>


                  <span className="asset-meta-divider"></span>


                  <span className="asset-meta-item">
                    <span className="meta-label">
                      Location
                    </span>

                    <strong>
                      {getName(
                        locations,
                        asset.locationName
                      ) || "Not set"}
                    </strong>
                  </span>


                  <span className="asset-meta-divider"></span>


                  <span className="asset-meta-item">
                    <span className="meta-label">
                      Unit
                    </span>

                    <strong>
                      {getName(
                        units,
                        asset.associateUnit
                      ) || "Not set"}
                    </strong>
                  </span>

                </div>


                {/* =========================================
                    UTILIZATION
                ========================================= */}
                <div className="asset-usage-section">

                  <div className="usage-heading">
                    <div>
                      <span>License Utilization</span>

                      <strong>
                        {asset.inUse || 0} /{" "}
                        {asset.assetQuantity || 0}
                      </strong>
                    </div>

                    <span className="usage-percent">
                      {Math.round(usagePercentage)}%
                    </span>
                  </div>


                  <div className="usage-track">
                    <div
                      className="usage-fill"
                      style={{
                        width: `${usagePercentage}%`,
                      }}
                    ></div>
                  </div>


                  <div className="usage-footer">
                    <span>
                      {asset.inUse || 0} assigned
                    </span>

                    <span>
                      {Math.max(
                        (asset.assetQuantity || 0) -
                          (asset.inUse || 0),
                        0
                      )}{" "}
                      available
                    </span>
                  </div>

                </div>


                {/* =========================================
                    FINANCIAL SNAPSHOT
                ========================================= */}
                <div className="inventory-financials">

                  <div className="financial-metric">
                    <span className="financial-label">
                      Yearly Cost
                    </span>

                    <strong>
                      {CURRENCY_SYMBOLS[currency]}{" "}
                      {(
                        asset.financialTracking
                          ?.yearlyCost || 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>


                  <div className="financial-metric">
                    <span className="financial-label">
                      Monthly Cost
                    </span>

                    <strong>
                      {CURRENCY_SYMBOLS[currency]}{" "}
                      {(
                        asset.financialTracking
                          ?.monthlyCost || 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>

                </div>


                {/* =========================================
                    DETAILS
                ========================================= */}
                <div className="inventory-detail-list">

                  <div className="inventory-detail">
                    <span>Purchase date</span>

                    <strong>
                      {formatDate(
                        asset.purchaseDetails
                          ?.purchaseDate
                      )}
                    </strong>
                  </div>


                  <div className="inventory-detail">
                    <span>Plan</span>

                    <strong>
                      {asset.type
                        ? asset.type
                            .replace("_", " ")
                            .replace(/\b\w/g, (c) =>
                              c.toUpperCase()
                            )
                        : "Not set"}
                    </strong>
                  </div>


                  <div className="inventory-detail">
                    <span>Vendor</span>

                    <strong
                      title={
                        asset.purchaseDetails?.vendor
                          ?.name || "No vendor"
                      }
                    >
                      {truncateText(
                        asset.purchaseDetails?.vendor
                          ?.name || "No vendor",
                        22
                      )}
                    </strong>
                  </div>


                  {asset.renewal?.expiryDate && (
                    <div className="inventory-detail">
                      <span>Expiry</span>

                      <strong>
                        {formatDate(
                          asset.renewal.expiryDate
                        )}
                      </strong>
                    </div>
                  )}

                </div>


                {/* =========================================
                    VENDOR CONTACT
                ========================================= */}
                {(asset.purchaseDetails?.vendor?.contact ||
                  asset.purchaseDetails?.vendor
                    ?.supportEmail) && (

                  <div className="inventory-vendor-info">

                    {asset.purchaseDetails?.vendor
                      ?.contact && (
                      <div>
                        <span>Contact</span>

                        <strong>
                          {
                            asset.purchaseDetails.vendor
                              .contact
                          }
                        </strong>
                      </div>
                    )}


                    {asset.purchaseDetails?.vendor
                      ?.supportEmail && (
                      <div>
                        <span>Support</span>

                        <strong
                          title={
                            asset.purchaseDetails.vendor
                              .supportEmail
                          }
                        >
                          {truncateText(
                            asset.purchaseDetails.vendor
                              .supportEmail,
                            26
                          )}
                        </strong>
                      </div>
                    )}

                  </div>
                )}


                {/* =========================================
                    SOFTWARE ALERTS
                ========================================= */}
                {diffDays !== null && diffDays <= 7 ? (

                  <div className="software-alert danger">
                    <span className="software-alert-dot"></span>

                    <div>
                      <strong>
                        {diffDays < 0
                          ? "License expired"
                          : diffDays === 0
                          ? "Expires today"
                          : `Expires in ${diffDays} ${
                              diffDays === 1
                                ? "day"
                                : "days"
                            }`}
                      </strong>

                      <span>
                        Review renewal information.
                      </span>
                    </div>
                  </div>

                ) : isFullyAssigned ? (

                  <div className="software-alert warning">
                    <span className="software-alert-dot"></span>

                    <div>
                      <strong>
                        All licenses assigned
                      </strong>

                      <span>
                        No licenses currently available.
                      </span>
                    </div>
                  </div>

                ) : asset.inUse === 0 ? (

                  <div className="software-alert info">
                    <span className="software-alert-dot"></span>

                    <div>
                      <strong>No active usage</strong>

                      <span>
                        All licenses are currently available.
                      </span>
                    </div>
                  </div>

                ) : null}


                {/* =========================================
                    ACTIONS
                ========================================= */}
                <div className="inventory-card-actions">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAsset(asset)
                    }
                    className="card-action primary tour-view"
                  >
                    View Instances
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleEditOpen(asset)
                    }
                    className="card-action tour-edit"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleAssign(asset)
                    }
                    className={`card-action assign tour-assign ${
                      isFullyAssigned
                        ? "disabled"
                        : ""
                    }`}
                    disabled={isFullyAssigned}
                    title={
                      isFullyAssigned
                        ? "All licenses are already assigned"
                        : "Assign software"
                    }
                  >
                    {isFullyAssigned
                      ? "Assigned"
                      : "Assign"}
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(asset._id)
                    }
                    className="card-action delete"
                    aria-label={`Delete ${asset.assetName}`}
                  >
                    Delete
                  </button>

                </div>

              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>


      {/* =====================================================
          PAGINATION
      ===================================================== */}
      <div className="inventory-pagination-wrapper">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  )}


  {/* =========================================================
      VIEW INSTANCES MODAL
  ========================================================= */}
  <AnimatePresence>
    {selectedAsset && (
      <motion.div
        className="inventory-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedAsset(null)}
      >
        <motion.div
          className="inventory-modal inventory-instance-modal"
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.985,
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* HEADER */}
          <div className="inventory-modal-header">

            <div>
              <span className="modal-eyebrow">
                SOFTWARE LICENSES
              </span>

              <h2>{selectedAsset.assetName}</h2>

              <p>
                {selectedAsset.assetCode} ·{" "}
                {selectedAsset.instances?.length ||
                  0}{" "}
                instances
              </p>
            </div>


            <button
              type="button"
              className="inventory-modal-close"
              onClick={() =>
                setSelectedAsset(null)
              }
              aria-label="Close"
            >
              ×
            </button>

          </div>


          {/* BODY */}
          <div className="inventory-modal-body">

            <div className="instance-section-heading">

              <div>
                <h3>All Instances</h3>

                <p>
                  View and manage individual software
                  licenses.
                </p>
              </div>


              <span className="instance-count">
                {selectedAsset.instances?.length ||
                  0}
              </span>

            </div>


            {selectedAsset.instances?.length ? (

              <div className="instance-group">

                {selectedAsset.instances.map(
                  (inst) => {

                    const assignment =
                      assignmentMap[
                        String(inst._id)
                      ];

                    return (
                      <InstanceCard
                        key={inst._id}
                        inst={inst}
                        assignment={assignment}
                        onEdit={
                          handleInstanceEditOpen
                        }
                        onUnassign={
                          handleUnassign
                        }
                        onDelete={
                          handleDeleteInstance
                        }
                      />
                    );
                  }
                )}

              </div>

            ) : (

              <div className="modal-empty-state">
                <div>□</div>

                <h4>No instances found</h4>

                <p>
                  There are currently no license
                  instances associated with this
                  software asset.
                </p>
              </div>

            )}

          </div>

        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>


  {/* =========================================================
      EDIT INSTANCE MODAL
  ========================================================= */}
  <AnimatePresence>
    {editInstance && (
      <motion.div
        className="inventory-modal-overlay inventory-modal-layer-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setEditInstance(null)}
      >
        <motion.div
          className="inventory-modal inventory-edit-modal"
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.985,
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* HEADER */}
          <div className="inventory-modal-header">

            <div>
              <span className="modal-eyebrow">
                SOFTWARE INSTANCE
              </span>

              <h2>Edit Instance</h2>

              <p>
                Update license information and
                operational details.
              </p>
            </div>


            <button
              type="button"
              className="inventory-modal-close"
              onClick={() =>
                setEditInstance(null)
              }
              aria-label="Close"
            >
              ×
            </button>

          </div>


          {/* BODY */}
          <div className="inventory-modal-body">

            {/* =========================================
                GENERAL INFORMATION
            ========================================= */}
            <div className="modal-form-section">

              <div className="modal-section-title">

                <span>01</span>

                <div>
                  <h3>Instance Information</h3>

                  <p>
                    Update condition and location.
                  </p>
                </div>

              </div>


              <div className="inventory-form-grid">

                <div className="inventory-input-group">

                  <label>Condition</label>

                  <select
                    value={
                      instanceForm.condition
                    }
                    onChange={(e) =>
                      setInstanceForm({
                        ...instanceForm,
                        condition:
                          e.target.value,
                      })
                    }
                  >
                    <option value="new">
                      New
                    </option>

                    <option value="good">
                      Good
                    </option>

                    <option value="damaged">
                      Damaged
                    </option>
                  </select>

                </div>


                <div className="inventory-input-group">

                  <label>Location</label>

                  <input
                    value={
                      instanceForm.location
                    }
                    onChange={(e) =>
                      setInstanceForm({
                        ...instanceForm,
                        location:
                          e.target.value,
                      })
                    }
                    placeholder="Enter location"
                  />

                </div>

              </div>
            </div>


            {/* =========================================
                HARDWARE FIELDS
                Kept because your existing component
                supports both instance types.
            ========================================= */}
            {editInstance.assetType ===
              "hardware" && (

              <div className="modal-form-section">

                <div className="modal-section-title">

                  <span>02</span>

                  <div>
                    <h3>
                      Hardware Information
                    </h3>

                    <p>
                      Device model and technical
                      specifications.
                    </p>
                  </div>

                </div>


                <div className="inventory-form-grid">

                  <div className="inventory-input-group">

                    <label>Model No</label>

                    <input
                      value={
                        instanceForm.modelNo ||
                        ""
                      }
                      onChange={(e) =>
                        setInstanceForm({
                          ...instanceForm,
                          modelNo:
                            e.target.value,
                        })
                      }
                    />

                  </div>


                  <div className="inventory-input-group">

                    <label>
                      Specifications
                    </label>

                    <input
                      value={
                        instanceForm.specifications ||
                        ""
                      }
                      onChange={(e) =>
                        setInstanceForm({
                          ...instanceForm,
                          specifications:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

              </div>
            )}


            {/* =========================================
                SOFTWARE FIELDS
            ========================================= */}
            {editInstance.assetType ===
              "software" && (

              <div className="modal-form-section">

                <div className="modal-section-title">

                  <span>02</span>

                  <div>
                    <h3>License Information</h3>

                    <p>
                      Update license identifiers for
                      this software instance.
                    </p>
                  </div>

                </div>


                <div className="inventory-form-grid">

                  <div className="inventory-input-group">

                    <label>License Key</label>

                    <input
                      value={
                        instanceForm.licenseKey ||
                        ""
                      }
                      onChange={(e) =>
                        setInstanceForm({
                          ...instanceForm,
                          licenseKey:
                            e.target.value,
                        })
                      }
                      placeholder="Enter license key"
                    />

                  </div>


                  <div className="inventory-input-group">

                    <label>
                      License Number
                    </label>

                    <input
                      value={
                        instanceForm.licenseNumber ||
                        ""
                      }
                      onChange={(e) =>
                        setInstanceForm({
                          ...instanceForm,
                          licenseNumber:
                            e.target.value,
                        })
                      }
                      placeholder="Enter license number"
                    />

                  </div>

                </div>

              </div>
            )}


            <div className="inventory-info-message">
              <span>i</span>

              <p>
                Financial and renewal information is
                managed through the software lifecycle
                and upgrade actions.
              </p>
            </div>

          </div>


          {/* FOOTER */}
          <div className="inventory-modal-footer">

            <button
              type="button"
              className="modal-secondary-action"
              onClick={() =>
                setEditInstance(null)
              }
            >
              Cancel
            </button>


            <button
              type="button"
              className="modal-primary-action"
              onClick={handleInstanceUpdate}
            >
              Save Changes
            </button>

          </div>

        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>


  {/* =========================================================
      EDIT SOFTWARE ASSET
  ========================================================= */}
  <AnimatePresence>
    {editAsset && (
      <motion.div
        className="inventory-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setEditAsset(null)}
      >
        <motion.div
          className="inventory-modal inventory-edit-asset-modal"
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.985,
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* HEADER */}
          <div className="inventory-modal-header">

            <div>
              <span className="modal-eyebrow">
                SOFTWARE ASSET
              </span>

              <h2>Edit Asset</h2>

              <p>
                Update software identity, licensing,
                location and vendor information.
              </p>
            </div>


            <button
              type="button"
              className="inventory-modal-close"
              onClick={() =>
                setEditAsset(null)
              }
              aria-label="Close"
            >
              ×
            </button>

          </div>


          {/* BODY */}
          <div className="inventory-modal-body">

            {/* =========================================
                ASSET INFORMATION
            ========================================= */}
            <div className="modal-form-section">

              <div className="modal-section-title">

                <span>01</span>

                <div>
                  <h3>Software Information</h3>

                  <p>
                    Basic identity and classification
                    information.
                  </p>
                </div>

              </div>


              <div className="inventory-form-grid">

                {/* NAME */}
                <div className="inventory-input-group">

                  <label>Software Name</label>

                  <input
                    value={editForm.assetName}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        assetName:
                          e.target.value,
                      })
                    }
                    placeholder="Software name"
                  />

                </div>


                {/* CATEGORY */}
                <div className="inventory-input-group">

                  <label>Category</label>

                  <select
                    value={
                      editForm.assetCategory
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        assetCategory:
                          e.target.value,
                      })
                    }
                  >
                    {categories.map((c) => (
                      <option
                        key={c._id}
                        value={c._id}
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>

                </div>


                {/* QUANTITY */}
                <div className="inventory-input-group">

                  <label>License Quantity</label>

                  <input
                    type="number"
                    min="1"
                    value={
                      editForm.assetQuantity
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        assetQuantity: Number(
                          e.target.value
                        ),
                      })
                    }
                  />

                  <span className="inventory-field-warning">
                    Changing quantity will add or
                    remove instances automatically.
                  </span>

                </div>


                {/* UNIT */}
                <div className="inventory-input-group">

                  <label>Unit</label>

                  <select
                    value={
                      editForm.associateUnit
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        associateUnit:
                          e.target.value,
                      })
                    }
                  >
                    {units.map((u) => (
                      <option
                        key={u._id}
                        value={u._id}
                      >
                        {u.name}
                      </option>
                    ))}
                  </select>

                </div>

              </div>
            </div>


            {/* =========================================
                LOCATION & PURCHASE
            ========================================= */}
            <div className="modal-form-section">

              <div className="modal-section-title">

                <span>02</span>

                <div>
                  <h3>Location & Purchase</h3>

                  <p>
                    Billing location and procurement
                    information.
                  </p>
                </div>

              </div>


              <div className="inventory-form-grid">

                {/* LOCATION */}
                <div className="inventory-input-group">

                  <label>Billing Location</label>

                  <select
                    value={
                      editForm.locationName
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        locationName:
                          e.target.value,
                      })
                    }
                  >
                    {locations.map((l) => (
                      <option
                        key={l._id}
                        value={l._id}
                      >
                        {l.name}
                      </option>
                    ))}
                  </select>

                </div>


                {/* PURCHASE DATE */}
                <div className="inventory-input-group">

                  <label>Purchase Date</label>

                  <input
                    type="date"
                    value={
                      editForm.purchaseDate ||
                      ""
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        purchaseDate:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>
            </div>


            {/* =========================================
                VENDOR
            ========================================= */}
            <div className="modal-form-section">

              <div className="modal-section-title">

                <span>03</span>

                <div>
                  <h3>Vendor Information</h3>

                  <p>
                    Supplier and software support
                    details.
                  </p>
                </div>

              </div>


              <div className="inventory-form-grid">

                {/* VENDOR NAME */}
                <div className="inventory-input-group">

                  <label>Vendor Name</label>

                  <input
                    type="text"
                    placeholder="e.g. Microsoft"
                    value={
                      editForm.vendorName || ""
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        vendorName:
                          e.target.value,
                      })
                    }
                  />

                </div>


                {/* CONTACT */}
                <div className="inventory-input-group">

                  <label>Contact Number</label>

                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={
                      editForm.vendorContact ||
                      ""
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        vendorContact:
                          e.target.value,
                      })
                    }
                  />

                </div>


                {/* EMAIL */}
                <div className="inventory-input-group full">

                  <label>Support Email</label>

                  <input
                    type="email"
                    placeholder="support@vendor.com"
                    value={
                      editForm.vendorEmail ||
                      ""
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        vendorEmail:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>
            </div>


            {/* INFO */}
            <div className="inventory-info-message">
              <span>i</span>

              <p>
                Cost and financial data are managed at
                the individual software instance level.
              </p>
            </div>

          </div>


          {/* FOOTER */}
          <div className="inventory-modal-footer">

            <button
              type="button"
              className="modal-secondary-action"
              onClick={() =>
                setEditAsset(null)
              }
            >
              Cancel
            </button>


            <button
              type="button"
              onClick={handleEditSave}
              className="modal-primary-action"
            >
              Save Changes
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
